import { Component } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeHU from '@angular/common/locales/hu';
import {
  AlertController,
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
import { CostModel, StatisticsModel } from 'src/models/statisticsModel';
import { CostModalComponent } from '../../modals/cost-modal/cost-modal.component';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.html',
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
    CostModalComponent,
  ],
  providers: [DatePipe],
})
export class Statistics {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private alertController: AlertController
  ) {
    registerLocaleData(localeHU);
  }

  statistics: StatisticsModel = { month: new Date(), sales: [], costs: [] };
  // {
  //   month: new Date('2025-03-01'),
  //   sales: [
  //     {
  //       product_id: 1,
  //       product_name: 'Kenyér',
  //       quantity: 2,
  //       income: 10,
  //     },
  //     {
  //       product_id: 2,
  //       product_name: 'Kifli',
  //       quantity: 1,
  //       income: 0.5,
  //     },
  //   ],
  //   costs: [
  //     {
  //       id: 1,
  //       month: new Date('2025-03-01'),
  //       name: 'Liszt',
  //       amount: 100,
  //     },
  //   ],
  // };

  editingCost: CostModel | null = null;

  ionViewWillEnter() {
    this.dataService.getStatistics('2025-03').subscribe({
      next: (result: StatisticsModel) => {
        this.statistics = result;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  newCost() {
    this.editingCost = {
      id: 0,
      month: new Date(),
      name: '',
      amount: 0,
    };
    this.modalNavbarService.setEditingCost(true);
  }

  modifyCost(cost: CostModel) {
    this.editingCost = { ...cost };
    this.modalNavbarService.setEditingCost(true);
  }

  saveCost(cost: CostModel) {
    if (this.editingCost) {
      const index = this.statistics!.costs.findIndex(
        (c) => c.id === this.editingCost!.id
      );
      if (index !== -1) {
        this.statistics!.costs[index] = cost;
      } else {
        this.statistics!.costs.push(cost);
      }
      this.modalNavbarService.setEditingCost(false);
    }
  }

  async deleteCost(cost: CostModel) {
    const alert = await this.alertController.create({
      header: 'Törlés',
      message: `Biztosan törölni szeretnéd a költséget?`,
      buttons: [
        {
          text: 'Mégse',
          role: 'cancel',
        },
        {
          text: 'Törlés',
          role: 'destructive',
          handler: () => {
            this.dataService.deleteCost(cost.id).subscribe({
              next: () => {
                const index = this.statistics!.costs.findIndex(
                  (c) => c.id === cost.id
                );
                if (index !== -1) this.statistics!.costs.splice(index, 1);
              },
              error: (err) => {
                console.error('Error deleting cost:', err);
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
