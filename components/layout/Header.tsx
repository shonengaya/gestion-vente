import React, { useState, useEffect } from 'react';
import { CalendarIcon, ChevronDownIcon, SignOutIcon } from '../ui/Icons';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale/fr';
import { Profile } from '../../types';
import { supabase } from '../../services/supabase';

interface HeaderProps {
    timeFilter: 'day' | 'week' | 'month' | 'year' | 'custom';
    setTimeFilter: (val: any) => void;
    dateRange: { start: string, end: string };
    setDateRange: (val: any) => void;
    userProfile: Profile | null;
    currentUserEmail: string | null;
}

export const Header: React.FC<HeaderProps> = ({ timeFilter, setTimeFilter, dateRange, setDateRange, userProfile, currentUserEmail }) => {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const getRemainingTime = () => {
        if (!userProfile?.subscription_expires_at) return null;
        const expiry = new Date(userProfile.subscription_expires_at);
        const now = new Date();
        const diffTime = Math.abs(expiry.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(diffDays / 30);

        if (diffMonths > 0) return `${diffMonths} mois et ${diffDays % 30} jours`;
        return `${diffDays} jours`;
    };

    const getSubscriptionStatusColor = () => {
        if (!userProfile?.subscription_expires_at) return 'text-gray-500';
        const expiry = new Date(userProfile.subscription_expires_at);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) return 'text-orange-500';
        if (diffDays < 0) return 'text-red-500';
        return 'text-emerald-600';
    };

    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Check if event already fired
        if ((window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            (window as any).deferredPrompt = e;
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("Pour installer l'application :\n1. Sur Android (Chrome) : Cliquez sur le menu (3 points) > 'Installer l'application'\n2. Sur iOS (Safari) : Cliquez sur Partager > 'Sur l'écran d'accueil'\n3. Sur PC (Chrome) : Cliquez sur l'icône dans la barre d'adresse");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <header className="h-20 bg-white border-b border-gray-200/60 sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Logo */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="grid grid-cols-2 gap-1 w-5 h-5 flex-shrink-0">
                        <div className="bg-blue-500 rounded-full w-full h-full"></div>
                        <div className="bg-gray-400 rounded-full w-full h-full"></div>
                        <div className="bg-gray-600 rounded-full w-full h-full"></div>
                        <div className="bg-gray-800 rounded-full w-full h-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-base text-slate-800 tracking-tight leading-none">Prolow5</span>
                        <span className="text-[9px] text-gray-400 font-medium leading-none mt-0.5">Gestion de ventes et de budget</span>
                    </div>
                </div>

                {/* Search Simulation */}
                <div className="relative max-w-md w-full hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                    </div>
                    <input type="text" placeholder="Rechercher une transaction..." className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border-0 rounded-xl text-sm font-medium text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
            </div>

            {/* Invisible Backdrop for DatePicker */}
            {isDatePickerOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsDatePickerOpen(false)}
                />
            )}

            <div className="flex items-center gap-6">
                {/* Date Picker Trigger & Filter */}
                <div className="relative z-50">
                    <button
                        onClick={() => { setIsDatePickerOpen(!isDatePickerOpen); setIsProfileOpen(false); }}
                        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                        <CalendarIcon className="w-4 h-4" />
                        <span className="capitalize hidden sm:inline">
                            {(() => {
                                const today = new Date();
                                if (timeFilter === 'day') return today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                                if (timeFilter === 'week') {
                                    const start = new Date(today);
                                    const day = start.getDay() || 7;
                                    start.setDate(today.getDate() - day + 1);
                                    const end = new Date(start);
                                    end.setDate(start.getDate() + 6);
                                    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
                                }
                                if (timeFilter === 'month') return today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                                if (timeFilter === 'year') return today.getFullYear().toString();
                                if (timeFilter === 'custom' && dateRange.start) {
                                    return `${new Date(dateRange.start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${dateRange.end ? new Date(dateRange.end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '...'}`;
                                }
                                return today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                            })()}
                        </span>
                        <ChevronDownIcon className="w-3 h-3 text-gray-400 hidden sm:block" />
                    </button>

                    {isDatePickerOpen && (
                        <div className="absolute top-full right-0 mt-2 w-auto min-w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-fade-in origin-top-right z-50">
                            <div className="flex flex-col gap-2 mb-4">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Période</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['day', 'week', 'month', 'year'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => { setTimeFilter(t); setIsDatePickerOpen(false); }}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeFilter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {t === 'day' ? 'Jour' : t === 'week' ? 'Semaine' : t === 'month' ? 'Mois' : t === 'year' ? 'Année' : ''}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setTimeFilter('custom')}
                                        className={`col-span-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeFilter === 'custom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        Personnalisé
                                    </button>
                                </div>
                            </div>

                            {timeFilter === 'custom' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sélectionner les dates</label>
                                    <div className="border border-gray-100 rounded-xl overflow-hidden p-2 flex justify-center bg-gray-50">
                                        <DatePicker
                                            selectsRange={true}
                                            startDate={dateRange.start ? new Date(dateRange.start) : undefined}
                                            endDate={dateRange.end ? new Date(dateRange.end) : undefined}
                                            onChange={(update: any) => {
                                                const [start, end] = update;
                                                setDateRange({
                                                    start: start ? start.toLocaleDateString('en-CA') : '',
                                                    end: end ? end.toLocaleDateString('en-CA') : ''
                                                });
                                            }}
                                            inline
                                            locale={fr as any}
                                            calendarClassName="!font-sans !border-0 !shadow-none !bg-transparent"
                                        />
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={() => setIsDatePickerOpen(false)}
                                            disabled={!dateRange.start || !dateRange.end}
                                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Valider
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Invisible Backdrop for Profile */}
                {isProfileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsProfileOpen(false)}
                    />
                )}

                {/* User Profile Trigger */}
                <div className="relative z-50">
                    <div
                        onClick={() => { setIsProfileOpen(!isProfileOpen); setIsDatePickerOpen(false); }}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors border border-gray-200"
                        title="Profil"
                    >
                        <span className="font-bold text-xs">{(userProfile?.username || currentUserEmail || 'U').charAt(0).toUpperCase()}</span>
                    </div>

                    {isProfileOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-fade-in origin-top-right">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                                    {(userProfile?.username || currentUserEmail || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate">{userProfile?.username || 'Utilisateur'}</h4>
                                    <p className="text-xs text-gray-500 truncate">{currentUserEmail}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                {userProfile?.subscription_expires_at && (
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Abonnement</p>
                                        <div className="flex justify-between items-center">
                                            <span className={`font-bold ${getSubscriptionStatusColor()}`}>
                                                {new Date(userProfile.subscription_expires_at) < new Date() ? 'Expiré' : 'Actif'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                Reste: {getRemainingTime()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">Exp: {new Date(userProfile.subscription_expires_at).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>


                            <button
                                onClick={handleInstallClick}
                                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-bold py-2.5 rounded-xl hover:bg-blue-100 transition-colors mb-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Installer l'app
                            </button>


                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <SignOutIcon className="w-4 h-4" />
                                Se déconnecter
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
