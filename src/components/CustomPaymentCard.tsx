import React, { useState } from 'react';
import { Send, Loader2, Wallet } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase } from '../lib/supabase';

export const CustomPaymentCard: React.FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSend = async () => {
        if (!publicKey) {
            alert('Please connect your wallet first!');
            return;
        }

        const solAmount = parseFloat(amount);
        if (isNaN(solAmount) || solAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const recipient = new PublicKey('4R3wTavnFJhjF4RScAfwCSS9RnhGnMEtprgoeqwHyoSN');

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

            const transaction = new Transaction({
                feePayer: publicKey,
                blockhash,
                lastValidBlockHeight,
            }).add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipient,
                    lamports: solAmount * LAMPORTS_PER_SOL,
                })
            );

            const signature = await sendTransaction(transaction, connection);

            await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
            console.log('Transaction successful:', signature);

            // Save to Supabase with node_count 0 to indicate custom payment
            const { error } = await supabase
                .from('deployments')
                .insert([
                    {
                        wallet_address: publicKey.toString(),
                        node_count: 0, // 0 indicates custom payment
                        amount_sol: solAmount,
                        transaction_signature: signature,
                    },
                ]);

            if (error) {
                console.error('Supabase error:', error);
            }

            setStatus('success');
            setAmount('');
        } catch (error: any) {
            console.error('Payment error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Transaction failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Wallet size={24} color="#a78bfa" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Custom Payment</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Deploy custom H100 configurations or top up your compute credits with a flexible SOL amount.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Amount (SOL)</label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field"
                        placeholder="0.00"
                        style={{ paddingRight: '4rem' }}
                    />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>SOL</span>
                </div>
            </div>

            {status === 'success' && (
                <div style={{
                    background: 'rgba(167, 139, 250, 0.1)',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    color: '#a78bfa',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    <strong>Success!</strong> Payment sent successfully.
                </div>
            )}

            {status === 'error' && (
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
            )}

            <button
                className="btn-primary"
                onClick={handleSend}
                disabled={isProcessing}
                style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                    </>
                ) : (
                    <>
                        <Send size={20} />
                        Send Custom Amount
                    </>
                )}
            </button>
        </div>
    );
};
