import { OrderItemModel } from "./orderItemModel";

export interface OrderModel {
  id: number;
  customerName?: string;
  phoneNumber?: string;
  note?: string;
  status: string;
  isPaying: boolean;
  totalPrice: number;
  orderScheduleId: number;
  orderScheduleDate: string;
  orderItems: OrderItemModel[];
}


