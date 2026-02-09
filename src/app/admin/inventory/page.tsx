'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { translations } from '../../../lib/translations';
import { getTranslation, searchMatch } from '../../../lib/i18n';
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
        return searchMatch(product.display_names, searchQuery) || searchMatch(product.name, searchQuery);
    });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">88 <span className="text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">Stock</span></h1>
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2">{filteredProducts.length} active units across stores</p>
                    </div>
                    <Link
                        href="/admin"
                        className="px-8 py-4 bg-black text-[#39FF14] rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 border-2 border-black hover:bg-[#39FF14] hover:text-black"
                    >
                        {t.backToAdmin}
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-12 relative group">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-[#39FF14] transition-all" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchProducts}
                        className="w-full pl-16 pr-8 py-6 bg-white border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none shadow-xl transition-all font-black text-gray-900 placeholder-gray-300 uppercase tracking-widest text-[11px]"
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#39FF14] border-t-transparent mx-auto mb-6 shadow-[0_0_20px_rgba(57,255,20,0.2)]"></div>
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">{t.loadingInventory}</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[3.5rem] shadow-2xl border-2 border-gray-50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b-2 border-gray-50">
                                    <tr>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Product</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{t.currentStock}</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Status</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{t.priceLabel}</th>
                                        <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-50">
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
                                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] overflow-hidden border-2 border-gray-100 group-hover:scale-105 transition-transform flex-shrink-0 shadow-sm">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={getTranslation(product.display_names?.[lang] || product.name, lang)}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-gray-900 text-lg uppercase italic tracking-tighter">
                                                                    {getTranslation(product.display_names?.[lang] || product.name, lang)}
                                                                </div>
                                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-1.5 opacity-50">
                                                                    REF: {product.id.toString().slice(0, 8).toUpperCase()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={editStock}
                                                                onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                                                                className="w-28 bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none text-xl font-black text-gray-900"
                                                                min="0"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-900 font-black text-2xl tracking-tighter italic">
                                                                {product.stock_quantity || 0}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-2 ${status.color.replace('/10', '/5')} shadow-sm`}>
                                                            <span>{status.icon}</span>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-8 text-right">
                                                        {isEditing ? (
                                                            <div className="flex items-center justify-end gap-3">
                                                                <input
                                                                    type="number"
                                                                    value={editPrice}
                                                                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                                                                    className="w-36 bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none text-xl font-black text-gray-900 text-right"
                                                                    min="0"
                                                                    step="100"
                                                                />
                                                                <span className="text-[#39FF14] font-black text-[10px] uppercase tracking-widest drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">AMD</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-gray-900 font-black text-2xl tracking-tighter italic">{product.price.toLocaleString()}</span>
                                                                <span className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">AMD</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-8 text-center">
                                                        <div className="flex items-center justify-center gap-3">
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdate(product.id)}
                                                                        className="p-4 bg-black text-[#39FF14] rounded-2xl hover:bg-[#39FF14] hover:text-black transition-all border-2 border-black shadow-lg"
                                                                        title={t.save}
                                                                    >
                                                                        <Check className="w-6 h-6 stroke-[3px]" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancel}
                                                                        className="p-4 bg-white text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border-2 border-gray-100 shadow-lg"
                                                                        title={t.cancel}
                                                                    >
                                                                        <X className="w-6 h-6 stroke-[3px]" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEdit(product)}
                                                                    className="p-4 bg-white text-gray-300 rounded-2xl hover:text-[#39FF14] hover:border-[#39FF14] transition-all border-2 border-gray-100 shadow-sm"
                                                                    title={t.edit}
                                                                >
                                                                    <Edit2 className="w-6 h-6" />
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
