import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OrderModel } from 'src/models/orderModel';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { ProductModel } from 'src/models/productModel';
import { CostModel, StatisticsModel } from 'src/models/statisticsModel';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient, private authService: AuthService) {}
  apiUrl: string = 'http://127.0.0.1:8000/api';

  getOrders(): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(`${this.apiUrl}/orders`).pipe(
      map((orders) =>
        orders.map((order) => ({
          ...order,
          order_schedule_date: new Date(order.order_schedule_date),
        }))
      )
    );
  }

  getOrdersByOrderScheduleId(scheduleId: number): Observable<OrderModel[]> {
    return this.http
      .get<OrderModel[]>(`${this.apiUrl}/orders/${scheduleId}`)
      .pipe(
        map((orders) =>
          orders.map((order) => ({
            ...order,
            order_schedule_date: new Date(order.order_schedule_date),
          }))
        )
      );
  }

  getOrder(id: number): Observable<OrderModel> {
    return this.http.get<OrderModel>(`${this.apiUrl}/orders/${id}`).pipe(
      map((order) => ({
        ...order,
        order_schedule_date: new Date(order.order_schedule_date),
      }))
    );
  }

  addOrder(order: OrderModel): Observable<OrderModel> {
    return this.http.post<OrderModel>(`${this.apiUrl}/orders`, order);
  }

  updateOrder(id: number, order: OrderModel): Observable<OrderModel> {
    return this.http.put<OrderModel>(`${this.apiUrl}/orders/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/${id}`);
  }

  getOrderSchedules(): Observable<OrderScheduleModel[]> {
    return this.http
      .get<OrderScheduleModel[]>(`${this.apiUrl}/orderSchedules`)
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
      .get<OrderScheduleModel>(`${this.apiUrl}/orderSchedules/${id}`)
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
      `${this.apiUrl}/orderSchedules`,
      orderSchedule
    );
  }

  updateOrderSchedule(
    id: number,
    orderSchedule: OrderScheduleModel
  ): Observable<OrderScheduleModel> {
    return this.http.put<OrderScheduleModel>(
      `${this.apiUrl}/orderSchedules/${id}`,
      orderSchedule
    );
  }

  deleteOrderSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orderSchedules/${id}`);
  }

  getProducts(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(`${this.apiUrl}/products`);
  }

  getProduct(id: number): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${this.apiUrl}/products/${id}`);
  }

  addProduct(product: ProductModel): Observable<ProductModel> {
    return this.http.post<ProductModel>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: ProductModel): Observable<ProductModel> {
    return this.http.put<ProductModel>(
      `${this.apiUrl}/products/${id}`,
      product
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  getStatistics(month: string): Observable<StatisticsModel> {
    return this.http
      .get<StatisticsModel>(
        `${this.apiUrl}/statistics?month=${month.replace("'", '')}`
      )
      .pipe(
        map((statistics) => ({
          ...statistics,
          month: new Date(statistics.month),
        }))
      );
  }

  addCost(cost: CostModel): Observable<CostModel> {
    return this.http.post<CostModel>(`${this.apiUrl}/costs`, cost);
  }

  updateCost(id: number, cost: CostModel): Observable<CostModel> {
    return this.http.put<CostModel>(`${this.apiUrl}/costs/${id}`, cost);
  }

  deleteCost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/costs/${id}`);
  }
}
