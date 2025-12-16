import React, { useEffect, useState } from 'react';
import { getAllProfiles, extendSubscription, toggleUserStatus } from '../services/api';
import { Profile } from '../types';
import { Card } from './ui/Card';

export const AdminDashboard: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProfiles = async () => {
        try {
            const data = await getAllProfiles();
            setProfiles(data);
        } catch (error) {
            console.error(error);
            alert("Erreur lors du chargement des utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleExtend = async (userId: string, months: number) => {
        if (!confirm(`Ajouter ${months} mois d'abonnement à cet utilisateur ?`)) return;

        setProcessingId(userId);
        try {
            await extendSubscription(userId, months);
            await fetchProfiles(); // Refresh list
            alert("Abonnement prolongé avec succès !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la prolongation");
        } finally {
            setProcessingId(null);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean, email: string) => {
        const action = currentStatus ? "Désactiver" : "Activer";
        if (!confirm(`Voulez-vous vraiment ${action} l'utilisateur ${email} ?`)) return;

        // Optimistic Update: Change status immediately in UI
        const oldProfiles = [...profiles];
        setProfiles(profiles.map(p =>
            p.id === userId ? { ...p, is_active: !currentStatus } : p
        ));

        setProcessingId(userId);
        try {
            await toggleUserStatus(userId, !currentStatus);
            // Success! No need to revert. We can fetch to be sure, or just keep going.
            // await fetchProfiles(); // Optional: uncomment if you want to sync fully
        } catch (error) {
            console.error(error);
            alert("Erreur lors du changement de statut");
            // Revert on error
            setProfiles(oldProfiles);
        } finally {
            setProcessingId(null);
        }
    };

    const isExpired = (dateStr: string) => {
        return new Date(dateStr) < new Date();
    };

    const filteredProfiles = profiles.filter(profile =>
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Chargement de l'interface admin...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Administration Prolow5</h1>
                    <p className="text-gray-500">Gérez les accès et abonnements utilisateurs</p>
                </div>

                <Card title={`Utilisateurs Inscrits (${filteredProfiles.length})`}>
                    <div className="mb-4 px-4">
                        <input
                            type="text"
                            placeholder="Rechercher par email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Statut</th>
                                    <th className="px-4 py-3">Expiration</th>
                                    <th className="px-4 py-3 text-right">Actions (Ajouter Mois)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProfiles.map(profile => {
                                    const expired = isExpired(profile.subscription_expires_at);
                                    return (
                                        <tr key={profile.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{profile.email}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleToggleStatus(profile.id, profile.is_active ?? true, profile.email)}
                                                    disabled={!!processingId}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${(profile.is_active ?? true)
                                                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200'
                                                        : 'bg-red-100 text-red-700 border-red-200 hover:bg-green-100 hover:text-green-700 hover:border-green-200'
                                                        }`}
                                                >
                                                    {(profile.is_active ?? true) ? 'Actif (Désactiver ?)' : 'Désactivé (Activer ?)'}
                                                </button>
                                                {expired && (profile.is_active ?? true) && (
                                                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Expiré</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(profile.subscription_expires_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2 items-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="Mois"
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        id={`input-${profile.id}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const input = document.getElementById(`input-${profile.id}`) as HTMLInputElement;
                                                            const months = parseInt(input.value);
                                                            if (months > 0) handleExtend(profile.id, months);
                                                            else alert("Veuillez entrer un nombre valide de mois");
                                                        }}
                                                        disabled={!!processingId}
                                                        className="px-3 py-1 bg-brand-600 text-white rounded hover:bg-brand-500 text-xs font-bold transition-colors shadow-sm"
                                                    >
                                                        Ajouter
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};
