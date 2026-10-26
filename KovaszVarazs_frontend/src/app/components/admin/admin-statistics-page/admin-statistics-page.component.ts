import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { AdminCostModalComponent } from '../admin-cost-modal/admin-cost-modal.component';
import { DataService } from '../../../services/data.service';
import { ConfirmService } from '../../../services/confirm.service';
import {
  CostModel,
  StatisticsModel,
} from '../../../../models/statisticsModel';

@Component({
  selector: 'app-admin-statistics-page',
  imports: [
    NavbarComponent,
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminCostModalComponent,
  ],
  templateUrl: './admin-statistics-page.component.html',
})
export class AdminStatisticsPageComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private confirmService: ConfirmService,
  ) {
    registerLocaleData(localeHu);
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

  ngOnInit() {
    this.loadStatistics();
  }

  onTypeChange() {
    if (this.type === 'monthly') {
      const today = new Date();
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        today.getMonth(),
        1,
      );
    }
    this.loadStatistics();
  }

  nextPeriod() {
    if (this.type === 'monthly') {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1,
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
        1,
      );
    } else {
      this.currentDate = new Date(this.currentDate.getFullYear() - 1, 0, 1);
    }
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading = true;
    const requestedDate = this.currentDate;
    const requestedType = this.type;

    const request =
      this.type === 'monthly'
        ? this.dataService.getStatisticsMonth(
            this.formatMonth(this.currentDate),
          )
        : this.dataService.getStatisticsYear(
            this.currentDate.getFullYear().toString(),
          );

    request.subscribe({
      next: (result: StatisticsModel) => {
        // Gyors lapozásnál egy korábbi időszak válasza ne írja felül az aktuálisat.
        if (
          requestedDate !== this.currentDate ||
          requestedType !== this.type
        ) {
          return;
        }
        this.statistics = result;

        this.combinedSales = result.sales.all.map((allItem) => {
          const match = result.sales.paid.find(
            (p) => p.product_id === allItem.product_id,
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
          a.product_name.localeCompare(b.product_name),
        );
        this.sortCosts();

        this.calculateTotals();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private sortCosts() {
    this.statistics.costs.sort((a, b) => a.name.localeCompare(b.name));
  }

  newCost() {
    this.editingCost = {
      id: 0,
      month: '',
      name: '',
      amount: 0,
    };
  }

  modifyCost(cost: CostModel) {
    this.editingCost = { ...cost };
  }

  saveCost(cost: CostModel) {
    const index = this.statistics.costs.findIndex((c) => c.id === cost.id);
    if (index !== -1) {
      this.statistics.costs[index] = cost;
    } else {
      this.statistics.costs.push(cost);
    }
    this.sortCosts();
    this.editingCost = null;
    this.calculateTotals();
  }

  async deleteCost(cost: CostModel) {
    const confirmed = await this.confirmService.ask({
      title: 'Törlés',
      message: 'Biztosan törölni szeretnéd a költséget?',
      confirmLabel: 'Törlés',
    });
    if (!confirmed) return;

    this.dataService.deleteCost(cost.id).subscribe({
      next: () => {
        this.statistics.costs = this.statistics.costs.filter(
          (c) => c.id !== cost.id,
        );
        this.calculateTotals();
      },
      error: (err) => console.error('Hiba a költség törlésekor:', err),
    });
  }

  formatMonth(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  calculateTotals() {
    this.totalSales = this.statistics.sales.paid.reduce(
      (sum, s) => sum + Number(s.income || 0),
      0,
    );
    this.totalCosts = this.statistics.costs.reduce(
      (sum, c) => sum + Number(c.amount || 0),
      0,
    );
  }
}
