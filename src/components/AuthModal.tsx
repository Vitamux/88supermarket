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
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative z-[1000] border border-gray-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {view === 'login' ? t.login : t.register}
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {view === 'login' ? 'Welcome back to 88 Supermarket' : 'Join the new standard of fresh shopping'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100 font-bold animate-pulse text-center">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {view === 'register' && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={t.fullName}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] focus:bg-white outline-none transition-all text-gray-900 font-medium"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        placeholder={t.phoneNumber}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] focus:bg-white outline-none transition-all text-gray-900 font-medium"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder={t.email}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] focus:bg-white outline-none transition-all text-gray-900 font-medium"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={t.password}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] focus:bg-white outline-none transition-all text-gray-900 font-medium"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#39FF14] transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-[#39FF14] hover:text-black text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[1.25rem] shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                view === 'login' ? t.signIn : t.signUp
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        {view === 'login' ? (
                            <>
                                {t.dontHaveAccount}{' '}
                                <button
                                    onClick={() => setView('register')}
                                    className="text-black font-black hover:text-[#39FF14] transition-colors"
                                >
                                    {t.register}
                                </button>
                            </>
                        ) : (
                            <>
                                {t.alreadyHaveAccount}{' '}
                                <button
                                    onClick={() => setView('login')}
                                    className="text-black font-black hover:text-[#39FF14] transition-colors"
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
