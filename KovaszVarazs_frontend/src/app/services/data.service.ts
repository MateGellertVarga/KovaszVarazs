import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { OrderModel } from '../../models/orderModel';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderScheduleModel } from '../../models/orderScheduleModel';
import { ProductModel } from '../../models/productModel';
import { CostModel, StatisticsModel } from '../../models/statisticsModel';
import { RequestModel } from '../../models/requestModel';
import { OrderSeedModel } from '../../models/orderSeedModel';
import { UserModel } from '../../models/userModel';
import {
  RecipeModel,
  ScheduleRecipeCalculationModel,
} from '../../models/recipeModel';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) {}

  getOrdersByOrderScheduleId(scheduleId: number): Observable<OrderModel[]> {
    return this.http
      .get<OrderModel[]>(`${this.configService.apiUrl}/orders/${scheduleId}`)
      .pipe(
        map((orders) =>
          orders.map((order) => ({
            ...order,
            order_schedule_date: new Date(order.order_schedule_date),
          })),
        ),
      );
  }

  getActiveOrdersByUserId(
    userId: number | undefined, //nagyon csúnyaaaaa, but works
  ): Observable<OrderModel[]> {
    return this.http
      .get<OrderModel[]>(`${this.configService.apiUrl}/orders`)
      .pipe(
        map((orders) =>
          orders.map((order) => ({
            ...order,
            order_schedule_date: new Date(order.order_schedule_date),
          })),
        ),
      );
  }

  addOrder(order: OrderModel): Observable<OrderModel> {
    return this.http.post<OrderModel>(
      `${this.configService.apiUrl}/orders`,
      order,
    );
  }

  updateOrder(id: number, order: OrderModel): Observable<OrderModel> {
    return this.http.put<OrderModel>(
      `${this.configService.apiUrl}/orders/${id}`,
      order,
    );
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configService.apiUrl}/orders/${id}`);
  }

  getOrderSchedules(
    before: number,
    after: number,
  ): Observable<OrderScheduleModel[]> {
    return this.http
      .get<
        OrderScheduleModel[]
      >(`${this.configService.apiUrl}/orderSchedules?before=${before}&after=${after}`)
      .pipe(
        map((schedules) =>
          schedules.map((schedule) => ({
            ...schedule,
            available_date: new Date(schedule.available_date),
          })),
        ),
      );
  }

  getOrderSchedule(id: number): Observable<OrderScheduleModel> {
    return this.http
      .get<OrderScheduleModel>(
        `${this.configService.apiUrl}/orderSchedules/${id}`,
      )
      .pipe(
        map((schedule) => ({
          ...schedule,
          available_date: new Date(schedule.available_date),
        })),
      );
  }

  getProducts(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(
      `${this.configService.apiUrl}/products`,
    );
  }

  // --- Admin végpontok (a mobil app DataService-éből átemelve) ---

  addOrderSchedule(
    orderSchedule: OrderScheduleModel,
  ): Observable<OrderScheduleModel> {
    return this.http.post<OrderScheduleModel>(
      `${this.configService.apiUrl}/orderSchedules`,
      orderSchedule,
    );
  }

  updateOrderSchedule(
    id: number,
    orderSchedule: OrderScheduleModel,
  ): Observable<OrderScheduleModel> {
    return this.http.put<OrderScheduleModel>(
      `${this.configService.apiUrl}/orderSchedules/${id}`,
      orderSchedule,
    );
  }

  deleteOrderSchedule(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.apiUrl}/orderSchedules/${id}`,
    );
  }

  addProduct(productData: FormData): Observable<ProductModel> {
    return this.http.post<ProductModel>(
      `${this.configService.apiUrl}/products`,
      productData,
    );
  }

  // Multipart feltöltés miatt POST + `_method=PUT` a FormData-ban.
  updateProduct(id: number, productData: FormData): Observable<ProductModel> {
    return this.http.post<ProductModel>(
      `${this.configService.apiUrl}/products/${id}`,
      productData,
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.apiUrl}/products/${id}`,
    );
  }

  getRecipes(): Observable<RecipeModel[]> {
    return this.http.get<RecipeModel[]>(`${this.configService.apiUrl}/recipes`);
  }

  addRecipe(recipe: RecipeModel): Observable<RecipeModel> {
    return this.http.post<RecipeModel>(
      `${this.configService.apiUrl}/recipes`,
      recipe,
    );
  }

  updateRecipe(id: number, recipe: RecipeModel): Observable<RecipeModel> {
    return this.http.put<RecipeModel>(
      `${this.configService.apiUrl}/recipes/${id}`,
      recipe,
    );
  }

  deleteRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configService.apiUrl}/recipes/${id}`);
  }

  getScheduleRecipeCalculation(
    scheduleId: number,
  ): Observable<ScheduleRecipeCalculationModel> {
    return this.http.get<ScheduleRecipeCalculationModel>(
      `${this.configService.apiUrl}/recipes/calculate-schedule/${scheduleId}`,
    );
  }

  getStatisticsMonth(month: string): Observable<StatisticsModel> {
    return this.http.get<StatisticsModel>(
      `${this.configService.apiUrl}/statistics/monthly?month=${month}`,
    );
  }

  getStatisticsYear(year: string): Observable<StatisticsModel> {
    return this.http.get<StatisticsModel>(
      `${this.configService.apiUrl}/statistics/yearly?year=${year}`,
    );
  }

  addCost(cost: CostModel): Observable<CostModel> {
    return this.http.post<CostModel>(
      `${this.configService.apiUrl}/costs`,
      cost,
    );
  }

  updateCost(id: number, cost: CostModel): Observable<CostModel> {
    return this.http.put<CostModel>(
      `${this.configService.apiUrl}/costs/${id}`,
      cost,
    );
  }

  deleteCost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configService.apiUrl}/costs/${id}`);
  }

  getSeeds(): Observable<OrderSeedModel[]> {
    return this.http.get<OrderSeedModel[]>(
      `${this.configService.apiUrl}/seeds`,
    );
  }

  addSeed(seed: OrderSeedModel): Observable<OrderSeedModel> {
    return this.http.post<OrderSeedModel>(
      `${this.configService.apiUrl}/seeds`,
      seed,
    );
  }

  updateSeed(id: number, seed: OrderSeedModel): Observable<OrderSeedModel> {
    return this.http.put<OrderSeedModel>(
      `${this.configService.apiUrl}/seeds/${id}`,
      seed,
    );
  }

  deleteSeed(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configService.apiUrl}/seeds/${id}`);
  }

  getRequests(): Observable<RequestModel[]> {
    return this.http.get<RequestModel[]>(
      `${this.configService.apiUrl}/registration-requests`,
    );
  }

  getUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.configService.apiUrl}/users`);
  }

  handleRegistrationRequest(
    id: number,
    action: 'approve' | 'reject',
  ): Observable<any> {
    return this.http.post<any>(
      `${this.configService.apiUrl}/registration-requests/${id}/${action}`,
      {},
    );
  }

  toggleReminder(userId: number): Observable<any> {
    return this.http.patch(
      `${this.configService.apiUrl}/users/${userId}/reminder`,
      {},
    );
  }

  deactivateUser(userId: number): Observable<any> {
    return this.http.post<any>(
      `${this.configService.apiUrl}/users/${userId}/deactivate`,
      {},
    );
  }
}
