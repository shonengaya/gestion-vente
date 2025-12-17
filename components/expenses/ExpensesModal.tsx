import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { TrashIcon } from '../ui/Icons';
import { Category } from '../../types';

interface ExpensesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    onDelete: (id: string, e: any) => Promise<void>;
    editingExpenseId: string | null;
    initialData: any;
    categories: Category[];
}

export const ExpensesModal: React.FC<ExpensesModalProps> = ({
    isOpen, onClose, onSubmit, onDelete, editingExpenseId, initialData, categories
}) => {
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingExpenseId ? "Modifier la Dépense" : "Nouvelle Dépense"}
        >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required placeholder="Ex: Achat fournitures" className="md:col-span-2" />

                <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Catégorie (Budget)</label>
                    <select
                        value={formData.category_id || ''}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                        <option value="">Aucune (Général)</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <Input label="Montant (Ar)" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required placeholder="Ex: 10000" />
                <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />

                <div className="md:col-span-2 mt-6 flex gap-3 border-t border-gray-100 pt-5">
                    {editingExpenseId && (
                        <button
                            type="button"
                            onClick={(e) => onDelete(editingExpenseId, e)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-transparent hover:border-red-100 mr-auto"
                        >
                            <TrashIcon />
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-gray-100 font-medium rounded-lg transition-all ml-auto">
                        Annuler
                    </button>
                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-70 shadow-lg shadow-red-600/20">
                        {loading ? '...' : (editingExpenseId ? 'Mettre à jour' : 'Enregistrer')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
