import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { OrderScheduleModel } from '../../../../models/orderScheduleModel';
import { ProductModel } from '../../../../models/productModel';
import { AdminModalComponent } from '../admin-modal/admin-modal.component';

interface ScheduleProductOption {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-admin-order-schedule-modal',
  imports: [FormsModule, AdminModalComponent],
  templateUrl: './admin-order-schedule-modal.component.html',
})
export class AdminOrderScheduleModalComponent implements OnInit {
  @Input() orderSchedule: OrderScheduleModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<OrderScheduleModel>();

  constructor(private dataService: DataService) {}

  isLoading: boolean = true;
  isSaving: boolean = false;
  dateValue: string = '';
  products: ScheduleProductOption[] = [];
  productMaxQuantities: { [productId: number]: number } = {};
  errorMessage: string = '';

  ngOnInit() {
    if (this.orderSchedule?.available_date) {
      this.dateValue = formatDate(
        this.orderSchedule.available_date,
        'yyyy-MM-dd',
        'hu',
      );
    }

    this.dataService.getProducts().subscribe({
      next: (result: ProductModel[]) => {
        this.products = result
          .filter((product) => product.is_used)
          .map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
          }));
        // A már nem használt, de ezen a napon szereplő termékek is maradjanak szerkeszthetők.
        this.orderSchedule?.products.forEach((product) => {
          if (!this.products.some((p) => p.id === product.id)) {
            this.products.push({
              id: product.id,
              name: product.product_name,
              price: product.unit_price,
            });
          }
        });
        this.products.sort((a, b) => a.name.localeCompare(b.name));
        this.initProductMaxQuantities();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Nem sikerült betölteni a termékeket.';
        this.isLoading = false;
      },
    });
  }

  initProductMaxQuantities() {
    this.productMaxQuantities = {};
    this.products.forEach((product) => {
      this.productMaxQuantities[product.id] = 0;
    });
    this.orderSchedule?.products.forEach((product) => {
      this.productMaxQuantities[product.id] = product.max_quantity;
    });
  }

  onQuantityChange(productId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    this.productMaxQuantities[productId] = isNaN(newQuantity)
      ? 0
      : Math.max(0, newQuantity);
    input.value = String(this.productMaxQuantities[productId]);
  }

  save() {
    if (!this.orderSchedule) return;
    this.syncProductsFromQuantities();
    if (!this.checkRequiredFields()) return;

    this.orderSchedule.available_date = new Date(this.dateValue);
    this.isSaving = true;
    const saveObservable =
      this.orderSchedule.id !== 0
        ? this.dataService.updateOrderSchedule(
            this.orderSchedule.id,
            this.orderSchedule,
          )
        : this.dataService.addOrderSchedule(this.orderSchedule);

    saveObservable.subscribe({
      next: (orderSchedule: OrderScheduleModel) => {
        this.isSaving = false;
        this.saved.emit(orderSchedule);
      },
      error: (error: any) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message ?? error.message;
      },
    });
  }

  syncProductsFromQuantities() {
    this.orderSchedule!.products = this.products
      .filter((product) => (this.productMaxQuantities[product.id] ?? 0) > 0)
      .map((product) => ({
        id: product.id,
        product_name: product.name,
        max_quantity: this.productMaxQuantities[product.id],
        remaining_quantity: this.productMaxQuantities[product.id],
        unit_price: product.price,
      }));
  }

  checkRequiredFields(): boolean {
    this.errorMessage = '';
    if (!this.dateValue) {
      this.errorMessage += 'Dátum kötelező!\n';
    }
    if (
      !this.orderSchedule?.products ||
      this.orderSchedule.products.length === 0 ||
      !this.orderSchedule.products.some((product) => product.max_quantity > 0)
    ) {
      this.errorMessage += 'Legalább egy termék kötelező!';
    }
    this.errorMessage = this.errorMessage.trim();
    return !this.errorMessage;
  }
}
