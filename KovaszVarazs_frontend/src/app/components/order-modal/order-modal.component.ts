import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { OrderModel } from '../../../models/orderModel';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { OrderScheduleModel } from '../../../models/orderScheduleModel';

@Component({
  selector: 'app-order-modal',
  imports: [DatePipe, CommonModule, DialogModule, FormsModule],
  templateUrl: './order-modal.component.html',
  styleUrl: './order-modal.component.css',
})
export class OrderModalComponent implements OnChanges {
  @Input() order: OrderModel | null = null;
  @Output() saved = new EventEmitter<OrderModel>();
  @Output() canceled = new EventEmitter<void>();
  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {
    registerLocaleData(localeHu);
  }

  isLoading = true;
  orderStep = 0;
  displayedStep = 0;
  slideDirection: 'left' | 'right' = 'right';
  steps = [0, 1, 2, 3];
  stepTitles = ['Nap', 'Termékek', 'Adatok', 'Összegzés'];
  availableOrderSchedules: OrderScheduleModel[] = [];
  selectedOrderSchedule: OrderScheduleModel | null = null;
  productQuantities: { [product_name: string]: number } = {};
  successfullySent = false;
  errorMessage = '';

  get isSelectedScheduleExpired(): boolean {
    if (!this.selectedOrderSchedule) return false;
    const availableDate = new Date(this.selectedOrderSchedule.available_date);
    const deadline = new Date(availableDate);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(6, 0, 0, 0);
    return new Date() > deadline;
  }

