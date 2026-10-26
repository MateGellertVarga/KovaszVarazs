export interface ProductModel {
  id: number;
  name: string;
  price: number;
  image_url: string;
  is_used: boolean;
  category: string;
  allergens: string;
  description: string;
  deleted_at?: Date;
  recipes?: RecipeWithPivot[];
  recipe_id?: number;
  dough_weight?: number;
}

export interface RecipeWithPivot {
  id: number;
  name: string;
  total_dough_amount: number;
  pivot: {
    product_id: number;
    recipe_id: number;
    quantity: number;
  };
}

export const PRODUCT_CATEGORIES = [
  'Kenyerek',
  'Édes kalácsok',
  'Sós kalácsok',
  'Egyéb',
];
