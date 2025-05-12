import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AlertController,
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
  IonList,
  IonItem,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { ProductModel } from 'src/models/productModel';
import { ProductModalComponent } from '../../modals/product-modal/product-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'products',
  templateUrl: 'products.html',
  imports: [
    CommonModule,
    IonRefresherContent,
    IonRefresher,
    IonItem,
    IonList,
    IonIcon,
    IonFab,
    IonFabButton,
    IonButton,
    IonCardHeader,
    IonCardContent,
    IonCard,
    IonCardTitle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ProductModalComponent,
  ],
})
export class Products {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  isLoading: boolean = true;
  products: ProductModel[] = [];
  editingProduct: ProductModel | null = null;

  ionViewWillEnter() {
    this.isLoading = true;
    this.dataService.getProducts().subscribe({
      next: (result: ProductModel[]) => {
        this.products = result;
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  refresh(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  newProduct() {
    this.editingProduct = {
      id: 0,
      name: '',
      price: 0,
      image_url: '',
    };
    this.modalNavbarService.openModal();
  }

  modifyProduct(product: ProductModel) {
    this.editingProduct = { ...product };
    this.modalNavbarService.openModal();
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

  async deleteProduct(product: ProductModel) {
    const alert = await this.alertController.create({
      header: 'Törlés',
      message: `Biztosan törölni szeretnéd a terméket?`,
      buttons: [
        {
          text: 'Mégse',
          role: 'cancel',
        },
        {
          text: 'Törlés',
          role: 'destructive',
          handler: () => {
            this.dataService.deleteProduct(product.id).subscribe({
              next: () => {
                const index = this.products.findIndex(
                  (p) => p.id === product.id
                );
                if (index !== -1) {
                  this.products.splice(index, 1);
                  this.changeDetectorRef.detectChanges();
                }
              },
              error: (err) => {
                console.error('Error deleting product:', err);
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
