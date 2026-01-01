import React, { useEffect, useState } from 'react';
import api from '../../api/SublymusApi';
import { WalletBalance } from '../../api/Interfaces';

export default function Page() {
  const [platformWallet, setPlatformWallet] = useState<WalletBalance | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [walletData, statusData] = await Promise.all([
          api.wallets.getPlatform(),
          api.admin.getGlobalStatus()
        ]);
        setPlatformWallet(walletData);
        setStats(statusData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div>Chargement du tableau de bord...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1 style={styles.title}>Tableau de Bord Admin</h1>
      <p style={styles.subtitle}>Aperçu global de la plateforme Sublymus</p>

      <div style={styles.grid}>
        <div style={{ ...styles.card, ...styles.walletCard }}>
          <h2 style={styles.cardTitle}>Portefeuille Principal Sublymus</h2>
          {platformWallet ? (
            <div style={styles.walletContent}>
              <div style={styles.balanceLabel}>Solde Total</div>
              <div style={styles.mainBalance}>
                {platformWallet.balance.toLocaleString()} {platformWallet.currency}
              </div>
              <div style={styles.walletDetails}>
                <div>Disponible: {platformWallet.available_balance.toLocaleString()}</div>
                <div>En attente: {platformWallet.pending_balance.toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <p>Impossible de charger le portefeuille plateforme.</p>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Statistiques Boutiques</h2>
          {stats?.stores ? (
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.stores.total}</div>
                <div style={styles.statLabel}>Total</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.stores.active}</div>
                <div style={styles.statLabel}>Actives</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.stores.running}</div>
                <div style={styles.statLabel}>En cours</div>
              </div>
            </div>
          ) : (
            <p>Statistiques non disponibles.</p>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Statistiques Thèmes</h2>
          {stats?.themes ? (
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.themes.total}</div>
                <div style={styles.statLabel}>Total</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.themes.active}</div>
                <div style={styles.statLabel}>Actifs</div>
              </div>
            </div>
          ) : (
            <p>Statistiques non disponibles.</p>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>État du Système</h2>
          <div style={styles.infoRow}>
            <span>Docker Swarm:</span>
            <span style={{ color: stats?.docker_swarm_status === 'connected' ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
              {stats?.docker_swarm_status === 'connected' ? 'Connecté' : 'Erreur'}
            </span>
          </div>
          <div style={styles.infoRow}>
            <span>Nœuds Swarm:</span>
            <span>{stats?.swarm_node_count || 0}</span>
          </div>
        </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  walletCard: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
    color: '#fff',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
    opacity: 0.9,
  },
  walletContent: {
    textAlign: 'center',
    padding: '10px 0',
  },
  balanceLabel: {
    fontSize: '14px',
    opacity: 0.7,
    marginBottom: '5px',
  },
  mainBalance: {
    fontSize: '36px',
    fontWeight: '800',
    marginBottom: '15px',
  },
  walletDetails: {
    display: 'flex',
    justifyContent: 'space-around',
    fontSize: '13px',
    opacity: 0.8,
  },
  statsGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    textAlign: 'center',
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1890ff',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
  }
};
