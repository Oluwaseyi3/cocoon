import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../lib/supabase';

export function useUserStatus() {
    const { publicKey } = useWallet();
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (!publicKey) {
                setIsSignedUp(false);
                setLoading(false);
                return;
            }

            try {
                // Check if user has any deployments
                const { count, error } = await supabase
                    .from('deployments')
                    .select('*', { count: 'exact', head: true })
                    .eq('wallet_address', publicKey.toString());

                if (error) {
                    console.error('Error fetching user status:', error);
                    setIsSignedUp(false); // Default to false on error, or handle gracefully
                } else {
                    setIsSignedUp(count !== null && count > 0);
                }
            } catch (error) {
                console.error('Error checking user status:', error);
                setIsSignedUp(false);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [publicKey]);

    return { isSignedUp, loading };
}
