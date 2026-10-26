import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { AdminOrderScheduleModalComponent } from '../admin-order-schedule-modal/admin-order-schedule-modal.component';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { WebsocketService } from '../../../services/websocket.service';
import { ConfirmService } from '../../../services/confirm.service';
import { OrderScheduleModel } from '../../../../models/orderScheduleModel';
import { ScheduleRecipeCalculationModel } from '../../../../models/recipeModel';

@Component({
  selector: 'app-admin-order-schedules-page',
  imports: [
    NavbarComponent,
    CommonModule,
    AdminPageHeaderComponent,
    AdminOrderScheduleModalComponent,
  ],
  templateUrl: './admin-order-schedules-page.component.html',
})
export class AdminOrderSchedulesPageComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private websocketService: WebsocketService,
    private confirmService: ConfirmService,
  ) {
    registerLocaleData(localeHu);
  }

  isLoading: boolean = true;
  orderSchedules: OrderScheduleModel[] = [];
  editingOrderSchedule: OrderScheduleModel | null = null;
  calculations: { [scheduleId: number]: ScheduleRecipeCalculationModel } = {};
  calculationErrors: { [scheduleId: number]: boolean } = {};
  showCalcs: { [scheduleId: number]: boolean } = {};
  expandedRecipes: { [uniqueKey: string]: boolean } = {};
  expandedGrandTotals: { [scheduleId: number]: boolean } = {};
  private websocketCleanup: (() => void) | null = null;

  ngOnInit() {
    this.initializeWebsocketSubscription();
    this.loadOrderSchedules();
  }

  ngOnDestroy() {
    this.cleanupWebsocketSubscription();
  }

  loadOrderSchedules(silent = false) {
    if (!silent) this.isLoading = true;
    this.dataService.getOrderSchedules(0, 50).subscribe({
      next: (data) => {
        this.orderSchedules = data;
        this.orderSchedules.forEach((s) => this.sortScheduleProducts(s));
        this.sortOrderSchedules();
        this.orderSchedules.forEach((s) => this.loadCalculation(s.id));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Nem sikerült lekérni a sütési napokat:', err);
        this.isLoading = false;
      },
    });
  }

  private loadCalculation(scheduleId: number) {
    this.calculationErrors[scheduleId] = false;
    this.dataService.getScheduleRecipeCalculation(scheduleId).subscribe({
      next: (res: ScheduleRecipeCalculationModel) => {
        res.recipes.sort((a, b) => a.recipe_name.localeCompare(b.recipe_name));
        res.recipes.forEach((recipe) =>
          recipe.ingredients.sort((a, b) => a.name.localeCompare(b.name)),
        );
        res.grand_total_ingredients.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        this.calculations[scheduleId] = res;
      },
      error: (err) => {
        console.error('Kalkuláció betöltése sikertelen:', err);
        this.calculationErrors[scheduleId] = true;
      },
    });
  }

  private sortScheduleProducts(schedule: OrderScheduleModel) {
    schedule.products = schedule.products ?? [];
    schedule.products.sort((a, b) =>
      a.product_name.localeCompare(b.product_name),
    );
  }

  private sortOrderSchedules() {
    this.orderSchedules.sort(
      (a, b) =>
        new Date(a.available_date).getTime() -
        new Date(b.available_date).getTime(),
    );
  }

  toggleCalculation(scheduleId: number) {
    this.showCalcs[scheduleId] = !this.showCalcs[scheduleId];
  }

  toggleRecipeAccordion(scheduleId: number, recipeName: string) {
    const key = `${scheduleId}_${recipeName}`;
    this.expandedRecipes[key] = !this.expandedRecipes[key];
  }

  toggleGrandTotal(scheduleId: number) {
    this.expandedGrandTotals[scheduleId] =
      !this.expandedGrandTotals[scheduleId];
  }

  newOrderSchedule() {
    this.editingOrderSchedule = {
      id: 0,
      user_id: this.authService.loggedInUser?.id,
      available_date: new Date(),
      note: '',
      products: [],
    };
  }

  modifyOrderSchedule(orderSchedule: OrderScheduleModel) {
    this.editingOrderSchedule = { ...orderSchedule };
  }

  saveOrderSchedule(orderSchedule: OrderScheduleModel) {
    orderSchedule.available_date = new Date(orderSchedule.available_date);
    this.sortScheduleProducts(orderSchedule);
    const index = this.orderSchedules.findIndex(
      (os) => os.id === orderSchedule.id,
    );
    if (index !== -1) {
      this.orderSchedules[index] = orderSchedule;
    } else {
      this.orderSchedules.push(orderSchedule);
    }
    this.sortOrderSchedules();
    this.loadCalculation(orderSchedule.id);
    this.editingOrderSchedule = null;
  }

  async deleteOrderSchedule(orderSchedule: OrderScheduleModel) {
    const confirmed = await this.confirmService.ask({
      title: 'Törlés',
      message:
        'Biztosan törölni szeretnéd ezt a sütési napot? Az összes hozzá tartozó rendelés is törlődik!',
      confirmLabel: 'Törlés',
    });
    if (!confirmed) return;

    this.dataService.deleteOrderSchedule(orderSchedule.id).subscribe({
      next: () => {
        this.orderSchedules = this.orderSchedules.filter(
          (os) => os.id !== orderSchedule.id,
        );
      },
      error: (error) => {
        console.error('Hiba a sütési nap törlésekor:', error);
      },
    });
  }

  private initializeWebsocketSubscription() {
    try {
      this.websocketCleanup = this.websocketService.listenToPrivateChannel(
        'order-schedules',
        '.order-schedules.changed',
        () => this.loadOrderSchedules(true),
      );
    } catch (error) {
      console.error('Nem sikerült csatlakozni a websocket csatornához:', error);
    }
  }

  private cleanupWebsocketSubscription() {
    this.websocketCleanup?.();
    this.websocketCleanup = null;
  }
}
