import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { OrderModel } from '../../../../models/orderModel';
import {
  OrderScheduleModel,
  Product,
} from '../../../../models/orderScheduleModel';
import { AdminModalComponent } from '../admin-modal/admin-modal.component';

@Component({
  selector: 'app-admin-order-modal',
  imports: [FormsModule, AdminModalComponent],
  templateUrl: './admin-order-modal.component.html',
})
export class AdminOrderModalComponent implements OnInit {
  @Input() order: OrderModel | null = null;
  @Input() orderSchedule: OrderScheduleModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<OrderModel>();

  constructor(private dataService: DataService) {}

  isSaving = false;
  products: Product[] = [];
  productQuantities: { [productId: number]: number } = {};
  errorMessage = '';

  ngOnInit() {
    this.products = [...(this.orderSchedule?.products ?? [])].sort((a, b) =>
      a.product_name.localeCompare(b.product_name),
    );
    this.initProductQuantities();
  }

  initProductQuantities() {
    this.productQuantities = {};
    this.products.forEach((product) => {
      this.productQuantities[product.id] = 0;
    });
    this.order?.order_items.forEach((item) => {
      this.productQuantities[item.product_id] = item.quantity;
    });
  }

  // Adminként nincs felső korlát (a mobil apphoz hasonlóan túl is lehet foglalni).
  increaseQuantity(productId: number) {
    this.productQuantities[productId] =
      (this.productQuantities[productId] ?? 0) + 1;
  }

  decreaseQuantity(productId: number) {
    if ((this.productQuantities[productId] ?? 0) > 0) {
      this.productQuantities[productId]--;
    }
  }

  onQuantityChange(productId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    this.productQuantities[productId] = isNaN(newQuantity)
      ? 0
      : Math.max(0, newQuantity);
    input.value = String(this.productQuantities[productId]);
  }

  save() {
    if (!this.order) return;
    this.syncOrderItemsFromQuantities();
    if (!this.checkRequiredFields()) return;

    this.isSaving = true;
    const saveObservable =
      this.order.id != 0
        ? this.dataService.updateOrder(this.order.id, this.order)
        : this.dataService.addOrder(this.order);
    saveObservable.subscribe({
      next: (order: OrderModel) => {
        this.isSaving = false;
        this.saved.emit(order);
      },
      error: (error: any) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message ?? error.message;
      },
    });
  }

  syncOrderItemsFromQuantities() {
    const previousItems = this.order!.order_items;
    this.order!.order_items = Object.entries(this.productQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const productId = Number(id);
        const productName =
          this.products.find((p) => p.id === productId)?.product_name ??
          previousItems.find((i) => i.product_id === productId)
            ?.product_name ??
          '';
        return {
          product_id: productId,
          product_name: productName,
          quantity,
        };
      });
  }

  checkRequiredFields(): boolean {
    this.errorMessage = '';
    if (!this.order?.customer_name) {
      this.errorMessage += 'Név kötelező!\n';
    }
    if (this.order?.is_paying == null) {
      this.errorMessage += 'Fizet-e kötelező!\n';
    }
    if (!this.order?.order_schedule_id) {
      this.errorMessage += 'Nap kötelező!\n';
    }
    if (
      !this.order?.order_items ||
      this.order.order_items.length === 0 ||
      !this.order.order_items.some((item) => item.quantity > 0)
    ) {
      this.errorMessage += 'Legalább egy termék kötelező!\n';
    }
    this.errorMessage = this.errorMessage.trim();
    return !this.errorMessage;
  }
}
