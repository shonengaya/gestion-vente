import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { addCategory, deleteCategory } from '../../services/api';
import { TrashIcon } from '../ui/Icons';
import { Category } from '../../types';

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onRefresh: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
    isOpen, onClose, categories, onRefresh
}) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setLoading(true);
        try {
            await addCategory({ name: newCategoryName, color: '#3b82f6' }); // Default blue
            setNewCategoryName('');
            onRefresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmMsg = "⚠️ ATTENTION: Supprimer cette catégorie supprimera également TOUS les budgets associés.\n\nVoulez-vous vraiment continuer ?";
        if (!confirm(confirmMsg)) return;

        try {
            await deleteCategory(id);
            onRefresh();
        } catch (error: any) {
            console.error('Erreur suppression catégorie:', error);

            // Afficher un message d'erreur user-friendly
            if (error.code === '23503') {
                alert("❌ Impossible de supprimer: Cette catégorie est encore utilisée.\n\nVeuillez d'abord exécuter le script SQL 'fix_cascade_delete.sql' dans Supabase.");
            } else {
                alert(`❌ Erreur: ${error.message || 'Impossible de supprimer la catégorie'}`);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gérer les Catégories">
            <div className="space-y-6">
                <form onSubmit={handleAdd} className="flex gap-2">
                    <Input
                        label="Nom de la catégorie"
                        placeholder="Nouvelle catégorie..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                    >
                        Ajouter
                    </button>
                </form>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {categories.length === 0 && <p className="text-gray-400 text-center text-sm">Aucune catégorie.</p>}
                    {categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="font-medium text-slate-700">{cat.name}</span>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};
