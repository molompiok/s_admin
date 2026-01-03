import React, { useEffect, useState } from 'react';
import api from '../../../api/SublymusApi';
import { User, Transaction } from '../../../api/Interfaces';
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

    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Utilisation des nouveaux paramètres de requête pour précharger les stores et affiliations
                const response = await api.auth.me(id, { stores: 'true', affiliate: 'true' });
                setUser(response.user);
                setRoles(response.roles);

                if (response.user.wave_main_wallet_id) {
                    const txData = await api.admin.getWalletTransactions(response.user.wave_main_wallet_id, { limit: 10 });
                    setTransactions(txData.transactions || []);
                }
            } catch (err: any) {
                setError(err.message || 'Erreur lors du chargement des détails de l\'utilisateur.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id]);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!user) return <div>Utilisateur non trouvé.</div>;

    return (
        <div>
            <div style={styles.header}>
                <a href="/users" style={styles.backLink}>← Retour aux utilisateurs</a>
                <h1 style={styles.title}>{user.full_name || 'Utilisateur sans nom'}</h1>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Profil</h2>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>ID:</span>
                        <span>{user.id}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Email:</span>
                        <span>{user.email}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Téléphone:</span>
                        <span>{user.phone || 'N/A'}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Statut:</span>
                        <span>{user.status}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Rôles:</span>
                        <span>{roles.join(', ')}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Vérifié:</span>
                        <span>{user.email_verified_at ? 'Oui' : 'Non'}</span>
                    </div>
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Portefeuille (Wallet)</h2>
                    {user.wallet ? (
                        <>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>ID:</span>
                                <span>{user.wave_main_wallet_id}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Solde:</span>
                                <span style={styles.balance}>{user.wallet.balance.toLocaleString()} {user.wallet.currency}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Disponible:</span>
                                <span>{user.wallet.available_balance.toLocaleString()} {user.wallet.currency}</span>
                            </div>
                        </>
                    ) : (
                        <p>Aucun portefeuille principal.</p>
                    )}
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Boutiques Possédées</h2>
                    {user.stores && user.stores.length > 0 ? (
                        <ul style={styles.list}>
                            {user.stores.map(store => (
                                <li key={store.id} style={styles.listItem}>
                                    <div style={{ flex: 1 }}>
                                        <div style={styles.bold}>{store.name}</div>
                                        <div style={styles.subText}>{store.slug}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', marginRight: '15px' }}>
                                        <div style={{ ...styles.balance, fontSize: '14px' }}>
                                            {store.wallet ? `${store.wallet.balance.toLocaleString()} ${store.wallet.currency}` : 'N/A'}
                                        </div>
                                        <div style={{ ...styles.subText, color: store.is_active ? '#52c41a' : '#ff4d4f' }}>
                                            {store.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                    <a href={`/stores/${store.id}`} style={styles.detailsButton}>Détails</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucune boutique possédée.</p>
                    )}
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Boutiques Collaborateur</h2>
                    {user.collab_stores && user.collab_stores.length > 0 ? (
                        <ul style={styles.list}>
                            {user.collab_stores.map(store => (
                                <li key={store.id} style={styles.listItem}>
                                    <a href={`/stores/${store.id}`} style={styles.link}>{store.name}</a>
                                    <span style={styles.subText}>({store.slug})</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucune collaboration.</p>
                    )}
                </div>

                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Codes Affiliation</h2>
                    {user.affiliateCodes && user.affiliateCodes.length > 0 ? (
                        <ul style={styles.list}>
                            {user.affiliateCodes.map(code => (
                                <li key={code.id} style={styles.listItem}>
                                    <span style={styles.bold}>{code.code}</span>
                                    <span style={styles.subText}>({code.is_active ? 'Actif' : 'Inactif'})</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucun code d'affiliation.</p>
                    )}
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        minWidth: 0,
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
        gap: '10px',
    },
    label: {
        color: '#666',
        fontWeight: '500',
        whiteSpace: 'nowrap',
    },
    balance: {
        fontWeight: '700',
        color: '#52c41a',
        fontSize: '18px',
    },
    link: {
        color: '#1890ff',
        textDecoration: 'none',
        fontWeight: '500',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    listItem: {
        padding: '10px 0',
        borderBottom: '1px solid #f9f9f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
    },
    subText: {
        fontSize: '12px',
        color: '#999',
        marginLeft: '5px',
    },
    bold: {
        fontWeight: '600',
    },
    detailsButton: {
        backgroundColor: '#1890ff',
        color: '#fff',
        padding: '5px 12px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: '500',
    },
    tableContainer: {
        overflowX: 'auto',
        width: '100%',
    },
    table: {
        width: '100%',
        minWidth: '600px',
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
