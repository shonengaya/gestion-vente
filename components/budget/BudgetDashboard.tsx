import React, { useState } from 'react';
import { useBudget } from '../../hooks/useBudget';
import { Card } from '../ui/Card';
import { PeriodType } from '../../types';
import { BudgetCard } from './BudgetCard';
import { CategoryManager } from './CategoryManager';
import { BudgetModal } from './BudgetModal';
import { BudgetTutorial } from './BudgetTutorial';
import { ChevronDownIcon } from '../ui/Icons';
import { formatAriary } from '../../constants';

// Helper for date display
const formatDateRange = (d: Date, type: PeriodType) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    if (type === 'day') return d.toLocaleDateString('fr-FR', options);
    if (type === 'month') return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (type === 'year') return d.getFullYear().toString();
    // Simplified for others
    return d.toLocaleDateString('fr-FR');
};

interface BudgetDashboardProps {
    refreshTrigger?: any;
    availableFunds?: number;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({ refreshTrigger, availableFunds }) => {
    const {
        categories, budgetSummary, loading,
        periodType, setPeriodType,
        selectedDate, setSelectedDate,
        refreshData, addCategory, upsertBudget, createRecurringBudgets, deleteBudget
    } = useBudget();

    // Refresh when trigger changes (e.g. new expense added)
    React.useEffect(() => {
        if (refreshTrigger !== undefined) {
            refreshData();
        }
    }, [refreshTrigger]);

    const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingBudgetData, setEditingBudgetData] = useState<any>(null);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    const periods: { value: PeriodType, label: string }[] = [
        { value: 'day', label: 'Journalier' },
        { value: 'week', label: 'Hebdo' },
        { value: 'month', label: 'Mensuel' },
        { value: 'quarter', label: 'Trimestriel' },
        { value: 'semester', label: 'Semestriel' },
        { value: 'year', label: 'Annuel' },
    ];

    const handleEditBudget = (summary: any) => {
        setEditingBudgetData(summary);
        setIsBudgetModalOpen(true);
    };

    const handleBudgetSubmit = async (data: any) => {
        if (data.isRecurring) {
            await createRecurringBudgets(
                data.category_id,
                data.amount,
                data.start_date,
                data.end_date,
                data.weekdays
            );
        } else {
            // Normal upset
            const { isRecurring, ...cleanData } = data; // remove extra flag if present
            await upsertBudget(cleanData);
        }
        refreshData();
        setEditingBudgetData(null);
    };

    const handleDeleteBudget = async (budgetId: string | undefined) => {
        if (!budgetId) {
            alert("Aucun budget à supprimer pour cette catégorie.");
            return;
        }

        if (!confirm("Êtes-vous sûr de vouloir supprimer ce budget ?")) {
            return;
        }

        try {
            await deleteBudget(budgetId);
            refreshData();
        } catch (error) {
            console.error("Error deleting budget:", error);
            alert("Erreur lors de la suppression du budget");
        }
    };

    // Navigation handlers
    const shiftDate = (amount: number) => {
        const d = new Date(selectedDate);
        if (periodType === 'day') d.setDate(d.getDate() + amount);
        else if (periodType === 'week') d.setDate(d.getDate() + (amount * 7));
        else if (periodType === 'month') d.setMonth(d.getMonth() + amount);
        else if (periodType === 'year') d.setFullYear(d.getFullYear() + amount);
        // ... handled others simply
        setSelectedDate(d);
    };

    // Calculate normalized start date for current period
    const getNormalizedStartDate = () => {
        const d = new Date(selectedDate);

        // Helper to format date as YYYY-MM-DD in local timezone
        const formatLocalDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (periodType === 'day') {
            return formatLocalDate(d);
        } else if (periodType === 'week') {
            const day = d.getDay() || 7;
            const diff = d.getDate() - day + 1;
            const startD = new Date(d);
            startD.setDate(diff);
            return formatLocalDate(startD);
        } else if (periodType === 'month') {
            return formatLocalDate(new Date(d.getFullYear(), d.getMonth(), 1));
        } else if (periodType === 'quarter') {
            const quarter = Math.floor(d.getMonth() / 3);
            return formatLocalDate(new Date(d.getFullYear(), quarter * 3, 1));
        } else if (periodType === 'semester') {
            const semester = d.getMonth() < 6 ? 0 : 6;
            return formatLocalDate(new Date(d.getFullYear(), semester, 1));
        } else if (periodType === 'year') {
            return formatLocalDate(new Date(d.getFullYear(), 0, 1));
        }
        return formatLocalDate(d);
    };

