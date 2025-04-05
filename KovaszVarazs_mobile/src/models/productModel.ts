export interface ProductModel {
  id: number;
  name: string;
  price: number;
  image_url: string;
  deleted_at?: Date;
}
