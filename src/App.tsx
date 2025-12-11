import { useState } from 'react';
import { DeploymentCard } from './components/DeploymentCard';
import { EarningsCard } from './components/EarningsCard';
import { Cpu, Network, Server } from 'lucide-react';
import { WalletContextProvider } from './contexts/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function App() {
    const [nodeCount, setNodeCount] = useState(1);
    const PRICE_PER_NODE = 2500;

    return (
        <WalletContextProvider>
            <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #1a1b3a 0%, var(--bg-dark) 50%)' }}>
                <header style={{ borderBottom: '1px solid var(--border)', background: 'rgba(5, 5, 17, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Cpu size={20} color="white" />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>TokenOS <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 'normal', marginLeft: '0.5rem' }}>DeAI Alpha</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }}></div>
                                <span style={{ color: 'var(--text-muted)' }}>Network Live</span>
                            </div>
                            <WalletMultiButton />
                        </div>
                    </div>
                </header>

                <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem', minHeight: 'calc(100vh - 80px)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                        <h1 className="glow-text" style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                            Deploy High-Performance Compute
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '660px', margin: '0 auto', lineHeight: '1.7' }}>
                            Join the TokenOS DeAI AlphaTest. Deploy an NVIDIA H100 node instantly and start earning yield via our A²E arbitrage engine.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                        <DeploymentCard
                            nodeCount={nodeCount}
                            setNodeCount={setNodeCount}
                            pricePerNode={PRICE_PER_NODE}
                        />
                        <EarningsCard
                            nodeCount={nodeCount}
                            pricePerNode={PRICE_PER_NODE}
                        />
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>What you are deploying</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Server size={24} color="#a78bfa" />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>DeAI Node</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        Your H100 will be added to the TokenOS Compute Aggregation Layer (CAL). It joins a virtual cluster to process high-end AI inference tasks securely.
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Network size={24} color="#a78bfa" />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>A²E Integration</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        The Arbitrage & Orchestration Engine manages your node. If internal demand is low, A²E automatically "wholesales" your compute to external spot markets (like AWS) to ensure you generate yield.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </WalletContextProvider>
    );
}

export default App;
