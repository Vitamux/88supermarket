'use client';

import { useState, useEffect } from 'react';
import { createManager } from '@/actions/auth-actions';
// import { useFormState } from 'react-dom'; // Next 14+
import { useAdminStore } from '@/store/useAdminStore';
import { supabase } from '@/lib/supabase';
import { Shield, Store, UserPlus, Mail, Lock, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StaffPage() {
    const { profile } = useAdminStore();
    const router = useRouter();
    const [stores, setStores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Redirect if not owner
    useEffect(() => {
        if (profile && profile.role !== 'owner') {
            router.push('/admin');
        }
    }, [profile, router]);

    useEffect(() => {
        const fetchStores = async () => {
            const { data } = await supabase.from('stores').select('*');
            if (data) setStores(data);
        };
        fetchStores();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const result = await createManager(null, formData);

        setMessage({
            text: result.message,
            type: result.success ? 'success' : 'error'
        });
        setIsLoading(false);

        if (result.success) {
            (e.target as HTMLFormElement).reset();
        }
    };

    if (profile?.role !== 'owner') {
        return null; // Or a loading spinner while redirecting
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 selection:bg-[#39FF14] selection:text-black">
            <div className="max-w-xl mx-auto">
                <div className="mb-12">
                    <Link href="/admin" className="text-gray-500 hover:text-[#39FF14] transition-colors text-xs font-black uppercase tracking-[0.2em] mb-6 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">
                        Staff <span className="text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]">Management</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                        Invite & Manage Store Managers
                    </p>
                </div>

                <div className="bg-zinc-900/50 border-2 border-zinc-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#39FF14] rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                            <UserPlus className="w-6 h-6 stroke-[3px]" />
                        </div>
                        <h2 className="text-xl font-black uppercase italic tracking-tight">Invite Manager</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-4">Email Address</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-[#39FF14] transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="manager@88supermarket.com"
                                    className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-4 pl-14 pr-4 font-bold text-sm focus:border-[#39FF14] focus:outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-4">Password</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-[#39FF14] transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-4 pl-14 pr-4 font-bold text-sm focus:border-[#39FF14] focus:outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-4">Assigned Branch</label>
                            <div className="relative group/input">
                                <Store className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-[#39FF14] transition-colors" />
                                <select
                                    name="storeId"
                                    required
                                    defaultValue=""
                                    className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-4 pl-14 pr-10 font-bold text-sm focus:border-[#39FF14] focus:outline-none transition-all appearance-none text-white cursor-pointer"
                                >
                                    <option value="" disabled className="text-zinc-500">Select a branch...</option>
                                    {stores.map(store => (
                                        <option key={store.id} value={store.id}>
                                            {store.name} ({store.district})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#39FF14] text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(57,255,20,0.2)] mt-4"
                        >
                            {isLoading ? 'Creating...' : 'Create Manager Account'}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 border-2 ${message.type === 'success' ? 'bg-[#39FF14]/10 border-[#39FF14] text-[#39FF14]' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            <p className="font-bold text-xs uppercase tracking-wide">{message.text}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
