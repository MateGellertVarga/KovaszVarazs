export interface IngredientModel {
  name: string;
  amount: number;
}

export interface ProductLinkModel {
  product_id: number;
  quantity: number;
  product_name?: string;
}

export interface RecipeModel {
  id: number;
  name: string;
  total_dough_amount: number;
  ingredients: IngredientModel[];
  products: ProductLinkModel[];
}

export interface ScheduleRecipeCalculationModel {
  recipes: {
    recipe_name: string;
    total_grams: number;
    ingredients: { name: string; amount: number }[];
  }[];
  grand_total_ingredients: { name: string; amount: number }[];
  missing_products: string[];
}
