'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { translations } from '../../../lib/translations';
import { supabase } from '../../../lib/supabase';
import { Search, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';

import { useAdminStore } from '../../../store/useAdminStore';

interface Product {
    id: number;
    name: string;
    display_names?: { en: string; ru: string; am: string };
    price: number;
    stock_quantity: number;
    image_url?: string;
    store_id?: string;
}

export default function InventoryPage() {
    const { profile, activeStoreId } = useAdminStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editStock, setEditStock] = useState(0);
    const [editPrice, setEditPrice] = useState(0);
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const isManager = profile?.role === 'manager';

    useEffect(() => {
        fetchProducts();
    }, [activeStoreId]);

    const fetchProducts = async () => {
        setLoading(true);
        let query = supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

        if (activeStoreId) {
            query = query.eq('store_id', activeStoreId);
        } else if (isManager && profile?.assigned_store_id) {
            query = query.eq('store_id', profile.assigned_store_id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setEditStock(product.stock_quantity || 0);
        setEditPrice(product.price || 0);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditStock(0);
        setEditPrice(0);
    };

    const handleUpdate = async (id: number) => {
        const { error } = await supabase
            .from('products')
            .update({
                stock_quantity: editStock,
                price: editPrice
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating product:', error);
            alert(t.updateFailed);
        } else {
            alert(t.updateSuccess);
            setEditingId(null);
            fetchProducts(); // Refresh the list
        }
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) {
            return {
                color: 'bg-red-500/10 text-red-500 border-red-500/20',
                icon: '🔴',
                label: t.outOfStock
            };
        } else if (quantity <= 10) {
            return {
                color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                icon: '🟡',
                label: t.lowStock
            };
        } else {
            return {
                color: 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20',
                icon: '🟢',
                label: t.inStock
            };
        }
    };

    const filteredProducts = products.filter(product => {
        const productName = product.display_names?.[lang] || product.name || '';
        return productName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">88 <span className="text-[#39FF14]">Stock</span></h1>
                        <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">{filteredProducts.length} active units</p>
                    </div>
                    <Link
                        href="/admin"
                        className="px-6 py-3 bg-[#1A1A1A] text-gray-500 border border-gray-800 rounded-xl hover:text-[#39FF14] hover:border-[#39FF14] transition-all font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
                    >
                        {t.backToAdmin}
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-8 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#39FF14] transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchProducts}
                        className="w-full pl-12 pr-4 py-4 bg-[#1A1A1A] border border-gray-800 rounded-2xl focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none shadow-sm transition-all font-black text-white placeholder-gray-700 uppercase tracking-widest text-[10px]"
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14] mx-auto transition-all"></div>
                        <p className="text-gray-500 mt-4 font-black text-xs uppercase tracking-widest">{t.loadingInventory}</p>
                    </div>
                ) : (
                    <div className="bg-[#1A1A1A] rounded-[2.5rem] shadow-2xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Product</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t.currentStock}</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t.priceLabel}</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                {t.noProductsFound}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => {
                                            const status = getStockStatus(product.stock_quantity || 0);
                                            const imageUrl = product.image_url || 'https://via.placeholder.com/80x80?text=No+Image';
                                            const isEditing = editingId === product.id;

                                            return (
                                                <tr key={product.id} className="hover:bg-black/40 transition-colors group">
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-black rounded-2xl overflow-hidden border border-gray-800 group-hover:scale-105 transition-transform flex-shrink-0">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={product.display_names?.[lang] || product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-white text-sm uppercase italic tracking-tight">
                                                                    {product.display_names?.[lang] || product.name}
                                                                </div>
                                                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                                                    ID: {product.id.slice(0, 8)}...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={editStock}
                                                                onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                                                                className="w-24 bg-black border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none text-lg font-black text-white"
                                                                min="0"
                                                            />
                                                        ) : (
                                                            <span className="text-white font-black text-lg">
                                                                {product.stock_quantity || 0}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                                                            <span>{status.icon}</span>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        {isEditing ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editPrice}
                                                                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                                                                    className="w-32 bg-black border border-gray-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none text-lg font-black text-white text-right"
                                                                    min="0"
                                                                    step="0.01"
                                                                />
                                                                <span className="text-gray-500 font-black text-[10px] uppercase tracking-widest">AMD</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-white font-black text-lg">{product.price.toLocaleString()}</span>
                                                                <span className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest">AMD</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdate(product.id)}
                                                                        className="p-3 bg-[#39FF14]/10 text-[#39FF14] rounded-xl hover:bg-[#39FF14] hover:text-black transition-all border border-[#39FF14]/20"
                                                                        title={t.save}
                                                                    >
                                                                        <Check className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancel}
                                                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                                        title={t.cancel}
                                                                    >
                                                                        <X className="w-5 h-5" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEdit(product)}
                                                                    className="p-3 bg-[#39FF14]/10 text-gray-400 rounded-xl hover:bg-[#39FF14] hover:text-black transition-all border border-[#39FF14]/20"
                                                                    title={t.edit}
                                                                >
                                                                    <Edit2 className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