  get currentSteps(): number[] {
    return this.isSelectedScheduleExpired ? [0, 1] : [0, 1, 2, 3];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['order']) {
      this.isLoading = true;
      this.orderStep = 0;
      this.displayedStep = 0;
      this.errorMessage = '';
      this.dataService.getOrderSchedules(0, 50).subscribe({
        next: (schedules) => {
          this.availableOrderSchedules = schedules;
          if (this.order && this.order.order_schedule_id) {
            this.selectedOrderSchedule =
              this.availableOrderSchedules.find(
                (s) => s.id === this.order!.order_schedule_id
              ) ?? this.availableOrderSchedules[0];
          } else {
            this.selectedOrderSchedule =
              this.availableOrderSchedules[0] ?? null;
          }
          if (this.selectedOrderSchedule && this.order) {
            this.order.order_schedule_id = this.selectedOrderSchedule.id;
            this.order.order_schedule_date = new Date(
              this.selectedOrderSchedule.available_date
            );
          }
          this.initProductQuantities();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }

  nextOrderStep() {
    this.errorMessage = '';
    if (this.orderStep === 0 && !this.selectedOrderSchedule) {
      this.errorMessage = 'Először válassz egy rendelési napot!';
      return;
    }
    if (this.orderStep === 1) {
      if (this.isSelectedScheduleExpired) {
        return;
      }
      const sum = Object.values(this.productQuantities).reduce(
        (a, b) => a + (b ?? 0),
        0
      );
      if (sum < 1) {
        this.errorMessage = 'Válassz legalább 1 db terméket!';
        return;
      }
    }
    if (this.orderStep === 2) {
      if (!this.order?.customer_name) {
        this.errorMessage = 'Név megadása kötelező!';
        return;
      }
      if (this.order.customer_name.trim().length < 3) {
        this.errorMessage = 'Név túl rövid!';
        return;
      }
      this.syncOrderItemsFromQuantities();
    }

    if (this.orderStep < this.currentSteps.length - 1) {
      this.slideDirection = 'right';
      this.displayedStep = this.orderStep + 1;
      setTimeout(() => {
        this.orderStep++;
      }, 250);
    }
  }

  prevOrderStep() {
    this.errorMessage = '';
    if (this.orderStep > 0) {
      if (this.orderStep === 2) {
        this.syncOrderItemsFromQuantities();
      }
      this.slideDirection = 'left';
      this.displayedStep = this.orderStep - 1;
      setTimeout(() => {
        this.orderStep--;
      }, 250);
    }
  }

  goToStep(stepIndex: number) {
    this.errorMessage = '';
    if (stepIndex === this.orderStep) return;
    if (stepIndex > this.orderStep) {
      if (stepIndex !== this.orderStep + 1) return;
      if (this.orderStep === 0 && !this.selectedOrderSchedule) {
        this.errorMessage = 'Először válassz egy rendelési napot!';
        return;
      }
      if (this.orderStep === 1) {
        if (this.isSelectedScheduleExpired) return;
        
        const sum = Object.values(this.productQuantities).reduce(
          (a, b) => a + (b ?? 0),
          0
        );
        if (sum < 1) {
          this.errorMessage = 'Válassz legalább 1 db terméket!';
          return;
        }
      }
      if (this.orderStep === 2) {
        if (!this.order?.customer_name) {
          this.errorMessage = 'Név megadása kötelező!';
          return;
        }
        if (this.order.customer_name.trim().length < 3) {
          this.errorMessage = 'Név túl rövid!';
          return;
        }
        this.syncOrderItemsFromQuantities();
      }

      this.slideDirection = 'right';
      this.displayedStep = stepIndex;
      setTimeout(() => {
        this.orderStep = stepIndex;
      }, 250);
      return;
    }

    if (stepIndex < this.orderStep) {
      this.slideDirection = 'left';
      this.displayedStep = stepIndex;
      setTimeout(() => {
        this.orderStep = stepIndex;
      }, 250);
    }
  }

  selectOrderSchedule(schedule: OrderScheduleModel) {
    this.selectedOrderSchedule = schedule;
    if (this.order) {
      this.order.order_schedule_id = schedule.id;
      this.order.order_schedule_date = new Date(schedule.available_date);
    }
    this.initProductQuantities();
  }

  initProductQuantities() {
    this.productQuantities = {};
    if (this.order && this.order.order_items.length > 0) {
      this.order.order_items.forEach((item) => {
        const cap = this.getProductRemaining(item.product_id);
        const q = Math.min(item.quantity, cap);
        this.productQuantities[item.product_id] = q;
      });
      this.selectedOrderSchedule?.products.forEach((product) => {
        if (!(product.id in this.productQuantities)) {
          this.productQuantities[product.id] = 0;
        }
      });
    } else {
      this.selectedOrderSchedule?.products.forEach((product) => {
        this.productQuantities[product.id] = 0;
      });
    }
  }

  getProductMax(productId: number): number {
    if (!this.selectedOrderSchedule) return 0;
    const p = this.selectedOrderSchedule.products.find(
      (p) => p.id === productId
    );
    return p ? p.max_quantity : 0;
  }

  getProductRemaining(productId: number): number {
    if (!this.selectedOrderSchedule) return 0;
    const p = this.selectedOrderSchedule.products.find(
      (p) => p.id === productId
    );
    return p ? p.remaining_quantity : 0;
  }

  increaseQuantity(product_id: number) {
    if (
      this.productQuantities[product_id] < this.getProductRemaining(product_id)
    ) {
      this.productQuantities[product_id]++;
    }
  }

  decreaseQuantity(product_id: number) {
    if (this.productQuantities[product_id] > 0) {
      this.productQuantities[product_id]--;
    }
  }

  onQuantityChange(product_id: number, event: Event) {
    const input = event.target as HTMLInputElement;
    let newQuantity = parseInt(input.value, 10);
    if (isNaN(newQuantity) || newQuantity < 0) newQuantity = 0;
    const cap = this.getProductRemaining(product_id);
    if (newQuantity > cap) newQuantity = cap;
    this.productQuantities[product_id] = newQuantity;
  }

  syncOrderItemsFromQuantities() {
    if (!this.order || !this.selectedOrderSchedule) return;
    this.order.order_items = this.selectedOrderSchedule.products
      .filter((p) => (this.productQuantities[p.id] ?? 0) > 0)
      .map((p) => ({
        product_id: p.id,
        product_name: p.product_name,
        quantity: this.productQuantities[p.id],
      }));
  }

  getOrderTotal(): number {
    if (!this.order || !this.selectedOrderSchedule) return 0;
    let total = 0;
    for (const item of this.order.order_items) {
      const product = this.selectedOrderSchedule.products.find(
        (p) => p.id === item.product_id
      );
      if (product) total += item.quantity * product.unit_price;
    }
    return total;
  }

  save() {
    if (this.order) {
      if (this.selectedOrderSchedule) {
        this.order.order_schedule_id = this.selectedOrderSchedule.id;
        this.order.order_schedule_date = new Date(this.selectedOrderSchedule.available_date);
      }
      this.syncOrderItemsFromQuantities();
      const saveObservable =
        this.order.id != 0
          ? this.dataService.updateOrder(this.order.id, this.order)
          : this.dataService.addOrder(this.order);
      saveObservable.subscribe({
        next: (order: OrderModel) => {
          this.successfullySent = true;
          setTimeout(() => {
            this.saved.emit(order);
            this.canceled.emit();
            this.resetState();
          }, 3000);
        },
        error: (error: any) => {
          this.errorMessage = error.error?.message ?? error.message;
        },
      });
    }
  }

  close() {
    this.canceled.emit();
    this.resetState();
  }

  private resetState() {
    this.isLoading = false;
    this.orderStep = 0;
    this.displayedStep = 0;
    this.successfullySent = false;
    this.errorMessage = '';
    this.order = null;
  }
}
