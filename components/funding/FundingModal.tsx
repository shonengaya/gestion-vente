import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

interface FundingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any; // For editing
    fundingId?: string | null;  // For editing
    onUpdate?: (id: string, data: any) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

export const FundingModal: React.FC<FundingModalProps> = ({
    isOpen, onClose, onSuccess, initialData, fundingId, onUpdate, onDelete
}) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('Apport Personnel');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    // Load initial data
    React.useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount);
            setDescription(initialData.description);
            setPaymentMethod(initialData.payment_method);
            setDate(initialData.date);
        } else {
            // Reset
            setAmount('');
            setDescription('Apport Personnel');
            setPaymentMethod('Cash');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (fundingId && onUpdate) {
                // Edit Mode
                await onUpdate(fundingId, {
                    amount: Number(amount),
                    description,
                    payment_method: paymentMethod,
                    date
                });
            } else {
                // Create Mode
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Non connecté");

                const { error } = await supabase.from('funding_entries').insert([{
                    user_id: user.id,
                    amount: Number(amount),
                    description,
                    payment_method: paymentMethod,
                    date
                }]);
                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'opération.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!fundingId || !onDelete || !window.confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) return;

        setLoading(true);
        try {
            await onDelete(fundingId);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                        </span>
                        {fundingId ? 'Modifier l\'approvisionnement' : 'Approvisionner'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant à ajouter (Ar)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:font-normal"
                            placeholder="Ex: 50000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source / Méthode</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Cash', 'Mobile Money', 'Virement'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setPaymentMethod(m)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${paymentMethod === m
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optionnel)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Ex: Apport personnel, Fond de caisse..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        {fundingId && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
                            >
                                Supprimer
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Traitement...' : (fundingId ? 'Mettre à jour' : 'Confirmer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
