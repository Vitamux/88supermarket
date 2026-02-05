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
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const isAdmin = user?.email === adminEmail;

    useEffect(() => {
        setMounted(true);

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
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl font-extrabold tracking-tighter text-gray-900 group-hover:text-etalon-violet-600 transition-colors">
                            Etalon Market
                        </span>
                    </Link>

                    <div className="bg-gray-100/50 rounded-full px-1 p-1 hidden md:flex items-center">
                        {/* Navigation functionality moved to sidebar/search */}
                    </div>

                    <div className="flex items-center gap-4">
                        {mounted ? (
                            user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 text-gray-700 hover:text-etalon-violet-600 transition-colors font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-100"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-etalon-violet-100 flex items-center justify-center text-etalon-violet-700 text-sm font-bold">
                                            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden md:block truncate max-w-[120px]">
                                            {isAdmin ? "Admin Panel" : (user.user_metadata?.full_name || t.myAccount)}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]">
                                            <div className="px-4 py-2 border-b border-gray-50 mb-2">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">{t.account}</p>
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
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                            >
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold">{isAdmin ? "Admin Dashboard" : t.myAccount}</span>
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-gray-50 mt-1"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="font-semibold">{t.logout}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setAuthView('login'); setIsAuthModalOpen(true); }}
                                        className="px-5 py-2 text-gray-700 hover:text-etalon-violet-600 transition-colors font-black text-sm uppercase tracking-wide"
                                    >
                                        {t.login}
                                    </button>
                                    <button
                                        onClick={() => { setAuthView('register'); setIsAuthModalOpen(true); }}
                                        className="px-6 py-2.5 bg-etalon-violet-600 text-white rounded-full font-black text-sm hover:bg-etalon-violet-700 transition-all shadow-lg shadow-violet-200 active:scale-95 uppercase tracking-wide"
                                    >
                                        {t.register}
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="w-32 h-10 bg-gray-50 rounded-full animate-pulse"></div>
                        )}

                        <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>

                        <Link href="/cart" className="relative group">
                            <div className="p-2 bg-gray-50 rounded-full group-hover:bg-etalon-violet-50 transition-colors">
                                <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-etalon-violet-600 transition-colors" />
                                {mounted && itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-fuchsia-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white transform group-hover:scale-110 transition-all">
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
