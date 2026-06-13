import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
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
  IonRefresherContent,
  IonRefresher,
  IonSearchbar,
  IonLabel,
  IonButtons,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { OrderModel } from 'src/models/orderModel';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { OrderModalComponent } from '../../modals/order-modal/order-modal.component';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'orders',
  templateUrl: 'orders.html',
  imports: [
    IonButtons,
    IonLabel,
    CommonModule,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
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
    IonMenuButton,
  ],
  providers: [DatePipe],
})
export default class Orders {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef,
    private websocketService: WebsocketService
  ) {
    registerLocaleData(localeHu);
  }

  @ViewChild('orderListContainer')
  orderListContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('nameListContainer')
  nameListContainer!: ElementRef<HTMLDivElement>;

  private observer: IntersectionObserver | null = null;
  private isClickScrolling = false;

  isLoading: boolean = true;
  orderSchedules: OrderScheduleModel[] = [];
  allOrders: OrderModel[] = [];
  orders: OrderModel[] = [];
  names: string[] = [];
  activeName: string = '';
  currentOrderSchedule: OrderScheduleModel | null = null;
  editingOrder: OrderModel | null = null;
  orderSummary: { product_name: string; totalQuantity: number }[] = [];
  totalIncome: number = 0;
  private orderChangesCleanup: (() => void) | null = null;
  private orderScheduleChangesCleanup: (() => void) | null = null;
  private websocketInitialized = false;

  ionViewWillEnter() {
    void this.initializeWebsocketSubscriptions();
    this.loadOrdersViewData();
  }

  private loadOrdersViewData() {
    this.isLoading = true;

    this.dataService.getOrderSchedules(50, 50).subscribe({
      next: (orderSchedules) => {
        this.orderSchedules = orderSchedules.sort(
          (a, b) =>
            new Date(a.available_date).getTime() -
            new Date(b.available_date).getTime()
        );

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

        const existing = this.orderSchedules.find(
          (s) => s.id === this.currentOrderSchedule?.id
        );

        if (!this.currentOrderSchedule || !existing) {
          this.currentOrderSchedule =
            todaySchedule ??
            futureSchedules[0] ??
            pastSchedules[pastSchedules.length - 1] ??
            null;
        } else {
          this.currentOrderSchedule = existing;
        }

        if (this.currentOrderSchedule) {
          this.loadOrdersForCurrentSchedule();
          this.refreshObserver();
        } else {
          console.error('Nincs egyetlen elérhető sütési nap sem!');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Nem sikerült lekérni a sütési napokat:', err);
        this.isLoading = false;
      },
    });
  }

  ionViewWillLeave() {
    this.cleanupWebsocketSubscriptions();
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  ngOnDestroy() {
    this.cleanupWebsocketSubscriptions();
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  loadOrdersForCurrentSchedule() {
    this.dataService
      .getOrdersByOrderScheduleId(this.currentOrderSchedule!.id)
      .subscribe({
        next: (orders) => {
          this.allOrders = orders;
          this.orders = [...orders];
          this.sortOrders();
          this.isLoading = false;
          this.calculateSummary();
          this.refreshObserver();
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
    this.names = [];
    this.orders.forEach((o) => {
      if (o.customer_name) {
        this.names.push(o.customer_name);
      }
    });
  }

  searchOrders(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';

    this.orders = this.allOrders.filter((d) =>
      d.customer_name!.toLowerCase().includes(query)
    );
    this.names = this.allOrders
      .filter((d) => d.customer_name!.toLowerCase().includes(query))
      .map((d) => d.customer_name!)
      .sort((a, b) => a.localeCompare(b));
    this.refreshObserver();
  }

  newOrder() {
    this.dataService.getOrderSchedule(this.currentOrderSchedule!.id).subscribe({
      next: (schedule) => {
        this.currentOrderSchedule = schedule;
        this.editingOrder = {
          id: 0,
          customer_name: '',
          phone_number: '',
          note: '',
          status: 'pending',
          is_paying: true,
          already_paid: false,
          total_price: 0,
          order_schedule_id: schedule.id,
          order_schedule_date: new Date(schedule.available_date),
          order_items: [],
        };
        this.modalNavbarService.openModal();
      },
      error: (err) =>
        console.error('Nem sikerült lekérni a sütési nap részleteit:', err),
    });
  }

  modifyOrder(order: OrderModel) {
    this.dataService.getOrderSchedule(order.order_schedule_id).subscribe({
      next: (schedule) => {
        this.currentOrderSchedule = schedule;
        this.editingOrder = { ...order };
        this.modalNavbarService.openModal();
      },
      error: (err) =>
        console.error('Nem sikerült lekérni a sütési nap részleteit:', err),
    });
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
      this.names = this.orders
        .map((o) => o.customer_name!)
        .sort((a, b) => a.localeCompare(b));
      this.refreshObserver();
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
            this.names = this.orders
              .map((o) => o.customer_name!)
              .sort((a, b) => a.localeCompare(b));
            this.refreshObserver();
          }
        },
        error: (err) => {
          console.error('Törlés sikertelen:', err);
        },
      });
    }
  }

  private setupIntersectionObserver() {
    if (!this.orderListContainer) return;

    const options = {
      root: this.orderListContainer.nativeElement,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      if (this.isClickScrolling) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const customerName = entry.target.getAttribute('data-customer-name');
          if (customerName && this.activeName !== customerName) {
            this.activeName = customerName;
            this.changeDetectorRef.detectChanges();
            this.scrollNameListToActive();
          }
        }
      });
    }, options);
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      const cards =
        this.orderListContainer.nativeElement.querySelectorAll(
          '.order-card-item'
        );
      cards.forEach((card) => this.observer?.observe(card));
    }, 100);
  }

  refreshObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 200);
  }

  private scrollNameListToActive() {
    if (!this.nameListContainer) return;
    const items =
      this.nameListContainer.nativeElement.querySelectorAll('ion-item');
    let targetItem: HTMLElement | null = null;

    items.forEach((item: any) => {
      if (item.textContent?.trim() === this.activeName) {
        targetItem = item;
      }
    });

    if (targetItem) {
      (targetItem as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }

  scrollToOrder(customerName: string) {
    this.activeName = customerName;
    const targetOrder = this.orders.find(
      (o) => o.customer_name === customerName
    );

    if (targetOrder) {
      const element = document.getElementById('order-' + targetOrder.id);

      if (element) {
        this.isClickScrolling = true;
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          this.isClickScrolling = false;
        }, 600);
      }
    }
  }

  changeOrderStatusForward(id: number) {
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

  orderStatusReverse(id: number) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return;
    order.status = 'processing';

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
    this.orderSummary.sort((a, b) =>
      a.product_name.localeCompare(b.product_name)
    );

    this.orders.forEach((order) => {
      if (order.status === 'completed') {
        this.totalIncome += Number(order.total_price || 0);
      }
    });
  }

  private async initializeWebsocketSubscriptions() {
    if (this.websocketInitialized) {
      return;
    }

    try {
      this.orderChangesCleanup =
        await this.websocketService.listenToPrivateChannel(
          'orders',
          '.orders.changed',
          () => {
            this.loadOrdersViewData();
          }
        );

      this.orderScheduleChangesCleanup =
        await this.websocketService.listenToPrivateChannel(
          'order-schedules',
          '.order-schedules.changed',
          () => {
            this.loadOrdersViewData();
          }
        );

      this.websocketInitialized = true;
    } catch (error) {
      console.error(
        'Nem sikerült csatlakozni a websocket csatornákhoz:',
        error
      );
    }
  }

  private cleanupWebsocketSubscriptions() {
    this.orderChangesCleanup?.();
    this.orderChangesCleanup = null;

    this.orderScheduleChangesCleanup?.();
    this.orderScheduleChangesCleanup = null;

    this.websocketInitialized = false;
  }
}
