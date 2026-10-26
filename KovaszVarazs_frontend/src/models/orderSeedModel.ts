import { OrderItemModel } from './orderItemModel';

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

export const SEED_DAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Hétfő' },
  { value: 2, label: 'Kedd' },
  { value: 3, label: 'Szerda' },
  { value: 4, label: 'Csütörtök' },
  { value: 5, label: 'Péntek' },
  { value: 6, label: 'Szombat' },
  { value: 7, label: 'Vasárnap' },
];
