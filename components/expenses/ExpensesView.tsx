import React from 'react';
import { Card } from '../ui/Card';
import { PencilIcon } from '../ui/Icons';
import { formatAriary } from '../../constants';

interface ExpensesViewProps {
    filteredExpenses: any[];
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    timeFilter: string;
    setTimeFilter: (val: string) => void;
    onAdd: () => void;
    onEdit: (expense: any) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
    filteredExpenses, searchQuery, setSearchQuery,
    timeFilter, setTimeFilter, onAdd, onEdit
}) => {
    const totalAmount = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dépenses</h2>
                    <p className="text-sm text-gray-500">Suivi détaillé de vos sorties d'argent.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-medium shadow-md shadow-slate-500/20 transition-all"
                >
                    <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                    </div>
                    Nouvelle Dépense
                </button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher (Description)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        />
                    </div>

                    {/* Time Filter */}
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                        <option value="today">Aujourd'hui</option>
                        <option value="yesterday">Hier</option>
                        <option value="week">Cette semaine</option>
                        <option value="month">Ce mois</option>
                        <option value="year">Cette année</option>
                        <option value="all">Tout</option>
                    </select>
                </div>
            </Card>

            {/* Expenses Table */}
            <Card title={
                <div className="flex justify-between items-center">
                    <span>Historique des Dépenses</span>
                    <span className="text-red-600 font-bold text-lg">
                        Total: {formatAriary(totalAmount)}
                    </span>
                </div>
            }>
                <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-xs uppercase bg-gray-50 text-gray-500 sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Montant</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Aucune dépense trouvée.</td>
                                </tr>
                            ) : (
                                filteredExpenses.map((e: any) => (
                                    <tr key={e.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => onEdit(e)}>
                                        <td className="px-4 py-3">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-slate-900 font-medium group-hover:text-blue-600 transition-colors">{e.description}</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-bold">{formatAriary(e.amount)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="p-2 text-gray-400 group-hover:text-blue-600 rounded-lg transition-colors" title="Modifier">
                                                <PencilIcon />
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile Card View for All Expenses */}
                <div className="md:hidden space-y-3">
                    {filteredExpenses.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">Aucune dépense trouvée.</div>
                    ) : (
                        filteredExpenses.map((e: any) => (
                            <div key={e.id} onClick={() => onEdit(e)} className="p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="font-bold text-slate-900">{e.description}</div>
                                <div className="flex justify-between items-end mt-1">
                                    <span className="text-red-600 font-bold text-lg">{formatAriary(e.amount)}</span>
                                    <span className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};
