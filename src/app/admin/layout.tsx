'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'v.anri01@gmail.com';

            if (!session) {
                router.push('/');
                return;
            }

            // Check if user is in admin_profiles
            const { data: profile, error } = await supabase
                .from('admin_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            let currentProfile = profile;

            if (error || !profile) {
                if (session.user.email === adminEmail) {
                    currentProfile = {
                        id: session.user.id,
                        email: session.user.email!,
                        role: 'owner',
                        assigned_store_id: null
                    };
                    useAdminStore.getState().setProfile(currentProfile);
                } else {
                    router.push('/');
                    return;
                }
            } else {
                useAdminStore.getState().setProfile(profile);
            }

            // Route protection
            const path = window.location.pathname;
            if (currentProfile?.role === 'manager' && path.includes('/admin/categories')) {
                router.push('/admin');
                return;
            }

            setAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14]"></div>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
