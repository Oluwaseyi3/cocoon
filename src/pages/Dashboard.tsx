import { Server, Activity, DollarSign } from 'lucide-react';
import { useUserStatus } from '../hooks/useUserStatus';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';

export function Dashboard() {
    const { isSignedUp, loading } = useUserStatus();
    const { connected } = useWallet();

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: '8rem', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
            </main>
        );
    }

    if (!connected || !isSignedUp) {
        return <Navigate to="/" replace />;
    }

    // Static data for now
    const stats = {
        totalNodes: 2,
        totalEarnings: 1.45,
        dailyYield: 0.12,
        uptime: '99.9%'
    };

    const deployments = [
        {
            id: '1',
            date: '2025-12-22T10:30:00Z',
            nodes: 1,
            status: 'Active',
            hash: '5x...3k9'
        },
        {
            id: '2',
            date: '2025-12-23T14:15:00Z',
            nodes: 1,
            status: 'Provisioning',
            hash: '9p...2m1'
        }
    ];

    return (
        <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ marginBottom: '4rem' }}>
                <h1 className="glow-text" style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>
                    Monitor your compute nodes and earnings
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                            <Server size={20} color="#10b981" />
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>Active Nodes</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.totalNodes}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                            <DollarSign size={20} color="#a78bfa" />
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>Total Earnings (SOL)</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.totalEarnings}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        + {stats.dailyYield} SOL / day
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                            <Activity size={20} color="#3b82f6" />
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>Network Uptime</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.uptime}</div>
                </div>
            </div>

            {/* Deployments List */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Recent Deployments</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Nodes</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Tx Hash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deployments.map((deployment) => (
                                <tr key={deployment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>#{deployment.id}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(deployment.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>{deployment.nodes} x H100</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.875rem',
                                            background: deployment.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                            color: deployment.status === 'Active' ? '#10b981' : '#eab308'
                                        }}>
                                            {deployment.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{deployment.hash}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
