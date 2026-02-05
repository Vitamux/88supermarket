'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { translations } from '../../../lib/translations';
import { supabase } from '../../../lib/supabase';
import { Phone, MapPin, Package, Check } from 'lucide-react';
import Link from 'next/link';

interface Order {
    id: string;
    customer_name: string;
    phone: string;
    address: string;
    items: any[];
    total_price: number;
    status: string;
    created_at: string;
}

export default function ActiveOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { lang } = useLanguageStore();
    const t = translations[lang];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    const handleMarkCompleted = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'completed' })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order');
        } else {
            // Remove from current view
            setOrders(orders.filter(order => order.id !== orderId));
        }
    };

    const isNewOrder = (createdAt: string) => {
        const orderDate = new Date(createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.activeOrders}</h1>
                        <p className="text-gray-500 mt-1">{orders.length} pending orders</p>
                    </div>
                    <Link
                        href="/admin"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back to Admin
                    </Link>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etalon-violet-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            📦
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.noActiveOrders}</h2>
                        <p className="text-gray-500">All orders are completed!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-etalon-violet-100 rounded-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-etalon-violet-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{order.customer_name}</h3>
                                            <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    {isNewOrder(order.created_at) && (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            🆕 {t.newBadge}
                                        </span>
                                    )}
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-3 mb-4 bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <a
                                            href={`tel:${order.phone}`}
                                            className="text-etalon-violet-600 font-medium hover:underline"
                                        >
                                            {order.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <p className="text-gray-700">{order.address}</p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                                        {t.items} ({order.items?.length || 0})
                                    </h4>
                                    <div className="space-y-2">
                                        {order.items?.map((item: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.image_url ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                📦
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Qty: {item.quantity} × {item.price} AMD
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                    {(item.price * item.quantity).toFixed(0)} AMD
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total & Action */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        <p className="text-sm text-gray-500 uppercase tracking-wide">{t.total}</p>
                                        <p className="text-2xl font-bold text-etalon-violet-600">
                                            {order.total_price.toFixed(0)} AMD
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleMarkCompleted(order.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        <Check className="w-5 h-5" />
                                        {t.markAsCompleted}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
