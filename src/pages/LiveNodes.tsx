import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Server, Activity, DollarSign } from 'lucide-react';

interface Deployment {
    id: number;
    created_at: string;
    node_count: number;
    amount_sol: number;
    transaction_signature: string;
    wallet_address: string;
}

export function LiveNodes() {
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllDeployments = async () => {
            try {
                const { data, error } = await supabase
                    .from('deployments')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching deployments:', error);
                } else {
                    setDeployments(data || []);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDeployments();
    }, []);

    // Earnings Logic Constants
    const RATE_PER_DAY = 120;
    const DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours

    const OVERRIDES: Record<string, string> = {
        'k26A3XrW4gx7UXA3D8DhxcYQiwZjqc1gddb7f6LzgQP': '2025-12-12T00:00:00Z',
        'GkWMf255xX2chqNgnV8B2djGa2eSsFBBC8ASdgtohFUb': '2025-12-21T00:00:00Z',
        'EmZvBGFYh8XCS9nXu7F372abwMSEeX8e5LWuJxfMigby': '2025-12-23T00:00:00Z'
    };

    // Process data for display
    const processedNodes = deployments.map(d => {
        const walletAddress = d.wallet_address;

        // Determine start date logic (mirroring Dashboard.tsx)
        const overrideDate = OVERRIDES[walletAddress];

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
        const effectiveStart = startDate + DELAY_MS;

        const now = Date.now();
        let earnings = 0;

        if (now > effectiveStart) {
            const daysActive = (now - effectiveStart) / (24 * 60 * 60 * 1000);
            earnings = daysActive * RATE_PER_DAY * d.node_count;
        }

        return {
            ...d,
            earnings,
            startDate
        };
    });

    // Calculate aggregate stats
    const totalNodes = processedNodes.reduce((acc, curr) => acc + curr.node_count, 0);
    const totalNetworkEarnings = processedNodes.reduce((acc, curr) => acc + curr.earnings, 0);
    const totalUptime = '99.9%'; // Static for now

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: '8rem', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading network data...</div>
            </main>
        );
    }

    return (
        <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ marginBottom: '4rem' }}>
                <h1 className="glow-text" style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Live Nodes
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>
                    Real-time network status and performance
                </p>
            </div>

            {/* Network Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                            <Server size={20} color="#10b981" />
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>Total Active Nodes</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{totalNodes}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                            <DollarSign size={20} color="#a78bfa" />
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>Network Earnings Paid</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>${totalNetworkEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                            <Activity size={20} color="#3b82f6" />
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>Network Uptime</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{totalUptime}</div>
                </div>
            </div>

            {/* Nodes Table */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Active Deployments</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Deployment ID</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Live Date</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Nodes</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Earnings (Est)</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedNodes.map((node) => (
                                <tr key={node.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{node.id}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(node.startDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>{node.node_count} x H100</td>
                                    <td style={{ padding: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                                        ${node.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
