export interface StatisticsModel {
  sales: {
    all: SaleQuantityModel[];
    paid: SaleModel[];
  };
  costs: CostModel[];
}

export interface SaleQuantityModel {
  product_id: number;
  product_name: string;
  quantity: number;
}

export interface SaleModel extends SaleQuantityModel {
  income: number;
}

export interface CostModel {
  id: number;
  month: string;
  name: string;
  amount: number;
}
