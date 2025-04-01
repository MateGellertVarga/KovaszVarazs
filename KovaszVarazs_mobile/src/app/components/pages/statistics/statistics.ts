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
import { CostModel, StatisticsModel } from 'src/models/statisticsModel';
import { CostModalComponent } from '../../modals/cost-modal/cost-modal.component';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';

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
    CostModalComponent,
  ],
  providers: [DatePipe],
})
export class Statistics implements OnInit {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService
  ) {
    registerLocaleData(localeHU);
  }

  statistics: StatisticsModel = {
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
  };

  editingCost: CostModel | null = null;

  ngOnInit() {
    // this.dataService.getStatistics().subscribe({
    //   next: (result: StatisticsModel[]) => {
    //     this.statistics = result;
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   },
    // });
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
      const index = this.statistics.costs.findIndex(
        (c) => c.id === this.editingCost!.id
      );
      if (index !== -1) {
        this.statistics.costs[index] = cost;
      } else {
        this.statistics.costs.push(cost);
      }
      this.modalNavbarService.setEditingCost(false);
    }
  }

  deleteCost(cost: CostModel) {
    this.dataService.deleteCost(cost.id).subscribe({
      next: (result: any) => {
        const index = this.statistics.costs.findIndex((c) => c.id === cost.id);
        this.statistics.costs.splice(index, 1);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
