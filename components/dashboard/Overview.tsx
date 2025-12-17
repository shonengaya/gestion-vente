import React from 'react';
import { Card } from '../ui/Card';
import { KPI } from './KPI';
import { WalletIcon, TrendUpIcon, TrendDownIcon, PackageIcon, PencilIcon } from '../ui/Icons';
import { formatAriary } from '../../constants';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-xl text-gray-700 text-sm">
                <p className="font-semibold mb-2 text-gray-900">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color || entry.fill }} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
                        <span>{entry.name}:</span>
                        <span className="font-bold">
                            {typeof entry.value === 'number' ? formatAriary(entry.value) : entry.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface OverviewProps {
    totals: { sales: number; expenses: number; net: number; treasury: number };
    chartData: any[];
    pieData: any[];
    salesHistory: any[];
    expensesHistory: any[];
    handleEditSale: (sale: any) => void;
    handleEditExpense: (expense: any) => void;
    timeFilter: string;
    dateRange: { start: string, end: string };
    onAddFunding: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
    totals, chartData, pieData, salesHistory, expensesHistory,
    handleEditSale, handleEditExpense, timeFilter, dateRange, onAddFunding
}) => {
    // ... (getPeriodTitle logic remains same)
    const getPeriodTitle = () => {
        if (timeFilter === 'day') return "Aujourd'hui";
        if (timeFilter === 'week') return "Cette Semaine";
        if (timeFilter === 'month') return "Ce Mois";
        if (timeFilter === 'year') return "Cette Année";
        if (timeFilter === 'custom') return "Période Personnalisée";
        return "Vue d'ensemble";
    };

    const getPeriodSubtitle = () => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        if (timeFilter === 'day') return today.toLocaleDateString('fr-FR', options);
        // ... (keep logic simple)
        if (timeFilter === 'custom' && dateRange.start) {
            return `Du ${new Date(dateRange.start).toLocaleDateString('fr-FR')} au ${dateRange.end ? new Date(dateRange.end).toLocaleDateString('fr-FR') : '...'}`;
        }
        return today.toLocaleDateString('fr-FR', options);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Period Title & Funding Action */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{getPeriodTitle()}</h2>
                    <p className="text-gray-500 text-sm mt-1 capitalize">{getPeriodSubtitle()}</p>
                </div>
                <button
                    onClick={onAddFunding}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                    Approvisionner
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <KPI
                    title="Total Ventes"
                    value={formatAriary(totals.sales).replace('Ar', '')}
                    color="text-emerald-600"
                    icon={TrendUpIcon}
                    trend="up"
                />
                <KPI
                    title="Trésorerie Dispo." // Replaced Transactions
                    value={formatAriary(totals.treasury).replace('Ar', '')}
                    color="text-indigo-600"
                    icon={WalletIcon}
                    trend="up"
                />
                <KPI
                    title="Total Dépenses"
                    value={formatAriary(totals.expenses).replace('Ar', '')}
                    color="text-red-600"
                    icon={TrendDownIcon}
                    trend="down"
                />
                <KPI
                    title="Bénéfice Net"
                    value={formatAriary(totals.net).replace('Ar', '')}
                    color="text-slate-800"
                    icon={PackageIcon}
                    trend="up"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">Évolution Financière</h3>
                        <Select
                            label=""
                            options={['Semaine', 'Mois', 'Année']} /* Just visuals for now */
                            className="!mb-0 w-32 !py-2 !text-xs"
                            value="Mois"
                            onChange={() => { }}
                        />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="sales" name="Ventes" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="expenses" name="Dépenses" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-6">Répartition par Service</h3>
                    <div className="flex-1 min-h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text Overly */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-slate-800">{pieData.length}</span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Services</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {pieData.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-xs text-gray-500 font-medium">{entry.name}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-700">{Math.round((entry.value / totals.sales) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Dernières Ventes">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Client</th>
                                    <th className="px-4 py-3">Montant</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {salesHistory.slice(0, 5).map((s: any) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEditSale(s)}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{s.customer_name}</td>
                                        <td className="px-4 py-3 text-emerald-600 font-medium">{formatAriary(s.amount)}</td>
                                        <td className="px-4 py-3 text-right">{new Date(s.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {salesHistory.slice(0, 5).map((s: any) => (
                            <div key={s.id} onClick={() => handleEditSale(s)} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100 flex flex-col gap-2">
                                <div className="font-bold text-slate-900">{s.customer_name}</div>
                                <div className="flex justify-between items-end">
                                    <span className="text-emerald-600 font-bold">{formatAriary(s.amount)}</span>
                                    <span className="text-xs text-gray-500">{new Date(s.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Dernières Dépenses">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Motif</th>
                                    <th className="px-4 py-3">Montant</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expensesHistory.slice(0, 5).map((e: any) => (
                                    <tr key={e.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEditExpense(e)}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{e.description}</td>
                                        <td className="px-4 py-3 text-red-600 font-medium">{formatAriary(e.amount)}</td>
                                        <td className="px-4 py-3 text-right">{new Date(e.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {expensesHistory.slice(0, 5).map((e: any) => (
                            <div key={e.id} onClick={() => handleEditExpense(e)} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100 flex flex-col gap-2">
                                <div className="font-bold text-slate-900">{e.description}</div>
                                <div className="flex justify-between items-end">
                                    <span className="text-red-600 font-bold">{formatAriary(e.amount)}</span>
                                    <span className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// Helper component for Select to avoid import issues or circular deps if simple
const Select = ({ className, ...props }: any) => (
    <select className={`bg-gray-50 border border-gray-100 rounded-lg text-gray-600 focus:ring-blue-500 focus:border-blue-500 block ${className}`} {...props}>
        {props.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
);
