import { Server, Activity, DollarSign } from 'lucide-react';
import { useUserStatus } from '../hooks/useUserStatus';
import { useDeployments } from '../hooks/useDeployments';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';

export function Dashboard() {
    const { isSignedUp, loading: statusLoading } = useUserStatus();
    const { deployments, loading: deploymentsLoading } = useDeployments();
    const { connected, publicKey } = useWallet();

    if (statusLoading || deploymentsLoading) {
        return (
            <main className="container" style={{ paddingTop: '8rem', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
            </main>
        );
    }

    if (!connected || !isSignedUp) {
        return <Navigate to="/" replace />;
    }

    // Earnings Logic
    const RATE_PER_DAY = 120;
    const DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours

    const OVERRIDES: Record<string, string> = {
        'k26A3XrW4gx7UXA3D8DhxcYQiwZjqc1gddb7f6LzgQP': '2025-12-12T00:00:00Z',
        'GkWMf255xX2chqNgnV8B2djGa2eSsFBBC8ASdgtohFUb': '2025-12-21T00:00:00Z',
        'EmZvBGFYh8XCS9nXu7F372abwMSEeX8e5LWuJxfMigby': '2025-12-23T00:00:00Z'
    };

    const walletAddress = publicKey?.toString() || '';
    const overrideDate = OVERRIDES[walletAddress];

    let totalNodes = 0;
    let totalEarnings = 0;

    // Sort deployments by date ascending (oldest first)
    const sortedDeployments = [...deployments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    sortedDeployments.forEach((d) => {
        totalNodes += d.node_count;

        const createdTime = new Date(d.created_at).getTime();
        let startDate = createdTime;

        if (overrideDate) {
            const overrideTime = new Date(overrideDate).getTime();
            // If bought before launch (override date), clamp start to launch date
            if (createdTime < overrideTime) {
                startDate = overrideTime;
            }
        }

        // Apply 24h delay UNIVERSALLY to all deployments
        // Earnings start 24 hours after deployment (or launch floor)
        const effectiveStart = startDate + DELAY_MS;

        const now = Date.now();

        if (now > effectiveStart) {
            const daysActive = (now - effectiveStart) / (24 * 60 * 60 * 1000);
            totalEarnings += daysActive * RATE_PER_DAY * d.node_count;
        }
    });

    const dailyYield = totalNodes * RATE_PER_DAY;

    const stats = {
        totalNodes: totalNodes,
        totalEarnings: totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        dailyYield: dailyYield.toLocaleString(),
        uptime: '99.9%'
    };

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
                        <span style={{ color: 'var(--text-muted)' }}>Total Earnings (USD)</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>${stats.totalEarnings}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        + ${stats.dailyYield} / day
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
                                    <td style={{ padding: '1rem' }}>{new Date(deployment.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>{deployment.node_count} x H100</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.875rem',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            color: '#10b981'
                                        }}>
                                            Active
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                        {deployment.transaction_signature.slice(0, 8)}...{deployment.transaction_signature.slice(-8)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
