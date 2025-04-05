import { Component, OnInit } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { OrderModel } from 'src/models/orderModel';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { OrderModalComponent } from '../../modals/order-modal/order-modal.component';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'orders',
  templateUrl: 'orders.html',
  styleUrls: ['orders.scss'],
  imports: [
    IonFabButton,
    IonFab,
    IonCardTitle,
    IonCardSubtitle,
    IonCardHeader,
    IonCardContent,
    IonCard,
    IonButton,
    IonLabel,
    IonItem,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    DatePipe,
    OrderModalComponent,
  ],
  providers: [DatePipe],
})
export default class Orders implements OnInit {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private authService: AuthService
  ) {
    registerLocaleData(localeHu);
  }

  orderSchedules: OrderScheduleModel[] = //[];
    [
      {
        id: 1,
        available_date: new Date('2025-03-29'),
        products: [
          {
            id: 1,
            product_name: 'Kenyér',
            max_quantity: 10,
            remaining_quantity: 10,
          },
          {
            id: 2,
            product_name: 'Kifli',
            max_quantity: 10,
            remaining_quantity: 10,
          },
        ],
      },
      {
        id: 2,
        available_date: new Date('2025-03-30'),
        products: [
          {
            id: 1,
            product_name: 'Kenyér',
            max_quantity: 10,
            remaining_quantity: 10,
          },
          {
            id: 2,
            product_name: 'Kifli',
            max_quantity: 10,
            remaining_quantity: 10,
          },
        ],
      },
    ];
  orders: OrderModel[] = //[];
    [
      {
        id: 2,
        customer_name: 'Kis János',
        phone_number: '0905234546',
        note: 'Subidubi',
        status: 'pending',
        is_paying: true,
        total_price: 20,
        order_schedule_id: 1,
        order_schedule_date: '2025-03-29',
        order_items: [
          {
            product_id: 1,
            product_name: 'Kenyér',
            quantity: 2,
          },
          {
            product_id: 2,
            product_name: 'Kifli',
            quantity: 1,
          },
        ],
      },
      {
        id: 1,
        customer_name: 'Nagy Pista',
        status: 'pending',
        is_paying: true,
        total_price: 10,
        order_schedule_id: 1,
        order_schedule_date: '2025-03-29',
        order_items: [
          {
            product_id: 1,
            product_name: 'Kenyér',
            quantity: 2,
          },
        ],
      },
    ];

  editingOrder: OrderModel | null = null;
  orderSummary: { product_name: string; totalQuantity: number }[] = [];
  totalIncome: number = 0;

  ngOnInit() {
    // this.dataService.getOrderSchedules().subscribe((orderSchedules) => {
    //   this.orderSchedules = orderSchedules;
    // });
    // this.dataService.getOrders().subscribe({
    //   next: (orders) => {
    //     this.orders = orders;
    //     this.calculateSummary();
    //   },
    //   error: (err) => {
    //     console.error(err);
    //   },
    // });
  }

  nextOrderSchedule(id: number) {}
  previousOrderSchedule(id: number) {}

  newOrder() {
    this.editingOrder = {
      id: 0,
      customer_name: '',
      phone_number: '',
      note: '',
      status: 'pending',
      is_paying: true,
      total_price: 0,
      order_schedule_id: 1,
      order_schedule_date: '',
      order_items: [],
    };
    this.modalNavbarService.setEditingOrder(true);
  }

  modifyOrder(order: OrderModel) {
    this.editingOrder = { ...order };
    this.modalNavbarService.setEditingOrder(true);
  }

  saveOrder(order: OrderModel) {
    if (this.editingOrder) {
      const index = this.orders.findIndex(
        (o) => o.id === this.editingOrder!.id
      );
      if (index !== -1) {
        this.orders[index] = order;
      } else {
        this.orders.push(order);
      }
      this.editingOrder = null;
      //this.calculateSummary();
    }
  }

  deleteOrder(order: OrderModel) {
    // TODO: confirm window
    this.dataService.deleteOrder(order.id).subscribe({
      next: (result: any) => {
        const index = this.orders.findIndex((o) => o.id == order.id);
        this.orders.splice(index, 1);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  changeOrderStatus(id: number) {
    this.orders.forEach((order) => {
      if (order.id === id) {
        if (order.status === 'pending') {
          order.status = 'in progress';
        } else if (order.status === 'in progress') {
          order.status = 'completed';
          this.calculateSummary();
        }
      }
    });
  }

  calculateSummary() {
    this.totalIncome = 0;
    const productMap = new Map<string, { totalQuantity: number }>();

    for (const order of this.orders) {
      for (const item of order.order_items) {
        if (!productMap.has(item.product_name)) {
          productMap.set(item.product_name, { totalQuantity: 0 });
        }
        const product = productMap.get(item.product_name);
        product!.totalQuantity += item.quantity;
      }
    }

    this.orderSummary = Array.from(productMap, ([product_name, data]) => ({
      product_name,
      totalQuantity: data.totalQuantity,
    }));

    this.orders.forEach((order) => {
      if (order.status === 'completed') {
        this.totalIncome += order.total_price;
      }
    });
  }
}
