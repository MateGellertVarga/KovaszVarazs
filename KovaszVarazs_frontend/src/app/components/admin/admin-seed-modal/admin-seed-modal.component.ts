import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import {
  OrderSeedModel,
  SEED_DAYS,
  SeedOrderModel,
} from '../../../../models/orderSeedModel';
import { ProductModel } from '../../../../models/productModel';
import { AdminModalComponent } from '../admin-modal/admin-modal.component';

@Component({
  selector: 'app-admin-seed-modal',
  imports: [FormsModule, AdminModalComponent],
  templateUrl: './admin-seed-modal.component.html',
})
export class AdminSeedModalComponent implements OnInit {
  @Input() seed: OrderSeedModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<OrderSeedModel>();

  constructor(private dataService: DataService) {}

  seedDays = SEED_DAYS;
  isLoading: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';
  products: ProductModel[] = [];
  editingOrderId: number | null = null;
  private idCounter = Date.now();

  ngOnInit() {
    if (this.seed) {
      this.seed.day = Number(this.seed.day) || 0;
    }
    this.loadProducts();
  }

  private loadProducts() {
    this.isLoading = true;
    this.dataService.getProducts().subscribe({
      next: (products) => {
        this.products = products.sort((a, b) => a.name.localeCompare(b.name));
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
    const item = order.order_items.find((i) => i.product_id === product.id);

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
        order.order_items.splice(order.order_items.indexOf(item), 1);
      }
    }
  }

  onManualQuantityChange(
    order: SeedOrderModel,
    product: ProductModel,
    event: Event,
  ) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    const item = order.order_items.find((i) => i.product_id === product.id);

    if (value <= 0) {
      if (item) {
        order.order_items.splice(order.order_items.indexOf(item), 1);
      }
      target.value = '0';
    } else if (!item) {
      order.order_items.push({
        product_id: product.id,
        product_name: product.name,
        quantity: value,
      });
    } else {
      item.quantity = value;
    }
  }

  save() {
    if (!this.seed || !this.validate()) return;

    this.isSaving = true;
    const saveObservable =
      this.seed.id != 0
        ? this.dataService.updateSeed(this.seed.id, this.seed)
        : this.dataService.addSeed(this.seed);
    saveObservable.subscribe({
      next: (seed: OrderSeedModel) => {
        this.isSaving = false;
        this.saved.emit(seed);
      },
      error: (error: any) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message ?? error.message;
      },
    });
  }

  validate(): boolean {
    this.errorMessage = '';
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
