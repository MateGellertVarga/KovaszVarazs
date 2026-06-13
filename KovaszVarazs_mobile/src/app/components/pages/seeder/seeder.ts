import { ChangeDetectorRef, Component } from '@angular/core';
import {
  AlertController,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonItem,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import localeHu from '@angular/common/locales/hu';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { OrderSeedModel } from 'src/models/orderSeedModel';
import { SeedModalComponent } from '../../modals/seed-modal/seed-modal.component';
import { DatePipe, registerLocaleData } from '@angular/common';

@Component({
  selector: 'app-seeder',
  templateUrl: './seeder.html',
  imports: [
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonList,
    IonItem,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonIcon,
    IonButton,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    SeedModalComponent,
    DatePipe,
  ],
})
export class Seeder {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    registerLocaleData(localeHu);
  }

  isLoading: boolean = true;
  seeds: OrderSeedModel[] = [];
  editingSeed: OrderSeedModel | null = null;

  ionViewWillEnter() {
    this.isLoading = true;
    this.dataService.getSeeds().subscribe((data) => {
      this.seeds = data;
      this.seeds.forEach((s) =>
        s.orders.sort((a, b) =>
          a.customer_name!.localeCompare(b.customer_name!)
        )
      );
      this.isLoading = false;
    });
  }

  refresh(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  newSeed() {
    this.editingSeed = {
      id: 0,
      day: 0,
      orders: [],
    };
    this.modalNavbarService.openModal();
  }

  modifySeed(seed: OrderSeedModel) {
    this.editingSeed = { ...seed };
    this.modalNavbarService.openModal();
  }

  saveSeed() {
    if (this.editingSeed) {
      const index = this.seeds.findIndex((s) => s.id === this.editingSeed!.id);
      if (index !== -1) {
        this.seeds[index] = this.editingSeed!;
      } else {
        this.seeds.push(this.editingSeed!);
      }
      this.editingSeed = null;
    }
    this.editingSeed = null;
  }

  async deleteSeed(seed: OrderSeedModel) {
    const alert = await this.alertController.create({
      header: 'Törlés',
      message: `Biztosan törölni szeretnéd ezt az alap rendelést?`,
      buttons: [
        {
          text: 'Mégse',
          role: 'cancel',
        },
        {
          text: 'Törlés',
          role: 'destructive',
          handler: () => {
            this.dataService.deleteSeed(seed.id).subscribe({
              next: () => {
                const index = this.seeds.findIndex((s) => s.id === seed.id);
                if (index !== -1) {
                  this.seeds.splice(index, 1);
                  this.changeDetectorRef.detectChanges();
                }
              },
              error: (error) => {
                console.error('Error deleting seed:', error);
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
