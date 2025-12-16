import { supabase } from './supabase';
import { Sale, Expense, DashboardStats, MonthlyData } from '../types';

// --- Sales Operations ---

export const addSale = async (sale: Omit<Sale, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from('sales')
    .insert([{ ...sale, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateSale = async (id: string, updates: Partial<Sale>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from('sales')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user only updates their own
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSale = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};

// --- Expenses Operations ---

export const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from('expenses')
    .insert([{ ...expense, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExpense = async (id: string, updates: Partial<Expense>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExpense = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// --- Analytics & Aggregations ---

// Helper to filter data client-side for immediate reactivity
// In a very large app, these would be RPC calls or specific parameterized queries
const calculatePeriodStats = (items: any[], dateField: string, amountField: string) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Start of week (Monday)
  const d = new Date(now);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(d.setDate(diff)).toISOString().split('T')[0];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];

  const sum = (arr: any[]) => arr.reduce((acc, curr) => acc + Number(curr[amountField]), 0);

  return {
    today: sum(items.filter(i => i[dateField] === today)),
    week: sum(items.filter(i => i[dateField] >= startOfWeek)),
    month: sum(items.filter(i => i[dateField] >= startOfMonth)),
    year: sum(items.filter(i => i[dateField] >= startOfYear)),
  };
};

export const getDashboardStats = async (): Promise<{ stats: DashboardStats, chartData: MonthlyData[] }> => {
  const [salesData, expensesData] = await Promise.all([
    getSales(),
    getExpenses()
  ]);

  const salesStats = calculatePeriodStats(salesData, 'date', 'amount');
  const expensesStats = calculatePeriodStats(expensesData, 'date', 'amount');

  const stats: DashboardStats = {
    salesToday: salesStats.today,
    salesWeek: salesStats.week,
    salesMonth: salesStats.month,
    salesYear: salesStats.year,
    expensesToday: expensesStats.today,
    expensesWeek: expensesStats.week,
    expensesMonth: expensesStats.month,
    expensesYear: expensesStats.year,
    netToday: salesStats.today - expensesStats.today,
    netWeek: salesStats.week - expensesStats.week,
    netMonth: salesStats.month - expensesStats.month,
    netYear: salesStats.year - expensesStats.year,
  };

  // Generate Chart Data (Last 6 months)
  const chartData: MonthlyData[] = [];
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = d.toLocaleString('fr-FR', { month: 'short' });
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed

    const salesInMonth = salesData.filter(s => {
      const sDate = new Date(s.date);
      return sDate.getMonth() === month && sDate.getFullYear() === year;
    }).reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expensesInMonth = expensesData.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getMonth() === month && eDate.getFullYear() === year;
    }).reduce((acc, curr) => acc + Number(curr.amount), 0);

    chartData.push({
      name: monthKey,
      sales: salesInMonth,
      expenses: expensesInMonth,
      net: salesInMonth - expensesInMonth
    });
  }

  return { stats, chartData };
};
