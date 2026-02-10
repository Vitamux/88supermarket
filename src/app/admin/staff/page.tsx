'use client';

import { useState, useEffect } from 'react';
import { createManager, deleteManager } from '@/actions/auth-actions';
// import { useFormState } from 'react-dom'; // Next 14+
import { useAdminStore } from '@/store/useAdminStore';
import { supabase } from '@/lib/supabase';
import { Shield, Store, UserPlus, Mail, Lock, ChevronDown, CheckCircle, AlertTriangle, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StaffPage() {
    const { profile } = useAdminStore();
    const router = useRouter();
    const [stores, setStores] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Redirect if not owner
    useEffect(() => {
        if (profile && profile.role !== 'owner') {
            router.push('/admin');
        }
    }, [profile, router]);

    const fetchStores = async () => {
        const { data, error } = await supabase.from('stores').select('*');
        console.log('📍 Fetched stores:', data);
        console.log('📍 Store fetch error:', error);
        if (data) setStores(data);
    };

    const fetchManagers = async () => {
        // Fetch profiles with role 'manager' and join with stores to get store name
        /* 
           Note: Supabase simple join might require foreign key setup in client.
           For now, let's fetch profiles and map store names manually if join is complex 
           or use the relational query if setup.
        */
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'manager');

        if (profiles) {
            setManagers(profiles);
        }
    };

    useEffect(() => {
        fetchStores();
        fetchManagers();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        console.log('📧 Form data - Email:', formData.get('email'));
        console.log('🏪 Form data - StoreId:', formData.get('storeId'));
        console.log('🔑 Form data - Password length:', (formData.get('password') as string)?.length);

        const result = await createManager(null, formData);

        setMessage({
            text: result.message,
            type: result.success ? 'success' : 'error'
        });
        setIsLoading(false);

        if (result.success) {
            (e.target as HTMLFormElement).reset();
            fetchManagers(); // Refresh list
        }
    };

    const handleDelete = async (managerId: string) => {
        if (!confirm('Are you sure you want to remove this manager? This action cannot be undone.')) return;

        setIsDeleting(managerId);
        const result = await deleteManager(managerId);

        if (result.success) {
            setManagers(managers.filter(m => m.id !== managerId));
            setMessage({ text: 'Manager removed successfully', type: 'success' });
        } else {
            setMessage({ text: result.message, type: 'error' });
        }
        setIsDeleting(null);
    };

    if (profile?.role !== 'owner') {
        return null; // Or a loading spinner while redirecting
    }

    const getStoreName = (storeId: string) => {
        const store = stores.find(s => s.id === storeId);
        return store ? `${store.name} (${store.district})` : 'Unknown Branch';
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 selection:bg-[#39FF14] selection:text-black font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Link href="/admin" className="text-gray-500 hover:text-[#39FF14] transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-flex items-center gap-2 group">
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-2">
                            Staff <span className="text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">Management</span>
                        </h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">
                            Global Personnel Control Center
                        </p>
                    </div>
                    <div className="bg-[#39FF14]/10 border border-[#39FF14]/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#39FF14]" />
                        <span className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest">Owner Access Only</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Invite Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group sticky top-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-[#39FF14] rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] group-hover:scale-105 transition-transform">
                                    <UserPlus className="w-6 h-6 stroke-[3px]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Invite Manager</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Create access credentials</p>
                                </div>
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
                                            className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-4 pl-14 pr-4 font-bold text-sm focus:border-[#39FF14] focus:outline-none transition-all placeholder:text-zinc-700 text-white"
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
                                            className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-4 pl-14 pr-4 font-bold text-sm focus:border-[#39FF14] focus:outline-none transition-all placeholder:text-zinc-700 text-white"
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
                                            <option value="" disabled className="text-zinc-500">
                                                {stores.length === 0 ? 'Loading branches...' : 'Select a branch...'}
                                            </option>
                                            {stores.map(store => (
                                                <option key={store.id} value={store.id} className="bg-zinc-900 text-white">
                                                    {store.name} - {store.district}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                    </div>
                                    {stores.length === 0 && (
                                        <p className="text-[10px] text-yellow-500 pl-4 mt-2">⚠️ Loading stores from database...</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#39FF14] text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(57,255,20,0.2)] mt-4 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    ) : 'Create Manager Account'}
                                </button>
                            </form>

                            {message && (
                                <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-[#39FF14]/10 border-[#39FF14]/50 text-[#39FF14]' : 'bg-red-500/10 border-red-500/50 text-red-500'} animate-in fade-in slide-in-from-bottom-2`}>
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                    <p className="font-bold text-[10px] uppercase tracking-wide">{message.text}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manager List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Active Managers</h3>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{managers.length} active assignments</p>
                                </div>
                                <div className="bg-black/50 p-2 rounded-xl">
                                    <Shield className="w-5 h-5 text-zinc-700" />
                                </div>
                            </div>

                            {managers.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border-2 border-zinc-800 text-4xl grayscale opacity-30">
                                        👥
                                    </div>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No managers assigned yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-black text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                            <tr>
                                                <th className="px-8 py-6">Manager</th>
                                                <th className="px-8 py-6">Assigned Branch</th>
                                                <th className="px-8 py-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800">
                                            {managers.map((manager) => (
                                                <tr key={manager.id} className="group hover:bg-zinc-800/30 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:text-[#39FF14] group-hover:bg-zinc-900 transition-colors">
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white text-sm">{manager.email}</p>
                                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">ID: {manager.id.substring(0, 8)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]"></div>
                                                            <span className="font-bold text-gray-300 text-sm">{getStoreName(manager.assigned_store_id)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => handleDelete(manager.id)}
                                                            disabled={isDeleting === manager.id}
                                                            className="p-3 bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                                                            title="Revoke Access"
                                                        >
                                                            {isDeleting === manager.id ? (
                                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                            ) : (
                                                                <Trash2 className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
