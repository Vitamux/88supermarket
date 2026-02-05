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

    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        phone: ''
    });

    const totalPrice = getTotalPrice();

    const handleCheckout = async () => {
        // Validate form
        if (!formData.fullName || !formData.address || !formData.phone) {
            alert(t.fillAllFields);
            return;
        }

        // Prepare order data
        const orderData = {
            customer_name: formData.fullName,
            address: formData.address,
            phone: formData.phone,
            items: items, // Supabase handles JS arrays as JSONB automatically
            total_price: totalPrice,
            status: 'pending'
        };

        console.log('Submitting order data:', orderData);

        // Insert order into Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) {
            console.error('Full Error:', error);
            console.error('Error Details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            alert(`Failed to place order: ${error.message || 'Please try again.'}`);
            return;
        }

        console.log('Order placed successfully:', data);

        // Subtract inventory for each item in the order
        for (const item of items) {
            // Fetch current stock
            const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', item.id)
                .single();

            if (fetchError) {
                console.error(`Error fetching product ${item.id}:`, fetchError);
                continue; // Skip this item but continue processing others
            }

            // Calculate new stock (allow negative for now)
            const currentStock = product?.stock_quantity || 0;
            const newStock = currentStock - item.quantity;

            // Update stock
            const { error: updateError } = await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.id);

            if (updateError) {
                console.error(`Error updating stock for product ${item.id}:`, updateError);
            } else {
                console.log(`Updated product ${item.id}: ${currentStock} -> ${newStock}`);
            }
        }

        alert(t.orderSuccess);
        clearCart();
        router.push('/');
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
                            className="bg-etalon-violet-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-etalon-violet-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
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
                                            <p className="text-etalon-violet-600 font-medium">
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
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-etalon-violet-50 text-etalon-violet-600 transition-colors"
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

                        {/* Summary Card with Checkout Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">{t.summary}</h2>

                                {/* Checkout Form */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.fullName}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.deliveryAddress}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                            placeholder="123 Main St, Apt 4"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.phoneNumber}
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                            placeholder="+374 XX XXX XXX"
                                        />
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="space-y-4 mb-8 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg text-gray-900">{t.total}</span>
                                        <span className="font-extrabold text-3xl text-etalon-violet-600">
                                            {totalPrice.toFixed(0)} AMD
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-gradient-to-r from-etalon-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {t.checkout}
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-4">
                                    Secure checkout powered by Etalon
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
