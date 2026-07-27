export interface UserModel {
  id?: number;
  name: string;
  email: string;
  phone_number: string;
  password?: string;
  role: string;
  is_active: boolean;
  token?: string;
}
