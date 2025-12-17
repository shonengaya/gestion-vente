import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getBudgetSummary, getCategories, addCategory, getBudgets, addBudget, upsertBudget, createRecurringBudgets, updateBudget, deleteBudget, deleteCategory } from '../services/api';
import { Category, Budget, BudgetSummary, PeriodType } from '../types';

export const useBudget = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [budgetSummary, setBudgetSummary] = useState<BudgetSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // Period state - Default to 'day' as requested
    const [periodType, setPeriodType] = useState<PeriodType>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchCategories = async () => {
        const cats = await getCategories();
        setCategories(cats);
    };

    const fetchBudgets = async () => {
        const buds = await getBudgets();
        setBudgets(buds);
    };

    const fetchSummary = useCallback(async () => {
        // Helper to format date as YYYY-MM-DD in local timezone
        const toLocalYMD = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const d = new Date(selectedDate);
        let start = '', end = '';

        if (periodType === 'day') {
            start = toLocalYMD(d);
            end = start;
        } else if (periodType === 'week') {
            // Adjust to start of week (Monday) ?
            // Current logic seems to assume d might be middle of week
            const day = d.getDay() || 7; // 1 (Mon) to 7 (Sun)
            const diff = d.getDate() - day + 1;
            const startD = new Date(d);
            startD.setDate(diff);
            start = toLocalYMD(startD);

            const endD = new Date(startD);
            endD.setDate(startD.getDate() + 6);
            end = toLocalYMD(endD);
        } else if (periodType === 'month') {
            start = toLocalYMD(new Date(d.getFullYear(), d.getMonth(), 1));
            end = toLocalYMD(new Date(d.getFullYear(), d.getMonth() + 1, 0));
        } else if (periodType === 'quarter') {
            const quarter = Math.floor(d.getMonth() / 3);
            start = toLocalYMD(new Date(d.getFullYear(), quarter * 3, 1));
            end = toLocalYMD(new Date(d.getFullYear(), (quarter + 1) * 3, 0));
        } else if (periodType === 'semester') {
            const semester = d.getMonth() < 6 ? 0 : 6;
            start = toLocalYMD(new Date(d.getFullYear(), semester, 1));
            end = toLocalYMD(new Date(d.getFullYear(), semester + 6, 0));
        } else if (periodType === 'year') {
            start = toLocalYMD(new Date(d.getFullYear(), 0, 1));
            end = toLocalYMD(new Date(d.getFullYear(), 11, 31));
        } else {
            // Default to month
            start = toLocalYMD(new Date(d.getFullYear(), d.getMonth(), 1));
            end = toLocalYMD(new Date(d.getFullYear(), d.getMonth() + 1, 0));
        }

        try {
            const data = await getBudgetSummary(periodType, start, end);
            setBudgetSummary(data);
        } catch (e) {
            console.error("Failed to fetch budget summary", e);
        }
    }, [periodType, selectedDate]);

    const refreshData = async () => {
        setLoading(true);
        await Promise.all([fetchCategories(), fetchBudgets(), fetchSummary()]);
        setLoading(false);
    };

    useEffect(() => {
        refreshData();

        // Realtime Subscription
        const channel = supabase
            .channel('budget-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchSummary())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, () => { fetchBudgets(); fetchSummary(); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return {
        categories, budgets, budgetSummary, loading,
        periodType, setPeriodType,
        selectedDate, setSelectedDate,
        refreshData,
        addCategory, deleteCategory, // Export API wrappers if needed directly or wrap them
        addBudget, upsertBudget, createRecurringBudgets, updateBudget, deleteBudget
    };
};
