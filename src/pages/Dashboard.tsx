import { Server, Activity, DollarSign, AlertCircle } from 'lucide-react';
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
    const LIFECYCLE_DAYS = 30;
    const LIFECYCLE_MS = LIFECYCLE_DAYS * 24 * 60 * 60 * 1000;

    const OVERRIDES: Record<string, string> = {
        'k26A3XrW4gx7UXA3D8DhxcYQiwZjqc1gddb7f6LzgQP': '2025-12-12T00:00:00Z',
        'GkWMf255xX2chqNgnV8B2djGa2eSsFBBC8ASdgtohFUb': '2025-12-21T00:00:00Z',
        'EmZvBGFYh8XCS9nXu7F372abwMSEeX8e5LWuJxfMigby': '2025-12-23T00:00:00Z'
    };

    const walletAddress = publicKey?.toString() || '';
    const overrideDate = OVERRIDES[walletAddress];

    // Process deployments to calculate status and earnings for each
    const processedDeployments = deployments.map(d => {
        const createdTime = new Date(d.created_at).getTime();
        let startDate = createdTime;

        if (overrideDate) {
            const overrideTime = new Date(overrideDate).getTime();
            if (createdTime < overrideTime) {
                startDate = overrideTime;
            }
        }

        const effectiveStart = startDate + DELAY_MS;
        const completionDate = effectiveStart + LIFECYCLE_MS;
        const now = Date.now();

        let earnings = 0;
        let status = 'Active';

        if (now > completionDate) {
            earnings = LIFECYCLE_DAYS * RATE_PER_DAY * d.node_count;
            status = 'Completed';
        } else if (now > effectiveStart) {
            const daysActive = (now - effectiveStart) / (24 * 60 * 60 * 1000);
            earnings = daysActive * RATE_PER_DAY * d.node_count;
        } else {
            status = 'Provisioning';
        }

        return {
            ...d,
            earnings,
            status,
            effectiveStart
        };
    });

    // Calculate totals
    const totalNodes = processedDeployments.reduce((acc, curr) => acc + curr.node_count, 0);
    const totalEarnings = processedDeployments.reduce((acc, curr) => acc + curr.earnings, 0);

    // Check if any nodes are completed to show message
    const hasCompletedNodes = processedDeployments.some(d => d.status === 'Completed');

    // Sort by date (newest first for list, or oldest? Original code sorted oldest first for loop but didn't resort for display. Let's keep display order based on original hook return which likely was default order, but let's confirm.
    // The original code: const sortedDeployments = [...deployments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    // But the loop was only for totals. The table mapped `deployments`.
    // Let's sort processedDeployments by newest first for the table as is common.
    processedDeployments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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

            {hasCompletedNodes && (
                <div style={{
                    marginBottom: '2rem',
                    padding: '1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    color: '#93c5fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <AlertCircle size={20} />
                    <span>Your earnings will be deposited to your deployment wallet within 24 hours of deployment completion.</span>
                </div>
            )}

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
                            {processedDeployments.map((deployment) => (
                                <tr key={deployment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>#{deployment.id}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(deployment.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>{deployment.node_count} x H100</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.875rem',
                                            background: deployment.status === 'Completed' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                                            color: deployment.status === 'Completed' ? '#9ca3af' : '#10b981',
                                            border: deployment.status === 'Completed' ? '1px solid rgba(75, 85, 99, 0.3)' : 'none'
                                        }}>
                                            {deployment.status}
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
