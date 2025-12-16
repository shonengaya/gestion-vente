import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/productService';
import { Product } from '../../types';
import { Select } from '../ui/Input';

interface ProductSelectorProps {
    onSelect: (product: Product) => void;
    className?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ onSelect, className }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts().then(setProducts).finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const product = products.find(p => p.id === selectedId);
        if (product) {
            onSelect(product);
        }
    };

    if (loading) return <div className="text-xs text-gray-400">Chargement produits...</div>;
    if (products.length === 0) return null;

    return (
        <div className={`mb-4 ${className}`}>
            <label className="text-sm font-semibold text-gray-700 ml-1 block mb-1">Sélection rapide (Optionnel)</label>
            <select
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                onChange={handleChange}
                defaultValue=""
            >
                <option value="" disabled>Choisir un produit / service...</option>
                {products.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.name} - {p.price} Ar {p.type === 'ART' && p.stock > 0 ? `(Stock: ${p.stock})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};
