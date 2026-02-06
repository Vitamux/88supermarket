'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { translations } from '../../../lib/translations';
import { supabase } from '../../../lib/supabase';
import { Phone, MapPin, Package, Check, Copy, ChevronDown, Filter, Trash2 } from 'lucide-react';
import Link from 'next/link';
// Removed unused toast import

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
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const statusColors: { [key: string]: string } = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        packing: 'bg-blue-100 text-blue-800 border-blue-200',
        delivery: 'bg-purple-100 text-purple-800 border-purple-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
    };

    const getStatusColor = (status: string) => statusColors[status?.toLowerCase()] || statusColors.pending;

    const statusLabels: { [key: string]: string } = {
        pending: t.pendingLabel,
        packing: t.packingLabel,
        delivery: t.deliveryLabel,
        completed: t.completedLabel,
    };

    useEffect(() => {
        fetchOrders();

        // Real-time subscription
        const channel = supabase
            .channel('orders_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newOrder = payload.new as Order;
                        setOrders(prev => [newOrder, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedOrder = payload.new as Order;
                        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                    } else if (payload.eventType === 'DELETE') {
                        setOrders(prev => prev.filter(o => o.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(o => o.status === statusFilter));
        }
    }, [orders, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order');
        }
    };

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        alert(t.copySuccess);
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm(t.confirmDeleteProduct + "?")) return;

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order');
        } else {
            setOrders(prev => prev.filter(o => o.id !== orderId));
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
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.activeOrders}</h1>
                        <p className="text-gray-500 mt-1">{orders.filter(o => o.status !== 'completed').length} {t.pending} orders</p>
                    </div>
                    <Link
                        href="/admin"
                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium flex items-center gap-2"
                    >
                        {t.backToAdmin}
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === 'all' ? 'bg-etalon-violet-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        {t.allStatuses}
                    </button>
                    {['pending', 'packing', 'delivery', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${statusFilter === status ? statusColors[status] + ' shadow-sm' : 'text-gray-500 hover:bg-gray-50 border-transparent'}`}
                        >
                            {statusLabels[status]}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etalon-violet-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">{t.loadingOrders}</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
                            {statusFilter === 'all' ? '📦' : '✨'}
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">{t.noActiveOrders}</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">{t.allOrdersCompleted}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${getStatusColor(order.status).split(' ')[0]}`}>
                                            <Package className={`w-7 h-7 ${getStatusColor(order.status).split(' ')[1]}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-gray-900 text-xl tracking-tight">{order.customer_name}</h3>
                                                {isNewOrder(order.created_at) && (
                                                    <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                        {t.newBadge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-mono font-bold text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative group">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className={`appearance-none font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl border-2 transition-all cursor-pointer outline-none ${getStatusColor(order.status)}`}
                                            >
                                                <option value="pending">{t.pendingLabel}</option>
                                                <option value="packing">{t.packingLabel}</option>
                                                <option value="delivery">{t.deliveryLabel}</option>
                                                <option value="completed">{t.completedLabel}</option>
                                            </select>
                                            <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${getStatusColor(order.status).split(' ')[1]}`} />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Order"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Customer Info Grid */}
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <a
                                        href={`tel:${order.phone}`}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-etalon-violet-200 transition-all"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-etalon-violet-600 shadow-sm">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.phone}</p>
                                            <p className="text-gray-900 font-bold">{order.phone}</p>
                                        </div>
                                    </a>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="max-w-[180px]">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</p>
                                                <p className="text-gray-900 font-bold truncate">{order.address}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCopyAddress(order.address)}
                                            className="p-2 text-gray-400 hover:text-etalon-violet-600 hover:bg-white rounded-lg transition-all"
                                            title="Copy Address"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Items Summary with Thumbnails */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest">
                                            {t.items} ({order.items?.length || 0})
                                        </h4>
                                        <div className="flex -space-x-2">
                                            {order.items?.slice(0, 5).map((item, i) => (
                                                <div key={i} className="w-8 h-8 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-gray-100">
                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {(order.items?.length || 0) > 5 && (
                                                <div className="w-8 h-8 rounded-lg border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                                    +{(order.items?.length || 0) - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                                        {order.items?.map((item: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-etalon-violet-600 bg-etalon-violet-50 w-6 h-6 rounded flex items-center justify-center">
                                                        {item.quantity}
                                                    </span>
                                                    <p className="font-bold text-gray-700 text-sm">
                                                        {item.display_names?.[lang] || item.name}
                                                    </p>
                                                </div>
                                                <span className="font-bold text-gray-500 text-xs">
                                                    {item.price.toFixed(0)} AMD
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="flex items-end justify-between pt-6 border-t-2 border-dotted border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.total}</p>
                                        <p className="text-3xl font-black text-etalon-violet-600 tracking-tighter">
                                            {order.total_price.toFixed(0)} <span className="text-lg font-bold">AMD</span>
                                        </p>
                                    </div>
                                    {order.status !== 'completed' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                                            className="bg-etalon-violet-600 hover:bg-etalon-violet-700 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-etalon-violet-200 hover:-translate-y-1 active:translate-y-0"
                                        >
                                            <Check className="w-5 h-5" />
                                            {t.markAsCompleted}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
