import { Component, OnInit } from '@angular/core';
import { IonHeader, IonTitle, IonToolbar, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'statistics',
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.scss'],
  imports: [IonContent, IonToolbar, IonHeader, IonTitle],
})
export class Statistics implements OnInit {
  constructor() {}

  ngOnInit() {}
}
