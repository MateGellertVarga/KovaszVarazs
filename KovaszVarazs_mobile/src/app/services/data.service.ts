import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderModel } from 'src/models/orderModel';
import { OrderScheduleModel } from 'src/models/orderScheduleModel';
import { ProductModel } from 'src/models/productModel';
import { CostModel, StatisticsModel } from 'src/models/statisticsModel';
import { UserModel } from 'src/models/userModel';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}
  apiUrl: string = 'http://127.0.0.1:8000/api';

  admin: UserModel = {
      id: 1,
      name: 'Admin',
      email: 'admin@admin.com',
      phoneNumber: '111222333',
      password: 'admin',
      role: 'admin',
      accessToken: '11|fWPupeOOuefivh94OJ0vf55O8shn0keQX0xpaUyL4f463d29',
      refreshToken: '12|s16vUrm2jacPD1tRPzgyD2uSuRDVsJDZdcKyuwuCc170ec73',
  };
  headers = new HttpHeaders({
    Authorization: `Bearer ${this.admin.accessToken}`,
  })

  getOrders(): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(`${this.apiUrl}/orders`, {
      headers: this.headers,
    });
  }

  getOrder(id: number): Observable<OrderModel> {
    return this.http.get<OrderModel>(`${this.apiUrl}/orders/${id}`, {
      headers: this.headers,
    });
  }

  addOrder(order: OrderModel): Observable<OrderModel> {
    return this.http.post<OrderModel>(`${this.apiUrl}/orders`, order, {
      headers: this.headers,
    });
  }

  updateOrder(id: number, order: OrderModel): Observable<OrderModel> {
    return this.http.put<OrderModel>(`${this.apiUrl}/orders/${id}`, order, {
      headers: this.headers,
    });
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/${id}`, {
      headers: this.headers,
    });
  }

  getOrderSchedules(): Observable<OrderScheduleModel[]> {
    return this.http.get<OrderScheduleModel[]>(`${this.apiUrl}/orderSchedules`);
  }

  getOrderSchedule(id: number): Observable<OrderScheduleModel> {
    return this.http.get<OrderScheduleModel>(
      `${this.apiUrl}/orderSchedules/${id}`,
      {
        headers: this.headers,
      }
    );
  }

  addOrderSchedule(
    orderSchedule: OrderScheduleModel
  ): Observable<OrderScheduleModel> {
    return this.http.post<OrderScheduleModel>(
      `${this.apiUrl}/orderSchedules`,
      orderSchedule,
      {
        headers: this.headers,
      }
    );
  }

  updateOrderSchedule(
    id: number,
    orderSchedule: OrderScheduleModel
  ): Observable<OrderScheduleModel> {
    return this.http.put<OrderScheduleModel>(
      `${this.apiUrl}/orderSchedules/${id}`,
      orderSchedule,
      {
        headers: this.headers,
      }
    );
  }

  deleteOrderSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orderSchedules/${id}`, {
      headers: this.headers,
    });
  }

  getProducts(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(`${this.apiUrl}/products`);
  }

  getProduct(id: number): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${this.apiUrl}/products/${id}`);
  }

  addProduct(product: ProductModel): Observable<ProductModel> {
    return this.http.post<ProductModel>(`${this.apiUrl}/products`, product, {
      headers: this.headers,
    });
  }

  updateProduct(id: number, product: ProductModel): Observable<ProductModel> {
    return this.http.put<ProductModel>(
      `${this.apiUrl}/products/${id}`,
      product,
      {
        headers: this.headers,
      }
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, {
      headers: this.headers,
    });
  }

  getStatistics(month: Date): Observable<StatisticsModel> {
    return this.http.get<StatisticsModel>(
      `${this.apiUrl}/statistics?month=${month}`,
      {
        headers: this.headers,
      }
    );
  }

  addCost(cost: CostModel): Observable<CostModel> {
    return this.http.post<CostModel>(`${this.apiUrl}/costs`, cost, {
      headers: this.headers,
    });
  }

  updateCost(id: number, cost: CostModel): Observable<CostModel> {
    return this.http.put<CostModel>(`${this.apiUrl}/costs/${id}`, cost, {
      headers: this.headers,
    });
  }

  deleteCost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/costs/${id}`, {
      headers: this.headers,
    });
  }
}
