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
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { ProductModel } from 'src/models/productModel';
import { ProductModalComponent } from '../../modals/product-modal/product-modal.component';

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
    ProductModalComponent,
  ],
})
export class Products implements OnInit {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService
  ) {}

  products: ProductModel[] = [
    {
      id: 1,
      name: 'Kenyér',
      price: 5,
      image_url: 'https://ionicframework.com/docs/img/demos/card-media.png',
    },
    {
      id: 2,
      name: 'Kifli',
      price: 0.5,
      image_url: 'https://ionicframework.com/docs/img/demos/card-media.png',
    },
    {
      id: 3,
      name: 'Kalács',
      price: 10,
      image_url: 'https://ionicframework.com/docs/img/demos/card-media.png',
    },
  ];

  editingProduct: ProductModel | null = null;

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

  newProduct() {
    this.editingProduct = {
      id: 0,
      name: '',
      price: 0,
      image_url: '',
    };
    this.modalNavbarService.setEditingProduct(true);
  }

  modifyProduct(product: ProductModel) {
    this.editingProduct = { ...product };
    this.modalNavbarService.setEditingProduct(true);
  }

  saveProduct(product: ProductModel) {
    if (this.editingProduct) {
      const index = this.products.findIndex(
        (p) => p.id === this.editingProduct!.id
      );
      if (index !== -1) {
        this.products[index] = product;
      } else {
        this.products.push(product);
      }
      this.editingProduct = null;
    }
  }

  deleteProduct(product: ProductModel) {
    this.dataService.deleteProduct(product.id).subscribe({
      next: (result: any) => {
        const index = this.products.findIndex((p) => p.id === product.id);
        this.products.splice(index, 1);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
