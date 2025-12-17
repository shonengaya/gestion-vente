import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { formatAriary } from '../../constants';

interface FundingViewProps {
    funding: any[];
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    timeFilter: string;
    // Actions
    onAdd: () => void;
    onEdit: (item: any) => void;
}

export const FundingView: React.FC<FundingViewProps> = ({
    funding, searchQuery, setSearchQuery, timeFilter, onAdd, onEdit
}) => {

    const filteredFunding = useMemo(() => {
        let data = funding;

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(f =>
                f.description?.toLowerCase().includes(q) ||
                f.payment_method?.toLowerCase().includes(q) ||
                f.amount.toString().includes(q)
            );
        }

        // Time filter is handled by parent or we can do it here if needed. 
        // Assuming "funding" prop contains ALL history for now, let's apply time filter locally if parent doesn't.
        // Actually Dashboard usually filters Main History. But funding is fetched separately.
        // For now let's just show all or simple filter.
        // Let's implement simple date filtering consistent with others.

        const now = new Date();
        if (timeFilter === 'day') {
            data = data.filter(f => new Date(f.date).toDateString() === now.toDateString());
        } else if (timeFilter === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
            startOfWeek.setHours(0, 0, 0, 0);
            data = data.filter(f => new Date(f.date) >= startOfWeek);
        } else if (timeFilter === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            data = data.filter(f => new Date(f.date) >= startOfMonth);
        }

        return data;
    }, [funding, searchQuery, timeFilter]);

    const totalFiltered = filteredFunding.reduce((sum, item) => sum + Number(item.amount), 0);

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Historique Trésorerie</h2>
                    <p className="text-gray-500 text-sm mt-1">Gérez vos apports et mouvements de fonds.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                    Nouvel Apport
                </button>
            </div>

            {/* Total Card */}
            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between">
                <span className="text-gray-500 font-medium">Total sur la période</span>
                <span className="text-2xl font-bold text-indigo-600">{formatAriary(totalFiltered)}</span>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                </div>
                <input
                    type="text"
                    placeholder="Rechercher (montant, description, méthode)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                />
            </div>

            {/* List */}
            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Méthode</th>
                                <th className="px-6 py-4 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFunding.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        Aucun historique trouvé pour cette période.
                                    </td>
                                </tr>
                            ) : (
                                filteredFunding.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => onEdit(item)}
                                        className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {new Date(item.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.description || <span className="text-gray-300 italic">Sans description</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium border border-gray-200">
                                                {item.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-indigo-600 group-hover:text-indigo-700">
                                            +{formatAriary(item.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
