import React, { useEffect, useState } from 'react';
import api from '../../../api/SublymusApi';
import { Store, WalletBalance, Transaction } from '../../../api/Interfaces';
import { usePageContext } from 'vike-react/usePageContext';

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
    if (transactions.length === 0) return <p>Aucune transaction trouvée.</p>;

    return (
        <div style={styles.tableContainer}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Catégorie</th>
                        <th style={styles.th}>Libellé</th>
                        <th style={styles.th}>Montant</th>
                        <th style={styles.th}>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx.id} style={styles.tr}>
                            <td style={styles.td}>{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td style={styles.td}><span style={styles.badge}>{tx.category}</span></td>
                            <td style={styles.td}>{tx.label}</td>
                            <td style={{ ...styles.td, ...styles.amount, color: tx.amount < 0 ? '#ff4d4f' : '#52c41a' }}>
                                {tx.amount.toLocaleString()}
                            </td>
                            <td style={styles.td}>{tx.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Page() {
    const pageContext = usePageContext();
    const { id } = pageContext.routeParams;

    const [store, setStore] = useState<Store | null>(null);
    const [wallet, setWallet] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const storeData = await api.stores.get(id);
                setStore(storeData);

                if (storeData.wave_store_wallet_id) {
                    const [walletData, txData] = await Promise.all([
                        api.wallets.get(storeData.wave_store_wallet_id),
                        api.admin.getWalletTransactions(storeData.wave_store_wallet_id, { limit: 10 })
                    ]);
                    setWallet(walletData);
                    setTransactions(txData.transactions || []);
                }
            } catch (err: any) {
                setError(err.message || 'Erreur lors du chargement des détails de la boutique.');
            } finally {
                setLoading(false);
            }
        };
        fetchStoreData();
    }, [id]);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!store) return <div>Boutique non trouvée.</div>;

    return (
        <div>
            <div style={styles.header}>
                <a href="/stores" style={styles.backLink}>← Retour aux boutiques</a>
                <h1 style={styles.title}>{store.name}</h1>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Informations Générales</h2>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>ID:</span>
                        <span>{store.id}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Slug:</span>
                        <span>{store.slug}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Statut:</span>
                        <span>{store.status}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Domaines:</span>
                        <span>{store.domain_names.join(', ')}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Créé le:</span>
                        <span>{new Date(store.createdAt).toLocaleString()}</span>
                    </div>
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Propriétaire</h2>
                    {store.user ? (
                        <>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Nom:</span>
                                <span>{store.user.full_name || 'N/A'}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Email:</span>
                                <span>{store.user.email}</span>
                            </div>
                            <a href={`/users/${store.user.id}`} style={styles.link}>Voir le profil complet</a>
                        </>
                    ) : (
                        <p>Informations propriétaire non disponibles.</p>
                    )}
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Portefeuille (Wallet)</h2>
                    {wallet ? (
                        <>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>ID:</span>
                                <span>{wallet.id}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Solde:</span>
                                <span style={styles.balance}>{wallet.balance.toLocaleString()} {wallet.currency}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Disponible:</span>
                                <span>{wallet.available_balance.toLocaleString()} {wallet.currency}</span>
                            </div>
                        </>
                    ) : (
                        <p>Aucun portefeuille associé.</p>
                    )}
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Configuration Technique</h2>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>API:</span>
                        <span>{store.currentApi?.name || 'Par défaut'}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Thème:</span>
                        <span>{store.currentTheme?.name || 'Par défaut'}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Actif:</span>
                        <span>{store.is_active ? 'Oui' : 'Non'}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>En cours:</span>
                        <span>{store.is_running ? 'Oui' : 'Non'}</span>
                    </div>
                </div>
            </div>

            <div style={{ ...styles.card, marginTop: '20px' }}>
                <h2 style={styles.cardTitle}>Dernières Transactions</h2>
                <TransactionTable transactions={transactions} />
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    header: {
        marginBottom: '30px',
    },
    backLink: {
        color: '#666',
        textDecoration: 'none',
        fontSize: '14px',
        display: 'block',
        marginBottom: '10px',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        margin: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '20px',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '10px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '12px',
        fontSize: '15px',
    },
    label: {
        color: '#666',
        fontWeight: '500',
    },
    balance: {
        fontWeight: '700',
        color: '#52c41a',
        fontSize: '18px',
    },
    link: {
        color: '#1890ff',
        textDecoration: 'none',
        fontSize: '14px',
        marginTop: '10px',
        display: 'inline-block',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        borderBottom: '2px solid #f0f0f0',
        color: '#666',
        fontWeight: '600',
    },
    tr: {
        borderBottom: '1px solid #f0f0f0',
    },
    td: {
        padding: '12px',
        fontSize: '14px',
    },
    badge: {
        backgroundColor: '#f5f5f5',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
    },
    amount: {
        fontWeight: '600',
        textAlign: 'right',
    }
};
