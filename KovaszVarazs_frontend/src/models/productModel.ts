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
}
