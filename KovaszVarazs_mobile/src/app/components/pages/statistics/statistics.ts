import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeHU from '@angular/common/locales/hu';
import { FormsModule } from '@angular/forms'; // 👈 EZT BE KELL TENNED A KÉTUTAS BINDINGHEZ!
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
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { CostModel, StatisticsModel } from 'src/models/statisticsModel';
import { CostModalComponent } from '../../modals/cost-modal/cost-modal.component';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.html',
  imports: [
    FormsModule,
    IonButtons,
    CommonModule,
    IonRefresherContent,
    IonRefresher,
    IonList,
    IonItem,
    IonIcon,
    IonButton,
    IonContent,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonSelect,
    IonSelectOption,
    DatePipe,
    CostModalComponent,
    IonMenuButton,
  ],
  providers: [DatePipe],
})
export class Statistics {
  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    registerLocaleData(localeHU);
  }

  isLoading: boolean = true;
  type: 'monthly' | 'yearly' = 'monthly';

  statistics: StatisticsModel = { sales: { all: [], paid: [] }, costs: [] };
  combinedSales: {
    product_name: string;
    product_id: number;
    all_quantity: number;
    paid_quantity: number;
    income: number;
  }[] = [];

  currentDate: Date = new Date();
  editingCost: CostModel | null = null;
  totalSales: number = 0;
  totalCosts: number = 0;

  ionViewWillEnter() {
    this.loadStatistics();
  }

  refresh(event: any) {
    this.loadStatistics();
    event.target.complete();
  }

  onTypeChange() {
    if (this.type === 'monthly') {
      const today = new Date();
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        today.getMonth(),
        1
      );
    }
    this.loadStatistics();
  }

  nextPeriod() {
    if (this.type === 'monthly') {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      );
    } else {
      this.currentDate = new Date(this.currentDate.getFullYear() + 1, 0, 1);
    }
    this.loadStatistics();
  }

  previousPeriod() {
    if (this.type === 'monthly') {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      );
    } else {
      this.currentDate = new Date(this.currentDate.getFullYear() - 1, 0, 1);
    }
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading = true;

    const request =
      this.type === 'monthly'
        ? this.dataService.getStatisticsMonth(
            this.formatMonth(this.currentDate)
          )
        : this.dataService.getStatisticsYear(
            this.currentDate.getFullYear().toString()
          );

    request.subscribe({
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
        this.combinedSales.sort((a, b) =>
          a.product_name.localeCompare(b.product_name)
        );
        this.statistics.costs.sort((a, b) => a.name.localeCompare(b.name));

        this.calculateTotals();
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error(err);
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
      const index = this.statistics.costs.findIndex(
        (c) => c.id === this.editingCost!.id
      );
      if (index !== -1) {
        this.statistics.costs[index] = cost;
      } else {
        this.statistics.costs.push(cost);
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
        { text: 'Mégse', role: 'cancel' },
        { text: 'Törlés', role: 'confirm' },
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
            this.calculateTotals();
            this.changeDetectorRef.detectChanges();
          }
        },
        error: (err) => console.error('Error deleting cost:', err),
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
    this.totalCosts = this.statistics.costs.reduce((sum, c: CostModel) => {
      return sum + Number(c.amount || 0);
    }, 0);
  }
}
