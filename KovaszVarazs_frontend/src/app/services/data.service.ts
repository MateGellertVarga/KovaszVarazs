import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { OrderModel } from '../../models/orderModel';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderScheduleModel } from '../../models/orderScheduleModel';
import { ProductModel } from '../../models/productModel';

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

  getActiveOrdersByUserId(
    userId: number | undefined //nagyon csúnyaaaaa, but works
  ): Observable<OrderModel[]> {
    return this.http
      .get<OrderModel[]>(`${this.configService.apiUrl}/orders`)
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

  getProducts(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(
      `${this.configService.apiUrl}/products`
    );
  }
}
