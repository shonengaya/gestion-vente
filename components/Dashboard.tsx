import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { getDashboardStats, addSale, addExpense, getSales, getExpenses, updateSale, updateExpense, deleteSale, deleteExpense, getUserProfile } from '../services/api';
import { DashboardStats, MonthlyData, Sale, Expense, PaymentMethod, Profile } from '../types';
import { formatAriary, PAYMENT_METHODS } from '../constants';
import { Card } from './ui/Card';
import { Input, Select } from './ui/Input';
import { InstallPWA } from './InstallPWA';
import { AdminDashboard } from './AdminDashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Icons as simple SVG components to avoid external deps
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V200a24,24,0,0,0,24,24H216a24,24,0,0,0,24-24V88A24,24,0,0,0,216,64Zm8,136a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V64H216a8,8,0,0,1,8,8v16H176a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48ZM184,112h32v16H184Z"></path></svg>
);
const TrendUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M232,88V200a8,8,0,0,1-16,0V107.31L125.66,197.66a8,8,0,0,1-11.32,0l-48-48L29.66,186.34A8,8,0,0,1,18.34,175l40-40a8,8,0,0,1,11.32,0l48,48L204.69,96H168a8,8,0,0,1,0-16h56A8,8,0,0,1,232,88Z"></path></svg>
);
const TrendDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M232,168a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h36.69L117.66,73,69.66,121a8,8,0,0,1-11.32,0l-40-40A8,8,0,0,1,29.66,69.66l40,40L112,67.31a8,8,0,0,1,11.32,0l96.68,96.69V128a8,8,0,0,1,16,0Z"></path></svg>
);

const SignOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L212.69,128l-42.35,42.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34ZM104,136H208a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16Z"></path></svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160l90.35-90.35,16.68,16.69L68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188.69,202.63,65.37l16.68,16.69Z"></path></svg>
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

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'expenses'>('overview');
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [expensesHistory, setExpensesHistory] = useState<Expense[]>([]);

  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Form States & Editing
  const [newSale, setNewSale] = useState({ customer_name: '', service_name: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'Orange Money' });
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserEmail(user.email || null);

      // Fetch Profile
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);

      // Check Expiry or Inactive (skip for admin)
      if (profile && user.email !== ADMIN_EMAIL) {
        // Check Deactivation first
        if (profile.is_active === false) {
          setIsDeactivated(true);
          setLoading(false);
          return;
        }

        const expiry = new Date(profile.subscription_expires_at);
        if (new Date() > expiry) {
          setIsExpired(true);
          setLoading(false);
          return; // Stop fetching data if expired
        }
      }

      const { stats, chartData } = await getDashboardStats();
      const sHist = await getSales();
      const eHist = await getExpenses();
      setStats(stats);
      setChartData(chartData);
      setSalesHistory(sHist);
      setExpensesHistory(eHist);
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
          <button onClick={handleSignOut} className="text-brand-600 font-medium hover:underline">
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
      if (!editingSaleId) setActiveTab('overview');
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement: " + getSafeErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSale = (sale: Sale) => {
    setNewSale({
      customer_name: sale.customer_name,
      service_name: sale.service_name,
      amount: String(sale.amount),
      date: sale.date,
      payment_method: sale.payment_method
    });
    setEditingSaleId(sale.id);
    setActiveTab('sales');
    // Scroll to top or form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditSale = () => {
    setNewSale({ customer_name: '', service_name: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'Orange Money' });
    setEditingSaleId(null);
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
      if (!editingExpenseId) setActiveTab('overview');
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement: " + getSafeErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setNewExpense({
      description: expense.description,
      amount: String(expense.amount),
      date: expense.date
    });
    setEditingExpenseId(expense.id);
    setActiveTab('expenses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditExpense = () => {
    setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setEditingExpenseId(null);
  };

  const KPI = ({ title, value, color, icon: Icon, subValue }: any) => (
    <Card className="relative overflow-hidden group hover:border-brand-500/30 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-bold mt-2 ${color}`}>{value}</h3>
          {subValue && <p className="text-gray-400 text-xs mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gray-50 text-gray-400 group-hover:text-brand-500 transition-colors`}>
          <Icon />
        </div>
      </div>
    </Card>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-500 font-medium">Chargement des données...</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gray-50">
      {/* Sidebar / Navbar */}
      <nav className="fixed bottom-0 w-full z-50 bg-white border-t border-gray-200 md:top-0 md:bottom-auto md:w-64 md:h-full md:border-r md:border-t-0 flex md:flex-col justify-around md:justify-start md:items-stretch md:p-6 shadow-sm md:shadow-none">
        <div className="hidden md:block mb-10 px-2">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white text-lg">P</span>
            Prolow5
          </h1>
        </div>

        <button onClick={() => setActiveTab('overview')} className={`p-4 md:px-4 md:py-3 rounded-xl flex flex-col md:flex-row items-center gap-2 md:gap-4 transition-all ${activeTab === 'overview' ? 'text-brand-600 bg-brand-50 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
          <WalletIcon />
          <span className="text-xs md:text-sm">Tableau de bord</span>
        </button>

        <button onClick={() => setActiveTab('sales')} className={`p-4 md:px-4 md:py-3 rounded-xl flex flex-col md:flex-row items-center gap-2 md:gap-4 transition-all ${activeTab === 'sales' ? 'text-green-600 bg-green-50 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
          <TrendUpIcon />
          <span className="text-xs md:text-sm">Ventes</span>
        </button>

        <button onClick={() => setActiveTab('expenses')} className={`p-4 md:px-4 md:py-3 rounded-xl flex flex-col md:flex-row items-center gap-2 md:gap-4 transition-all ${activeTab === 'expenses' ? 'text-red-600 bg-red-50 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
          <TrendDownIcon />
          <span className="text-xs md:text-sm">Dépenses</span>
        </button>

        <div className="hidden md:flex flex-grow items-end">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <SignOutIcon />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8 max-w-7xl mx-auto">

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tableau de bord</h2>
          <button onClick={handleSignOut} className="p-2 text-gray-500 hover:text-red-600">
            <SignOutIcon />
          </button>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Grid */}
            {/* KPI Section */}

            {/* Mobile: Single Summary Card */}
            <div className="md:hidden">
              <Card className="shadow-sm border border-gray-100 p-0">
                <div className="divide-y divide-gray-100">
                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Ventes (Mois)</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">{formatAriary(stats.salesMonth)}</h3>
                      <p className="text-gray-400 text-[11px] mt-0.5">+{formatAriary(stats.salesToday)} aujourd'hui</p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-50 text-green-600">
                      <TrendUpIcon />
                    </div>
                  </div>

                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Dépenses (Mois)</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">{formatAriary(stats.expensesMonth)}</h3>
                      <p className="text-gray-400 text-[11px] mt-0.5">+{formatAriary(stats.expensesToday)} aujourd'hui</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                      <TrendDownIcon />
                    </div>
                  </div>

                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Bénéfice Net (Mois)</p>
                      <h3 className={`text-xl font-bold mt-1 ${stats.netMonth >= 0 ? "text-brand-600" : "text-red-600"}`}>{formatAriary(stats.netMonth)}</h3>
                      <p className="text-gray-400 text-[11px] mt-0.5">Annuel: {formatAriary(stats.netYear)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 text-gray-500">
                      <WalletIcon />
                    </div>
                  </div>

                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Ventes (Année)</p>
                      <h3 className="text-xl font-bold text-blue-600 mt-1">{formatAriary(stats.salesYear)}</h3>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <TrendUpIcon />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Desktop: Grid View */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPI
                title="Ventes (Mois)"
                value={formatAriary(stats.salesMonth)}
                color="text-gray-900"
                icon={TrendUpIcon}
                subValue={`+${formatAriary(stats.salesToday)} aujourd'hui`}
              />
              <KPI
                title="Dépenses (Mois)"
                value={formatAriary(stats.expensesMonth)}
                color="text-gray-900"
                icon={TrendDownIcon}
                subValue={`+${formatAriary(stats.expensesToday)} aujourd'hui`}
              />
              <KPI
                title="Bénéfice Net (Mois)"
                value={formatAriary(stats.netMonth)}
                color={stats.netMonth >= 0 ? "text-brand-600" : "text-red-600"}
                icon={WalletIcon}
                subValue={`Annuel: ${formatAriary(stats.netYear)}`}
              />
              <KPI
                title="Total Ventes (Année)"
                value={formatAriary(stats.salesYear)}
                color="text-blue-600"
                icon={TrendUpIcon}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Évolution Mensuelle" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e293b' }}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar dataKey="sales" name="Ventes" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Bénéfice Net" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e293b' }}
                    />
                    <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
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
                          <td className="px-4 py-3 text-green-600 font-medium">{formatAriary(s.amount)}</td>
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
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6 animate-fade-in">
            <Card title={editingSaleId ? "Modifier la Vente" : "Nouvelle Vente"}>
              <form onSubmit={submitSale} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nom du Client" value={newSale.customer_name} onChange={e => setNewSale({ ...newSale, customer_name: e.target.value })} required placeholder="Ex: Jean Rakoto" />
                <Input label="Service / Produit" value={newSale.service_name} onChange={e => setNewSale({ ...newSale, service_name: e.target.value })} required placeholder="Ex: Réparation PC" />
                <Input label="Montant (Ar)" type="number" value={newSale.amount} onChange={e => setNewSale({ ...newSale, amount: e.target.value })} required placeholder="Ex: 50000" />
                <Input label="Date" type="date" value={newSale.date} onChange={e => setNewSale({ ...newSale, date: e.target.value })} required />
                <Select label="Moyen de Paiement" options={PAYMENT_METHODS} value={newSale.payment_method} onChange={e => setNewSale({ ...newSale, payment_method: e.target.value })} />

                <div className="md:col-span-2 mt-4 flex gap-4">
                  {editingSaleId && (
                    <button type="button" onClick={cancelEditSale} className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all">
                      Annuler
                    </button>
                  )}
                  <button type="submit" disabled={formLoading} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-brand-500/20">
                    {formLoading ? 'Enregistrement...' : (editingSaleId ? 'Mettre à jour' : 'Enregistrer la Vente')}
                  </button>
                </div>
              </form>
            </Card>

            <Card title="Historique des Ventes">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-500 sticky top-0 backdrop-blur-md">
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
                    {salesHistory.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(s.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{s.customer_name}</td>
                        <td className="px-4 py-3">{s.service_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs border ${s.payment_method.includes('Orange') ? 'border-orange-200 text-orange-700 bg-orange-50' : s.payment_method.includes('Telma') ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                            {s.payment_method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold">{formatAriary(s.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleEditSale(s)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Modifier">
                            <PencilIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-fade-in">
            <Card title={editingExpenseId ? "Modifier la Dépense" : "Nouvelle Dépense"}>
              <form onSubmit={submitExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} required placeholder="Ex: Achat fournitures" className="md:col-span-2" />
                <Input label="Montant (Ar)" type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} required placeholder="Ex: 10000" />
                <Input label="Date" type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} required />

                <div className="md:col-span-2 mt-4 flex gap-4">
                  {editingExpenseId && (
                    <button type="button" onClick={cancelEditExpense} className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all">
                      Annuler
                    </button>
                  )}
                  <button type="submit" disabled={formLoading} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-red-500/20">
                    {formLoading ? 'Enregistrement...' : (editingExpenseId ? 'Mettre à jour' : 'Enregistrer la Dépense')}
                  </button>
                </div>
              </form>
            </Card>

            <Card title="Historique des Dépenses">
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
                    {expensesHistory.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{e.description}</td>
                        <td className="px-4 py-3 text-right text-red-600 font-bold">{formatAriary(e.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleEditExpense(e)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Modifier">
                            <PencilIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>
      <InstallPWA />
    </div>
  );
};