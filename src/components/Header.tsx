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
    const setSelectedStoreId = useCartStore((state) => state.setSelectedStoreId); // No longer needed for direct select
    const setIsLocationModalOpen = useCartStore((state) => state.setIsLocationModalOpen);
    const { lang, setLang } = useLanguageStore();
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
                            <span className="text-2xl font-black tracking-tighter text-[#39FF14] transition-all dropdown-link drop-shadow-[0_0_15px_rgba(57,255,20,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(57,255,20,0.8)]">
                                88 SUPERMARKET
                            </span>
                        </Link>

                        {/* Language Switcher & Location Trigger */}
                        <div className="flex items-center gap-4">
                            {/* Language Switcher */}
                            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                {[
                                    { code: 'en', label: '🇺🇸' },
                                    { code: 'ru', label: '🇷🇺' },
                                    { code: 'am', label: '🇦🇲' },
                                ].map((flag) => (
                                    <button
                                        key={flag.code}
                                        onClick={() => setLang(flag.code as any)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${lang === flag.code
                                            ? 'bg-white text-black shadow-sm font-bold'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {flag.label}
                                    </button>
                                ))}
                            </div>

                            {/* Location Trigger */}
                            <button
                                onClick={() => setIsLocationModalOpen(true)}
                                className="hidden md:flex items-center gap-2 bg-white border-2 border-gray-100 hover:border-[#39FF14] px-4 py-2.5 rounded-xl transition-all group"
                            >
                                <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:text-[#39FF14] transition-colors max-w-[150px] truncate">
                                    {stores.find(s => s.id === selectedStoreId)?.name || t.selectStore}
                                </span>
                                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-[#39FF14]" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        {mounted ? (
                            user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-3 text-gray-900 hover:text-[#39FF14] transition-all font-black bg-white px-5 py-2.5 rounded-2xl border-2 border-gray-50 hover:border-[#39FF14]/30 shadow-sm"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#39FF14] flex items-center justify-center text-black text-xs font-black shadow-[0_0_15px_rgba(57,255,20,0.4)]">
                                            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden md:block truncate max-w-[120px] text-[10px] uppercase tracking-widest">
                                            {isAdmin ? "Admin" : (user.user_metadata?.full_name || t.myAccount)}
                                        </span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 py-3 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div className="px-6 py-4 border-b border-gray-50 mb-2">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">{t.account}</p>
                                                <p className="text-sm font-black text-gray-900 truncate tracking-tight">{user.email}</p>
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
                                                className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-[#39FF14]/10 hover:text-[#39FF14] transition-all flex items-center gap-4"
                                            >
                                                <User className="w-4 h-4" />
                                                <span>{isAdmin ? "Admin Dashboard" : t.myAccount}</span>
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all flex items-center gap-4 border-t border-gray-50 mt-1"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>{t.logout}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => { setAuthView('login'); setIsAuthModalOpen(true); }}
                                        className="px-6 py-3 text-gray-400 hover:text-gray-900 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                                    >
                                        {t.login}
                                    </button>
                                    <button
                                        onClick={() => { setAuthView('register'); setIsAuthModalOpen(true); }}
                                        className="px-8 py-3.5 bg-black text-[#39FF14] rounded-2xl font-black text-[10px] hover:bg-[#39FF14] hover:text-black transition-all shadow-xl active:scale-95 uppercase tracking-[0.2em] border border-black"
                                    >
                                        {t.register}
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="w-32 h-12 bg-gray-50 rounded-2xl animate-pulse"></div>
                        )}

                        <Link href="/cart" className="relative group">
                            <div className="p-3.5 bg-white rounded-2xl group-hover:bg-[#39FF14]/5 transition-all border-2 border-gray-50 group-hover:border-[#39FF14]/20 shadow-sm group-hover:shadow-md">
                                <ShoppingBag className="w-6 h-6 text-gray-400 group-hover:text-[#39FF14] transition-colors" />
                                {mounted && itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-black text-[#39FF14] text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg ring-4 ring-white transform group-hover:scale-110 transition-all border border-[#39FF14]/30">
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
