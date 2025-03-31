export interface UserModel {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}
