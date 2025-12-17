import React from 'react';
import { WalletIcon, TrendUpIcon, TrendDownIcon, PackageIcon } from '../ui/Icons';

interface MobileNavProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-between items-center px-4 py-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
                onClick={() => setActiveTab('overview')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${activeTab === 'overview' ? 'text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}
            >
                <WalletIcon className={activeTab === 'overview' ? "w-6 h-6" : "w-5 h-5"} />
                <span className={`text-[9px] font-medium ${activeTab === 'overview' ? 'font-bold' : ''}`}>Accueil</span>
            </button>

            <button
                onClick={() => setActiveTab('sales')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${activeTab === 'sales' ? 'text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}
            >
                <TrendUpIcon className={activeTab === 'sales' ? "w-6 h-6" : "w-5 h-5"} />
                <span className={`text-[9px] font-medium ${activeTab === 'sales' ? 'font-bold' : ''}`}>Ventes</span>
            </button>

            <button
                onClick={() => setActiveTab('expenses')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${activeTab === 'expenses' ? 'text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}
            >
                <TrendDownIcon className={activeTab === 'expenses' ? "w-6 h-6" : "w-5 h-5"} />
                <span className={`text-[9px] font-medium ${activeTab === 'expenses' ? 'font-bold' : ''}`}>Dépenses</span>
            </button>

            <button
                onClick={() => setActiveTab('products')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${activeTab === 'products' ? 'text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}
            >
                <PackageIcon className={activeTab === 'products' ? "w-6 h-6" : "w-5 h-5"} />
                <span className={`text-[9px] font-medium ${activeTab === 'products' ? 'font-bold' : ''}`}>Produits</span>
            </button>

            {/* Combined Budget/Funds or separate if space permits. Sticking to separate for now but tight. */}
            <button
                onClick={() => setActiveTab('budget')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${activeTab === 'budget' ? 'text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className={activeTab === 'budget' ? "w-6 h-6" : "w-5 h-5"}><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Zm-32,32a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"></path></svg>
                <span className={`text-[9px] font-medium ${activeTab === 'budget' ? 'font-bold' : ''}`}>Budget</span>
            </button>

            <button
                onClick={() => setActiveTab('funding')}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${activeTab === 'funding' ? 'text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className={activeTab === 'funding' ? "w-6 h-6" : "w-5 h-5"}><path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm-88,0a32,32,0,0,1,64,0,32,32,0,0,1-64,0Zm88,136H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40V200Z"></path></svg>
                <span className={`text-[9px] font-medium ${activeTab === 'funding' ? 'font-bold' : ''}`}>Fonds</span>
            </button>
        </nav>
    );
};
