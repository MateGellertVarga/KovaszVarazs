import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { ProductModel } from 'src/models/productModel';
import {
  IonDatetimeButton,
  IonDatetime,
  IonModal,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-order-schedule-modal',
  templateUrl: './order-schedule-modal.component.html',
  imports: [
    IonLabel,
    IonItem,
    IonModal,
    IonDatetime,
    IonDatetimeButton,
    FormsModule,
    DatePipe,
  ],
  providers: [DatePipe],
})
export class OrderScheduleModalComponent implements OnInit {
  @Input() orderSchedule: OrderScheduleModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<OrderScheduleModel>();
  @ViewChild('dateInput') dateInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private dataService: DataService,
    private modalnavbarService: ModalNavbarService
  ) {}

  scrollY: number = 0;
  viewportHeight: number = 0;
  products: ProductModel[] = [];
  productMaxQuantities: { [product_name: string]: number } = {};
  errorMessage: string = '';

  ngOnInit() {
    this.dataService.getProducts().subscribe({
      next: (result: ProductModel[]) => {
        this.products = result;
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.scrollY = window.scrollY || window.pageYOffset;
    this.viewportHeight = window.innerHeight;
    this.initProductMaxQuantities();
  }

  focusDateInput() {
    const inputEl = this.dateInputRef?.nativeElement;
    if (inputEl && typeof inputEl.showPicker === 'function') {
      try {
        inputEl.showPicker();
      } catch (e) {
        inputEl.focus();
      }
    }
  }

  onDateChange(newValue: string) {
    this.orderSchedule!.available_date = new Date(newValue);
  }

  initProductMaxQuantities() {
    if (this.orderSchedule && this.orderSchedule.products.length > 0) {
      this.orderSchedule.products.forEach((product) => {
        this.productMaxQuantities[product.product_name] = product.max_quantity;
      });

      this.products.forEach((product) => {
        if (!(product.name in this.productMaxQuantities)) {
          this.productMaxQuantities[product.name] = 0;
        }
      });
    } else {
      this.products.forEach((product) => {
        this.productMaxQuantities[product.name] = 0;
      });
    }
  }

  onQuantityChange(product_name: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    this.productMaxQuantities[product_name] = isNaN(newQuantity)
      ? 0
      : newQuantity;
  }

  cancel() {
    this.modalnavbarService.closeModal();
    this.canceled.emit();
  }

  save() {
    if (this.orderSchedule) {
      this.syncProductsFromQuantities();
    }

    if (this.orderSchedule && this.checkRequiredFields()) {
      const saveObservable =
        this.orderSchedule.id !== 0
          ? this.dataService.updateOrderSchedule(
              this.orderSchedule.id,
              this.orderSchedule
            )
          : this.dataService.addOrderSchedule(this.orderSchedule);

      saveObservable.subscribe({
        next: (orderSchedule: OrderScheduleModel) => {
          this.saved.emit(orderSchedule);
          this.modalnavbarService.closeModal();
        },
        error: (error: any) => {
          console.log(error.error.message);

          this.errorMessage = error.error?.message ?? error.message;
        },
      });
    }
  }

  syncProductsFromQuantities() {
    this.orderSchedule!.products = Object.entries(this.productMaxQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([product_name, quantity]) => {
        const existingProduct = this.products.find(
          (p) => p.name === product_name
        );
        return {
          id: existingProduct!.id,
          product_name: existingProduct!.name,
          max_quantity: quantity,
          remaining_quantity: quantity,
        };
      });
  }

  checkRequiredFields(): boolean {
    this.errorMessage = '';
    if (!this.orderSchedule?.available_date) {
      this.errorMessage += 'Dátum kötelező!\n';
    }
    if (
      !this.orderSchedule?.products ||
      this.orderSchedule?.products.length === 0 ||
      !this.orderSchedule?.products.some((product) => product.max_quantity > 0)
    ) {
      this.errorMessage += 'Legalább egy termék kötelező!';
    }
    return !this.errorMessage;
  }
}
