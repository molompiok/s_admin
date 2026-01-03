import React, { useEffect, useState } from 'react';
import api from '../../../api/SublymusApi';
import { Store } from '../../../api/Interfaces';

export default function Page() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchStores = async (searchTerm = '') => {
        setLoading(true);
        try {
            const response = await api.stores.list({
                request_all: true,
                search: searchTerm
            });
            setStores(response.list);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des boutiques.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStores(search);
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h1 style={styles.title}>Boutiques</h1>
            <p style={styles.subtitle}>Liste de toutes les boutiques créées sur la plateforme</p>

            <form onSubmit={handleSearch} style={styles.searchForm}>
                <input
                    type="text"
                    placeholder="Rechercher par nom, titre ou ID (#id)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
                <button type="submit" style={styles.searchButton}>Rechercher</button>
            </form>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nom</th>
                            <th style={styles.th}>Slug</th>
                            <th style={styles.th}>Statut</th>
                            <th style={styles.th}>Actif</th>
                            <th style={styles.th}>En cours</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(stores || []).map(store => (
                            <tr key={store.id} style={styles.tr}>
                                <td style={styles.td}>{store.name}</td>
                                <td style={styles.td}>{store.slug}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: store.status === 'active' ? '#e6f7ff' : '#fff1f0',
                                        color: store.status === 'active' ? '#1890ff' : '#f5222d',
                                        borderColor: store.status === 'active' ? '#91d5ff' : '#ffa39e',
                                    }}>
                                        {store.status}
                                    </span>
                                </td>
                                <td style={styles.td}>{store.is_active ? '✅' : '❌'}</td>
                                <td style={styles.td}>{store.is_running ? '✅' : '❌'}</td>
                                <td style={styles.td}>
                                    <a href={`/stores/${store.id}`} style={styles.link}>Détails</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    title: {
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '10px',
    },
    subtitle: {
        color: '#666',
        marginBottom: '30px',
    },
    searchForm: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        maxWidth: '500px',
    },
    searchInput: {
        flex: 1,
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
    },
    searchButton: {
        padding: '10px 20px',
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    th: {
        padding: '16px',
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #f0f0f0',
        fontWeight: '600',
        color: '#333',
    },
    td: {
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
    },
    tr: {
        transition: 'background-color 0.2s',
    },
    badge: {
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        border: '1px solid',
    },
    link: {
        color: '#1890ff',
        textDecoration: 'none',
        fontWeight: '500',
    }
};
