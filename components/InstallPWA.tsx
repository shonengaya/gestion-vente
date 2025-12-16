import React, { useEffect, useState } from 'react';

export const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setSupportsPWA(false);
        }

        window.addEventListener('beforeinstallprompt', handler);

        const appInstalledHandler = () => {
            setSupportsPWA(false);
            setPromptInstall(null);
            console.log("PWA Installed");
        };

        window.addEventListener('appinstalled', appInstalledHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', appInstalledHandler);
        };
    }, []);

    const onClick = async (evt: React.MouseEvent) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();

        // Wait for usage choice
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setSupportsPWA(false);
        }
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <button
            className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-50 bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-xl shadow-lg shadow-brand-500/30 flex items-center gap-2 animate-bounce hover:animate-none transition-all"
            onClick={onClick}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path>
            </svg>
            <span className="font-semibold text-sm">Installer l'app</span>
        </button>
    );
};
