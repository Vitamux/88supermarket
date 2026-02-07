'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { translations } from '../../../lib/translations';
import { supabase } from '../../../lib/supabase';
import { useAdminStore } from '../../../store/useAdminStore';
import { Phone, MapPin, Package, Check, Copy, ChevronDown, Filter, Trash2, Store } from 'lucide-react';
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
    const { profile, activeStoreId, setActiveStoreId } = useAdminStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [stores, setStores] = useState<any[]>([]);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const isOwner = profile?.role === 'owner';
    const isManager = profile?.role === 'manager';

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
        fetchStores();

        // Real-time subscription - with store-level filtering
        const channel = supabase
            .channel('orders_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    const newOrder = payload.new as any;

                    // Filter based on store context
                    const targetStoreId = isManager ? profile?.assigned_store_id : activeStoreId;

                    if (targetStoreId && newOrder.store_id !== targetStoreId) {
                        return; // Ignore if it doesn't match the current view
                    }

                    if (payload.eventType === 'INSERT') {
                        setOrders(prev => [newOrder as Order, ...prev]);

                        // Play notification sound if it matches the current view
                        // Only play if the order belongs to the active store (for owners) or assigned store (for managers)
                        if (!targetStoreId || newOrder.store_id === targetStoreId) {
                            try {
                                const audio = new Audio('/sounds/notification.mp3');
                                audio.play().catch(e => console.log('Audio play failed (user interaction required):', e));
                            } catch (error) {
                                console.error('Error playing notification sound:', error);
                            }
                        }
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
    }, [activeStoreId, profile?.assigned_store_id]); // Re-subscribe/refetch if context changes

    const fetchStores = async () => {
        const { data } = await supabase.from('stores').select('*');
        if (data) setStores(data);
    };

    useEffect(() => {
        let result = [...orders];

        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }

        // Additional filtering based on store context
        if (activeStoreId) {
            result = result.filter(o => (o as any).store_id === activeStoreId);
        }

        setFilteredOrders(result);
    }, [orders, statusFilter, activeStoreId]);

    const fetchOrders = async () => {
        setLoading(true);
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        // Filter by store if required
        if (activeStoreId) {
            query = query.eq('store_id', activeStoreId);
        } else if (isManager && profile?.assigned_store_id) {
            query = query.eq('store_id', profile.assigned_store_id);
        }

        const { data, error } = await query;

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
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">
                            88 <span className="text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">Active</span> Orders
                        </h1>
                        <p className="text-gray-400 mt-2 uppercase text-[10px] font-black tracking-[0.4em]">
                            {orders.filter(o => o.status !== 'completed').length} {t.pending} shipments
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="px-8 py-4 bg-black text-[#39FF14] rounded-2xl hover:bg-[#39FF14] hover:text-black transition-all shadow-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 border-2 border-black"
                    >
                        {t.backToAdmin}
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="flex-1 bg-white p-3 rounded-[1.5rem] shadow-xl border-2 border-gray-50 flex flex-wrap gap-2">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${statusFilter === 'all' ? 'bg-[#39FF14] text-black shadow-[0_10px_20px_rgba(57,255,20,0.3)]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            {t.allStatuses}
                        </button>
                        {['pending', 'packing', 'delivery', 'completed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${statusFilter === status ? 'border-[#39FF14] bg-[#39FF14]/5 text-[#39FF14] shadow-[0_5px_15px_rgba(57,255,20,0.2)]' : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                {statusLabels[status]}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const audio = new Audio('/sounds/notification.mp3');
                                audio.play().then(() => {
                                    audio.pause();
                                    audio.currentTime = 0;
                                    setAudioEnabled(true);
                                }).catch(() => alert("Please interact with the document first"));
                            }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${audioEnabled ? 'bg-[#39FF14]/20 text-gray-900 border-2 border-[#39FF14]' : 'bg-gray-200 text-gray-500 border-2 border-transparent'}`}
                        >
                            {audioEnabled ? '🔔 AUDIO ON' : '🔕 ENABLE AUDIO'}
                        </button>

                        <div className={`bg-white p-3 rounded-[1.5rem] shadow-xl flex items-center gap-3 group relative min-w-[200px] border-2 ${isOwner ? 'border-[#39FF14]' : 'border-gray-100 opacity-70'}`}>
                            <div className="pl-3">
                                <Store className={`w-5 h-5 ${isOwner ? 'text-[#39FF14]' : 'text-gray-300'}`} />
                            </div>
                            <select
                                value={activeStoreId || (isManager ? profile?.assigned_store_id : '') || ''}
                                onChange={(e) => setActiveStoreId(e.target.value || null)}
                                disabled={!isOwner}
                                className="bg-transparent text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] py-2 pr-10 outline-none appearance-none cursor-pointer w-full disabled:cursor-not-allowed"
                            >
                                {isOwner && <option value="" className="bg-white">{t.allBranches}</option>}
                                {Object.entries(stores.reduce((acc, store) => {
                                    const district = store.district || 'Other';
                                    if (!acc[district]) acc[district] = [];
                                    acc[district].push(store);
                                    return acc;
                                }, {} as Record<string, any[]>)).map(([district, districtStores]) => (
                                    <optgroup key={district} label={district}>
                                        {(districtStores as any[]).map((store: any) => (
                                            <option key={store.id} value={store.id} className="bg-white">{store.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className={`w-4 h-4 absolute right-6 pointer-events-none ${isOwner ? 'text-[#39FF14]' : 'text-gray-300'}`} />
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#39FF14] border-t-transparent mx-auto mb-6 shadow-[0_0_20px_rgba(57,255,20,0.2)]"></div>
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">{t.loadingOrders}</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-gray-50 p-24 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner border-2 border-white animate-bounce-elastic">
                            {statusFilter === 'all' ? '📦' : '✨'}
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">{t.noActiveOrders}</h2>
                        <p className="text-gray-400 max-w-sm mx-auto font-medium italic">{t.allOrdersCompleted}</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-[3rem] shadow-2xl border-2 border-gray-50 p-10 hover:border-[#39FF14]/40 transition-all group overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-[#39FF14]/5 blur-[80px] -mr-24 -mt-24 rounded-full group-hover:bg-[#39FF14]/10 transition-all"></div>
                                {/* Order Header */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-gray-50 border-2 border-gray-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                                            <Package className="w-10 h-10 text-[#39FF14]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4">
                                                <h3 className="font-black text-gray-900 text-3xl tracking-tighter uppercase italic">{order.customer_name}</h3>
                                                {isNewOrder(order.created_at) && (
                                                    <span className="bg-black text-[#39FF14] px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(0,0,0,0.2)] animate-pulse">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-1.5">Shipment ID: {order.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="relative group/status min-w-[160px]">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className={`appearance-none font-black text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-2xl border-2 transition-all cursor-pointer outline-none w-full ${getStatusColor(order.status)} shadow-sm hover:translate-y-[-2px] active:translate-y-0`}
                                            >
                                                <option value="pending" className="bg-white">{t.pendingLabel}</option>
                                                <option value="packing" className="bg-white">{t.packingLabel}</option>
                                                <option value="delivery" className="bg-white">{t.deliveryLabel}</option>
                                                <option value="completed" className="bg-white">{t.completedLabel}</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-current" />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="p-3.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border-2 border-gray-50 bg-white shadow-sm"
                                            title="Delete Order"
                                        >
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Customer Info Grid */}
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <a
                                        href={`tel:${order.phone}`}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#39FF14]/30 transition-all"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#39FF14] shadow-sm">
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
                                            className="p-2 text-gray-400 hover:text-[#39FF14] hover:bg-white rounded-lg transition-all"
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
                                                    <span className="text-[10px] font-black text-black bg-[#39FF14] w-6 h-6 rounded-lg flex items-center justify-center shadow-sm">
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
                                <div className="flex flex-col md:flex-row items-end md:items-center justify-between pt-10 border-t-2 border-dashed border-gray-100 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">{t.total}</p>
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter italic">
                                            {order.total_price.toLocaleString()} <span className="text-[10px] font-black text-[#39FF14] uppercase ml-1 drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">AMD FULL TOTAL</span>
                                        </p>
                                    </div>
                                    {order.status !== 'completed' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                                            className="bg-black text-[#39FF14] font-black px-10 py-5 rounded-[1.5rem] transition-all flex items-center gap-3 shadow-2xl hover:bg-[#39FF14] hover:text-black hover:-translate-y-1 active:scale-95 text-[10px] uppercase tracking-[0.4em] border-2 border-black w-full md:w-auto justify-center"
                                        >
                                            <Check className="w-6 h-6 stroke-[4px]" />
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
