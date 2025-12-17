import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { Input, Select } from '../ui/Input';

interface ProductFormProps {
    initialData?: Partial<Product>;
    onSubmit: (data: Partial<Product>) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        type: 'ART',
        price: 0,
        stock: 0,
        ...initialData
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Nom du produit / service"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Coca Cola GM"
            />

            <Select
                label="Type"
                options={['Article (Stock géré)', 'Service (Prestation)']}
                value={formData.type === 'ART' ? 'Article (Stock géré)' : 'Service (Prestation)'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value === 'Article (Stock géré)' ? 'ART' : 'SRV' })}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Prix (Ar)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    min="0"
                />

                {formData.type === 'ART' && (
                    <Input
                        label="Stock Initial"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        min="0"
                    />
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isLoading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-lg shadow-slate-900/20 font-medium"
                    disabled={isLoading}
                >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
};
