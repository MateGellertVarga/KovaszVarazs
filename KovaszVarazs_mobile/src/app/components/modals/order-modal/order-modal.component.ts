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

  productQuantities: { [productName: string]: number } = {};
  errorMessage: string = '';

  ngOnInit() {
    this.initProductQuantities();
  }

  initProductQuantities() {
    if (this.order && this.order.orderItems.length > 0) {
      this.order.orderItems.forEach((item) => {
        this.productQuantities[item.productName] = item.quantity;
      });
      this.orderSchedule?.products.forEach((product) => {
        if (!(product.productName in this.productQuantities)) {
          this.productQuantities[product.productName] = 0;
        }
      });
    } else {
      this.orderSchedule?.products.forEach((product) => {
        this.productQuantities[product.productName] = 0;
      });
    }
  }

  increaseQuantity(productName: string) {
    if (this.productQuantities[productName] !== undefined) {
      this.productQuantities[productName]++;
    } else {
      this.productQuantities[productName] = 1;
    }
  }

  decreaseQuantity(productName: string) {
    if (
      this.productQuantities[productName] !== undefined &&
      this.productQuantities[productName] > 0
    ) {
      this.productQuantities[productName]--;
    }
  }

  onQuantityChange(productName: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    this.productQuantities[productName] = isNaN(newQuantity) ? 0 : newQuantity;
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
    if (!this.order?.customerName) {
      this.errorMessage += 'Név kötelező!\n';
    }
    if (this.order?.isPaying == null) {
      this.errorMessage += 'Fizet-e kötelező!\n';
    }
    if (!this.order?.orderScheduleId) {
      this.errorMessage += 'Nap kötelező!\n';
    }
    if (!this.order?.orderItems || this.order?.orderItems.length === 0) {
      this.errorMessage += 'Legalább egy termék kötelező!\n';
    }
    return !this.errorMessage;
  }
}
