'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, Order } from '../../store/useCartStore';
import { supabase } from '../../lib/supabase';
import { Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { translations } from '../../lib/translations';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
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
    const { lang } = useLanguageStore();
    const t = translations[lang];

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

    useEffect(() => {
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

        fetchProducts();
        fetchCategories();
    }, []);

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
                    <h1 className="text-3xl font-bold text-gray-900">{t.adminManagement}</h1>
                    <span className="bg-etalon-violet-100 text-etalon-violet-700 px-4 py-2 rounded-full font-semibold">{t.adminMode}</span>
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
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm opacity-80">{t.pending}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold">{t.activeOrders}</h3>
                        <p className="text-sm opacity-80 mt-1">{t.activeOrdersDesc}</p>
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
                                <p className="text-sm opacity-80">{t.total}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold">{t.manageCategories}</h3>
                        <p className="text-sm opacity-80 mt-1">{t.manageCategoriesDesc}</p>
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
                                <p className="text-sm opacity-80">{t.shop}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold">{t.stockManager}</h3>
                        <p className="text-sm opacity-80 mt-1">{t.bulkEditDesc}</p>
                    </Link>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">{t.addProduct}</h3>
                        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.addProductName} (English)</label>
                                <input required type="text" value={newProduct.display_names.en} onChange={e => setNewProduct({ ...newProduct, display_names: { ...newProduct.display_names, en: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="Apple" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.addProductName} (Russian)</label>
                                <input required type="text" value={newProduct.display_names.ru} onChange={e => setNewProduct({ ...newProduct, display_names: { ...newProduct.display_names, ru: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="Яблоко" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.addProductName} (Armenian)</label>
                                <input required type="text" value={newProduct.display_names.am} onChange={e => setNewProduct({ ...newProduct, display_names: { ...newProduct.display_names, am: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="Խնձոր" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.priceLabel} (AMD)</label>
                                <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.productImage}</label>
                                <input type="text" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.productCategory}</label>
                                <select
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="">{t.categorySelect}</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug || cat.name}>
                                            {cat.name?.[lang] || cat.name || cat.slug}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="bg-etalon-violet-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-etalon-violet-700 transition shadow-md hover:shadow-lg h-[46px]">
                                {t.addNew}
                            </button>
                        </form>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Description and Image Preview */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.description}</label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all resize-vertical"
                                        rows={4}
                                        placeholder={t.productDescriptionFallback}
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-3">{t.imagePreview}</p>
                                    <div className="aspect-square w-full max-w-[200px] bg-white rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center">
                                        {newProduct.image_url ? (
                                            <img
                                                src={newProduct.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=' + t.invalidUrl;
                                                }}
                                            />
                                        ) : (
                                            <div className="text-gray-300 text-4xl">🖼️</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Optional Nutritional Info */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-etalon-violet-600 rounded-full"></span>
                                    {t.nutritionalFacts} ({t.nutritionOptional})
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.calories}</label>
                                        <input
                                            type="text"
                                            value={newProduct.nutritional_info.calories}
                                            onChange={e => setNewProduct({ ...newProduct, nutritional_info: { ...newProduct.nutritional_info, calories: e.target.value } })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-etalon-violet-500 outline-none"
                                            placeholder="150"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.protein}</label>
                                        <input
                                            type="text"
                                            value={newProduct.nutritional_info.protein}
                                            onChange={e => setNewProduct({ ...newProduct, nutritional_info: { ...newProduct.nutritional_info, protein: e.target.value } })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-etalon-violet-500 outline-none"
                                            placeholder="5g"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.carbs}</label>
                                        <input
                                            type="text"
                                            value={newProduct.nutritional_info.carbs}
                                            onChange={e => setNewProduct({ ...newProduct, nutritional_info: { ...newProduct.nutritional_info, carbs: e.target.value } })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-etalon-violet-500 outline-none"
                                            placeholder="20g"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.fat}</label>
                                        <input
                                            type="text"
                                            value={newProduct.nutritional_info.fat}
                                            onChange={e => setNewProduct({ ...newProduct, nutritional_info: { ...newProduct.nutritional_info, fat: e.target.value } })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-etalon-violet-500 outline-none"
                                            placeholder="2g"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">{t.productImage}</th>
                                    <th className="p-4">{t.addProductName}</th>
                                    <th className="p-4">{t.expectedPrice} (AMD)</th>
                                    <th className="p-4">{t.actions}</th>
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
                                        <td className="p-4 font-semibold text-gray-900">{product.display_names?.[lang] || product.name}<br /><span className="text-xs font-normal text-gray-500">{product.category}</span></td>
                                        <td className="p-4 text-gray-500 font-bold">{product.price} AMD</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title={t.deleteProduct}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">{t.noProductsFound}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
