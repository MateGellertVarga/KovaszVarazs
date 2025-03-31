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
  ],
  providers: [DatePipe],
})
export default class Orders implements OnInit {
  constructor(private dataService: DataService) {
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

  modifyOrder(id: number) {
    this.orders.forEach((order) => {
      if (order.id === id) {
        //modal
      }
    });
  }
  deleteOrder(id: number) {
    this.orders.forEach((order) => {
      if (order.id === id) {
        //alert confirm
      }
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

  orderSummary: { productName: string; totalQuantity: number }[] = [];
  totalIncome: number = 0;

  calculateSummary() {
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
