export interface OrderScheduleModel {
  id: number;
  availableDate: Date;
  products: Product[];
}

export interface Product {
  id: number;
  productName: string;
  maxQuantity: number;
  remainingQuantity: number;
}


