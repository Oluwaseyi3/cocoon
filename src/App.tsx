import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Cpu, LayoutDashboard, Home, Activity } from 'lucide-react';
import { WalletContextProvider } from './contexts/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStatus } from './hooks/useUserStatus';

import { LiveNodes } from './pages/LiveNodes';

function Navbar() {
    const { connected } = useWallet();
    const { isSignedUp } = useUserStatus();
    const location = useLocation();

    return (
        <header style={{ borderBottom: '1px solid var(--border)', background: 'rgba(2, 4, 16, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div className="container header-content">
                <Link to="/" className="logo-container" style={{ textDecoration: 'none' }}>
                    <div className="logo-icon">
                        <Cpu size={20} color="white" />
                    </div>
                    <span className="logo-text">TokenOS <span className="logo-subtext">DeAI Alpha</span></span>
                </Link>
                <div className="header-actions">
                    <nav style={{ display: 'flex', gap: '1rem', marginRight: '1rem' }}>
                        <Link
                            to="/live-nodes"
                            style={{
                                color: location.pathname === '/live-nodes' ? 'white' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}
                        >
                            <Activity size={18} />
                            Live Nodes
                        </Link>
                        {connected && isSignedUp && (
                            <>
                                <Link
                                    to="/"
                                    style={{
                                        color: location.pathname === '/' ? 'white' : 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <Home size={18} />
                                    Home
                                </Link>
                                <Link
                                    to="/dashboard"
                                    style={{
                                        color: location.pathname === '/dashboard' ? 'white' : 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </Link>
                            </>
                        )}
                    </nav>
                    <div className="network-indicator">
                        <div className="network-dot"></div>
                        <span className="network-text">Network Live</span>
                    </div>
                    <WalletMultiButton />
                </div>
            </div>
        </header>
    );
}

function App() {
    return (
        <WalletContextProvider>
            <Router>
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/live-nodes" element={<LiveNodes />} />
                    </Routes>
                </div>
            </Router>
        </WalletContextProvider>
    );
}

export default App;
