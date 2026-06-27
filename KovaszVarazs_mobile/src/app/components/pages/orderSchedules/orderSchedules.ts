import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import {
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonCardSubtitle,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { OrderScheduleModalComponent } from '../../modals/order-schedule-modal/order-schedule-modal.component';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'orderSchedules',
  templateUrl: 'orderSchedules.html',
  providers: [DatePipe],
  imports: [
    IonButtons,
    IonRefresherContent,
    IonRefresher,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonCard,
    IonCardHeader,
    IonList,
    IonItem,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    DatePipe,
    OrderScheduleModalComponent,
    IonMenuButton,
  ],
})
export class OrderSchedules implements OnDestroy {
  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
    private modalNavbarService: ModalNavbarService,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef,
    private websocketService: WebsocketService
  ) {
    registerLocaleData(localeHu);
  }

  isLoading: boolean = true;
  orderSchedules: OrderScheduleModel[] = [];
  editingOrderSchedule: OrderScheduleModel | null = null;
  isProcessing: boolean = false;
  private websocketCleanup: (() => void) | null = null;
  private websocketInitialized = false;

  ionViewWillEnter() {
    void this.initializeWebsocketSubscription();
    this.loadOrderSchedules();
  }

  ionViewWillLeave() {
    this.cleanupWebsocketSubscription();
  }

  ngOnDestroy() {
    this.cleanupWebsocketSubscription();
  }

  private loadOrderSchedules() {
    this.isLoading = true;
    this.dataService.getOrderSchedules(0, 50).subscribe((data) => {
      this.orderSchedules = data;
      this.orderSchedules.forEach((o) =>
        o.products.sort((a, b) => a.product_name.localeCompare(b.product_name))
      );
      this.isLoading = false;
    });
  }

  refresh(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  newOrderSchedule() {
    this.editingOrderSchedule = {
      id: 0,
      available_date: new Date(),
      note: '',
      products: [],
    };
    this.modalNavbarService.openModal();
  }

  modifyOrderSchedule(orderSchedule: OrderScheduleModel) {
    this.editingOrderSchedule = { ...orderSchedule };
    this.modalNavbarService.openModal();
  }

  saveOrderSchedule(orderSchedule: OrderScheduleModel) {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    if (this.editingOrderSchedule) {
      const index = this.orderSchedules.findIndex(
        (os) => os.id === this.editingOrderSchedule!.id
      );
      if (index !== -1) {
        this.orderSchedules[index] = orderSchedule;
      } else {
        this.orderSchedules.push(orderSchedule);
      }
      this.editingOrderSchedule = null;
    }
    this.isProcessing = false;
  }

  async deleteOrderSchedule(orderSchedule: OrderScheduleModel) {
    const alert = await this.alertController.create({
      header: 'Törlés',
      message: `Biztosan törölni szeretnéd ezt a sütési napot? Az összes hozzá tartozó rendelés is törlődik!`,
      buttons: [
        {
          text: 'Mégse',
          role: 'cancel',
        },
        {
          text: 'Törlés',
          role: 'destructive',
          handler: () => {
            this.dataService.deleteOrderSchedule(orderSchedule.id).subscribe({
              next: () => {
                const index = this.orderSchedules.findIndex(
                  (os) => os.id === orderSchedule.id
                );
                if (index !== -1) {
                  this.orderSchedules.splice(index, 1);
                  this.changeDetectorRef.detectChanges();
                }
              },
              error: (error) => {
                console.error('Error deleting order schedule:', error);
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }

  private async initializeWebsocketSubscription() {
    if (this.websocketInitialized) {
      return;
    }

    try {
      this.websocketCleanup =
        await this.websocketService.listenToPrivateChannel(
          'order-schedules',
          '.order-schedules.changed',
          () => {
            this.loadOrderSchedules();
          }
        );

      this.websocketInitialized = true;
    } catch (error) {
      console.error('Nem sikerült csatlakozni a websocket csatornához:', error);
    }
  }

  private cleanupWebsocketSubscription() {
    this.websocketCleanup?.();
    this.websocketCleanup = null;
    this.websocketInitialized = false;
  }
}
