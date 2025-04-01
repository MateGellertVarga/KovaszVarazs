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
    private modalNavbarService: ModalNavbarService
  ) {
    registerLocaleData(localeHu);
  }

  orderSchedules: OrderScheduleModel[] = [
    {
      id: 1,
      availableDate: new Date('2025-03-29'),
      products: [
        {
          id: 1,
          productName: 'Kenyér',
          maxQuantity: 10,
          remainingQuantity: 10,
        },
        {
          id: 2,
          productName: 'Kifli',
          maxQuantity: 10,
          remainingQuantity: 10,
        },
      ],
    },
    {
      id: 2,
      availableDate: new Date('2025-03-30'),
      products: [
        {
          id: 1,
          productName: 'Kenyér',
          maxQuantity: 10,
          remainingQuantity: 10,
        },
        {
          id: 2,
          productName: 'Kifli',
          maxQuantity: 10,
          remainingQuantity: 10,
        },
      ],
    },
  ];
  orders: OrderModel[] = [
    {
      id: 2,
      customerName: 'Kis János',
      phoneNumber: '0905234546',
      note: 'Subidubi',
      status: 'pending',
      isPaying: true,
      totalPrice: 20,
      orderScheduleId: 1,
      orderScheduleDate: '2025-03-29',
      orderItems: [
        {
          productId: 1,
          productName: 'Kenyér',
          quantity: 2,
        },
        {
          productId: 2,
          productName: 'Kifli',
          quantity: 1,
        },
      ],
    },
    {
      id: 1,
      customerName: 'Nagy Pista',
      status: 'pending',
      isPaying: true,
      totalPrice: 10,
      orderScheduleId: 1,
      orderScheduleDate: '2025-03-29',
      orderItems: [
        {
          productId: 1,
          productName: 'Kenyér',
          quantity: 2,
        },
      ],
    },
  ];

  editingOrder: OrderModel | null = null;
  orderSummary: { productName: string; totalQuantity: number }[] = [];
  totalIncome: number = 0;

  ngOnInit() {
    // this.dataService.getOrderSchedules().subscribe(orderSchedules => {
    //   this.orderSchedules = orderSchedules;
    // });
    // this.dataService.getOrders().subscribe(orders => {
    //   this.orders = orders;
    // });
    this.calculateSummary();
  }

  nextOrderSchedule(id: number) {}
  previousOrderSchedule(id: number) {}

  newOrder() {
    this.editingOrder = {
      id: 0,
      customerName: '',
      phoneNumber: '',
      note: '',
      status: 'pending',
      isPaying: true,
      totalPrice: 0,
      orderScheduleId: 1,
      orderScheduleDate: '',
      orderItems: [],
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
      for (const item of order.orderItems) {
        if (!productMap.has(item.productName)) {
          productMap.set(item.productName, { totalQuantity: 0 });
        }
        const product = productMap.get(item.productName);
        product!.totalQuantity += item.quantity;
      }
    }

    this.orderSummary = Array.from(productMap, ([productName, data]) => ({
      productName,
      totalQuantity: data.totalQuantity,
    }));

    this.orders.forEach((order) => {
      if (order.status === 'completed') {
        this.totalIncome += order.totalPrice;
      }
    });
  }
}
