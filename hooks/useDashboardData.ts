import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { getSales, getExpenses, getUserProfile, addSale, updateSale, deleteSale, addExpense, updateExpense, deleteExpense } from '../services/api';
import { Sale, Expense, Profile, PaymentMethod } from '../types';

const ADMIN_EMAIL = 'andriantahirynomena@gmail.com';

export const useDashboardData = () => {
    // Data State
    const [sales, setSales] = useState<Sale[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
    const [expensesHistory, setExpensesHistory] = useState<Expense[]>([]);
    const [funding, setFunding] = useState<any[]>([]); // New State for funding

    // User State
    const [loading, setLoading] = useState(true);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [isDeactivated, setIsDeactivated] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    // Filter State
    const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Search/Filter State
    const [saleSearchQuery, setSaleSearchQuery] = useState('');
    const [saleFilterService, setSaleFilterService] = useState('all');
    const [saleFilterTime, setSaleFilterTime] = useState('month');
    const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
    const [expenseFilterTime, setExpenseFilterTime] = useState('month');

    // Fetch Data
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

            const sHist = await getSales();
            const eHist = await getExpenses();
            setSales(sHist);
            setExpenses(eHist);
            setSalesHistory(sHist);
            setSalesHistory(sHist);
            setExpensesHistory(eHist);

            // Fetch Funding
            const { data: fData } = await supabase.from('funding_entries').select('*').order('date', { ascending: false });
            setFunding(fData || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper: is in time range
    const isInTimeRange = (dateStr: string, filter: string) => {
        const itemDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const itemDateMidnight = new Date(itemDate);
        itemDateMidnight.setHours(0, 0, 0, 0);

        if (filter === 'all') return true;
        if (filter === 'today') return itemDateMidnight.getTime() === today.getTime();
        if (filter === 'yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return itemDateMidnight.getTime() === yesterday.getTime();
        }
        if (filter === 'week') {
            const day = today.getDay() || 7;
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - day + 1);
            return itemDateMidnight >= startOfWeek;
        }
        if (filter === 'month') {
            return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
        }
        if (filter === 'year') {
            return itemDate.getFullYear() === today.getFullYear();
        }
        return true;
    };

    // Filtered Lists for Tables
    const filteredSalesHistory = useMemo(() => salesHistory.filter(s => {
        const matchesSearch =
            s.customer_name.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
            s.service_name.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
            s.payment_method.toLowerCase().includes(saleSearchQuery.toLowerCase());
        const matchesService = saleFilterService === 'all' || s.service_name === saleFilterService;
        const matchesTime = isInTimeRange(s.date, saleFilterTime);
        return matchesSearch && matchesService && matchesTime;
    }), [salesHistory, saleSearchQuery, saleFilterService, saleFilterTime]);

    const filteredExpensesHistory = useMemo(() => expensesHistory.filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(expenseSearchQuery.toLowerCase());
        const matchesTime = isInTimeRange(e.date, expenseFilterTime);
        return matchesSearch && matchesTime;
    }), [expensesHistory, expenseSearchQuery, expenseFilterTime]);

    // Unique Services
    const uniqueServices = useMemo(() => Array.from(new Set(salesHistory.map(s => s.service_name))), [salesHistory]);

    // Filtered Data for Dashboard Overview (Affected by Main Time Filter)
    const getFilteredOverviewData = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().split('T')[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

        const filterFn = (dateStr: string) => {
            if (timeFilter === 'day') return dateStr === today;
            if (timeFilter === 'week') return dateStr >= startOfWeek;
            if (timeFilter === 'month') return dateStr >= startOfMonth;
            if (timeFilter === 'year') return dateStr >= startOfYear;
            if (timeFilter === 'custom') {
                const end = dateRange.end || dateRange.start;
                return dateStr >= dateRange.start && dateStr <= end;
            }
            return true;
        };

        return {
            sales: sales.filter(s => filterFn(s.date)),
            expenses: expenses.filter(e => filterFn(e.date))
        };
    };

    const { sales: overviewSales, expenses: overviewExpenses } = getFilteredOverviewData();

    const totals = useMemo(() => ({
        sales: overviewSales.reduce((sum, s) => sum + Number(s.amount), 0),
        expenses: overviewExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
        funding: funding.reduce((sum, f) => sum + Number(f.amount), 0), // Global funding total
        net: 0,
        treasury: 0 // Cash on hand
    }), [overviewSales, overviewExpenses, funding]);
    totals.net = totals.sales - totals.expenses;
    totals.treasury = (totals.sales + totals.funding) - totals.expenses;

    // CRUD Actions
    const handleAddSale = async (data: any) => {
        await addSale(data);
        await fetchData();
    };
    const handleUpdateSale = async (id: string, data: any) => {
        await updateSale(id, data);
        await fetchData();
    };
    const handleDeleteSale = async (id: string) => {
        await deleteSale(id);
        await fetchData();
    };

    const handleAddExpense = async (data: any) => {
        await addExpense(data);
        await fetchData();
    };
    const handleUpdateExpense = async (id: string, data: any) => {
        await updateExpense(id, data);
        await fetchData();
    };
    const handleDeleteExpense = async (id: string) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    // --- Funding Actions ---
    const handleUpdateFunding = async (id: string, updatedData: any) => {
        const { error } = await supabase.from('funding_entries').update(updatedData).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const handleDeleteFunding = async (id: string) => {
        const { error } = await supabase.from('funding_entries').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    // Prepare Chart Data
    const chartData = useMemo(() => {
        const groups: Record<string, { sales: number, expenses: number }> = {};
        const process = (items: any[], type: 'sales' | 'expenses') => {
            items.forEach(item => {
                const d = new Date(item.date);
                let key = '';
                if (timeFilter === 'year') {
                    key = d.toLocaleString('fr-FR', { month: 'short' });
                } else {
                    key = d.getDate().toString();
                    if (timeFilter === 'custom') {
                        key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                    }
                }
                if (!groups[key]) groups[key] = { sales: 0, expenses: 0 };
                groups[key][type] += Number(item.amount);
            });
        };
        process(overviewSales, 'sales');
        process(overviewExpenses, 'expenses');
        return Object.keys(groups).map(k => ({ name: k, ...groups[k] }));
    }, [overviewSales, overviewExpenses, timeFilter]);

    const pieData = useMemo(() => {
        const groups: Record<string, number> = {};
        overviewSales.forEach(s => {
            const key = s.service_name || 'Autre';
            groups[key] = (groups[key] || 0) + Number(s.amount);
        });
        return Object.entries(groups).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [overviewSales]);

    return {
        // State
        sales, expenses, salesHistory, expensesHistory,
        loading, currentUserEmail, userProfile, isDeactivated, isExpired,

        // Filter values
        timeFilter, dateRange,
        saleSearchQuery, saleFilterService, saleFilterTime,
        expenseSearchQuery, expenseFilterTime,

        // Setters
        setTimeFilter, setDateRange,
        setSaleSearchQuery, setSaleFilterService, setSaleFilterTime,
        setExpenseSearchQuery, setExpenseFilterTime,

        // Computed
        filteredSalesHistory, filteredExpensesHistory, uniqueServices,
        overviewSales, overviewExpenses, totals, chartData, pieData, isAdmin: currentUserEmail === ADMIN_EMAIL,
        funding, // Expose funding data

        // Actions
        fetchData,
        handleAddSale, handleUpdateSale, handleDeleteSale,
        handleAddExpense, handleUpdateExpense, handleDeleteExpense,
        handleUpdateFunding, handleDeleteFunding,
    };
};
