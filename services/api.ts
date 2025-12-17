import { supabase } from './supabase';
import { Sale, Expense, DashboardStats, MonthlyData, Profile } from '../types';

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

// --- Categories Operations ---

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
};

export const addCategory = async (category: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...category, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

// --- Budgets Operations ---

export const getBudgets = async () => {
  const { data, error } = await supabase.from('budgets').select('*');
  if (error) throw error;
  return data || [];
};

export const addBudget = async (budget: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from('budgets')
    .insert([{ ...budget, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const upsertBudget = async (budget: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Use upsert with onConflict to update existing budgets
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { ...budget, user_id: user.id },
      {
        onConflict: 'user_id,category_id,period_type,start_date',
        ignoreDuplicates: false
      }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateBudget = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('budgets').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const createRecurringBudgets = async (
  categoryId: string,
  amount: number,
  startDate: string,
  endDate: string,
  weekdays: number[]
) => {
  const { error } = await supabase.rpc('create_recurring_budgets', {
    p_category_id: categoryId,
    p_amount: amount,
    p_start_date: startDate,
    p_end_date: endDate,
    p_selected_weekdays: weekdays
  });

  if (error) throw error;
};

export const deleteBudget = async (id: string) => {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
};

export const getBudgetSummary = async (periodType: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .rpc('get_budget_summary', {
      p_period_type: periodType,
      p_start_date: startDate,
      p_end_date: endDate
    });
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


// --- Admin & Subscription Operations ---

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // If no row found, it's not a critical error, just no profile yet.
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error("Error fetching profile:", error.message, error.details, error.hint);
    return null;
  }
  return data;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  // Use the secure RPC function
  const { data, error } = await supabase
    .rpc('get_all_profiles_admin');

  if (error) {
    console.error("Admin Fetch Error:", error);
    throw error;
  }
  return data || [];
};

export const extendSubscription = async (userId: string, monthsToAdd: number) => {
  // Use the secure RPC function
  const { data, error } = await supabase
    .rpc('extend_subscription_admin', {
      target_user_id: userId,
      months_to_add: monthsToAdd
    });

  if (error) throw error;
  return data;
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  const { data, error } = await supabase
    .rpc('toggle_user_active_status_admin', {
      target_user_id: userId,
      new_status: isActive
    });

  if (error) throw error;
  // returns setof, so data is an array
  return data && data.length > 0 ? data[0] : null;
};
