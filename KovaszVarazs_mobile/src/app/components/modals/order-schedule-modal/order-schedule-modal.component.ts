import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { ProductModel } from 'src/models/productModel';

@Component({
  selector: 'app-order-schedule-modal',
  templateUrl: './order-schedule-modal.component.html',
  styleUrls: ['./order-schedule-modal.component.scss'],
  imports: [FormsModule, DatePipe],
  providers: [DatePipe],
})
export class OrderScheduleModalComponent implements OnInit {
  @Input() orderSchedule: OrderScheduleModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<OrderScheduleModel>();

  constructor(
    private dataService: DataService,
    private modalnavbarService: ModalNavbarService
  ) {}

  products: ProductModel[] = [
    {
      id: 1,
      name: 'Kenyér',
      price: 5,
      imageUrl: 'https://ionicframework.com/docs/img/demos/card-media.png',
    },
    {
      id: 2,
      name: 'Kifli',
      price: 0.5,
      imageUrl: 'https://ionicframework.com/docs/img/demos/card-media.png',
    },
    {
      id: 3,
      name: 'Kalács',
      price: 10,
      imageUrl: 'https://ionicframework.com/docs/img/demos/card-media.png',
    },
  ];
  productMaxQuantities: { [productName: string]: number } = {};
  errorMessage: string = '';

  ngOnInit() {
    // this.dataService.getProducts().subscribe({
    //   next: (result: ProductModel[]) => {
    //     this.products = result;
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   },
    // });
    this.initProductMaxQuantities();
  }

  onDateChange(date: Date, event: Event) {
    const input = event.target as HTMLInputElement;
    this.orderSchedule!.availableDate = new Date(date);
  }

  initProductMaxQuantities() {
    if (this.orderSchedule && this.orderSchedule.products.length > 0) {
      this.orderSchedule.products.forEach((product) => {
        this.productMaxQuantities[product.productName] = product.maxQuantity;
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

  onQuantityChange(productName: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    this.productMaxQuantities[productName] = isNaN(newQuantity)
      ? 0
      : newQuantity;
  }

  cancel() {
    this.modalnavbarService.setEditingOrderSchedule(false);
    this.canceled.emit();
  }

  save() {
    if (this.orderSchedule && this.checkRequiredFields()) {
      // this.dataService.addOrderSchedule(this.orderSchedule).subscribe({
      //   next: (orderSchedule: OrderScheduleModel) => {
      //     this.saved.emit(orderSchedule);
      //   },
      //   error: (error: any) => {
      //     this.errorMessage = error.error?.message ?? error.message;
      //   },
      // });
      this.modalnavbarService.setEditingOrderSchedule(false);
    }
  }

  checkRequiredFields(): boolean {
    this.errorMessage = '';
    if (!this.orderSchedule?.availableDate) {
      this.errorMessage += 'Dátum kötelező!\n';
    }
    if (
      !this.orderSchedule?.products ||
      this.orderSchedule?.products.length === 0
    ) {
      this.errorMessage += 'Termékek kötelezőek!';
    }
    return !this.errorMessage;
  }
}
