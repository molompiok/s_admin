import React, { useEffect, useState } from 'react';
import api from '../../api/SublymusApi';

export default function Page() {
    const [affiliations, setAffiliations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAffiliations = async () => {
            try {
                const data = await api.admin.getAffiliations();
                setAffiliations(data);
            } catch (err: any) {
                setError(err.message || 'Erreur lors du chargement des affiliations.');
            } finally {
                setLoading(false);
            }
        };
        fetchAffiliations();
    }, []);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h1 style={styles.title}>Affiliations</h1>
            <p style={styles.subtitle}>Liste de tous les codes d'affiliation créés sur la plateforme</p>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Code</th>
                            <th style={styles.th}>Utilisateur</th>
                            <th style={styles.th}>Canal</th>
                            <th style={styles.th}>Statut</th>
                            <th style={styles.th}>Date de création</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(affiliations || []).map(aff => (
                            <tr key={aff.id} style={styles.tr}>
                                <td style={styles.td}><strong style={styles.code}>{aff.code}</strong></td>
                                <td style={styles.td}>
                                    {aff.owner ? (
                                        <a href={`/users/${aff.owner.id}`} style={styles.link}>
                                            {aff.owner.full_name || aff.owner.email}
                                        </a>
                                    ) : 'Inconnu'}
                                </td>
                                <td style={styles.td}>{aff.channel || 'N/A'}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: aff.is_active ? '#f6ffed' : '#fff1f0',
                                        color: aff.is_active ? '#52c41a' : '#f5222d',
                                        borderColor: aff.is_active ? '#b7eb8f' : '#ffa39e',
                                    }}>
                                        {aff.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td style={styles.td}>{new Date(aff.createdAt).toLocaleDateString()}</td>
                                <td style={styles.td}>
                                    <button style={styles.actionBtn}>Désactiver</button>
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
    code: {
        color: '#1890ff',
        fontSize: '16px',
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
    },
    actionBtn: {
        padding: '4px 8px',
        fontSize: '12px',
        color: '#ff4d4f',
        border: '1px solid #ff4d4f',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};
