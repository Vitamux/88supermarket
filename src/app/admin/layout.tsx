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
            console.log('🔍 Admin Layout: Checking auth...');
            const { data: { session } } = await supabase.auth.getSession();
            console.log('🔍 Admin Layout: Session:', session ? 'Found' : 'Not found');
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'v.anri01@gmail.com';

            if (!session) {
                console.log('❌ Admin Layout: No session, redirecting to home');
                router.push('/');
                return;
            }

            // Check if user is in profiles
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            let currentProfile = profile;

            if (error || !profile) {
                console.log('⚠️ Admin Layout: No profile found in DB');
                if (session.user.email === adminEmail) {
                    console.log('✅ Admin Layout: User is admin email, creating owner profile');
                    currentProfile = {
                        id: session.user.id,
                        email: session.user.email!,
                        role: 'owner',
                        assigned_store_id: null
                    };
                    useAdminStore.getState().setProfile(currentProfile);
                } else {
                    console.log('❌ Admin Layout: User not admin, redirecting');
                    router.push('/');
                    return;
                }
            } else {
                console.log('✅ Admin Layout: Profile found:', profile.role);
                useAdminStore.getState().setProfile(profile);
            }

            // Route protection
            const path = window.location.pathname;
            console.log('🔍 Admin Layout: Current path:', path);
            if (currentProfile?.role === 'manager' && path.includes('/admin/categories')) {
                console.log('⚠️ Admin Layout: Manager trying to access categories, redirecting');
                router.push('/admin');
                return;
            }

            console.log('✅ Admin Layout: Authorization successful');
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
