import React, { useState } from 'react';
import api from '../../api/SublymusApi';
import { navigate } from 'vike/client/router';

export default function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.auth.login({ email, password });
            api.setToken(response.token);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Sublymus Admin</h1>
                <p style={styles.subtitle}>Connectez-vous pour gérer la plateforme</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f7f6',
        padding: '20px',
    },
    card: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: '24px',
        color: '#333',
        fontWeight: '700',
    },
    subtitle: {
        margin: '0 0 30px 0',
        fontSize: '14px',
        color: '#666',
    },
    form: {
        textAlign: 'left',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#444',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        marginTop: '10px',
        transition: 'background-color 0.2s',
    },
    error: {
        backgroundColor: '#fff1f0',
        border: '1px solid #ffa39e',
        color: '#cf1322',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px',
    }
};
