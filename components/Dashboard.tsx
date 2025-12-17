import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { getDashboardStats, addSale, addExpense, getSales, getExpenses, updateSale, updateExpense, deleteSale, deleteExpense, getUserProfile } from '../services/api';
import { DashboardStats, MonthlyData, Sale, Expense, PaymentMethod, Profile } from '../types';
import { formatAriary, PAYMENT_METHODS } from '../constants';
import { Card } from './ui/Card';
import { Input, Select } from './ui/Input';
import { InstallPWA } from './InstallPWA';
import { AdminDashboard } from './AdminDashboard';
import { ProductList } from './products/ProductList';
import { ProductSelector } from './products/ProductSelector';
import { Modal } from './ui/Modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale/fr';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

// Icons as simple SVG components to avoid external deps
const WalletIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V200a24,24,0,0,0,24,24H216a24,24,0,0,0,24-24V88A24,24,0,0,0,216,64Zm8,136a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V64H216a8,8,0,0,1,8,8v16H176a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48ZM184,112h32v16H184Z"></path></svg>
);
const TrendUpIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M232,88V200a8,8,0,0,1-16,0V107.31L125.66,197.66a8,8,0,0,1-11.32,0l-48-48L29.66,186.34A8,8,0,0,1,18.34,175l40-40a8,8,0,0,1,11.32,0l48,48L204.69,96H168a8,8,0,0,1,0-16h56A8,8,0,0,1,232,88Z"></path></svg>
);
const TrendDownIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M232,168a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h36.69L117.66,73,69.66,121a8,8,0,0,1-11.32,0l-40-40A8,8,0,0,1,29.66,69.66l40,40L112,67.31a8,8,0,0,1,11.32,0l96.68,96.69V128a8,8,0,0,1,16,0Z"></path></svg>
);

const SignOutIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L212.69,128l-42.35,42.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34ZM104,136H208a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16Z"></path></svg>
);

const PencilIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160l90.35-90.35,16.68,16.69L68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188.69,202.63,65.37l16.68,16.69Z"></path></svg>
);

const PackageIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.15a16,16,0,0,0-8.32,14v95.7a16,16,0,0,0,8.32,14l88,48.15a15.88,15.88,0,0,0,15.36,0l88-48.15a16,16,0,0,0,8.32-14V80.15A16,16,0,0,0,223.68,66.15ZM128,32l80,43.75-34.25,18.74L93.75,50.74Zm-80,43.75,80,43.75V224L48,180.25Zm88,148.25V119.5l80-43.75L216,180.25Z"></path></svg>
);

const CalendarIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48Zm136,160H48V96H208V208Z"></path></svg>
);

const ChevronDownIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
);

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-xl text-gray-700 text-sm">
        <p className="font-semibold mb-2 text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color || entry.fill }} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
            <span>{entry.name}:</span>
            <span className="font-bold">
              {typeof entry.value === 'number' ? formatAriary(entry.value) : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper to safely stringify errors
const getSafeErrorMessage = (err: any) => {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (err?.message && typeof err.message === 'string') return err.message;
  if (err?.error_description && typeof err.error_description === 'string') return err.error_description;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Erreur inconnue';
  }
};

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,84a12,12,0,1,1,12-12A12,12,0,0,1,128,164Zm40-84H88V56a40,40,0,0,1,80,0Z"></path></svg>
);

