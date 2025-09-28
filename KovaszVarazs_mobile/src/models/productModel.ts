export interface ProductModel {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  is_used: boolean;
  allergens: string;
  description: string;
  deleted_at?: Date;
}
