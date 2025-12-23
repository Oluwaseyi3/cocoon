import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../lib/supabase';

export interface Deployment {
    id: number;
    created_at: string;
    node_count: number;
    amount_sol: number;
    transaction_signature: string;
    wallet_address: string;
}

export function useDeployments() {
    const { publicKey } = useWallet();
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeployments = async () => {
            if (!publicKey) {
                setDeployments([]);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('deployments')
                    .select('*')
                    .eq('wallet_address', publicKey.toString())
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

        fetchDeployments();
    }, [publicKey]);

    return { deployments, loading };
}
