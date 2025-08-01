export interface OrderScheduleModel {
  id: number;
  available_date: Date;
  note?: string;
  products: Product[];
}

export interface Product {
  id: number;
  product_name: string;
  max_quantity: number;
  remaining_quantity: number;
  unit_price: number;
}
