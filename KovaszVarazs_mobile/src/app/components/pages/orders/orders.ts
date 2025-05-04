import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import {
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonRefresherContent,
  IonRefresher,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { OrderModel } from 'src/models/orderModel';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { OrderModalComponent } from '../../modals/order-modal/order-modal.component';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';

@Component({
  selector: 'orders',
  templateUrl: 'orders.html',
  imports: [
    CommonModule,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    IonFabButton,
    IonFab,
    IonCardTitle,
    IonCardSubtitle,
    IonCardHeader,
    IonCardContent,
    IonCard,
    IonButton,
    IonItem,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    DatePipe,
    OrderModalComponent,
  ],
  providers: [DatePipe],
})
export default class Orders {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    registerLocaleData(localeHu);
  }

  isLoading: boolean = true;
  orderSchedules: OrderScheduleModel[] = [];
  allOrders: OrderModel[] = [];
  orders: OrderModel[] = [];

  currentOrderSchedule: OrderScheduleModel | null = null;
  editingOrder: OrderModel | null = null;
  orderSummary: { product_name: string; totalQuantity: number }[] = [];
  totalIncome: number = 0;

  ionViewWillEnter() {
    this.isLoading = true;
    this.dataService.getOrderSchedules(50, 50).subscribe((orderSchedules) => {
      this.orderSchedules = orderSchedules.sort(
        (a, b) =>
          new Date(a.available_date).getTime() -
          new Date(b.available_date).getTime()
      );

      if (!this.currentOrderSchedule) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySchedule = this.orderSchedules.find(
          (s) =>
            new Date(s.available_date).toDateString() === today.toDateString()
        );

        const futureSchedules = this.orderSchedules.filter(
          (s) => new Date(s.available_date) > today
        );

        const pastSchedules = this.orderSchedules.filter(
          (s) => new Date(s.available_date) < today
        );

        if (todaySchedule) {
          this.currentOrderSchedule = todaySchedule;
        } else if (futureSchedules.length > 0) {
          this.currentOrderSchedule = futureSchedules[0];
        } else if (pastSchedules.length > 0) {
          this.currentOrderSchedule = pastSchedules[pastSchedules.length - 1];
        } else {
          this.currentOrderSchedule = null;
        }
      }

      if (this.currentOrderSchedule) {
        this.loadOrdersForCurrentSchedule();
      } else {
        console.error('Nincs egyetlen elérhető sütési nap sem!');
      }
    });
  }

  loadOrdersForCurrentSchedule() {
    this.dataService
      .getOrdersByOrderScheduleId(this.currentOrderSchedule!.id)
      .subscribe({
        next: (orders) => {
          this.allOrders = orders;
          this.orders = [...orders];
          this.isLoading = false;
          this.sortOrders();
          this.calculateSummary();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  nextOrderSchedule() {
    const currentIndex = this.orderSchedules.findIndex(
      (s) => s.id === this.currentOrderSchedule?.id
    );
    if (currentIndex >= 0 && currentIndex < this.orderSchedules.length - 1) {
      this.currentOrderSchedule = this.orderSchedules[currentIndex + 1];
      this.loadOrdersForCurrentSchedule();
    }
  }

  previousOrderSchedule() {
    const currentIndex = this.orderSchedules.findIndex(
      (s) => s.id === this.currentOrderSchedule?.id
    );
    if (currentIndex > 0) {
      this.currentOrderSchedule = this.orderSchedules[currentIndex - 1];
      this.loadOrdersForCurrentSchedule();
    }
  }

  refresh(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  sortOrders() {
    const status: Record<'pending' | 'processing' | 'completed', number> = {
      pending: 0,
      processing: 1,
      completed: 2,
    };

    this.orders.sort((a, b) => {
      const statusDiff =
        status[a.status as keyof typeof status] -
        status[b.status as keyof typeof status];
      return statusDiff !== 0
        ? statusDiff
        : a.customer_name!.localeCompare(b.customer_name!);
    });
  }

  searchOrders(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.orders = this.allOrders.filter((d) =>
      d.customer_name!.toLowerCase().includes(query)
    );
  }

  newOrder() {
    this.editingOrder = {
      id: 0,
      customer_name: '',
      phone_number: '',
      note: '',
      status: 'pending',
      is_paying: true,
      already_paid: false,
      total_price: 0,
      order_schedule_id: this.currentOrderSchedule!.id,
      order_schedule_date: new Date(),
      order_items: [],
    };
    this.modalNavbarService.openModal();
  }

  modifyOrder(order: OrderModel) {
    this.editingOrder = { ...order };
    this.modalNavbarService.openModal();
  }

  saveOrder(order: OrderModel) {
    if (this.editingOrder) {
      const index = this.orders.findIndex(
        (o) => o.id === this.editingOrder!.id
      );
      if (index !== -1) {
        this.orders[index] = order;
      } else {
        this.orders.push(order);
      }
      this.editingOrder = null;
      this.sortOrders();
      this.calculateSummary();
    }
  }

  async deleteOrder(order: OrderModel) {
    const alert = await this.alertController.create({
      header: 'Törlés',
      message: 'Biztosan törölni szeretnéd a rendelést?',
      buttons: [
        {
          text: 'Mégse',
          role: 'cancel',
        },
        {
          text: 'Törlés',
          role: 'confirm',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.dataService.deleteOrder(order.id).subscribe({
        next: () => {
          const index = this.orders.findIndex((o) => o.id === order.id);
          if (index !== -1) {
            this.orders.splice(index, 1);
            this.changeDetectorRef.detectChanges();
            this.calculateSummary();
          }
        },
        error: (err) => {
          console.error('Törlés sikertelen:', err);
        },
      });
    }
  }

  changeOrderStatus(id: number) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return;

    if (order.status === 'pending') {
      order.status = 'processing';
    } else if (order.status === 'processing') {
      order.status = 'completed';
    }

    this.dataService.updateOrder(order.id, order).subscribe({
      next: () => {
        this.sortOrders();
        this.calculateSummary();
      },
      error: (err) => {
        console.error('Hiba a státusz frissítésekor:', err);
      },
    });
  }

  calculateSummary() {
    this.totalIncome = 0;
    const productMap = new Map<string, { totalQuantity: number }>();

    for (const order of this.orders) {
      for (const item of order.order_items) {
        if (!productMap.has(item.product_name)) {
          productMap.set(item.product_name, { totalQuantity: 0 });
        }
        const product = productMap.get(item.product_name);
        product!.totalQuantity += item.quantity;
      }
    }

    this.orderSummary = Array.from(productMap, ([product_name, data]) => ({
      product_name,
      totalQuantity: data.totalQuantity,
    }));

    this.orders.forEach((order) => {
      if (order.status === 'completed') {
        this.totalIncome += Number(order.total_price || 0);
      }
    });
  }
}
