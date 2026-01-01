import React, { useEffect, useState } from 'react';
import api from '../../api/SublymusApi';
import { User, WalletBalance } from '../../api/Interfaces';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { User as UserIcon, Mail, Shield, Wallet, Key, Calendar, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.auth.me();
                setUser(data.user);
                setRoles(data.roles);
            } catch (err) {
                console.error(err);
                setError('Impossible de charger le profil.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Chargement du profil...</div>;
    if (error || !user) return <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">{error || 'Utilisateur non trouvé'}</div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-4xl font-bold border-4 border-white shadow-sm">
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{user.full_name || 'Utilisateur'}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="info">{roles.join(', ') || 'Utilisateur'}</Badge>
                        {user.email_verified_at && (
                            <Badge variant="success" className="flex items-center gap-1">
                                <CheckCircle size={12} /> Vérifié
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card title="Informations Personnelles">
                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Mail className="text-gray-400 mr-3" size={20} />
                                <div>
                                    <div className="text-xs text-gray-500">Email</div>
                                    <div className="font-medium text-gray-800">{user.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Shield className="text-gray-400 mr-3" size={20} />
                                <div>
                                    <div className="text-xs text-gray-500">ID Utilisateur</div>
                                    <div className="font-mono text-sm text-gray-600 break-all">{user.id}</div>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Calendar className="text-gray-400 mr-3" size={20} />
                                <div>
                                    <div className="text-xs text-gray-500">Membre depuis</div>
                                    <div className="font-medium text-gray-800">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {user.wallet && (
                        <Card title="Portefeuille Principal">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="text-emerald-600 text-sm font-medium mb-1">Solde Disponible</div>
                                    <div className="text-2xl font-bold text-emerald-800">{user.wallet.balance} {user.wallet.currency}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="text-gray-500 text-sm font-medium mb-1">En Attente</div>
                                    <div className="text-2xl font-bold text-gray-700">{user.wallet.pending_balance || 0} {user.wallet.currency}</div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card title="Sécurité">
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center">
                                    <Key className="text-gray-400 mr-3 group-hover:text-emerald-500 transition-colors" size={20} />
                                    <span className="text-sm font-medium text-gray-700">Changer le mot de passe</span>
                                </div>
                            </button>
                            {/* Add more security options here */}
                        </div>
                    </Card>

                    <Card title="Statistiques">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Connexions</span>
                                <span className="font-medium">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Dernière activité</span>
                                <span className="font-medium">Aujourd'hui</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
