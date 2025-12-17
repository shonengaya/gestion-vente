import React from 'react';
import { Card } from '../ui/Card';
import { WalletIcon, TrendUpIcon, TrendDownIcon, PackageIcon, SignOutIcon } from '../ui/Icons';
import { Profile } from '../../types';
import { supabase } from '../../services/supabase';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    userProfile: Profile | null;
    currentUserEmail: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userProfile, currentUserEmail }) => {
    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1c1e2d] text-gray-300 z-40 hidden md:flex flex-col font-sans transition-all duration-300">
            {/* Brand Area */}
            <div className="h-20 flex items-center px-8">
                <div className="flex items-center gap-3 text-white">
                    <div className="grid grid-cols-2 gap-1 w-6 h-6">
                        <div className="bg-blue-500 rounded-full w-full h-full"></div>
                        <div className="bg-gray-400 rounded-full w-full h-full"></div>
                        <div className="bg-gray-600 rounded-full w-full h-full"></div>
                        <div className="bg-gray-800 rounded-full w-full h-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight leading-none">Prolow5</h1>
                        <span className="text-[10px] text-gray-500 font-medium mt-1 leading-none">Gestion de ventes et de budget</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto mt-4">
                <div>
                    <div className="px-4 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Main
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <WalletIcon className="w-5 h-5" />
                            <span>Vue d'ensemble</span>
                        </button>
                    </div>
                </div>

                <div>
                    <div className="px-4 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Gestion
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'sales' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <TrendUpIcon className="w-5 h-5" />
                            <span>Ventes</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <TrendDownIcon className="w-5 h-5" />
                            <span>Dépenses</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('products')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <PackageIcon className="w-5 h-5" />
                            <span>Produits</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('budget')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'budget' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Zm-32,32a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"></path></svg>
                            <span>Budgets</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('funding')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-medium ${activeTab === 'funding' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm-88,0a32,32,0,0,1,64,0,32,32,0,0,1-64,0Zm88,136H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40V200Z"></path></svg>
                            <span>Trésorerie</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* User Profile Footer */}
            <div className="p-6">
                <Card className="!bg-white/5 !border-0 text-white p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner">
                        {(userProfile?.username || currentUserEmail || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-none mb-1">{userProfile?.username || 'Utilisateur'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{currentUserEmail}</p>
                    </div>
                    <button onClick={handleSignOut} className="text-gray-400 hover:text-white"><SignOutIcon className="w-5 h-5" /></button>
                </Card>
            </div>
        </aside>
    );
};
