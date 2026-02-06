'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, Order } from '../../store/useCartStore';
import { supabase } from '../../lib/supabase';
import { useLanguageStore } from '../../store/useLanguageStore';
import { translations } from '../../lib/translations';
import { useAdminStore } from '../../store/useAdminStore';
import { ChevronDown, BarChart3, Store, TrendingUp, Trash2, Plus, Info } from 'lucide-react';

export default function AdminDashboard() {
    const { profile, activeStoreId, setActiveStoreId } = useAdminStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');
    const [products, setProducts] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        image_url: '',
        category: '',
        display_names: { en: '', ru: '', am: '' },
        description: '',
        nutritional_info: {
            calories: '',
            protein: '',
            carbs: '',
            fat: ''
        }
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any[]>([]);
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const isOwner = profile?.role === 'owner';
    const isManager = profile?.role === 'manager';

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Fetch Products
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: true });
            if (productsData) setProducts(productsData);

            // Fetch Categories
            const { data: catsData } = await supabase.from('categories').select('*');
            if (catsData) setCategories(catsData);

            // Fetch Stores for Switcher
            const { data: storesData } = await supabase.from('stores').select('*');
            if (storesData) setStores(storesData);

            // Fetch Analytics (Sales per Store)
            if (isOwner) {
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('store_id, total_price');

                if (ordersData && storesData) {
                    const storeSales = storesData.map(store => {
                        const total = ordersData
                            .filter(o => o.store_id === store.id)
                            .reduce((sum, o) => sum + (o.total_price || 0), 0);
                        return { name: store.name, id: store.id, total };
                    });
                    setAnalytics(storeSales);
                }
            }
        };

        fetchDashboardData();
    }, [isOwner]);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const { price, image_url, category, display_names, description, nutritional_info } = newProduct;
        const name = display_names.en;

        const { data, error } = await supabase
            .from('products')
            .insert([{
                name,
                price: parseFloat(price),
                image_url,
                category,
                display_names,
                description: description || null,
                nutritional_info: Object.values(nutritional_info).some(v => v !== '') ? nutritional_info : null
            }])
            .select()
            .single();

        if (error) {
            alert(t.errorAddingProduct);
            console.error(error);
        } else {
            setProducts([...products, data]);
            setNewProduct({
                name: '',
                price: '',
                image_url: '',
                category: '',
                display_names: { en: '', ru: '', am: '' },
                description: '',
                nutritional_info: {
                    calories: '',
                    protein: '',
                    carbs: '',
                    fat: ''
                }
            });
            alert(t.productAdded);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            alert('Error deleting product');
        } else {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
                            88 <span className="text-[#39FF14]">Super</span>market
                        </h1>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mt-1">
                            {profile?.role} Portal <span className="mx-2 opacity-20">|</span> {profile?.email}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {isOwner && (
                            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-2xl shadow-sm hover:border-[#39FF14] transition-all group relative">
                                <Store className="w-4 h-4 text-gray-400 group-hover:text-[#39FF14]" />
                                <select
                                    value={activeStoreId || ''}
                                    onChange={(e) => setActiveStoreId(e.target.value || null)}
                                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer pr-4 appearance-none"
                                >
                                    <option value="">All Branches (HQ)</option>
                                    {stores.map(store => (
                                        <option key={store.id} value={store.id}>{store.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                        <div className="bg-black text-[#39FF14] px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse shadow-[0_0_8px_#39FF14]"></div>
                            Live {profile?.role} mode
                        </div>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-black text-white shadow-2xl scale-105' : 'bg-white text-gray-400 hover:text-black hover:bg-gray-100 shadow-sm'}`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-black text-white shadow-2xl scale-105' : 'bg-white text-gray-400 hover:text-black hover:bg-gray-100 shadow-sm'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Active Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-black text-white shadow-2xl scale-105' : 'bg-white text-gray-400 hover:text-black hover:bg-gray-100 shadow-sm'}`}
                    >
                        <Plus className="w-4 h-4" />
                        Inventory
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Global Sales Bar Chart for Owner */}
                        {isOwner && (
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Global Branch Sales</h2>
                                        <p className="text-gray-400 text-xs font-medium mt-1">Total revenue distribution across active locations</p>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                                        Real-time Feedback
                                    </div>
                                </div>
                                <div className="flex items-end gap-6 h-72 px-4 min-w-[600px]">
                                    {analytics.length > 0 ? (
                                        analytics.map((store) => {
                                            const maxSales = Math.max(...analytics.map(a => a.total)) || 1;
                                            const height = (store.total / maxSales) * 100;
                                            const isHighest = store.total === maxSales && store.total > 0;

                                            return (
                                                <div key={store.id} className="flex-1 flex flex-col items-center group relative">
                                                    <div className="absolute -top-10 text-[10px] font-black text-gray-900 bg-[#39FF14]/10 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {store.total.toLocaleString()} AMD
                                                    </div>
                                                    <div
                                                        style={{ height: `${Math.max(15, height)}%` }}
                                                        className={`w-full max-w-[60px] rounded-2xl transition-all duration-1000 group-hover:scale-x-110 ${isHighest ? 'bg-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.4)]' : 'bg-gray-900 group-hover:bg-gray-800'}`}
                                                    ></div>
                                                    <div className="mt-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-center w-full truncate px-2">
                                                        {store.name}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
                                            <p className="text-gray-300 font-black text-xs uppercase tracking-widest italic">Awaiting branch transaction data...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Link href="/admin/orders" className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-[#39FF14] transition-all group shadow-sm">
                                <TrendingUp className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                                <p className="text-4xl font-black text-gray-900 tracking-tighter">0</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{t.activeOrders}</p>
                            </Link>
                            <Link href="/admin/inventory" className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-[#39FF14] transition-all group shadow-sm">
                                <Plus className="w-8 h-8 text-green-500 mb-6 group-hover:scale-110 transition-transform" />
                                <p className="text-4xl font-black text-gray-900 tracking-tighter">{products.length}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{t.manageProducts}</p>
                            </Link>
                            {isOwner && (
                                <Link href="/admin/categories" className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-[#39FF14] transition-all group shadow-sm">
                                    <Store className="w-8 h-8 text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{categories.length}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{t.manageCategories}</p>
                                </Link>
                            )}
                            <div className="bg-black p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/20 blur-[60px] -mr-16 -mt-16 rounded-full group-hover:bg-[#39FF14]/30 transition-all"></div>
                                <Info className="w-8 h-8 text-[#39FF14] mb-6 animate-pulse" />
                                <p className="text-xs text-white/50 font-medium leading-relaxed italic">"Great service is the best advertisement."</p>
                                <p className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest mt-4">Growth Hack #88</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-20 rounded-[3rem] shadow-sm border border-gray-100 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl grayscale opacity-50">
                                📦
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Launch Order Management</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Head over to the specialized active orders page to manage fulfillment, tracking, and customer communications.</p>
                            <Link href="/admin/orders" className="inline-block bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                                Open Orders Dash
                            </Link>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-8">
                        {/* Product Add Form */}
                        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#39FF14]"></div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-4">
                                <Plus className="w-6 h-6 text-[#39FF14]" />
                                {t.addProduct}
                            </h2>

                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.addProductName} (EN)</label>
                                    <input required type="text" value={newProduct.display_names.en} onChange={e => setNewProduct({ ...newProduct, display_names: { ...newProduct.display_names, en: e.target.value } })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all font-bold text-gray-900" placeholder="Product name..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.priceLabel} (AMD)</label>
                                    <input required type="number" step="100" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all font-bold text-gray-900" placeholder="8800" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.productCategory}</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.slug || cat.name}>{cat.name?.[lang] || cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.productImage} URL</label>
                                    <input type="text" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all font-bold text-gray-900" placeholder="https://..." />
                                </div>
                                <button type="submit" className="bg-black text-[#39FF14] font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl h-[60px]">
                                    {t.addNew}
                                </button>
                            </form>
                        </div>

                        {/* Recent Inventory List */}
                        <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Recent Products</h3>
                                <Link href="/admin/inventory" className="bg-white border border-gray-200 px-6 py-2 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black hover:border-black transition-all">
                                    Full stock list
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-gray-50">
                                        {products.slice(0, 10).map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform">
                                                            {product.image_url ? (
                                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xl grayscale opacity-30">📦</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm uppercase">{product.display_names?.[lang] || product.name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <p className="text-sm font-black text-gray-900">{product.price.toLocaleString()} <span className="text-[10px] font-bold opacity-30">AMD</span></p>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="p-3 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
