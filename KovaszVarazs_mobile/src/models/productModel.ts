export interface ProductModel {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  is_used: boolean;
  deleted_at?: Date;
}
