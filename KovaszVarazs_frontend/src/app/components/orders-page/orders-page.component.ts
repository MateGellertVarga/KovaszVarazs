import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { OrderModel } from '../../../models/orderModel';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { OrderScheduleModel } from '../../../models/orderScheduleModel';
import { OrderModalComponent } from '../order-modal/order-modal.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders-page',
  imports: [
    NavbarComponent,
    DatePipe,
    CommonModule,
    DialogModule,
    FormsModule,
    OrderModalComponent,
    RouterLink,
  ],
  providers: [DatePipe],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css',
})
export class OrdersPageComponent {
  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {
    registerLocaleData(localeHu);
  }
  isLoading: boolean = true;
  orders: OrderModel[] = [];
  showOrderModal = false;
  order: OrderModel | null = null;
  errorMessage: string = '';
  showLoginHint: boolean = true;
  showInfo: boolean = true;

  isDeleteDialogOpen = false;

  ngOnInit(): void {
    if (this.authService.loggedInUser) {
      this.dataService
        .getActiveOrdersByUserId(this.authService.loggedInUser.id)
        .subscribe({
          next: (orders) => {
            this.orders = orders;
            this.isLoading = false;
            this.showLoginHint = true;
            this.showInfo = true;
          },
          error: () => {
            this.errorMessage = 'Hiba történt a rendelések betöltésekor';
            this.isLoading = false;
          },
        });
    } else {
      this.isLoading = false;
    }
  }

  newOrder() {
    this.order = {
      id: 0,
      user_id: this.authService.loggedInUser
        ? this.authService.loggedInUser.id
        : undefined,
      customer_name: this.authService.loggedInUser
        ? this.authService.loggedInUser.name
        : '',
      phone_number: this.authService.loggedInUser
        ? this.authService.loggedInUser.phone_number
        : '',
      note: '',
      status: 'pending',
      is_paying: true,
      already_paid: false,
      total_price: 0,
      order_schedule_id: 0,
      order_schedule_date: new Date(),
      order_items: [],
    };
    this.showOrderModal = true;
  }

  editOrder(order: OrderModel) {
    this.order = { ...order };
    this.showOrderModal = true;
  }

  openDelete(order: OrderModel) {
    this.order = order;
    this.isDeleteDialogOpen = true;
  }

  closeDelete() {
    this.isDeleteDialogOpen = false;
  }

  confirmDelete() {
    if (!this.order) return;
    const toDelete = this.order;
    this.dataService.deleteOrder(toDelete.id).subscribe(() => {
      this.orders = this.orders.filter((o) => o.id !== toDelete.id);
      this.isDeleteDialogOpen = false;
      this.order = null;
    });
  }

  saveOrder(order: OrderModel) {
    if (this.order) {
      const index = this.orders.findIndex((o) => o.id === this.order!.id);
      if (index !== -1) {
        this.orders[index] = order;
      } else {
        this.orders.push(order);
      }
      this.order = null;
    }
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.order = null;
  }

  dismiss(which: 'login' | 'info') {
    if (which === 'login') this.showLoginHint = false;
    else this.showInfo = false;
  }
}
