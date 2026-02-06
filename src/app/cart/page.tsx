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

            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{t.myCart}</h1>
                    <span className="text-gray-400 font-medium">({items.length} items)</span>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-4xl">
                            🛒
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.yourCartIsEmpty}</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet.</p>
                        <Link
                            href="/"
                            className="bg-[#39FF14] text-black px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#32E612] hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg shadow-[#39FF14]/20"
                        >
                            {t.backToShop}
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => {
                                const imageUrl = (item as any).image_url || 'https://via.placeholder.com/150x150?text=No+Image';

                                return (
                                    <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group transition-all hover:shadow-md">
                                        <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageUrl}
                                                alt={item.display_names?.[lang] || item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                {item.display_names?.[lang] || item.name}
                                            </h3>
                                            <p className="text-[#39FF14] drop-shadow-[0_0_1px_rgba(57,255,20,0.5)] font-black uppercase text-xs tracking-widest">
                                                {item.price} AMD
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 text-gray-600 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 text-gray-600 transition-colors border border-gray-100"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Total & Remove */}
                                            <div className="flex flex-col items-end gap-2 min-w-[100px]">
                                                <span className="font-bold text-lg text-gray-900">
                                                    {(item.price * item.quantity).toFixed(0)} AMD
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs group-hover:opacity-100"
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
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">{t.summary}</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">{totalPrice.toFixed(0)} AMD</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t.delivery}</span>
                                        <span className="font-semibold">{deliveryFee.toFixed(0)} AMD</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="space-y-4 mb-8 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg text-gray-900">{t.total}</span>
                                        <span className="font-black text-3xl text-gray-900 tracking-tighter">
                                            {finalTotal.toFixed(0)} <span className="text-sm uppercase opacity-40">AMD</span>
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-[#39FF14] text-black font-black py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#32E612] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    <span>{t.checkout}</span>
                                </button>
                                <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">
                                    Secure checkout powered by 88 Supermarket
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
