import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { OrderSeedModel, SeedOrderModel } from 'src/models/orderSeedModel';
import { ProductModel } from 'src/models/productModel';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';

@Component({
  selector: 'app-seed-modal',
  templateUrl: './seed-modal.component.html',
  imports: [IonIcon, CommonModule, FormsModule],
})
export class SeedModalComponent implements OnInit {
  @Input() seed: OrderSeedModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<OrderSeedModel>();

  scrollY: number = 0;
  viewportHeight: number = window.innerHeight;
  isLoading: boolean = false;
  errorMessage: string = '';
  products: ProductModel[] = [];
  editingOrderId: number | null = null;
  private idCounter = Date.now();

  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService
  ) {
    addIcons({ add });
  }

  ngOnInit() {
    this.loadProducts();
  }

  private loadProducts() {
    this.isLoading = true;
    this.dataService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.products.sort((a, b) => a.name.localeCompare(b.name));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Nem sikerült betölteni a termékeket:', err);
        this.errorMessage = 'Hiba a termékek betöltésekor.';
        this.isLoading = false;
      },
    });
  }

  addNewOrder() {
    const newOrder: SeedOrderModel = {
      id: this.idCounter++,
      customer_name: '',
      is_paying: true,
      order_items: [],
    };
    this.seed?.orders.push(newOrder);
    this.editingOrderId = newOrder.id;
  }

  removeOrder(index: number) {
    this.seed?.orders.splice(index, 1);
    this.editingOrderId = null;
  }

  toggleEditOrder(orderId: number) {
    this.editingOrderId = this.editingOrderId === orderId ? null : orderId;
  }

  getItemQuantity(order: SeedOrderModel, productId: number): number {
    const item = order.order_items.find((i) => i.product_id === productId);
    return item ? item.quantity : 0;
  }

  adjustQuantity(order: SeedOrderModel, product: ProductModel, change: number) {
    let item = order.order_items.find((i) => i.product_id === product.id);

    if (!item) {
      if (change > 0) {
        order.order_items.push({
          product_id: product.id,
          product_name: product.name,
          quantity: change,
        });
      }
    } else {
      item.quantity += change;
      if (item.quantity <= 0) {
        const index = order.order_items.indexOf(item);
        order.order_items.splice(index, 1);
      }
    }
  }

  onManualQuantityChange(
    order: SeedOrderModel,
    product: ProductModel,
    event: Event
  ) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;

    let item = order.order_items.find((i) => i.product_id === product.id);

    if (value <= 0) {
      if (item) {
        const index = order.order_items.indexOf(item);
        order.order_items.splice(index, 1);
      }
    } else {
      if (!item) {
        order.order_items.push({
          product_id: product.id,
          product_name: product.name,
          quantity: value,
        });
      } else {
        item.quantity = value;
      }
    }
  }

  onCancel() {
    this.canceled.emit();
  }

  onSave() {
    if (this.seed && this.validate()) {
      const saveObservable =
        this.seed.id != 0
          ? this.dataService.updateSeed(this.seed.id, this.seed)
          : this.dataService.addSeed(this.seed);
      saveObservable.subscribe({
        next: (seed: OrderSeedModel) => {
          this.saved.emit(seed);
          this.modalNavbarService.closeModal();
        },
        error: (error: any) => {
          this.errorMessage = error.error?.message ?? error.message;
          console.log(error.error?.message ?? error.message);
        },
      });
    }
  }
  validate(): boolean {
    if (!this.seed?.day) {
      this.errorMessage = 'Kérlek, válassz ki egy napot!';
      return false;
    }

    if (!this.seed.orders || this.seed.orders.length === 0) {
      this.errorMessage = 'A mentéshez legalább egy rendelést fel kell venned!';
      return false;
    }

    for (let index = 0; index < this.seed.orders.length; index++) {
      const order = this.seed.orders[index];
      const displayIndex = index + 1;

      if (!order.customer_name || order.customer_name.trim() === '') {
        this.errorMessage = `A(z) ${displayIndex}. rendelésnél a név nem maradhat üresen!`;
        this.editingOrderId = order.id;
        return false;
      }

      if (!order.order_items || order.order_items.length === 0) {
        this.errorMessage = `A(z) ${displayIndex}. rendelésnél (${order.customer_name}) legalább 1 terméket ki kell választani!`;
        this.editingOrderId = order.id;
        return false;
      }
    }
    return true;
  }
}
