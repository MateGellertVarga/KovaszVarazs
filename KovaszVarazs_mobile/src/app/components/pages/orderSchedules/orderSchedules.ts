import { Component, OnInit } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonButton, IonItem, IonLabel, IonList, IonCardSubtitle, IonCardHeader, IonCard, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';

@Component({
  selector: 'orderSchedules',
  templateUrl: 'orderSchedules.html',
  styleUrls: ['orderSchedules.scss'],
  providers: [DatePipe],
  imports: [IonCardContent, IonCardTitle, IonCard, IonCardHeader, IonCardSubtitle, IonList, IonLabel, IonItem, IonButton, IonIcon, IonFabButton, IonFab, IonHeader, IonToolbar, IonTitle, IonContent, DatePipe],
})
export class OrderSchedules implements OnInit {
  constructor(private dataService: DataService, private datePipe: DatePipe) {
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

  ngOnInit() {

  }
}
