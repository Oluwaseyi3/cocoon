import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, Clock, Minus, Plus, Loader2, RefreshCw } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase } from '../lib/supabase';

interface DeploymentCardProps {
    nodeCount: number;
    setNodeCount: (count: number) => void;
    pricePerNode: number;
}

export const DeploymentCard: React.FC<DeploymentCardProps> = ({ nodeCount, setNodeCount, pricePerNode }) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [isDeploying, setIsDeploying] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const [isFetchingPrice, setIsFetchingPrice] = useState(false);

    const fetchSolPrice = async () => {
        setIsFetchingPrice(true);
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await response.json();
            setSolPrice(data.solana.usd);
        } catch (error) {
            console.error('Error fetching SOL price:', error);
            // Fallback to a safe default if API fails, or maybe alert user
            // For now, let's keep the previous hardcoded value as a fallback but maybe notify?
            // actually, let's just not set it and handle the null case
        } finally {
            setIsFetchingPrice(false);
        }
    };

    useEffect(() => {
        fetchSolPrice();
        // Refresh price every minute
        const interval = setInterval(fetchSolPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleIncrement = () => setNodeCount(nodeCount + 1);
    const handleDecrement = () => setNodeCount(Math.max(1, nodeCount - 1));

    const handleDeploy = async () => {
        if (!publicKey) {
            alert('Please connect your wallet first!');
            return;
        }

        if (!solPrice) {
            alert('Unable to fetch current SOL price. Please try again.');
            fetchSolPrice();
            return;
        }

        setIsDeploying(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const recipient = new PublicKey('4R3wTavnFJhjF4RScAfwCSS9RnhGnMEtprgoeqwHyoSN');
            const feeRecipient = new PublicKey('7rMhamzcz8xjLnEbVYW5N1Vd1sygc6bv4wgXV2Y1bAss');

            // Calculate SOL amount based on current price
            const totalUsdCost = nodeCount * pricePerNode;
            const solAmountRaw = totalUsdCost / solPrice;
            // Add a small buffer or just round to 4 decimals for precision
            const amount = parseFloat(solAmountRaw.toFixed(4));

            const feeAmount = 0.2 * nodeCount;

            console.log(`Price: $${solPrice}/SOL, Cost: $${totalUsdCost}, Amount: ${amount} SOL`);

            console.log('Getting latest blockhash...');
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            console.log('Blockhash received:', blockhash);

            const transaction = new Transaction({
                feePayer: publicKey,
                blockhash,
                lastValidBlockHeight,
            }).add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipient,
                    lamports: Math.round(amount * LAMPORTS_PER_SOL), // Ensure integer lamports
                }),
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: feeRecipient,
                    lamports: feeAmount * LAMPORTS_PER_SOL,
                })
            );

            console.log('Sending transaction...');
            const signature = await sendTransaction(transaction, connection);

            if (!signature) {
                throw new Error('Transaction not signed');
            }

            console.log('Transaction sent, signature:', signature);

            console.log('Confirming transaction...');
            await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
            console.log('Transaction confirmed:', signature);

            // Save to Supabase
            const { error } = await supabase
                .from('deployments')
                .insert([
                    {
                        wallet_address: publicKey.toString(),
                        node_count: nodeCount,
                        amount_sol: amount,
                        transaction_signature: signature,
                    },
                ]);

            if (error) {
                console.error('Supabase error:', error);
            }

            setStatus('success');
            setNodeCount(1); // Reset
        } catch (error: any) {
            console.error('Deployment error:', error);
            setStatus('error');

            if (error?.message?.includes('User rejected') || error?.name === 'WalletSignTransactionError') {
                setErrorMessage('Transaction cancelled by user');
            } else {
                setErrorMessage(error.message || 'Transaction failed');
            }
        } finally {
            setIsDeploying(false);
        }
    };

    // Calculate display values
    const totalUsd = nodeCount * pricePerNode;
    const estimatedSol = solPrice ? (totalUsd / solPrice) : 0;
    const totalSolWithFee = estimatedSol + (0.2 * nodeCount);

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Server size={24} color="#a78bfa" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>NVIDIA H100 Node</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>80GB HBM3 | PCIe Gen5 | 3.2Tbps Network</p>
                </div>
                <span style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#a78bfa',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    HIGH DEMAND
                </span>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                        <CheckCircle size={16} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Available for Immediate Deployment</span>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Deployment Time</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                        <Clock size={16} />
                        <span style={{ fontSize: '0.9rem' }}>&lt; 24 Hours</span>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Number of Nodes</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleDecrement}
                        disabled={isDeploying}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border)',
                            opacity: isDeploying ? 0.5 : 1
                        }}
                    >
                        <Minus size={20} />
                    </button>
                    <div style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                    }}>
                        {nodeCount}
                    </div>
                    <button
                        onClick={handleIncrement}
                        disabled={isDeploying}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border)',
                            opacity: isDeploying ? 0.5 : 1
                        }}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Price per Node (30 Days)</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>${pricePerNode.toLocaleString()}.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Setup Fee</span>
                    <span style={{ color: 'var(--accent)', fontWeight: '500' }}>{(0.2 * nodeCount).toFixed(2)} SOL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>Total (SOL)</span>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {solPrice ? (
                                <>
                                    {totalSolWithFee.toFixed(4)} SOL
                                    <button
                                        onClick={fetchSolPrice}
                                        disabled={isFetchingPrice}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
                                        title="Refresh Price"
                                    >
                                        <RefreshCw size={14} className={isFetchingPrice ? "animate-spin" : ""} />
                                    </button>
                                </>
                            ) : (
                                <span style={{ fontSize: '1.5rem' }}>Loading price...</span>
                            )}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {solPrice ? (
                                <>Approx. ${totalUsd.toLocaleString()}.00 USD @ ${solPrice}/SOL</>
                            ) : (
                                <>Approx. ${totalUsd.toLocaleString()}.00 USD</>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {
                status === 'success' && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        <strong>Success!</strong> Your node deployment has been initiated.
                    </div>
                )
            }

            {
                status === 'error' && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        <strong>Error:</strong> {errorMessage}
                    </div>
                )
            }

            <button
                className="btn-primary"
                onClick={handleDeploy}
                disabled={isDeploying || !solPrice}
                style={{ opacity: (isDeploying || !solPrice) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
                {isDeploying ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                    </>
                ) : (
                    'Deploy Node via Solana'
                )}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
                Transaction secure.
            </p>
        </div >
    );
};
