'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, Order } from '../../store/useCartStore';
import { supabase } from '../../lib/supabase';
import { Trash2 } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        image_url: '',
        category: '',
        display_names: { en: '', ru: '', am: '' },
        nutrition: ''
    });
    const [categories, setCategories] = useState<any[]>([]);

    const inventory = [
        { id: 1, name: "Organic Honeycrisp Apples", stock: 120, status: "In Stock" },
        { id: 2, name: "Artisan Sourdough Bread", stock: 15, status: "Low Stock" },
        { id: 3, name: "Premium Grass-Fed Ribeye", stock: 42, status: "In Stock" },
        { id: 4, name: "Farm Fresh Eggs (Dozen)", stock: 8, status: "Critical" },
    ];

    const totalRevenue = inventory.reduce((acc, item) => {
        const prices: { [key: number]: number } = { 1: 3.99, 2: 6.49, 3: 24.99, 4: 5.99 };
        return acc + (item.stock * (prices[item.id] || 0));
    }, 0);

    const updateOrderStatus = useCartStore((state) => state.updateOrderStatus);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders:', error);
            } else if (data) {
                const mappedOrders: Order[] = data.map((order: any) => ({
                    id: order.id,
                    customer: {
                        name: order.customer_name,
                        address: 'N/A',
                        phone: 'N/A'
                    },
                    items: order.items || [],
                    total: order.total_price,
                    date: order.created_at,
                    status: order.status || 'Pending Pickup'
                }));
                setOrders(mappedOrders);
            }
        };

        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: true });
            if (error) console.error('Error fetching products:', error);
            else if (data) setProducts(data);
        };

        const fetchCategories = async () => {
            const { data, error } = await supabase.from('categories').select('*');
            if (data) setCategories(data);
        };

        fetchOrders();
        fetchProducts();
        fetchCategories();

        const channel = supabase
            .channel('orders_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                const newOrderRaw = payload.new;
                const newOrder: Order = {
                    id: newOrderRaw.id,
                    customer: {
                        name: newOrderRaw.customer_name,
                        address: 'N/A',
                        phone: 'N/A'
                    },
                    items: newOrderRaw.items || [],
                    total: newOrderRaw.total_price,
                    date: newOrderRaw.created_at,
                    status: newOrderRaw.status || 'Pending Pickup'
                };
                setOrders((prev) => [newOrder, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const { price, image_url, category, display_names, nutrition } = newProduct;
        // Use English name as the primary 'name'
        const name = display_names.en;

        const { data, error } = await supabase
            .from('products')
            .insert([{
                name,
                price: parseFloat(price),
                image_url,
                category,
                display_names,
                nutrition: nutrition || null
            }])
            .select()
            .single();

        if (error) {
            alert('Error adding product');
            console.error(error);
        } else {
            setProducts([...products, data]);
            setNewProduct({
                name: '',
                price: '',
                image_url: '',
                category: '',
                display_names: { en: '', ru: '', am: '' },
                nutrition: ''
            });
            alert('Product added successfully');
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

    const handleUpdatePrice = async (id: number, newPrice: string) => {
        const price = parseFloat(newPrice);
        if (isNaN(price)) return;

        const { error } = await supabase
            .from('products')
            .update({ price })
            .eq('id', id);

        if (error) {
            alert('Error updating price');
        } else {
            setProducts(products.map(p => p.id === id ? { ...p, price } : p));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Etalon Inventory Management</h1>
                    <span className="bg-etalon-violet-100 text-etalon-violet-700 px-4 py-2 rounded-full font-semibold">Admin Mode</span>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/admin/orders"
                        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                                📦
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{orders.length}</p>
                                <p className="text-sm opacity-80">Pending</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold">Active Orders</h3>
                        <p className="text-sm opacity-80 mt-1">Manage pending orders</p>
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                                🏷️
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{categories.length}</p>
                                <p className="text-sm opacity-80">Total</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold">Manage Categories</h3>
                        <p className="text-sm opacity-80 mt-1">Add/edit categories</p>
                    </Link>

                    <Link
                        href="/admin/inventory"
                        className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                                📊
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{products.length}</p>
                                <p className="text-sm opacity-80">Products</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold">Stock Manager</h3>
                        <p className="text-sm opacity-80 mt-1">Bulk edit inventory</p>
                    </Link>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 border-b border-gray-200">
                    <button
                        className={`pb-4 px-2 font-semibold ${activeTab === 'orders' ? 'text-etalon-violet-600 border-b-2 border-etalon-violet-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Active Orders
                    </button>
                    <button
                        className={`pb-4 px-2 font-semibold ${activeTab === 'products' ? 'text-etalon-violet-600 border-b-2 border-etalon-violet-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Manage Products
                    </button>
                </div>

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                                <tr>
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Items</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No active orders found.</td></tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-mono font-bold text-gray-900">#{order.id.toString().slice(0, 8)}...</td>
                                            <td className="p-4">
                                                <div className="font-semibold">{order.customer.name}</div>
                                                <div className="text-xs text-gray-500">{order.customer.address}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                            </td>
                                            <td className="p-4 font-bold text-etalon-violet-600">${order.total.toFixed(2)}</td>
                                            <td className="p-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                                    className="bg-gray-100 border-none rounded-lg text-sm font-medium px-3 py-1 cursor-pointer focus:ring-2 focus:ring-etalon-violet-500"
                                                >
                                                    <option>Pending Pickup</option>
                                                    <option>Packing</option>
                                                    <option>Out for Delivery</option>
                                                    <option>Completed</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Product</h3>
                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (English)</label>
                                    <input required type="text" value={newProduct.display_names.en} onChange={e => setNewProduct({ ...newProduct, display_names: { ...newProduct.display_names, en: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="Apple" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (Russian)</label>
                                    <input required type="text" value={newProduct.display_names.ru} onChange={e => setNewProduct({ ...newProduct, display_names: { ...newProduct.display_names, ru: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="Яблоко" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (Armenian)</label>
                                    <input required type="text" value={newProduct.display_names.am} onChange={e => setNewProduct({ ...newProduct, display_names: { ...newProduct.display_names, am: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="Խնձոր" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                    <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                    <input type="text" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.slug || cat.name}>
                                                {cat.name?.en || cat.name || cat.slug}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="bg-etalon-violet-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-etalon-violet-700 transition shadow-md hover:shadow-lg h-[46px]">
                                    Add New
                                </button>
                            </form>

                            {/* Nutrition Textarea - Full Width */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nutrition Info (Optional)</label>
                                <textarea
                                    value={newProduct.nutrition}
                                    onChange={e => setNewProduct({ ...newProduct, nutrition: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all resize-vertical"
                                    rows={3}
                                    placeholder="e.g., Calories: 120, Protein: 2g, Carbs: 15g, Fat: 0g"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Image</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Expected Price ($)</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-gray-500">#{product.id}</td>
                                            <td className="p-4">
                                                {product.image_url ?
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                                    : <div className="w-12 h-12 bg-gray-200 rounded-md"></div>}
                                            </td>
                                            <td className="p-4 font-semibold text-gray-900">{product.name}<br /><span className="text-xs font-normal text-gray-500">{product.category}</span></td>
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    defaultValue={product.price}
                                                    onBlur={(e) => handleUpdatePrice(product.id, e.target.value)}
                                                    className="w-24 border border-gray-200 rounded p-1 text-sm focus:border-etalon-violet-500 focus:outline-none"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">No products found. Add one above.</td></tr>
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
