import { OrderItemModel } from './orderItemModel';

export interface OrderModel {
  id: number;
  user_id?: number;
  customer_name?: string;
  phone_number?: string;
  note?: string;
  status: string;
  is_paying: boolean;
  already_paid: boolean;
  total_price: number;
  order_schedule_id: number;
  order_schedule_date: Date;
  order_items: OrderItemModel[];
}
