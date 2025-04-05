export interface StatisticsModel {
  month: Date;
  sales: SaleModel[];
  costs: CostModel[];
}

export interface SaleModel {
  product_id: number;
  product_name: string;
  quantity: number;
  income: number;
}

export interface CostModel {
  id: number;
  month: Date;
  name: string;
  amount: number;
}
