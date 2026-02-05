'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { translations } from '../../../lib/translations';
import { supabase } from '../../../lib/supabase';
import { Search, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    display_names?: { en: string; ru: string; am: string };
    price: number;
    stock_quantity: number;
    image_url?: string;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editStock, setEditStock] = useState(0);
    const [editPrice, setEditPrice] = useState(0);
    const { lang } = useLanguageStore();
    const t = translations[lang];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

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
                color: 'bg-red-100 text-red-700 border-red-200',
                icon: '🔴',
                label: t.outOfStock
            };
        } else if (quantity <= 10) {
            return {
                color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                icon: '🟡',
                label: t.lowStock
            };
        } else {
            return {
                color: 'bg-green-100 text-green-700 border-green-200',
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.inventory}</h1>
                        <p className="text-gray-500 mt-1">{filteredProducts.length} products</p>
                    </div>
                    <Link
                        href="/admin"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back to Admin
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchProducts}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etalon-violet-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading inventory...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {t.currentStock}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {t.priceLabel}
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No products found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => {
                                            const status = getStockStatus(product.stock_quantity || 0);
                                            const imageUrl = product.image_url || 'https://via.placeholder.com/80x80?text=No+Image';
                                            const isEditing = editingId === product.id;

                                            return (
                                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={product.display_names?.[lang] || product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {product.display_names?.[lang] || product.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    ID: {product.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={editStock}
                                                                onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none text-lg font-semibold"
                                                                min="0"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-900 font-semibold text-lg">
                                                                {product.stock_quantity || 0}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                                            <span>{status.icon}</span>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        {isEditing ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editPrice}
                                                                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                                                                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none text-lg font-semibold text-right"
                                                                    min="0"
                                                                    step="0.01"
                                                                />
                                                                <span className="text-gray-500 font-medium">AMD</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-900 font-semibold">
                                                                {product.price} AMD
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdate(product.id)}
                                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                                        title={t.save}
                                                                    >
                                                                        <Check className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancel}
                                                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                                        title={t.cancel}
                                                                    >
                                                                        <X className="w-5 h-5" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEdit(product)}
                                                                    className="p-2 bg-etalon-violet-100 text-etalon-violet-700 rounded-lg hover:bg-etalon-violet-200 transition-colors"
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
