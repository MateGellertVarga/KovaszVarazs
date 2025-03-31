import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCardHeader,
  IonCardTitle,
  IonCard,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonFabButton,
  IonFab,
  IonIcon,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { ProductModel } from 'src/models/productModel';

@Component({
  selector: 'products',
  templateUrl: 'products.html',
  styleUrls: ['products.scss'],
  imports: [
    IonIcon,
    IonFab,
    IonFabButton,
    IonButton,
    IonCardHeader,
    IonCardContent,
    IonCardSubtitle,
    IonCard,
    IonCardTitle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  ],
})
export class Products implements OnInit {
  constructor(private dataService: DataService) {}

  products: ProductModel[] = [
    {
      id: 1,
      name: 'Kenyér',
      price: 5,
      imageUrl: 'https://ionicframework.com/docs/img/demos/card-media.png',
    },
    {
      id: 2,
      name: 'Kifli',
      price: 0.5,
      imageUrl: 'https://ionicframework.com/docs/img/demos/card-media.png',
    },
  ];

  ngOnInit() {
    // this.dataService.getProducts().subscribe({
    //   next: (result: ProductModel[]) => {
    //     this.products = result;
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   },
    // });
  }
}
