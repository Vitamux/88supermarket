'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "../store/useCartStore";
import { ShoppingBag, User, LogOut, ChevronDown } from "lucide-react";
import AuthModal from "./AuthModal";
import { supabase } from "../lib/supabase";
import { useLanguageStore } from "../store/useLanguageStore";
import { translations } from "../lib/translations";

export default function Header() {
    const itemCount = useCartStore((state) => state.getItemCount());
    const selectedStoreId = useCartStore((state) => state.selectedStoreId);
    const setSelectedStoreId = useCartStore((state) => state.setSelectedStoreId);
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [stores, setStores] = useState<any[]>([]);
    const router = useRouter();

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const isAdmin = user?.email === adminEmail;

    useEffect(() => {
        setMounted(true);

        const fetchStores = async () => {
            const { data, error } = await supabase.from('stores').select('*').order('name');
            if (!error && data) {
                setStores(data);
                // Auto-select first store if none selected
                if (!selectedStoreId && data.length > 0) {
                    setSelectedStoreId(data[0].id);
                }
            }
        };
        fetchStores();

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsDropdownOpen(false);
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-2xl font-black tracking-tighter text-[#39FF14] transition-all dropdown-link drop-shadow-[0_0_2px_rgba(57,255,20,0.5)]">
                                88 SUPERMARKET
                            </span>
                        </Link>

                        {/* Branch Selector */}
                        <div className="relative group">
                            <select
                                value={selectedStoreId || ''}
                                onChange={(e) => setSelectedStoreId(e.target.value)}
                                className="appearance-none bg-gray-50 text-gray-900 text-xs font-black uppercase tracking-widest pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#39FF14] outline-none transition-all cursor-pointer"
                            >
                                <option value="" disabled>{t.selectStore}</option>
                                {stores.map((store) => (
                                    <option key={store.id} value={store.id} className="bg-white text-gray-900">
                                        {store.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        {mounted ? (
                            user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 text-gray-900 hover:text-[#39FF14] transition-colors font-bold bg-gray-50 px-4 py-2 rounded-xl border border-gray-100"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14] text-sm font-black border border-[#39FF14]/20">
                                            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden md:block truncate max-w-[120px]">
                                            {isAdmin ? "Admin" : (user.user_metadata?.full_name || t.myAccount)}
                                        </span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-3 border-b border-gray-50 mb-2">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-0.5">{t.account}</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    if (isAdmin) {
                                                        router.push('/admin');
                                                    } else {
                                                        alert(t.featureComingSoon);
                                                    }
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition-colors flex items-center gap-3"
                                            >
                                                <User className="w-4 h-4" />
                                                <span className="font-bold">{isAdmin ? "Admin Dashboard" : t.myAccount}</span>
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-gray-50 mt-1"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="font-bold">{t.logout}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setAuthView('login'); setIsAuthModalOpen(true); }}
                                        className="px-5 py-2 text-gray-500 hover:text-gray-900 transition-colors font-black text-xs uppercase tracking-widest"
                                    >
                                        {t.login}
                                    </button>
                                    <button
                                        onClick={() => { setAuthView('register'); setIsAuthModalOpen(true); }}
                                        className="px-6 py-2.5 bg-[#39FF14] text-black rounded-xl font-black text-xs hover:bg-[#32E612] transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)] active:scale-95 uppercase tracking-widest"
                                    >
                                        {t.register}
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="w-32 h-10 bg-gray-50 rounded-xl animate-pulse"></div>
                        )}

                        <Link href="/cart" className="relative group">
                            <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-[#39FF14]/10 transition-colors border border-gray-100 group-hover:border-[#39FF14]/30">
                                <ShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-[#39FF14] transition-colors" />
                                {mounted && itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white transform group-hover:scale-110 transition-all">
                                        {itemCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>

            </header>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialView={authView}
            />
        </>
    );
}
