import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard } from '@ionic/angular/standalone';

@Component({
  selector: 'orders',
  templateUrl: 'orders.html',
  styleUrls: ['orders.scss'],
  imports: [IonCard, IonIcon, IonButton, IonLabel, IonItem, IonList, IonHeader, IonToolbar, IonTitle, IonContent],
})
export default class Orders implements OnInit {
  constructor() {}

  ngOnInit() {}
}
