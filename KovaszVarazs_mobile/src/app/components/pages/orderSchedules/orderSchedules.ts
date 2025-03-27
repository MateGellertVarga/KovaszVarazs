import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'orderSchedules',
  templateUrl: 'orderSchedules.html',
  styleUrls: ['orderSchedules.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class OrderSchedules implements OnInit {
  constructor() {}

  ngOnInit() {}
}
