import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { AdminOrderModalComponent } from '../admin-order-modal/admin-order-modal.component';
import { DataService } from '../../../services/data.service';
import { WebsocketService } from '../../../services/websocket.service';
import { ConfirmService } from '../../../services/confirm.service';
import { OrderModel } from '../../../../models/orderModel';
import { OrderScheduleModel } from '../../../../models/orderScheduleModel';

type OrderStatus = 'pending' | 'processing' | 'completed';

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending: 0,
  processing: 1,
  completed: 2,
};

@Component({
  selector: 'app-admin-orders-page',
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminOrderModalComponent,
  ],
  templateUrl: './admin-orders-page.component.html',
})
export class AdminOrdersPageComponent implements OnInit, OnDestroy {
  constructor(
    private dataService: DataService,
    private websocketService: WebsocketService,
    private confirmService: ConfirmService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    registerLocaleData(localeHu);
  }

  @ViewChild('orderListContainer')
  orderListContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('nameListContainer')
  nameListContainer?: ElementRef<HTMLDivElement>;

  private observer: IntersectionObserver | null = null;
  private observerTimeout: ReturnType<typeof setTimeout> | null = null;
  private isClickScrolling = false;
  private websocketCleanups: (() => void)[] = [];

  isLoading: boolean = true;
  orderSchedules: OrderScheduleModel[] = [];
  allOrders: OrderModel[] = [];
  orders: OrderModel[] = [];
  searchQuery: string = '';
  activeOrderId: number | null = null;
  currentOrderSchedule: OrderScheduleModel | null = null;
  editingOrder: OrderModel | null = null;
  orderSummary: { product_name: string; totalQuantity: number }[] = [];
  totalIncome: number = 0;
  updatingOrderIds = new Set<number>();

  ngOnInit() {
    this.initializeWebsocketSubscriptions();
    this.loadOrdersViewData();
  }

  ngOnDestroy() {
    this.cleanupWebsocketSubscriptions();
    this.disconnectObserver();
  }

