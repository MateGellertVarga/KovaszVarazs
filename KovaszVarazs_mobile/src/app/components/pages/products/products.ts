import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'products',
  templateUrl: 'products.html',
  styleUrls: ['products.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class Products implements OnInit {
  constructor() {}

  ngOnInit() {}
}
