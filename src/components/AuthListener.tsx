'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useAdminStore } from '../store/useAdminStore';

export default function AuthListener() {
    const router = useRouter();
    const { setProfile } = useAdminStore();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                // Clear global state
                setProfile(null);
                router.push('/login');
                router.refresh(); // Ensure strict refresh
            }

            // Handle "Invalid Refresh Token" implicitly: 
            // When the token is invalid, Supabase usually fires SIGNED_OUT or simply doesn't return a session.
            // We can also force a check:
            if (!session && event !== 'SIGNED_OUT' && event !== 'INITIAL_SESSION') {
                // If we are seeing a state where we expect a session but don't have one?
                // Usually 'SIGNED_OUT' covers the "Invalid Refresh Token" case when the client detects it.
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router, setProfile]);

    return null;
}
