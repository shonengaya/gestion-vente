import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';

export const InstallPWA = () => {
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWA] Already installed (standalone mode)');
            setShowButton(false);
            return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        console.log('[PWA] Checking installability...');
        console.log('[PWA] iOS device:', isIOSDevice);
        console.log('[PWA] Standalone mode:', window.matchMedia('(display-mode: standalone)').matches);

        // On iOS, always show manual instructions button
        if (isIOSDevice) {
            console.log('[PWA] iOS detected - showing manual install button');
            setShowButton(true);
            setDebugInfo('iOS - Manual only');
        }

        const handler = (e: any) => {
            e.preventDefault();
            console.log('[PWA] ✅ beforeinstallprompt fired! Auto-install available.');
            setPromptInstall(e);
            setShowButton(true);
            setDebugInfo('Auto-install ready');
        };

        // Listen for the install prompt
        window.addEventListener('beforeinstallprompt', handler);

        // Fallback for non-iOS: show button after 5s if no prompt (for manual installation via menu)
        const timer = setTimeout(() => {
            if (!isIOSDevice && !promptInstall) {
                console.log('[PWA] No beforeinstallprompt after 5s. Showing manual instructions button.');
                setShowButton(true);
                setDebugInfo('Manual fallback (no auto)');
            }
        }, 5000);

        const appInstalledHandler = () => {
            console.log('[PWA] App installed successfully!');
            setPromptInstall(null);
            setShowInstructions(false);
            setShowButton(false);
        };

        window.addEventListener('appinstalled', appInstalledHandler);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', appInstalledHandler);
        };
    }, []);

    const onClick = async (evt: React.MouseEvent) => {
        evt.preventDefault();
        console.log('[PWA] Install button clicked. promptInstall:', !!promptInstall);

        if (promptInstall) {
            console.log('[PWA] Triggering native install prompt...');
            promptInstall.prompt();
            const { outcome } = await promptInstall.userChoice;
            console.log('[PWA] User choice:', outcome);
            if (outcome === 'accepted') {
                setShowButton(false);
            }
        } else {
            console.log('[PWA] No native prompt available. Showing manual instructions.');
            setShowInstructions(true);
        }
    };

    // Don't render if in standalone mode
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
        return null;
    }

    if (!showButton) return null;

    return (
        <>
            {/* Install Button */}
            <button
                className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 animate-bounce hover:animate-none transition-all"
                onClick={onClick}
                title={debugInfo}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path>
                </svg>
                <span className="font-semibold text-sm hidden md:inline">Installer l'app</span>
                <span className="font-semibold text-sm md:hidden">Installer</span>
            </button>

            {/* Manual Instructions Modal */}
            {showInstructions && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowInstructions(false)}>
                    <Card className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowInstructions(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Installer l'application</h3>
                            <p className="text-gray-500 text-sm">Pour une meilleure expérience, ajoutez Prolow5 à votre écran d'accueil.</p>
                        </div>

                        {isIOS ? (
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-sm">1</span>
                                    <span>Appuyez sur le bouton <span className="font-bold">Partager</span> <svg className="inline w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-sm">2</span>
                                    <span>Sélectionnez <span className="font-bold">Sur l'écran d'accueil</span> <svg className="inline w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-sm">1</span>
                                    <span>Appuyez sur le menu (3 points)
                                        <svg className="inline w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 256 256"><path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144ZM128,48a32,32,0,1,0-32-32A32.05,32.05,0,0,0,128,48Zm0-16a16,16,0,1,1-16,16A16,16,0,0,1,128,32ZM128,192a32,32,0,1,0,32,32A32.05,32.05,0,0,0,128,192Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,240Z"></path></svg>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-sm">2</span>
                                    <span>Sélectionnez <span className="font-bold">Installer l'application</span> ou <span className="font-bold">Ajouter à l'écran d'accueil</span></span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowInstructions(false)}
                            className="mt-8 w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            Compris !
                        </button>
                    </Card>
                </div>
            )}
        </>
    );
};
