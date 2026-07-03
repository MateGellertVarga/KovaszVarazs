import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OrderModel } from 'src/models/orderModel';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { ProductModel } from 'src/models/productModel';
import { CostModel, StatisticsModel } from 'src/models/statisticsModel';
import { ConfigService } from './config.service';
import { RequestModel } from 'src/models/requestModel';
import { OrderSeedModel } from 'src/models/orderSeedModel';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  getOrdersByOrderScheduleId(scheduleId: number): Observable<OrderModel[]> {
    return this.http
      .get<OrderModel[]>(`${this.configService.apiUrl}/orders/${scheduleId}`)
      .pipe(
        map((orders) =>
          orders.map((order) => ({
            ...order,
            order_schedule_date: new Date(order.order_schedule_date),
          }))
        )
      );
  }

  addOrder(order: OrderModel): Observable<OrderModel> {
    return this.http.post<OrderModel>(
      `${this.configService.apiUrl}/orders`,
      order
    );
  }

  updateOrder(id: number, order: OrderModel): Observable<OrderModel> {
    return this.http.put<OrderModel>(
      `${this.configService.apiUrl}/orders/${id}`,
      order
    );
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configService.apiUrl}/orders/${id}`);
  }

  getOrderSchedules(
    before: number,
    after: number
  ): Observable<OrderScheduleModel[]> {
    return this.http
      .get<OrderScheduleModel[]>(
        `${this.configService.apiUrl}/orderSchedules?before=${before}&after=${after}`
      )
      .pipe(
        map((schedules) =>
          schedules.map((schedule) => ({
            ...schedule,
            available_date: new Date(schedule.available_date),
          }))
        )
      );
  }

  getOrderSchedule(id: number): Observable<OrderScheduleModel> {
    return this.http
      .get<OrderScheduleModel>(
        `${this.configService.apiUrl}/orderSchedules/${id}`
      )
      .pipe(
        map((schedule) => ({
          ...schedule,
          available_date: new Date(schedule.available_date),
        }))
      );
  }

  addOrderSchedule(
    orderSchedule: OrderScheduleModel
  ): Observable<OrderScheduleModel> {
    return this.http.post<OrderScheduleModel>(
      `${this.configService.apiUrl}/orderSchedules`,
      orderSchedule
    );
  }

  updateOrderSchedule(
    id: number,
    orderSchedule: OrderScheduleModel
  ): Observable<OrderScheduleModel> {
    return this.http.put<OrderScheduleModel>(
      `${this.configService.apiUrl}/orderSchedules/${id}`,
      orderSchedule
    );
  }

  deleteOrderSchedule(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.apiUrl}/orderSchedules/${id}`
    );
  }

  getProducts(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(
      `${this.configService.apiUrl}/products`
    );
  }

  addProduct(productData: FormData): Observable<ProductModel> {
    return this.http.post<ProductModel>(
      `${this.configService.apiUrl}/products`,
      productData
    );
  }

  updateProduct(id: number, productData: FormData): Observable<ProductModel> {
    return this.http.post<ProductModel>(
      `${this.configService.apiUrl}/products/${id}`,
      productData
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.configService.apiUrl}/products/${id}`
    );
  }

  getStatisticsMonth(month: string): Observable<StatisticsModel> {
    return this.http
      .get<StatisticsModel>(
        `${this.configService.apiUrl}/statistics/monthly?month=${month}`
      )
      .pipe(
        map((statistics) => ({
          ...statistics,
        }))
      );
  }

  getStatisticsYear(year: string): Observable<StatisticsModel> {
    return this.http
      .get<StatisticsModel>(
        `${this.configService.apiUrl}/statistics/yearly?year=${year}`
      )
      .pipe(
        map((statistics) => ({
          ...statistics,
        }))
      );
  }

  addCost(cost: CostModel): Observable<CostModel> {
    return this.http.post<CostModel>(
      `${this.configService.apiUrl}/costs`,
      cost
    );
  }

  updateCost(id: number, cost: CostModel): Observable<CostModel> {
    return this.http.put<CostModel>(
      `${this.configService.apiUrl}/costs/${id}`,
      cost
    );
  }

  deleteCost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configService.apiUrl}/costs/${id}`);
  }

  getSeeds(): Observable<OrderSeedModel[]> {
    return this.http.get<OrderSeedModel[]>(
      `${this.configService.apiUrl}/seeds`
    );
  }

  addSeed(seed: OrderSeedModel): Observable<OrderSeedModel> {
    return this.http.post<OrderSeedModel>(
      `${this.configService.apiUrl}/seeds`,
      seed
    );
  }

  updateSeed(id: number, seed: OrderSeedModel): Observable<OrderSeedModel> {
    return this.http.put<OrderSeedModel>(
      `${this.configService.apiUrl}/seeds/${id}`,
      seed
    );
  }

  deleteSeed(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configService.apiUrl}/seeds/${id}`);
  }

  getRequests(): Observable<RequestModel[]> {
    return this.http.get<RequestModel[]>(
      `${this.configService.apiUrl}/requests`
    );
  }
}
