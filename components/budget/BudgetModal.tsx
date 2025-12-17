import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Category, PeriodType } from '../../types';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    categories: Category[];
    initialData?: any;
    currentPeriodType: PeriodType;
    currentStartDate: string; // Changed from Date to string
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
    isOpen, onClose, onSubmit, categories, initialData, currentPeriodType, currentStartDate
}) => {
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [loading, setLoading] = useState(false);

    // Recurring State
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurEndDate, setRecurEndDate] = useState('');
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default

    const weekdays = [
        { id: 1, label: 'L' },
        { id: 2, label: 'M' },
        { id: 3, label: 'M' },
        { id: 4, label: 'J' },
        { id: 5, label: 'V' },
        { id: 6, label: 'S' },
        { id: 0, label: 'D' },
    ];

    useEffect(() => {
        if (initialData) {
            setAmount(String(initialData.planned_amount || ''));
            setCategoryId(initialData.category_id || '');
            setIsRecurring(false); // Reset recurrence on edit
        } else {
            setAmount('');
            setCategoryId('');
            setIsRecurring(false);

            // Default recursion end date to end of current month
            const d = new Date();
            const endMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            setRecurEndDate(endMonth.toISOString().split('T')[0]);
        }
    }, [initialData, isOpen]);

    const toggleWeekday = (dayId: number) => {
        if (selectedWeekdays.includes(dayId)) {
            setSelectedWeekdays(selectedWeekdays.filter(d => d !== dayId));
        } else {
            setSelectedWeekdays([...selectedWeekdays, dayId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRecurring && currentPeriodType === 'day') {
                // Handle Recurring Budget Creation
                await onSubmit({
                    isRecurring: true,
                    category_id: categoryId,
                    amount: Number(amount),
                    start_date: currentStartDate,
                    end_date: recurEndDate,
                    weekdays: selectedWeekdays
                });
            } else {
                // Normal Single Budget (Create or Update)
                const payload: any = {
                    category_id: categoryId,
                    amount: Number(amount),
                    period_type: currentPeriodType,
                    start_date: initialData?.start_date || currentStartDate
                };

                // Only include ID if it is a valid string (not null/undefined/empty)
                if (initialData?.budget_id) {
                    payload.id = initialData.budget_id;
                }

                await onSubmit(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Définir le Budget">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">Catégorie</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        disabled={!!initialData?.category_id}
                        required
                    >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <Input
                    label="Montant Limite (Ar)"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="Ex: 5000"
                />

                {/* Recurring Options - Only available for Daily mode */}
                {currentPeriodType === 'day' ? (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-slate-700">Répartir automatiquement ?</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {isRecurring && (
                            <div className="space-y-3 animate-fade-in">
                                <div>
                                    <span className="text-xs text-slate-500 block mb-2">Jours à budgeter :</span>
                                    <div className="flex justify-between gap-1">
                                        {weekdays.map(d => (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => toggleWeekday(d.id)}
                                                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${selectedWeekdays.includes(d.id) ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="block mb-1 text-xs font-medium text-slate-700">jusqu'au :</label>
                                    <input
                                        type="date"
                                        value={recurEndDate}
                                        onChange={(e) => setRecurEndDate(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        min={currentStartDate}
                                        required={isRecurring}
                                    />
                                </div>
                                <p className="text-xs text-blue-600 italic mt-2">
                                    Cela créera automatiquement un budget de {amount ? Number(amount).toLocaleString() : 0} Ar pour chaque jour sélectionné.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500 italic">
                        💡 Pour planifier des budgets automatiquement sur plusieurs jours (récurrence), passez en vue "Journalier".
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Annuler</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all">
                        {loading ? '...' : (isRecurring ? 'Générer les Budgets' : 'Enregistrer')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
