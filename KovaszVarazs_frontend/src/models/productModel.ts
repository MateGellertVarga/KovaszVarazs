export interface ProductModel {
  id: number;
  name: string;
  price: number;
  image_url: string;
  is_used: boolean;
  category: string;
  deleted_at?: Date;
}
