import React, { useEffect, useState } from 'react';
import api from '../../../api/SublymusApi';
import { User } from '../../../api/Interfaces';

export default function Page() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.users.list();
                setUsers(response.users.list);
            } catch (err: any) {
                setError(err.message || 'Erreur lors du chargement des utilisateurs.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h1 style={styles.title}>Utilisateurs</h1>
            <p style={styles.subtitle}>Liste de tous les utilisateurs inscrits sur la plateforme</p>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nom</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Statut</th>
                            <th style={styles.th}>Vérifié</th>
                            <th style={styles.th}>Date d'inscription</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(users || []).map(user => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>{user.full_name || 'N/A'}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: user.status === 'VISIBLE' ? '#f6ffed' : '#fff1f0',
                                        color: user.status === 'VISIBLE' ? '#52c41a' : '#f5222d',
                                        borderColor: user.status === 'VISIBLE' ? '#b7eb8f' : '#ffa39e',
                                    }}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={styles.td}>{user.email_verified_at ? '✅' : '❌'}</td>
                                <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td style={styles.td}>
                                    <a href={`/users/${user.id}`} style={styles.link}>Détails</a>
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
