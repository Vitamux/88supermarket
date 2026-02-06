'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../lib/translations';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialView }: AuthModalProps) {
    const [view, setView] = useState<'login' | 'register'>(initialView);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const router = useRouter();
    const { lang } = useLanguageStore();
    const t = translations[lang];

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setError(null);
        }
    }, [isOpen, initialView]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (view === 'register') {
                const { error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.name,
                            phone: formData.phone
                        }
                    }
                });
                if (signUpError) throw signUpError;
            } else {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (signInError) {
                    if (signInError.message === 'Invalid login credentials') {
                        throw new Error('Incorrect Email or Password');
                    }
                    throw signInError;
                }

                // Check if user is admin for warp redirect
                const user = signInData.user;
                const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'v.anri01@gmail.com';

                if (user?.email === adminEmail) {
                    setSuccessMessage('Admin access granted. Redirecting to Dashboard... 🛡️');
                    setTimeout(() => {
                        onClose();
                        router.push('/admin');
                    }, 1500);
                    return;
                }
            }

            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl relative z-[1000] border-2 border-gray-50">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-3 bg-gray-50 hover:bg-[#39FF14] hover:text-black rounded-2xl transition-all z-20 shadow-sm border border-gray-100"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="inline-block px-4 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6 italic">
                            <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">88 Privilege</span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">
                            {view === 'login' ? t.login : t.register}
                        </h2>
                        <p className="text-gray-400 font-medium italic opacity-80">
                            {view === 'login' ? 'Welcome back to the future of fresh' : 'Join the new standard of premium shopping'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 italic shadow-sm flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-8 p-5 bg-[#39FF14]/10 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[#39FF14]/30 animate-pulse text-center shadow-lg">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {view === 'register' && (
                            <>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#39FF14] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={t.fullName}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4.5 pl-14 pr-6 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] focus:bg-white outline-none transition-all text-gray-900 font-black text-xs uppercase tracking-widest"
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#39FF14] transition-colors" />
                                    <input
                                        type="tel"
                                        placeholder={t.phoneNumber}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4.5 pl-14 pr-6 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] focus:bg-white outline-none transition-all text-gray-900 font-black text-xs uppercase tracking-widest"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#39FF14] transition-colors" />
                            <input
                                type="email"
                                placeholder={t.email}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4.5 pl-14 pr-6 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] focus:bg-white outline-none transition-all text-gray-900 font-black text-xs uppercase tracking-widest"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#39FF14] transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={t.password}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4.5 pl-14 pr-14 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] focus:bg-white outline-none transition-all text-gray-900 font-black text-xs uppercase tracking-widest"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-[#39FF14] transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-[#39FF14] text-[#39FF14] hover:text-black font-black text-[10px] uppercase tracking-[0.4em] py-6 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(57,255,20,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 border-2 border-black"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{view === 'login' ? t.signIn : t.signUp}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {view === 'login' ? (
                            <>
                                {t.dontHaveAccount}{' '}
                                <button
                                    onClick={() => setView('register')}
                                    className="text-gray-900 hover:text-[#39FF14] transition-colors border-b-2 border-gray-100 hover:border-[#39FF14] pb-0.5 ml-1"
                                >
                                    {t.register}
                                </button>
                            </>
                        ) : (
                            <>
                                {t.alreadyHaveAccount}{' '}
                                <button
                                    onClick={() => setView('login')}
                                    className="text-gray-900 hover:text-[#39FF14] transition-colors border-b-2 border-gray-100 hover:border-[#39FF14] pb-0.5 ml-1"
                                >
                                    {t.login}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
