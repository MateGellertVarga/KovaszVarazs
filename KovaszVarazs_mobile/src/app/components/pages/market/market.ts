import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  IonToolbar,
  IonHeader,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { DataService } from 'src/app/services/data.service';
import { OrderModel } from 'src/models/orderModel';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-market',
  templateUrl: './market.html',
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    DatePipe,
  ],
  providers: [DatePipe],
})
export class Market implements OnInit {
  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
    private modalNavbarService: ModalNavbarService,
    private changeDetectorRef: ChangeDetectorRef,
    private websocketService: WebsocketService
  ) {
    registerLocaleData(localeHu);
  }

  isLoading: boolean = true;
  availableOrderSchedules: OrderScheduleModel[] = [];
  selectedSchedule: OrderScheduleModel | null = null;
  order: OrderModel | null = null;
  isProcessing: boolean = false;
  isConfirmModalOpen: boolean = false;
  errorMessage: string = '';
  private websocketCleanup: (() => void) | null = null;
  private websocketInitialized = false;
  get toolbarTitle(): string {
    if (this.selectedSchedule) {
      return (
        new DatePipe('hu-HU').transform(
          this.selectedSchedule.available_date,
          'yyyy.MM.dd EEEE'
        ) || ''
      );
    }
    return 'Kassza';
  }

  ngOnInit() {
    void this.initializeWebsocketSubscription();
    this.loadSchedules();
  }

  ionViewWillLeave() {
    this.selectedSchedule = null;
    this.order = null;
    this.isConfirmModalOpen = false;
    this.cleanupWebsocketSubscription();
  }

  refresh(event: any) {
    this.loadSchedules();
    event.target.complete();
  }

  loadSchedules() {
    this.isLoading = true;
    this.dataService.getOrderSchedules(0, 50).subscribe({
      next: (schedules) => {
        this.availableOrderSchedules = schedules.sort(
          (a, b) =>
            new Date(a.available_date).getTime() -
            new Date(b.available_date).getTime()
        );
        if (this.selectedSchedule) {
          const updatedSchedule = this.availableOrderSchedules.find(
            (s) => s.id === this.selectedSchedule!.id
          );
          if (updatedSchedule) {
            this.selectedSchedule = updatedSchedule;
            if (this.selectedSchedule.products) {
              this.selectedSchedule.products = [
                ...this.selectedSchedule.products,
              ].sort((a: any, b: any) =>
                (a.product_name || '').localeCompare(b.product_name || '')
              );
            }
          }
        }
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message ?? err.message;
        this.isLoading = false;
      },
    });
  }

  selectOrderSchedule(schedule: OrderScheduleModel) {
    this.selectedSchedule = schedule;

    if (this.selectedSchedule.products) {
      this.selectedSchedule.products = [...this.selectedSchedule.products].sort(
        (a: any, b: any) =>
          (a.product_name || '').localeCompare(b.product_name || '')
      );
    }
    this.initializeOrder();
  }

  clearCart() {
    this.initializeOrder();
  }

  initializeOrder() {
    if (!this.selectedSchedule) return;

    this.order = {
      id: 0,
      customer_name: `#${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'completed',
      is_paying: true,
      already_paid: false,
      total_price: 0,
      order_schedule_id: this.selectedSchedule.id,
      order_schedule_date: new Date(this.selectedSchedule.available_date),
      order_items: [],
    };
  }

  getCartCount(productId: number): number {
    if (!this.order) return 0;
    const item = this.order.order_items.find((i) => i.product_id === productId);
    return item ? item.quantity : 0;
  }

  addToCart(product: any) {
    if (!this.order) return;

    const currentCount = this.getCartCount(product.id);
    const available = product.remaining_quantity || 0;

    if (currentCount < available) {
      const existingItem = this.order.order_items.find(
        (i) => i.product_id === product.id
      );

      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.order.order_items.push({
          product_id: product.id,
          product_name: product.product_name,
          quantity: 1,
        });
      }
      this.calculateTotal();
    }
  }

  removeFromCart(event: Event, productId: number) {
    event.stopPropagation();

    if (!this.order) return;

    const itemIndex = this.order.order_items.findIndex(
      (i) => i.product_id === productId
    );

    if (itemIndex !== -1) {
      if (this.order.order_items[itemIndex].quantity > 1) {
        this.order.order_items[itemIndex].quantity--;
      } else {
        this.order.order_items.splice(itemIndex, 1);
      }
      this.calculateTotal();
    }
  }

  calculateTotal() {
    if (!this.order || !this.selectedSchedule) return;

    this.order.total_price = 0;

    this.order.order_items.forEach((item) => {
      const product = this.selectedSchedule!.products?.find(
        (p: any) => p.id === item.product_id
      );
      if (product) {
        this.order!.total_price += item.quantity * (product.unit_price || 0);
      }
    });
  }

  confirmCheckout() {
    if (!this.order || this.order.order_items.length === 0) return;
    this.isConfirmModalOpen = true;
  }

  cancelCheckout() {
    this.isConfirmModalOpen = false;
  }

  sendOrder() {
    if (!this.order || this.isProcessing) return;
    this.isProcessing = true;

    this.dataService.addOrder(this.order as any).subscribe({
      next: () => {
        this.initializeOrder();
        this.loadSchedules();
        this.isConfirmModalOpen = false;
        this.isProcessing = false;
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = err.error?.message ?? err.message;
      },
    });
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
            this.loadSchedules();
            this.calculateTotal();
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
