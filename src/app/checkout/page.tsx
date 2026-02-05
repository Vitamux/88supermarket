'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function CheckoutPage() {
    const router = useRouter();
    const items = useCartStore((state) => state.items);
    const placeOrder = useCartStore((state) => state.placeOrder);
    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 1000;
    const total = cartTotal + deliveryFee;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: ''
    });

    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        setMounted(true);

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

            if (user) {
                setUser(user);
                setIsAdmin(adminEmail ? user.email === adminEmail : false);

                // Auto-fill form data
                setFormData(prev => ({
                    ...prev,
                    name: user.user_metadata?.full_name || prev.name,
                    phone: user.user_metadata?.phone || prev.phone
                }));
            }
        };

        fetchUser();
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-etalon-violet-600">Loading Checkout...</div></div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.address || !formData.phone) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            // 1. Create the order
            const orderData = {
                customer_name: formData.name,
                address: formData.address,
                phone: formData.phone,
                items: items,
                total_price: total,
                status: 'pending'
            };

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Update stock for each item
            for (const item of items) {
                // Fetch current stock
                const { data: product, error: fetchError } = await supabase
                    .from('products')
                    .select('stock_quantity')
                    .eq('id', item.id)
                    .single();

                if (!fetchError && product) {
                    const newStock = (product.stock_quantity || 0) - item.quantity;
                    await supabase
                        .from('products')
                        .update({ stock_quantity: newStock })
                        .eq('id', item.id);
                }
            }

            // 3. Update store (to show in Success page)
            const newOrder = {
                id: order.id.toString(),
                customer: {
                    name: formData.name,
                    address: formData.address,
                    phone: formData.phone
                },
                items: items,
                total: total,
                date: new Date().toISOString(),
                status: 'Pending Pickup' as const
            };

            useCartStore.setState((state) => ({
                orders: [newOrder, ...state.orders],
                items: []
            }));

            router.push('/checkout/success');
        } catch (err: any) {
            console.error('Checkout error:', err);
            alert(`Failed to place order: ${err.message || 'Please try again'}`);
        } finally {
            setLoading(false);
        }
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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Delivery Details</h2>
                            {isAdmin && (
                                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black ring-1 ring-amber-200 shadow-sm animate-pulse">
                                    🛡️ Administrator
                                </span>
                            )}
                        </div>
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
                                    <span className="text-gray-900">{item.price * item.quantity} AMD</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{cartTotal} AMD</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee</span>
                                <span>{deliveryFee} AMD</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-50 mt-2">
                                <span>Total</span>
                                <span className="text-etalon-violet-600">{total} AMD</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || items.length === 0}
                            className="w-full mt-8 bg-gradient-to-r from-etalon-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>Place Order</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