    // Totals
    const totalPlanned = budgetSummary.reduce((sum, item) => sum + Number(item.planned_amount), 0);
    const totalSpent = budgetSummary.reduce((sum, item) => sum + Number(item.spent_amount), 0);
    const globalPercent = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header & Controls Toolbar */}
            <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Budgets</h2>
                        <p className="text-slate-500 mt-1 text-sm md:text-base">Gérez vos limites de dépenses.</p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0">
                        <button
                            onClick={() => setIsTutorialOpen(true)}
                            className="text-slate-500 hover:text-slate-700 px-3 py-2 text-xs md:text-sm font-medium transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path></svg>
                            <span className="hidden md:inline">Aide</span>
                        </button>
                        <button
                            onClick={() => setIsCatManagerOpen(true)}
                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all shadow-sm whitespace-nowrap"
                        >
                            Catégories
                        </button>
                        <button
                            onClick={() => { setEditingBudgetData(null); setIsBudgetModalOpen(true); }}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                            <span className="hidden md:inline">Nouveau Budget</span>
                            <span className="md:hidden">Nouveau</span>
                        </button>
                    </div>
                </div>

                {/* Unified Toolbar */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Period Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                        {periods.map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriodType(p.value)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${periodType === p.value
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-4 px-2">
                        <button onClick={() => shiftDate(-1)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                            <ChevronDownIcon className="rotate-90 w-5 h-5" />
                        </button>
                        <span className="text-slate-900 font-semibold text-lg min-w-[200px] text-center">
                            {formatDateRange(selectedDate, periodType)}
                        </span>
                        <button onClick={() => shiftDate(1)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                            <ChevronDownIcon className="-rotate-90 w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Section - Minimalist */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <Card className="p-4 md:p-6 border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="text-indigo-600" viewBox="0 0 256 256"><path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm-88,0a32,32,0,0,1,64,0,32,32,0,0,1-64,0Zm88,136H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40V200Z"></path></svg>
                    </div>
                    <div className="text-slate-500 text-xs md:text-sm font-medium mb-1">Trésorerie Disponible</div>
                    <div className="text-xl md:text-3xl font-bold text-indigo-600 tracking-tight">{availableFunds !== undefined ? formatAriary(availableFunds) : '-- Ar'}</div>
                    <div className="mt-2 text-[10px] md:text-xs text-indigo-400 font-medium">Fonds réels disponibles</div>
                </Card>

                <Card className="p-4 md:p-6 border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-xs md:text-sm font-medium mb-1">Budget Alloué</div>
                    <div className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">{formatAriary(totalPlanned)}</div>
                    <div className="mt-2 text-[10px] md:text-xs text-slate-400">Total pour cette période</div>
                </Card>

                <Card className="p-4 md:p-6 border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-xs md:text-sm font-medium mb-1">Dépenses Réelles</div>
                    <div className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">{formatAriary(totalSpent)}</div>
                    <div className="mt-2 text-[10px] md:text-xs flex items-center gap-1">
                        <span className={totalSpent > totalPlanned ? "text-red-600 font-medium" : "text-emerald-600 font-medium"}>
                            {((totalSpent / (totalPlanned || 1)) * 100).toFixed(1)}%
                        </span>
                        <span className="text-slate-400">du budget utilisé</span>
                    </div>
                </Card>

                <Card className="p-4 md:p-6 border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-xs md:text-sm font-medium mb-1">Reste à dépenser</div>
                    <div className={`text-xl md:text-3xl font-bold tracking-tight ${totalPlanned - totalSpent < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatAriary(totalPlanned - totalSpent)}
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${globalPercent > 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(globalPercent, 100)}%` }}
                        />
                    </div>
                </Card>
            </div>

            {/* Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {budgetSummary.map((summary) => (
                    <BudgetCard
                        key={summary.budget_id || summary.category_id}
                        summary={summary}
                        onEdit={() => handleEditBudget(summary)}
                        onDelete={() => handleDeleteBudget(summary.budget_id)}
                    />
                ))}

                {/* Empty State / Add Button */}
                <button
                    onClick={() => { setEditingBudgetData(null); setIsBudgetModalOpen(true); }}
                    className="border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-slate-400 hover:bg-slate-50 transition-all group min-h-[200px]"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-slate-400 group-hover:text-slate-600" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                    </div>
                    <span className="font-medium text-slate-500 group-hover:text-slate-800">Ajouter un budget</span>
                </button>
            </div>

            {/* Modals */}
            <CategoryManager
                isOpen={isCatManagerOpen}
                onClose={() => setIsCatManagerOpen(false)}
                categories={categories}
                onRefresh={refreshData}
            />

            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSubmit={handleBudgetSubmit}
                categories={categories}
                currentPeriodType={periodType}
                currentStartDate={getNormalizedStartDate()}
                initialData={editingBudgetData}
            />

            <BudgetTutorial
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
            />
        </div>
    );
};
