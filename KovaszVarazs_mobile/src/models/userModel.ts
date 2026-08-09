export interface UserModel {
  id?: number;
  name: string;
  email: string;
  phone_number: string;
  password?: string;
  role: string;
  token?: string;
  is_active: boolean;
  wants_reminder: boolean;
}

export interface LoginResponse {
  user: UserModel;
  token: string;
}
