export interface RequestModel {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
}
