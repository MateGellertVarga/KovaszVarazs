import { Component, OnInit } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeHU from '@angular/common/locales/hu';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonList,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { StatisticsModel } from 'src/models/statisticsModel';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.scss'],
  imports: [
    IonFabButton,
    IonFab,
    IonList,
    IonItem,
    IonIcon,
    IonButton,
    IonContent,
    IonToolbar,
    IonHeader,
    IonTitle,
    DatePipe,
  ],
  providers: [DatePipe],
})
export class Statistics implements OnInit {

  constructor(private dataService: DataService) {
    registerLocaleData(localeHU);
  }

  statistics: StatisticsModel =
    {
      month: new Date('2025-03-01'),
      sales: [
        {
          productId: 1,
          productName: 'Kenyér',
          quantity: 2,
          income: 10,
        },
        {
          productId: 2,
          productName: 'Kifli',
          quantity: 1,
          income: 0.5,
        },
      ],
      costs: [
        {
          id: 1,
          month: new Date('2025-03-01'),
          name: 'Liszt',
          amount: 100,
        },
      ],
    }

  ngOnInit() {}
}
