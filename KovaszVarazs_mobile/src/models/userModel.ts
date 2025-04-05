export interface UserModel {
  id?: number;
  name: string;
  email: string;
  phone_number: string;
  password?: string;
  role: string;
  access_token?: string;
  refresh_token?: string;
}
