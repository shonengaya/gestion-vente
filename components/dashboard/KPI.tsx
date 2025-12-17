import React from 'react';

interface KPIProps {
    title: string;
    value: string | number;
    color?: string;
    icon?: any;
    subValue?: string;
    trend?: 'up' | 'down';
    isCurrency?: boolean;
    details?: any[];
}

import { formatCompactNumber, formatAriary } from '../../constants';



export const KPI: React.FC<KPIProps> = ({ title, value, color, icon: Icon, trend = 'up', isCurrency = false, details }) => {
    const [showDetail, setShowDetail] = React.useState(false);

    // Context-aware prefix and color
    // Context-aware prefix and color
    // User requested: "+" for positive flows (Ventes, Bénéfice) and "-", but Treasury?
    // User said: "si entre ou benefice rajouter ... si malus mettre -"
    // Let's explicitly check the value.
    const isNegative = typeof value === 'number' && value < 0;
    const isPositive = typeof value === 'number' && value > 0;

    // Explicitly target Expenses to be RED even if value is positive (it's a cost). 
    // BUT usually expenses are stored as positive numbers in DB. 
    // If title is "Total Dépenses" and value is 1000, it means we spent 1000. It should be RED with -.
    const isExpenseCard = title.toLowerCase().includes('dépenses') || title.toLowerCase().includes('depenses');
    const isTreasury = title.toLowerCase().includes('trésorerie'); // Keep treasury neutral or green? User didn't specify treasury color logic specifically other than "others you didn't put".

    // Logic: 
    // If Expense Card: Red, Prefix -
    // If Sales/Benefit: Green, Prefix +
    // If Treasury: Neutral (Slate), no prefix? User complained "les autres tu ne les as pas mis" when looking at Treasury (+392k sales was green).
    // Let's try to apply Green/+ to Treasury as well if it's positive.

    let forcedColor = 'text-slate-800';
    let forcedPrefix = '';

    if (isExpenseCard) {
        forcedColor = 'text-red-600';
        forcedPrefix = '-';
    } else if (isTreasury) {
        forcedColor = 'text-slate-800'; // Treasury usually neutral unless we want to show it's "healthy"
        // User screenshot showed Treasury as black "245k".
        // Maybe they want + there too? "les autres tu ne les as pas mis".
        // Let's leave Treasury neutral for now but fix the "MGA" missing issue.
    } else {
        // Sales, Benefit, etc.
        forcedColor = 'text-emerald-600';
        forcedPrefix = '+';
    }

    const displayValue = typeof value === 'number'
        ? (value > 10000
            ? `${formatCompactNumber(value)}`
            : (isCurrency ? formatAriary(value).replace(/\s?(Ar|MGA)/g, '') : value))
        : value;

    const exactValue = typeof value === 'number' ? formatAriary(value) : value;

    return (
        <>
            <div
                onClick={() => setShowDetail(true)}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-full hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group cursor-pointer active:scale-95"
            >
                <div className="flex justify-between items-start mb-2 md:mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="text-gray-400 text-[9px] md:text-[11px] font-bold uppercase tracking-wider mb-1 md:mb-2 truncate">{title}</p>
                        <h3 className={`text-lg md:text-3xl font-extrabold tracking-tight whitespace-normal break-words ${forcedColor}`} title={String(exactValue)}>
                            {typeof value === 'number' && forcedPrefix && <span className="mr-0.5">{forcedPrefix}</span>}
                            {displayValue}
                        </h3>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {Icon && <Icon className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                </div>

                <div className="mt-auto pt-2 md:pt-4 border-t border-gray-50 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 w-full">
                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {trend === 'up' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" transform="rotate(180 128 128)"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
                            )}
                            <span>25%</span>
                        </div>
                    </div>
                    <span className="text-[9px] md:text-[10px] text-gray-400 font-medium whitespace-nowrap">vs semaine dern.</span>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetail && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-10 md:pt-20 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={(e) => { e.stopPropagation(); setShowDetail(false); }}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                            <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                            </button>
                        </div>
                        <div className="py-8 text-center bg-gray-50 rounded-xl border border-gray-100 mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Montant Exact</span>
                            <span className={`text-3xl font-extrabold ${forcedColor}`}>{exactValue}</span>
                        </div>

                        {details && details.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Dernières Opérations</h4>
                                <div className="space-y-2">
                                    {details.slice(0, 3).map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="font-medium text-slate-700 truncate max-w-[140px]">{item.label || item.description || item.customer_name || 'Opération'}</span>
                                            <div className="text-right">
                                                <div className={`font-bold ${item.amount < 0 || (isExpenseCard && item.amount > 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {formatAriary(Math.abs(item.amount))}
                                                </div>
                                                <div className="text-[10px] text-gray-400">{item.date ? new Date(item.date).toLocaleDateString() : ''}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-center">
                            <button onClick={() => setShowDetail(false)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold w-full">Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
