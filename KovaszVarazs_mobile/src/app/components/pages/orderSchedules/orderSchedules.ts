import { Component, OnInit } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonCardSubtitle,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { OrderScheduleModalComponent } from '../../modals/order-schedule-modal/order-schedule-modal.component';

@Component({
  selector: 'orderSchedules',
  templateUrl: 'orderSchedules.html',
  styleUrls: ['orderSchedules.scss'],
  providers: [DatePipe],
  imports: [
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonList,
    IonLabel,
    IonItem,
    IonButton,
    IonIcon,
    IonFabButton,
    IonFab,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    DatePipe,
    OrderScheduleModalComponent,
  ],
})
export class OrderSchedules implements OnInit {
  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
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

  editingOrderSchedule: OrderScheduleModel | null = null;

  ngOnInit() {}

  newOrderSchedule() {
    this.editingOrderSchedule = {
      id: 0,
      availableDate: new Date(),
      products: [],
    };
    this.modalNavbarService.setEditingOrderSchedule(true);
  }

  modifyOrderSchedule(orderSchedule: OrderScheduleModel) {
    this.editingOrderSchedule = { ...orderSchedule };
    this.modalNavbarService.setEditingOrderSchedule(true);
  }

  saveOrderSchedule(orderSchedule: OrderScheduleModel) {
    if (this.editingOrderSchedule) {
      const index = this.orderSchedules.findIndex(
        (os) => os.id === this.editingOrderSchedule!.id
      );
      if (index !== -1) {
        this.orderSchedules[index] = orderSchedule;
      } else {
        this.orderSchedules.push(orderSchedule);
      }
      this.editingOrderSchedule = null;
    }
  }

  deleteOrderSchedule(orderSchedule: OrderScheduleModel) {
    // TODO: confirm window
    this.dataService.deleteOrderSchedule(orderSchedule.id).subscribe({
      next: (result: any) => {
        const index = this.orderSchedules.findIndex(
          (os) => os.id === orderSchedule.id
        );
        this.orderSchedules.splice(index, 1);
      },
      error: (error: any) => {
        console.error('Error deleting order schedule:', error);
      },
    });
  }
}
