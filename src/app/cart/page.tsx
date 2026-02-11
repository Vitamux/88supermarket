'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { translations } from '../../lib/translations';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { getTranslation } from '../../lib/i18n';

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const totalPrice = getTotalPrice();
    const deliveryFee = 1000;
    const finalTotal = totalPrice + deliveryFee;

    const handleCheckout = () => {
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
                <div className="flex items-center gap-6 mb-12">
                    <Link href="/" className="p-3 hover:bg-[#39FF14] hover:text-black rounded-2xl transition-all text-gray-400 group border-2 border-transparent hover:border-[#39FF14] bg-white shadow-sm">
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter italic">{t.myCart}<span className="text-[#39FF14]">.</span></h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-1">{items.length} {t.resultsFound}</p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] shadow-2xl border-2 border-gray-50 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 text-5xl shadow-inner border-2 border-white animate-bounce-elastic">
                            🛒
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight italic">{t.yourCartIsEmpty}</h2>
                        <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium italic">Looks like you haven't added anything to your cart yet.</p>
                        <Link
                            href="/"
                            className="bg-black text-[#39FF14] px-14 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-[#39FF14] hover:text-black transition-all transform hover:-translate-y-2 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-2 border-black"
                        >
                            {t.backToShop}
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => {
                                const imageUrl = (item as any).image_url || 'https://via.placeholder.com/150x150?text=No+Image';

                                return (
                                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-gray-50 flex flex-col sm:flex-row items-center gap-8 group transition-all hover:border-[#39FF14]/30">
                                        <div className="w-32 h-32 bg-gray-50 rounded-[1.5rem] overflow-hidden shrink-0 border-4 border-white shadow-lg relative group-hover:scale-105 transition-transform duration-500">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageUrl}
                                                alt={getTranslation(item.display_names || item.name, lang)}
                                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex flex-col gap-1 mb-2">
                                                <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">Premium Selection</span>
                                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                                                    {getTranslation(item.display_names || item.name, lang)}
                                                </h3>
                                            </div>
                                            <p className="text-gray-900 font-black text-lg tracking-tighter">
                                                {item.price.toLocaleString()} <span className="text-[10px] text-[#39FF14] uppercase ml-1">AMD</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-4 bg-gray-50 rounded-[1.5rem] px-5 py-2 border-2 border-gray-100/50 shadow-inner">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-[#39FF14] hover:text-black text-gray-300 transition-all active:scale-90"
                                                >
                                                    <Minus className="w-5 h-5 stroke-[4px]" />
                                                </button>
                                                <span className="font-black text-2xl text-gray-900 w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-[#39FF14] hover:text-black text-gray-300 transition-all active:scale-90"
                                                >
                                                    <Plus className="w-5 h-5 stroke-[4px]" />
                                                </button>
                                            </div>

                                            {/* Total & Remove */}
                                            <div className="flex flex-col items-end gap-3 min-w-[120px]">
                                                <span className="font-black text-2xl text-gray-900 tracking-tighter">
                                                    {(item.price * item.quantity).toLocaleString()} <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest block -mt-1 text-right">AMD</span>
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="hidden sm:inline">{t.delete}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-gray-50 sticky top-24 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-[60px] -mr-16 -mt-16"></div>
                                <h2 className="text-2xl font-black text-gray-900 mb-10 uppercase tracking-tighter italic flex items-center gap-4">
                                    <div className="h-6 w-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]"></div>
                                    {t.summary}
                                </h2>

                                <div className="space-y-5 mb-10">
                                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Subtotal</span>
                                        <span className="font-black text-lg text-gray-900 tracking-tighter">{totalPrice.toLocaleString()} <span className="text-[10px] text-[#39FF14]">AMD</span></span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.delivery}</span>
                                        <span className="font-black text-lg text-[#39FF14] tracking-tighter">{deliveryFee.toLocaleString()} <span className="text-[10px]">AMD</span></span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="mb-10 pt-8 border-t-2 border-dashed border-gray-100">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-black text-[12px] uppercase tracking-[0.4em] text-gray-900">{t.total}</span>
                                        <span className="font-black text-4xl text-gray-900 tracking-tighter leading-none">
                                            {finalTotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest block text-right drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">AMD FULL TOTAL</span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-black text-[#39FF14] font-black py-6 rounded-[1.5rem] shadow-2xl hover:bg-[#39FF14] hover:text-black transition-all transform hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-xs border-2 border-black"
                                >
                                    <span>{t.checkout}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                                </button>
                                <p className="text-[8px] text-center text-gray-400 mt-6 uppercase tracking-[0.5em] font-black opacity-40 italic">
                                    Secure fulfillment system
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
