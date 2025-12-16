export type PaymentMethod = 'Orange Money' | 'Telma MVola' | 'Cash' | 'Cheque' | 'Virement';

export interface Sale {
  id: string;
  user_id: string;
  customer_name: string;
  service_name: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface DateFilter {
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  salesYear: number;
  expensesToday: number;
  expensesWeek: number;
  expensesMonth: number;
  expensesYear: number;
  netToday: number;
  netWeek: number;
  netMonth: number;
  netYear: number;
}

export interface MonthlyData {
  name: string;
  sales: number;
  expenses: number;
  net: number;
}

export interface Profile {
  id: string;
  email: string;
  subscription_expires_at: string;
  role: string;
  is_active?: boolean;
  username?: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  type: 'ART' | 'SRV';
  price: number;
  stock: number;
  created_at?: string;
}