const ADMIN_EMAIL = 'andriantahirynomena@gmail.com';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Missing State Definitions
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [expensesHistory, setExpensesHistory] = useState<Expense[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'expenses' | 'products'>('overview');
  const [formLoading, setFormLoading] = useState(false);

  const [newSale, setNewSale] = useState({
    customer_name: '',
    service_name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'Orange Money'
  });
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Modal & Filter States
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [saleSearchQuery, setSaleSearchQuery] = useState('');
  const [saleFilterService, setSaleFilterService] = useState('all');
  const [saleFilterTime, setSaleFilterTime] = useState('month'); // Default 'month'

  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  const [expenseFilterTime, setExpenseFilterTime] = useState('month'); // Default 'month'

  // Helper for filter range
  const isInTimeRange = (dateStr: string, timeFilter: string) => {
    const itemDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDateMidnight = new Date(itemDate);
    itemDateMidnight.setHours(0, 0, 0, 0);

    if (timeFilter === 'all') return true;
    if (timeFilter === 'today') return itemDateMidnight.getTime() === today.getTime();
    if (timeFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return itemDateMidnight.getTime() === yesterday.getTime();
    }
    if (timeFilter === 'week') {
      // Current week (starting Monday)
      const day = today.getDay() || 7;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - day + 1);
      return itemDateMidnight >= startOfWeek;
    }
    if (timeFilter === 'month') {
      return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
    }
    if (timeFilter === 'year') {
      return itemDate.getFullYear() === today.getFullYear();
    }
    return true;
  };

  // Filtered Lists
  const filteredSalesHistory = salesHistory.filter(s => {
    const matchesSearch =
      s.customer_name.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
      s.service_name.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
      s.payment_method.toLowerCase().includes(saleSearchQuery.toLowerCase());
    const matchesService = saleFilterService === 'all' || s.service_name === saleFilterService;
    const matchesTime = isInTimeRange(s.date, saleFilterTime);
    return matchesSearch && matchesService && matchesTime;
  });

  const filteredExpensesHistory = expensesHistory.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(expenseSearchQuery.toLowerCase());
    const matchesTime = isInTimeRange(e.date, expenseFilterTime);
    return matchesSearch && matchesTime;
  });

  // Unique Services for Filter
  const uniqueServices = Array.from(new Set(salesHistory.map(s => s.service_name)));

  // Derived Data Calculation
  const getFilteredData = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    return {
      sales: sales.filter(s => {
        if (timeFilter === 'day') return s.date === today;
        if (timeFilter === 'week') return s.date >= startOfWeek;
        if (timeFilter === 'month') return s.date >= startOfMonth;
        if (timeFilter === 'year') return s.date >= startOfYear;
        if (timeFilter === 'custom') {
          const end = dateRange.end || dateRange.start; // Fallback to start if selecting
          return s.date >= dateRange.start && s.date <= end;
        }
        return true;
      }),
      expenses: expenses.filter(e => {
        if (timeFilter === 'day') return e.date === today;
        if (timeFilter === 'week') return e.date >= startOfWeek;
        if (timeFilter === 'month') return e.date >= startOfMonth;
        if (timeFilter === 'year') return e.date >= startOfYear;
        if (timeFilter === 'custom') {
          const end = dateRange.end || dateRange.start;
          return e.date >= dateRange.start && e.date <= end;
        }
        return true;
      })
    };
  };

  const { sales: filteredSales, expenses: filteredExpenses } = getFilteredData();

  const totals = {
    sales: filteredSales.reduce((sum, s) => sum + Number(s.amount), 0),
    expenses: filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
    net: 0
  };
  totals.net = totals.sales - totals.expenses;

  // Chart Data Preparation
  const chartData = React.useMemo(() => {
    const data: any[] = [];
    // If Day: Show hourly? No, maybe just show the specific transactions or simple overview. 
    // Let's stick to standard daily grouping for Month/Week, and Monthly for Year.

    // Grouping helper
    const groupBy = (items: any[], keyFn: (d: Date) => string) => {
      const groups: Record<string, { sales: number, expenses: number }> = {};
      items.forEach(item => {
        const k = keyFn(new Date(item.date));
        if (!groups[k]) groups[k] = { sales: 0, expenses: 0 };
        if (item.amount) groups[k].sales += Number(item.amount); // Careful if mixing arrays
      });
      return groups;
    };

    // Separate pass since we have two arrays
    const groups: Record<string, { sales: number, expenses: number }> = {};

    const process = (items: any[], type: 'sales' | 'expenses') => {
      items.forEach(item => {
        const d = new Date(item.date);
        let key = '';
        if (timeFilter === 'year') {
          key = d.toLocaleString('fr-FR', { month: 'short' });
        } else {
          key = d.getDate().toString(); // Day of month 1-31
          if (timeFilter === 'custom') {
            // For custom range, if it spans widely, maybe use month/year? 
            // For now keep daily for granularity.
            // If spanning years, maybe include month name.
            key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          }
        }

        if (!groups[key]) groups[key] = { sales: 0, expenses: 0 };
        groups[key][type] += Number(item.amount);
      });
    };

    process(filteredSales, 'sales');
    process(filteredExpenses, 'expenses');

    // Sort keys?
    // Quick dirty sort based on month/day index could be complex. 
    // Simply pushing keys. For Year, we want Jan-Dec. For Month, 1-31.
    return Object.keys(groups).map(k => ({
      name: k,
      sales: groups[k].sales,
      expenses: groups[k].expenses
    }));
  }, [filteredSales, filteredExpenses, timeFilter]);

  // Pie Data (By Product/Service)
  const pieData = React.useMemo(() => {
    const groups: Record<string, number> = {};
    filteredSales.forEach(s => {
      const key = s.service_name || 'Autre';
      groups[key] = (groups[key] || 0) + Number(s.amount);
    });
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [filteredSales]);


  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserEmail(user.email || null);
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);

      if (profile && user.email !== ADMIN_EMAIL) {
        if (profile.is_active === false) { setIsDeactivated(true); setLoading(false); return; }
        const expiry = new Date(profile.subscription_expires_at);
        if (new Date() > expiry) { setIsExpired(true); setLoading(false); return; }
      }

      // Fetch ALL data
      const sHist = await getSales();
      const eHist = await getExpenses();
      setSales(sHist);
      setExpenses(eHist);
      setSalesHistory(sHist); // Keep for table
      setExpensesHistory(eHist); // Keep for table

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-500 font-medium">Chargement des données...</div>;

  // 1. ADMIN VIEW
  const isAdmin = currentUserEmail?.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();



  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white text-lg">A</span>
            Admin Panel
          </h1>
          <button onClick={handleSignOut} className="text-gray-500 hover:text-red-600 font-medium text-sm">
            Déconnexion
          </button>
        </nav>
        <AdminDashboard />
      </div>
    );
  }

  // 2. EXPIRED OR DEACTIVATED VIEW
  if (isExpired || isDeactivated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="text-center max-w-md w-full py-12">
          <div className="flex justify-center mb-6 text-red-500">
            <LockIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isDeactivated ? "Compte Désactivé" : "Période d'essai terminée"}
          </h1>
          <p className="text-gray-500 mb-8">
            {isDeactivated
              ? "Votre compte a été désactivé par l'administrateur. Veuillez nous contacter pour plus d'informations."
              : "Votre accès de 3 jours a expiré. Veuillez contacter l'administrateur pour souscrire un abonnement et débloquer votre compte."
            }
          </p>
          <div className="bg-gray-100 p-4 rounded-xl mb-6 text-sm text-gray-700">
            Contact: <span className="font-bold">034 96 712 22</span>
          </div>
          <button onClick={handleSignOut} className="text-emerald-600 font-medium hover:underline">
            Se déconnecter
          </button>
        </Card>
      </div>
    );
  }

  const submitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...newSale,
        amount: Number(newSale.amount),
        payment_method: newSale.payment_method as PaymentMethod
      };

      if (editingSaleId) {
        await updateSale(editingSaleId, payload);
      } else {
        await addSale(payload as any);
      }

      setNewSale({ customer_name: '', service_name: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'Orange Money' });
      setEditingSaleId(null);
      await fetchData();
      setIsSaleModalOpen(false); // Close modal
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement: " + getSafeErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSale = (sale: Sale) => {
    setActiveTab('sales'); // Switch to sales tab
    setNewSale({
      customer_name: sale.customer_name,
      service_name: sale.service_name,
      amount: String(sale.amount),
      date: sale.date,
      payment_method: sale.payment_method
    });
    setEditingSaleId(sale.id);
    setIsSaleModalOpen(true); // Open modal
  };

  const cancelEditSale = () => {
    setNewSale({ customer_name: '', service_name: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'Orange Money' });
    setEditingSaleId(null);
    setIsSaleModalOpen(false);
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...newExpense,
        amount: Number(newExpense.amount)
      };

      if (editingExpenseId) {
        await updateExpense(editingExpenseId, payload);
      } else {
        await addExpense(payload as any);
      }

      setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setEditingExpenseId(null);
      await fetchData();
      setIsExpenseModalOpen(false); // Close modal
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement: " + getSafeErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setActiveTab('expenses'); // Switch to expenses tab
    setNewExpense({
      description: expense.description,
      amount: String(expense.amount),
      date: expense.date
    });
    setEditingExpenseId(expense.id);
    setIsExpenseModalOpen(true); // Open modal
  };

  const cancelEditExpense = () => {
    setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setEditingExpenseId(null);
    setIsExpenseModalOpen(false);
  };

  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
  );

  const handleDeleteSale = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click (edit)
    if (!confirm("Voulez-vous vraiment supprimer cette vente ?")) return;
    try {
      await deleteSale(id);
      await fetchData();
    } catch (err: any) {
      alert("Erreur: " + getSafeErrorMessage(err));
    }
  };

  const handleDeleteExpense = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer cette dépense ?")) return;
    try {
      await deleteExpense(id);
      await fetchData();
    } catch (err: any) {
      alert("Erreur: " + getSafeErrorMessage(err));
    }
  };

  const KPI = ({ title, value, color, icon: Icon, subValue, trend = 'up' }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-full hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2">
        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend === 'up' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" transform="rotate(180 128 128)"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
          )}
          <span>25%</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">vs semaine dernière</span>
      </div>
    </div>
  );


  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-500 font-medium">Chargement des données...</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gray-50">
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center p-3 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'overview' ? 'text-slate-900 font-bold' : 'text-gray-400 hover:text-slate-600'}`}
        >
          <WalletIcon />
          <span className="text-[10px]">Accueil</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'sales' ? 'text-slate-900 font-bold' : 'text-gray-400 hover:text-slate-600'}`}
        >
          <TrendUpIcon />
          <span className="text-[10px]">Ventes</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'expenses' ? 'text-slate-900 font-bold' : 'text-gray-400 hover:text-slate-600'}`}
        >
          <TrendDownIcon />
          <span className="text-[10px]">Dépenses</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'products' ? 'text-slate-900 font-bold' : 'text-gray-400 hover:text-slate-600'}`}
        >
          <PackageIcon />
          <span className="text-[10px]">Produits</span>
        </button>
      </nav>

      {/* Desktop Sidebar (Space Style) */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1c1e2d] text-gray-300 z-40 hidden md:flex flex-col font-sans transition-all duration-300">
        {/* Brand Area */}
        <div className="h-20 flex items-center px-8">
          <div className="flex items-center gap-3 text-white">
            <div className="grid grid-cols-2 gap-1 w-6 h-6">
              <div className="bg-blue-500 rounded-full w-full h-full"></div>
              <div className="bg-gray-400 rounded-full w-full h-full"></div>
              <div className="bg-gray-600 rounded-full w-full h-full"></div>
              <div className="bg-gray-800 rounded-full w-full h-full"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Prolow5</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto mt-4">
          <div>
            <div className="px-4 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Main
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
              >
                <WalletIcon className="w-5 h-5" />
                <span>Vue d'ensemble</span>
              </button>
            </div>
          </div>

          <div>
            <div className="px-4 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Gestion
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('sales')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'sales' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
              >
                <TrendUpIcon className="w-5 h-5" />
                <span>Ventes</span>
              </button>

              <button
                onClick={() => setActiveTab('expenses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
              >
                <TrendDownIcon className="w-5 h-5" />
                <span>Dépenses</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
              >
                <PackageIcon className="w-5 h-5" />
                <span>Produits</span>
              </button>
            </div>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-6">
          <Card className="!bg-white/5 !border-0 text-white p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner">
              {(userProfile?.username || currentUserEmail || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-none mb-1">{userProfile?.username || 'Utilisateur'}</p>
              <p className="text-[10px] text-gray-400 truncate">{currentUserEmail}</p>
            </div>
            <button onClick={handleSignOut} className="text-gray-400 hover:text-white"><SignOutIcon className="w-5 h-5" /></button>
          </Card>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="md:ml-64 min-h-screen bg-[#F5F6FA] text-slate-800 font-sans">

        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200/60 sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="grid grid-cols-2 gap-1 w-5 h-5">
                <div className="bg-blue-500 rounded-full w-full h-full"></div>
                <div className="bg-gray-400 rounded-full w-full h-full"></div>
                <div className="bg-gray-600 rounded-full w-full h-full"></div>
                <div className="bg-gray-800 rounded-full w-full h-full"></div>
              </div>
              <span className="font-bold text-lg text-slate-800 tracking-tight">Prolow5</span>
            </div>

            {/* Search Simulation */}
            <div className="relative max-w-md w-full hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
              </div>
              <input type="text" placeholder="Rechercher une transaction..." className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border-0 rounded-xl text-sm font-medium text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Date Picker Simulation */}
            {/* Date Picker Trigger & Filter */}
            <div className="relative z-50">
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="capitalize hidden sm:inline">
                  {timeFilter === 'custom' && dateRange.start ?
                    `${new Date(dateRange.start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${dateRange.end ? new Date(dateRange.end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '...'}`
                    : new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <ChevronDownIcon className="w-3 h-3 text-gray-400 hidden sm:block" />
              </button>

              {isDatePickerOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-fade-in origin-top-right">
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Période</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['day', 'week', 'month', 'year'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTimeFilter(t); setIsDatePickerOpen(false); }}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeFilter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                          {t === 'day' ? 'Jour' : t === 'week' ? 'Semaine' : t === 'month' ? 'Mois' : t === 'year' ? 'Année' : ''}
                        </button>
                      ))}
                      <button
                        onClick={() => setTimeFilter('custom')}
                        className={`col-span-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeFilter === 'custom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        Personnalisé
                      </button>
                    </div>
                  </div>

                  {timeFilter === 'custom' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sélectionner les dates</label>
                      <DatePicker
                        selectsRange={true}
                        startDate={dateRange.start ? new Date(dateRange.start) : undefined}
                        endDate={dateRange.end ? new Date(dateRange.end) : undefined}
                        onChange={(update: any) => {
                          const [start, end] = update;
                          setDateRange({
                            start: start ? start.toLocaleDateString('en-CA') : '',
                            end: end ? end.toLocaleDateString('en-CA') : ''
                          });
                        }}
                        inline
                        locale={fr as any}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Trigger */}
            <div className="relative">
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors border border-gray-200"
                title="Profil"
              >
                <span className="font-bold text-xs">{(userProfile?.username || currentUserEmail || 'U').charAt(0).toUpperCase()}</span>
              </div>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-fade-in origin-top-right z-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                      {(userProfile?.username || currentUserEmail || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{userProfile?.username || 'Utilisateur'}</h4>
                      <p className="text-xs text-gray-500 truncate">{currentUserEmail}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Abonnement</p>
                      {userProfile?.subscription_expires_at ? (
                        <div>
                          {(() => {
                            const now = new Date();
                            const expiry = new Date(userProfile.subscription_expires_at);
                            const diff = expiry.getTime() - now.getTime();
                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

                            let text = "";
                            let color = "text-emerald-600";

                            if (diff < 0) {
                              text = "Expiré";
                              color = "text-red-600";
                            } else if (days > 30) {
                              const months = Math.floor(days / 30);
                              const restDays = days % 30;
                              text = `${months} mois ${restDays > 0 ? `et ${restDays} jours` : ''} restants`;
                            } else {
                              text = `${days} jours restants`;
                              if (days < 7) color = "text-orange-500";
                            }

                            return (
                              <>
                                <p className={`text-sm font-bold ${color}`}>{text}</p>
                                <p className="text-[10px] text-gray-400 mt-1">Expire le {expiry.toLocaleDateString()}</p>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-slate-900">Illimité (Admin)</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-medium transition-all"
                  >
                    <SignOutIcon className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 pb-32">

          {/* Mobile Header Removed - Integrated into Top Header */}


          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Time Filter Tabs - Hidden in this design or moved */}

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <KPI
                  title="Total Ventes"
                  value={formatAriary(totals.sales).replace('Ar', '')}
                  color="text-emerald-600"
                  icon={TrendUpIcon}
                  trend="up"
                />
                <KPI
                  title="Transactions"
                  value={sales.filter(s => {
                    const d = new Date(s.date);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length}
                  color="text-blue-600"
                  icon={WalletIcon}
                  trend="up"
                />
                <KPI
                  title="Total Dépenses"
                  value={formatAriary(totals.expenses).replace('Ar', '')}
                  color="text-rose-600"
                  icon={TrendDownIcon}
                  trend="down"
                />
                <KPI
                  title="Bénéfice Net"
                  value={formatAriary(totals.net).replace('Ar', '')}
                  color={totals.net >= 0 ? "text-blue-600" : "text-rose-600"}
                  icon={PackageIcon}
                  trend={totals.net >= 0 ? "up" : "down"}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Area Chart: Evolution Superimposed (Takes 2 Cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">Total Earnings</h3>
                    <button className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M112,128a12,12,0,1,1-12-12A12,12,0,0,1,112,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,168,116Zm56,0a12,12,0,1,0,12,12A12,12,0,0,0,224,116ZM64,116a12,12,0,1,0,12,12A12,12,0,0,0,64,116Z"></path></svg></button>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip
                          formatter={(value: number) => formatAriary(value)}
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          name="Ventes"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorSales)"
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart: Distribution (Takes 1 Col) */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">Transactions</h3>
                    <button className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M112,128a12,12,0,1,1-12-12A12,12,0,0,1,112,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,168,116Zm56,0a12,12,0,1,0,12,12A12,12,0,0,0,224,116ZM64,116a12,12,0,1,0,12,12A12,12,0,0,0,64,116Z"></path></svg></button>
                  </div>
                  <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatAriary(value)}
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-slate-800">+8%</span>
                      <span className="text-xs text-gray-400">Croissance</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center gap-4 flex-wrap">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-xs text-gray-500 font-medium">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Dernières Ventes">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="text-xs uppercase bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Client</th>
                          <th className="px-4 py-3">Montant</th>
                          <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {salesHistory.slice(0, 5).map(s => (
                          <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEditSale(s)}>
                            <td className="px-4 py-3 font-medium text-gray-900">{s.customer_name}</td>
                            <td className="px-4 py-3 text-emerald-600 font-medium">{formatAriary(s.amount)}</td>
                            <td className="px-4 py-3 text-right">{new Date(s.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <Card title="Dernières Dépenses">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="text-xs uppercase bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Motif</th>
                          <th className="px-4 py-3">Montant</th>
                          <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {expensesHistory.slice(0, 5).map(e => (
                          <tr key={e.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEditExpense(e)}>
                            <td className="px-4 py-3 font-medium text-gray-900">{e.description}</td>
                            <td className="px-4 py-3 text-red-600 font-medium">{formatAriary(e.amount)}</td>
                            <td className="px-4 py-3 text-right">{new Date(e.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )
          }

          {
            activeTab === 'sales' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ventes</h2>
                    <p className="text-sm text-gray-500">Gérez vos ventes et recherchez des transactions.</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewSale({ customer_name: '', service_name: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'Orange Money' });
                      setEditingSaleId(null);
                      setIsSaleModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-medium shadow-md shadow-slate-500/20 transition-all"
                  >
                    <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                    </div>
                    Nouvelle Vente
                  </button>
                </div>

                {/* Filters */}
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Rechercher (Client, Service, Méthode)..."
                        value={saleSearchQuery}
                        onChange={(e) => setSaleSearchQuery(e.target.value)}
                        className="pl-10 w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                      />
                    </div>

                    {/* Service Filter */}
                    <select
                      value={saleFilterService}
                      onChange={(e) => setSaleFilterService(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      <option value="all">Tous les services</option>
                      {uniqueServices.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    {/* Time Filter */}
                    <select
                      value={saleFilterTime}
                      onChange={(e) => setSaleFilterTime(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      <option value="today">Aujourd'hui</option>
                      <option value="yesterday">Hier</option>
                      <option value="week">Cette semaine</option>
                      <option value="month">Ce mois</option>
                      <option value="year">Cette année</option>
                      <option value="all">Tout</option>
                    </select>
                  </div>
                </Card>

                {/* Sales Table */}
                {/* Sales Table */}
                <Card title={
                  <div className="flex justify-between items-center">
                    <span>Historique des Ventes</span>
                    <span className="text-emerald-600 font-bold text-lg">
                      Total: {formatAriary(filteredSalesHistory.reduce((sum, item) => sum + Number(item.amount), 0))}
                    </span>
                  </div>
                }>
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="text-xs uppercase bg-gray-50 text-gray-500 sticky top-0 backdrop-blur-md z-10">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Client</th>
                          <th className="px-4 py-3">Service</th>
                          <th className="px-4 py-3">Méthode</th>
                          <th className="px-4 py-3 text-right">Montant</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredSalesHistory.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucune vente trouvée.</td>
                          </tr>
                        ) : (
                          filteredSalesHistory.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => handleEditSale(s)}>
                              <td className="px-4 py-3">{new Date(s.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-slate-900 font-medium group-hover:text-blue-600 transition-colors">{s.customer_name}</td>
                              <td className="px-4 py-3">{s.service_name}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs border ${s.payment_method.includes('Orange') ? 'border-orange-200 text-orange-700 bg-orange-50' : s.payment_method.includes('Telma') ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                                  {s.payment_method}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-emerald-600 font-bold">{formatAriary(s.amount)}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="p-2 text-gray-400 group-hover:text-blue-600 rounded-lg transition-colors" title="Modifier">
                                  <PencilIcon />
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Sale Modal */}
                <Modal
                  isOpen={isSaleModalOpen}
                  onClose={() => setIsSaleModalOpen(false)}
                  title={editingSaleId ? "Modifier la Vente" : "Nouvelle Vente"}
                >
                  {!editingSaleId && (
                    <div className="mb-6">
                      <ProductSelector
                        onSelect={(p) => setNewSale({
                          ...newSale,
                          service_name: p.name,
                          amount: String(p.price)
                        })}
                      />
                    </div>
                  )}
                  <form onSubmit={submitSale} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nom du Client" value={newSale.customer_name} onChange={e => setNewSale({ ...newSale, customer_name: e.target.value })} required placeholder="Ex: Jean Rakoto" />
                    <Input label="Service / Produit" value={newSale.service_name} onChange={e => setNewSale({ ...newSale, service_name: e.target.value })} required placeholder="Ex: Réparation PC" />
                    <Input label="Montant (Ar)" type="number" value={newSale.amount} onChange={e => setNewSale({ ...newSale, amount: e.target.value })} required placeholder="Ex: 50000" />
                    <Input label="Date" type="date" value={newSale.date} onChange={e => setNewSale({ ...newSale, date: e.target.value })} required />
                    <Select label="Moyen de Paiement" options={PAYMENT_METHODS} value={newSale.payment_method} onChange={e => setNewSale({ ...newSale, payment_method: e.target.value })} />

                    <div className="md:col-span-2 mt-6 flex gap-3 border-t border-gray-100 pt-5">
                      {editingSaleId && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSale(e, editingSaleId)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-transparent hover:border-red-100 mr-auto"
                        >
                          <TrashIcon />
                        </button>
                      )}
                      <button type="button" onClick={() => setIsSaleModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-gray-100 font-medium rounded-lg transition-all ml-auto">
                        Annuler
                      </button>
                      <button type="submit" disabled={formLoading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all disabled:opacity-70 shadow-lg shadow-slate-900/20">
                        {formLoading ? '...' : (editingSaleId ? 'Mettre à jour' : 'Enregistrer')}
                      </button>
                    </div>
                  </form>
                </Modal>
              </div>
            )
          }

          {
            activeTab === 'expenses' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dépenses</h2>
                    <p className="text-sm text-gray-500">Suivi détaillé de vos sorties d'argent.</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
                      setEditingExpenseId(null);
                      setIsExpenseModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-medium shadow-md shadow-slate-500/20 transition-all"
                  >
                    <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                    </div>
                    Nouvelle Dépense
                  </button>
                </div>

                {/* Filters */}
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Rechercher (Description)..."
                        value={expenseSearchQuery}
                        onChange={(e) => setExpenseSearchQuery(e.target.value)}
                        className="pl-10 w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                      />
                    </div>

                    {/* Time Filter */}
                    <select
                      value={expenseFilterTime}
                      onChange={(e) => setExpenseFilterTime(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      <option value="today">Aujourd'hui</option>
                      <option value="yesterday">Hier</option>
                      <option value="week">Cette semaine</option>
                      <option value="month">Ce mois</option>
                      <option value="year">Cette année</option>
                      <option value="all">Tout</option>
                    </select>
                  </div>
                </Card>

                {/* Expense Modal */}
                <Modal
                  isOpen={isExpenseModalOpen}
                  onClose={() => setIsExpenseModalOpen(false)}
                  title={editingExpenseId ? "Modifier la Dépense" : "Nouvelle Dépense"}
                >
                  <form onSubmit={submitExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} required placeholder="Ex: Achat fournitures" className="md:col-span-2" />
                    <Input label="Montant (Ar)" type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} required placeholder="Ex: 10000" />
                    <Input label="Date" type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} required />

                    <div className="md:col-span-2 mt-6 flex gap-3 border-t border-gray-100 pt-5">
                      {editingExpenseId && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteExpense(e, editingExpenseId)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-transparent hover:border-red-100 mr-auto"
                        >
                          <TrashIcon />
                        </button>
                      )}
                      <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-gray-100 font-medium rounded-lg transition-all ml-auto">
                        Annuler
                      </button>
                      <button type="submit" disabled={formLoading} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-70 shadow-lg shadow-red-600/20">
                        {formLoading ? '...' : (editingExpenseId ? 'Mettre à jour' : 'Enregistrer')}
                      </button>
                    </div>
                  </form>
                </Modal>

                {/* Expenses Table */}
                <Card title={
                  <div className="flex justify-between items-center">
                    <span>Historique des Dépenses</span>
                    <span className="text-red-600 font-bold text-lg">
                      Total: {formatAriary(filteredExpensesHistory.reduce((sum, item) => sum + Number(item.amount), 0))}
                    </span>
                  </div>
                }>
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="text-xs uppercase bg-gray-50 text-gray-500 sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3 text-right">Montant</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredExpensesHistory.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Aucune dépense trouvée.</td>
                          </tr>
                        ) : (
                          filteredExpensesHistory.map(e => (
                            <tr key={e.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => handleEditExpense(e)}>
                              <td className="px-4 py-3">{new Date(e.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-slate-900 font-medium group-hover:text-blue-600 transition-colors">{e.description}</td>
                              <td className="px-4 py-3 text-right text-red-600 font-bold">{formatAriary(e.amount)}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="p-2 text-gray-400 group-hover:text-blue-600 rounded-lg transition-colors" title="Modifier">
                                  <PencilIcon />
                                </div>
                              </td>
                            </tr>
                          )))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          }

          {
            activeTab === 'products' && (
              <ProductList />
            )
          }
        </div>
      </main >
      <InstallPWA />
    </div >
  );
};