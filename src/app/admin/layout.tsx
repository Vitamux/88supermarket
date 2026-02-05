'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

            if (!session || session.user.email !== adminEmail) {
                router.push('/');
            } else {
                setAuthorized(true);
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etalon-violet-600"></div>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
