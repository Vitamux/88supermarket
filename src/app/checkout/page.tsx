'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const items = useCartStore((state) => state.items);
    const placeOrder = useCartStore((state) => state.placeOrder);
    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 5.00;
    const total = cartTotal + deliveryFee;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: ''
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-etalon-violet-600">Loading Checkout...</div></div>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.address) return;

        placeOrder(formData);
        router.push('/checkout/success');
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                    <Link href="/" className="text-etalon-violet-600 hover:underline">Continue Shopping</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Stepped Progress */}
                <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold mb-2">1</div>
                        <span className="text-sm font-semibold text-gray-900">Shipping</span>
                    </div>
                    <div className="h-1 flex-1 bg-gray-200 mx-4"></div>
                    <div className="flex flex-col items-center opacity-50">
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold mb-2">2</div>
                        <span className="text-sm font-semibold text-gray-500">Payment</span>
                    </div>
                    <div className="h-1 flex-1 bg-gray-200 mx-4"></div>
                    <div className="flex flex-col items-center opacity-50">
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold mb-2">3</div>
                        <span className="text-sm font-semibold text-gray-500">Success</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Details</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Jane Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                    placeholder="123 Fresh St, Apartment 4B"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                    placeholder="(555) 123-4567"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Right: Summary */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-medium text-gray-900">{item.name}</span>
                                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                    </div>
                                    <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee</span>
                                <span>${deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full mt-8 bg-violet-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-violet-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
