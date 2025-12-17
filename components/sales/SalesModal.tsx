import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { ProductSelector } from '../products/ProductSelector';
import { PAYMENT_METHODS } from '../../constants';
import { TrashIcon } from '../ui/Icons';

interface SalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    onDelete: (id: string, e: any) => Promise<void>;
    editingSaleId: string | null;
    initialData: any;
}

export const SalesModal: React.FC<SalesModalProps> = ({
    isOpen, onClose, onSubmit, onDelete, editingSaleId, initialData
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
            title={editingSaleId ? "Modifier la Vente" : "Nouvelle Vente"}
        >
            {!editingSaleId && (
                <div className="mb-6">
                    <ProductSelector
                        onSelect={(p) => setFormData({
                            ...formData,
                            service_name: p.name,
                            amount: String(p.price)
                        })}
                    />
                </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nom du Client" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} required placeholder="Ex: Jean Rakoto" />
                <Input label="Service / Produit" value={formData.service_name} onChange={(e) => setFormData({ ...formData, service_name: e.target.value })} required placeholder="Ex: Réparation PC" />
                <Input label="Montant (Ar)" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required placeholder="Ex: 50000" />
                <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                <Select label="Moyen de Paiement" options={PAYMENT_METHODS} value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} />

                <div className="md:col-span-2 mt-6 flex gap-3 border-t border-gray-100 pt-5">
                    {editingSaleId && (
                        <button
                            type="button"
                            onClick={(e) => onDelete(editingSaleId, e)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-transparent hover:border-red-100 mr-auto"
                        >
                            <TrashIcon />
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-gray-100 font-medium rounded-lg transition-all ml-auto">
                        Annuler
                    </button>
                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all disabled:opacity-70 shadow-lg shadow-slate-900/20">
                        {loading ? '...' : (editingSaleId ? 'Mettre à jour' : 'Enregistrer')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
