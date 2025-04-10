import { ChangeDetectorRef, Component } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import {
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
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
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { OrderScheduleModalComponent } from '../../modals/order-schedule-modal/order-schedule-modal.component';

@Component({
  selector: 'orderSchedules',
  templateUrl: 'orderSchedules.html',
  providers: [DatePipe],
  imports: [
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonCard,
    IonCardHeader,
    IonList,
    IonItem,
    IonButton,
    IonIcon,
    IonFabButton,
    IonFab,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    DatePipe,
    OrderScheduleModalComponent,
  ],
})
export class OrderSchedules {
  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
    private modalNavbarService: ModalNavbarService,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    registerLocaleData(localeHu);
  }

  orderSchedules: OrderScheduleModel[] = [];

  editingOrderSchedule: OrderScheduleModel | null = null;

  ionViewWillEnter() {
    this.dataService.getOrderSchedules(0, 50).subscribe((data) => {
      this.orderSchedules = data;
    });
  }

  newOrderSchedule() {
    this.editingOrderSchedule = {
      id: 0,
      available_date: new Date(),
      note: '',
      products: [],
    };
    this.modalNavbarService.setEditingOrderSchedule(true);
  }

  modifyOrderSchedule(orderSchedule: OrderScheduleModel) {
    this.editingOrderSchedule = { ...orderSchedule };
    this.modalNavbarService.setEditingOrderSchedule(true);
  }

  saveOrderSchedule(orderSchedule: OrderScheduleModel) {
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
  }

  async deleteOrderSchedule(orderSchedule: OrderScheduleModel) {
    const alert = await this.alertController.create({
      header: 'Törlés',
      message: 'Biztosan törölni szeretnéd ezt a sütési napot?',
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
}
