import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
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
  IonRefresher,
  IonRefresherContent,
  IonButtons,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { CostModel, StatisticsModel } from 'src/models/statisticsModel';
import { CostModalComponent } from '../../modals/cost-modal/cost-modal.component';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { Router } from '@angular/router';
@Component({
  selector: 'statistics',
  templateUrl: './statistics.html',
  imports: [
    IonButtons,
    CommonModule,
    IonRefresherContent,
    IonRefresher,
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
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {
    registerLocaleData(localeHU);
  }

  isLoading: boolean = true;
  statistics: StatisticsModel = { sales: { all: [], paid: [] }, costs: [] };
  combinedSales: {
    product_name: string;
    product_id: number;
    all_quantity: number;
    paid_quantity: number;
    income: number;
  }[] = [];
  currentMonth: Date = new Date();
  editingCost: CostModel | null = null;
  totalSales: number = 0;
  totalCosts: number = 0;

  ionViewWillEnter() {
    this.loadStatistics();
  }

  refresh(event: any) {
    this.ionViewWillEnter();
    event.target.complete();
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.loadStatistics();
  }

  previousMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading = true;
    this.dataService
      .getStatistics(this.formatMonth(this.currentMonth))
      .subscribe({
        next: (result: StatisticsModel) => {
          this.statistics = result;
          this.combinedSales = result.sales.all.map((allItem) => {
            const match = result.sales.paid.find(
              (p) => p.product_id === allItem.product_id
            );
            return {
              product_id: allItem.product_id,
              product_name: allItem.product_name,
              all_quantity: allItem.quantity,
              paid_quantity: match?.quantity || 0,
              income: match?.income || 0,
            };
          });

          this.isLoading = false;
          this.calculateTotals();
        },
        error: (err) => {
          console.log(err);
          this.isLoading = false;
        },
      });
  }

  newCost() {
    this.editingCost = {
      id: 0,
      month: '',
      name: '',
      amount: 0,
    };
    this.modalNavbarService.openModal();
  }

  modifyCost(cost: CostModel) {
    this.editingCost = { ...cost };
    this.modalNavbarService.openModal();
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
      this.editingCost = null;
      this.modalNavbarService.closeModal();
      this.calculateTotals();
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
          role: 'confirm',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.dataService.deleteCost(cost.id).subscribe({
        next: () => {
          const index = this.statistics.costs.findIndex(
            (c) => c.id === cost.id
          );
          if (index !== -1) {
            this.statistics.costs.splice(index, 1);
            this.changeDetectorRef.detectChanges();
            this.calculateTotals();
          }
        },
        error: (err) => {
          console.error('Error deleting cost:', err);
        },
      });
    }
  }

  formatMonth(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  calculateTotals() {
    this.totalSales = this.statistics.sales.paid.reduce(
      (sum, s) => sum + Number(s.income || 0),
      0
    );
    this.totalCosts = this.statistics.costs.reduce(
      (sum, c) => sum + Number(c.amount || 0),
      0
    );
  }

  toLogin() {
    this.router.navigate(['/tabs/login']);
  }
}
