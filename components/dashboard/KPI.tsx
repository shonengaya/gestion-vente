import React from 'react';

interface KPIProps {
    title: string;
    value: string | number;
    color?: string;
    icon?: any;
    subValue?: string;
    trend?: 'up' | 'down';
}

export const KPI: React.FC<KPIProps> = ({ title, value, color, icon: Icon, trend = 'up' }) => (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-full hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
            </div>
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {Icon && <Icon className="w-5 h-5" />}
            </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {trend === 'up' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" transform="rotate(180 128 128)"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
                )}
                <span>25%</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">vs semaine dernière</span>
        </div>
    </div>
);
