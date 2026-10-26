import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
  CommonModule,
  formatDate,
  registerLocaleData,
} from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { DataService } from '../../../services/data.service';
import { WebsocketService } from '../../../services/websocket.service';
import {
  OrderScheduleModel,
  Product,
} from '../../../../models/orderScheduleModel';
import { OrderModel } from '../../../../models/orderModel';

@Component({
  selector: 'app-admin-market-page',
  imports: [NavbarComponent, CommonModule, AdminPageHeaderComponent],
  templateUrl: './admin-market-page.component.html',
})
export class AdminMarketPageComponent implements OnInit, OnDestroy {
  constructor(
    private dataService: DataService,
    private websocketService: WebsocketService,
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

  get toolbarTitle(): string {
    if (this.selectedSchedule) {
      return formatDate(
        this.selectedSchedule.available_date,
        'yyyy.MM.dd EEEE',
        'hu',
      );
    }
    return 'Kassza';
  }

  ngOnInit() {
    this.initializeWebsocketSubscription();
    this.loadSchedules();
  }

  ngOnDestroy() {
    this.cleanupWebsocketSubscription();
    document.body.classList.remove('overflow-hidden');
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.isConfirmModalOpen) this.cancelCheckout();
  }

  loadSchedules(silent = false) {
    if (!silent) this.isLoading = true;
    this.dataService.getOrderSchedules(0, 50).subscribe({
      next: (schedules) => {
        this.availableOrderSchedules = schedules.sort(
          (a, b) =>
            new Date(a.available_date).getTime() -
            new Date(b.available_date).getTime(),
        );
        if (this.selectedSchedule) {
          const updatedSchedule = this.availableOrderSchedules.find(
            (s) => s.id === this.selectedSchedule!.id,
          );
          if (updatedSchedule) {
            this.selectedSchedule = updatedSchedule;
            this.sortSelectedScheduleProducts();
            this.calculateTotal();
          }
        }
        this.isLoading = false;
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
    this.sortSelectedScheduleProducts();
    this.initializeOrder();
  }

  backToScheduleSelection() {
    this.selectedSchedule = null;
    this.order = null;
    this.closeConfirmModal();
  }

  private sortSelectedScheduleProducts() {
    if (this.selectedSchedule?.products) {
      this.selectedSchedule.products = [...this.selectedSchedule.products].sort(
        (a, b) => (a.product_name || '').localeCompare(b.product_name || ''),
      );
    }
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

  addToCart(product: Product) {
    if (!this.order) return;

    const currentCount = this.getCartCount(product.id);
    const available = product.remaining_quantity || 0;
    if (currentCount >= available) return;

    const existingItem = this.order.order_items.find(
      (i) => i.product_id === product.id,
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

  removeFromCart(event: Event, productId: number) {
    event.stopPropagation();
    if (!this.order) return;

    const itemIndex = this.order.order_items.findIndex(
      (i) => i.product_id === productId,
    );
    if (itemIndex === -1) return;

    if (this.order.order_items[itemIndex].quantity > 1) {
      this.order.order_items[itemIndex].quantity--;
    } else {
      this.order.order_items.splice(itemIndex, 1);
    }
    this.calculateTotal();
  }

  calculateTotal() {
    if (!this.order || !this.selectedSchedule) return;

    this.order.total_price = this.order.order_items.reduce((sum, item) => {
      const product = this.selectedSchedule!.products?.find(
        (p) => p.id === item.product_id,
      );
      return sum + (product ? item.quantity * (product.unit_price || 0) : 0);
    }, 0);
  }

  confirmCheckout() {
    if (!this.order || this.order.order_items.length === 0) return;
    this.errorMessage = '';
    this.isConfirmModalOpen = true;
    document.body.classList.add('overflow-hidden');
  }

  cancelCheckout() {
    if (this.isProcessing) return;
    this.closeConfirmModal();
  }

  private closeConfirmModal() {
    this.isConfirmModalOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  sendOrder() {
    if (!this.order || this.isProcessing) return;
    this.isProcessing = true;

    this.dataService.addOrder(this.order).subscribe({
      next: () => {
        this.isProcessing = false;
        this.initializeOrder();
        this.loadSchedules(true);
        this.closeConfirmModal();
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = err.error?.message ?? err.message;
      },
    });
  }

  private initializeWebsocketSubscription() {
    try {
      this.websocketCleanup = this.websocketService.listenToPrivateChannel(
        'order-schedules',
        '.order-schedules.changed',
        () => this.loadSchedules(true),
      );
    } catch (error) {
      console.error('Nem sikerült csatlakozni a websocket csatornához:', error);
    }
  }

  private cleanupWebsocketSubscription() {
    this.websocketCleanup?.();
    this.websocketCleanup = null;
  }
}