  // A mobil app „resume” viselkedése: ha a fül újra előtérbe kerül, frissítünk.
  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.loadOrdersViewData(true);
    }
  }

  get currentScheduleIndex(): number {
    return this.orderSchedules.findIndex(
      (s) => s.id === this.currentOrderSchedule?.id,
    );
  }

  loadOrdersViewData(silent = false) {
    if (!silent) this.isLoading = true;

    this.dataService.getOrderSchedules(50, 50).subscribe({
      next: (orderSchedules) => {
        this.orderSchedules = orderSchedules.sort(
          (a, b) =>
            new Date(a.available_date).getTime() -
            new Date(b.available_date).getTime(),
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySchedule = this.orderSchedules.find(
          (s) =>
            new Date(s.available_date).toDateString() === today.toDateString(),
        );
        const futureSchedules = this.orderSchedules.filter(
          (s) => new Date(s.available_date) > today,
        );
        const pastSchedules = this.orderSchedules.filter(
          (s) => new Date(s.available_date) < today,
        );
        const existing = this.orderSchedules.find(
          (s) => s.id === this.currentOrderSchedule?.id,
        );

        this.currentOrderSchedule =
          existing ??
          todaySchedule ??
          futureSchedules[0] ??
          pastSchedules[pastSchedules.length - 1] ??
          null;

        if (this.currentOrderSchedule) {
          this.loadOrdersForCurrentSchedule();
        } else {
          this.allOrders = [];
          this.applyFilter();
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Nem sikerült lekérni a sütési napokat:', err);
        this.isLoading = false;
      },
    });
  }

  loadOrdersForCurrentSchedule() {
    const scheduleId = this.currentOrderSchedule!.id;
    this.dataService.getOrdersByOrderScheduleId(scheduleId).subscribe({
      next: (orders) => {
        // Gyors lapozásnál egy korábbi nap válasza ne írja felül az aktuálisat.
        if (this.currentOrderSchedule?.id !== scheduleId) return;
        this.allOrders = orders;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  nextOrderSchedule() {
    const currentIndex = this.currentScheduleIndex;
    if (currentIndex >= 0 && currentIndex < this.orderSchedules.length - 1) {
      this.switchSchedule(this.orderSchedules[currentIndex + 1]);
    }
  }

  previousOrderSchedule() {
    const currentIndex = this.currentScheduleIndex;
    if (currentIndex > 0) {
      this.switchSchedule(this.orderSchedules[currentIndex - 1]);
    }
  }

  private switchSchedule(schedule: OrderScheduleModel) {
    this.currentOrderSchedule = schedule;
    this.searchQuery = '';
    this.isLoading = true;
    this.loadOrdersForCurrentSchedule();
  }

  applyFilter() {
    const query = this.searchQuery.trim().toLowerCase();
    this.orders = this.allOrders.filter((o) =>
      (o.customer_name ?? '').toLowerCase().includes(query),
    );
    this.sortOrders();
    this.calculateSummary();
    this.refreshObserver();
  }

  sortOrders() {
    this.orders.sort((a, b) => {
      const statusDiff =
        STATUS_ORDER[a.status as OrderStatus] -
        STATUS_ORDER[b.status as OrderStatus];
      return statusDiff !== 0
        ? statusDiff
        : (a.customer_name ?? '').localeCompare(b.customer_name ?? '');
    });
  }

  calculateSummary() {
    const productMap = new Map<string, number>();
    for (const order of this.allOrders) {
      for (const item of order.order_items) {
        productMap.set(
          item.product_name,
          (productMap.get(item.product_name) ?? 0) + item.quantity,
        );
      }
    }
    this.orderSummary = Array.from(
      productMap,
      ([product_name, totalQuantity]) => ({ product_name, totalQuantity }),
    ).sort((a, b) => a.product_name.localeCompare(b.product_name));

    this.totalIncome = this.allOrders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + Number(order.total_price || 0), 0);
  }

  newOrder() {
    if (!this.currentOrderSchedule) return;
    this.dataService.getOrderSchedule(this.currentOrderSchedule.id).subscribe({
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
      },
      error: (err) =>
        console.error('Nem sikerült lekérni a sütési nap részleteit:', err),
    });
  }

  saveOrder(order: OrderModel) {
    const index = this.allOrders.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      this.allOrders[index] = order;
    } else {
      this.allOrders.push(order);
    }
    this.editingOrder = null;
    this.applyFilter();
  }

  async deleteOrder(order: OrderModel) {
    const confirmed = await this.confirmService.ask({
      title: 'Törlés',
      message: 'Biztosan törölni szeretnéd a rendelést?',
      confirmLabel: 'Törlés',
    });
    if (!confirmed) return;

    this.dataService.deleteOrder(order.id).subscribe({
      next: () => {
        this.allOrders = this.allOrders.filter((o) => o.id !== order.id);
        this.applyFilter();
      },
      error: (err) => {
        console.error('Törlés sikertelen:', err);
      },
    });
  }

  changeOrderStatusForward(order: OrderModel) {
    if (order.status === 'pending') {
      this.updateOrderStatus(order, 'processing');
    } else if (order.status === 'processing') {
      this.updateOrderStatus(order, 'completed');
    }
  }

  orderStatusReverse(order: OrderModel) {
    this.updateOrderStatus(order, 'processing');
  }

  private updateOrderStatus(order: OrderModel, status: OrderStatus) {
    if (this.updatingOrderIds.has(order.id)) return;
    const previousStatus = order.status;
    order.status = status;
    this.updatingOrderIds.add(order.id);

    this.dataService.updateOrder(order.id, order).subscribe({
      next: () => {
        this.updatingOrderIds.delete(order.id);
        this.sortOrders();
        this.calculateSummary();
        this.refreshObserver();
      },
      error: (err) => {
        this.updatingOrderIds.delete(order.id);
        order.status = previousStatus;
        console.error('Hiba a státusz frissítésekor:', err);
      },
    });
  }

  orderCardClass(order: OrderModel): string {
    if (order.status === 'processing') {
      return 'border-4 border-yellow-500 bg-yellow-100';
    }
    if (order.status === 'completed') {
      return 'border-4 border-green-700 bg-green-200';
    }
    return 'border border-gray-200 bg-white';
  }

  orderItemClass(order: OrderModel): string {
    if (order.status === 'processing') return 'bg-yellow-100';
    if (order.status === 'completed') return 'bg-green-200';
    return 'bg-white';
  }

  // --- Névlista és kártyák szinkron görgetése (mint a mobil app tablet nézetében) ---

  scrollToOrder(order: OrderModel) {
    this.activeOrderId = order.id;
    const container = this.orderListContainer?.nativeElement;
    const element = document.getElementById('order-' + order.id);
    if (!container || !element) return;

    this.isClickScrolling = true;
    const offset =
      element.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      container.clientHeight / 2 +
      element.clientHeight / 2;
    container.scrollTo({ top: offset, behavior: 'smooth' });
    setTimeout(() => {
      this.isClickScrolling = false;
    }, 600);
  }

  private refreshObserver() {
    this.disconnectObserver();
    this.observerTimeout = setTimeout(() => this.setupIntersectionObserver(), 200);
  }

  private disconnectObserver() {
    if (this.observerTimeout) clearTimeout(this.observerTimeout);
    this.observerTimeout = null;
    this.observer?.disconnect();
    this.observer = null;
  }

  private setupIntersectionObserver() {
    const container = this.orderListContainer?.nativeElement;
    if (!container) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.isClickScrolling) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const orderId = Number(entry.target.getAttribute('data-order-id'));
          if (orderId && this.activeOrderId !== orderId) {
            this.activeOrderId = orderId;
            this.changeDetectorRef.detectChanges();
            this.scrollNameListToActive();
          }
        }
      },
      { root: container, rootMargin: '-30% 0px -50% 0px', threshold: 0 },
    );
    container
      .querySelectorAll('.order-card-item')
      .forEach((card) => this.observer?.observe(card));
  }

  // Csak a névlistát görgetjük, az oldalt nem.
  private scrollNameListToActive() {
    const list = this.nameListContainer?.nativeElement;
    const item = list?.querySelector<HTMLElement>(
      `[data-name-order-id="${this.activeOrderId}"]`,
    );
    if (!list || !item) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < listRect.top) {
      list.scrollBy({ top: itemRect.top - listRect.top, behavior: 'smooth' });
    } else if (itemRect.bottom > listRect.bottom) {
      list.scrollBy({
        top: itemRect.bottom - listRect.bottom,
        behavior: 'smooth',
      });
    }
  }

  private initializeWebsocketSubscriptions() {
    try {
      this.websocketCleanups = [
        this.websocketService.listenToPrivateChannel(
          'orders',
          '.orders.changed',
          () => this.loadOrdersViewData(true),
        ),
        this.websocketService.listenToPrivateChannel(
          'order-schedules',
          '.order-schedules.changed',
          () => this.loadOrdersViewData(true),
        ),
      ];
    } catch (error) {
      console.error(
        'Nem sikerült csatlakozni a websocket csatornákhoz:',
        error,
      );
    }
  }

  private cleanupWebsocketSubscriptions() {
    this.websocketCleanups.forEach((cleanup) => cleanup());
    this.websocketCleanups = [];
  }
}
