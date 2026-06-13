import { OrderItemModel } from './orderItemModel';
import { OrderModel } from './orderModel';

export interface OrderSeedModel {
  id: number;
  day: number;
  orders: SeedOrderModel[];
}

export interface SeedOrderModel {
  id: number;
  customer_name: string;
  is_paying: boolean;
  order_items: OrderItemModel[];
}
