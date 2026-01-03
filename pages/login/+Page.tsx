import React, { useState, useEffect } from 'react';
import api from '../../api/SublymusApi';
import { navigate } from 'vike/client/router';
import { usePageContext } from 'vike-react/usePageContext';
import { LogIn } from 'lucide-react';

export default function Page() {
    const pageContext = usePageContext();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isProcessingToken, setIsProcessingToken] = useState(false);

    useEffect(() => {
        const token = pageContext.urlParsed.search.token;
        if (token) {
            setIsProcessingToken(true);
            api.setToken(token);

            // On redirige vers l'accueil après un court délai pour laisser le temps au token d'être stocké
            setTimeout(() => {
                navigate('/');
            }, 500);
        }
    }, [pageContext.urlParsed.search.token]);

    const handleGoogleLogin = () => {
        setError('');
        setLoading(true);

        try {
            const redirectSuccess = window.location.origin + window.location.pathname;
            const redirectError = window.location.origin + window.location.pathname;

            const url = api.auth.socialAuthBackendSource({
                provider: 'google',
                redirectSuccess,
                redirectError
            });

            window.location.href = url;
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la redirection vers Google.');
            setLoading(false);
        }
    };

    if (isProcessingToken) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h1 style={styles.title}>Connexion en cours...</h1>
                    <p style={styles.subtitle}>Veuillez patienter pendant que nous validons votre session.</p>
                    <div style={styles.loader}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Sublymus Admin</h1>
                <p style={styles.subtitle}>Connectez-vous pour gérer la plateforme</p>

                {error && <div style={styles.error}>{error}</div>}

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <LogIn size={20} />
                    {loading ? 'Redirection...' : 'Continuer avec Google'}
                </button>

                <p style={styles.footer}>
                    Utilisez votre compte Google d'administrateur
                </p>
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
    },
    footer: {
        marginTop: '20px',
        fontSize: '12px',
        color: '#999',
    },
    loader: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #000',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        animation: 'spin 2s linear infinite',
        margin: '20px auto',
    }
};

