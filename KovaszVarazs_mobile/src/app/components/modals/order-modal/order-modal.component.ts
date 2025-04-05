import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { OrderModel } from 'src/models/orderModel';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss'],
  imports: [FormsModule],
})
export class OrderModalComponent implements OnInit {
  @Input() order: OrderModel | null = null;
  @Input() orderSchedule: OrderScheduleModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<OrderModel>();

  constructor(
    private dataService: DataService,
    private modalnavbarService: ModalNavbarService
  ) {}

  productQuantities: { [product_name: string]: number } = {};
  errorMessage: string = '';

  ngOnInit() {
    this.initProductQuantities();
  }

  initProductQuantities() {
    if (this.order && this.order.order_items.length > 0) {
      this.order.order_items.forEach((item) => {
        this.productQuantities[item.product_name] = item.quantity;
      });
      this.orderSchedule?.products.forEach((product) => {
        if (!(product.product_name in this.productQuantities)) {
          this.productQuantities[product.product_name] = 0;
        }
      });
    } else {
      this.orderSchedule?.products.forEach((product) => {
        this.productQuantities[product.product_name] = 0;
      });
    }
  }

  increaseQuantity(product_name: string) {
    if (this.productQuantities[product_name] !== undefined) {
      this.productQuantities[product_name]++;
    } else {
      this.productQuantities[product_name] = 1;
    }
  }

  decreaseQuantity(product_name: string) {
    if (
      this.productQuantities[product_name] !== undefined &&
      this.productQuantities[product_name] > 0
    ) {
      this.productQuantities[product_name]--;
    }
  }

  onQuantityChange(product_name: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    this.productQuantities[product_name] = isNaN(newQuantity) ? 0 : newQuantity;
  }

  cancel() {
    this.modalnavbarService.setEditingOrder(false);
    this.canceled.emit();
  }

  save() {
    if (this.order && this.checkRequiredFields()) {
      // this.dataService.addOrder(this.order!).subscribe({
      //   next: (order: OrderModel) => {
      //     this.saved.emit(order);
      //   },
      //   error: (error: any) => {
      //     this.errorMessage = error.error?.message ?? error.message;
      //   },
      // });
      this.modalnavbarService.setEditingOrder(false);
    }
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
    if (!this.order?.order_items || this.order?.order_items.length === 0) {
      this.errorMessage += 'Legalább egy termék kötelező!\n';
    }
    return !this.errorMessage;
  }
}
