'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { useLanguageStore } from '@/store/useLanguageStore';
import { translations } from '@/lib/translations';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Category {
    id: number;
    name: { en: string; ru: string; am: string };
    slug: string;
    created_at: string;
}

export default function CategoriesPage() {
    const router = useRouter();
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({
        nameEn: '',
        nameRu: '',
        nameAm: '',
        slug: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('slug', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
        } else if (data) {
            setCategories(data);
        }
        setLoading(false);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCategory.nameEn || !newCategory.nameRu || !newCategory.nameAm || !newCategory.slug) {
            alert('Please fill in all fields');
            return;
        }

        const categoryData = {
            name: {
                en: newCategory.nameEn,
                ru: newCategory.nameRu,
                am: newCategory.nameAm
            },
            slug: newCategory.slug.toLowerCase().replace(/\s+/g, '-')
        };

        const { data, error } = await supabase
            .from('categories')
            .insert([categoryData])
            .select()
            .single();

        if (error) {
            console.error('Error adding category:', error);
            alert(`Failed to add category: ${error.message}`);
        } else {
            setCategories([...categories, data]);
            setNewCategory({ nameEn: '', nameRu: '', nameAm: '', slug: '' });
            alert(t.categoryAdded);
        }
    };

    const handleDeleteCategory = async (id: number, categoryName: string) => {
        if (!confirm(`${t.confirmDeleteCategory} "${categoryName}"?`)) {
            return;
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting category:', error);
            alert(`Failed to delete category: ${error.message}`);
        } else {
            setCategories(categories.filter(cat => cat.id !== id));
            alert(t.categoryDeleted);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/admin')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{t.manageCategories}</h1>
                </div>

                {/* Add Category Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{t.addCategory}</h2>
                    <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.categoryName} (English)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameEn}
                                onChange={e => setNewCategory({ ...newCategory, nameEn: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                placeholder="Bakery"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.categoryName} (Русский)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameRu}
                                onChange={e => setNewCategory({ ...newCategory, nameRu: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                placeholder="Выпечка"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.categoryName} (Հայերեն)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameAm}
                                onChange={e => setNewCategory({ ...newCategory, nameAm: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                placeholder="Հացաբուլկեղեն"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={newCategory.slug}
                                onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                                placeholder="bakery"
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-etalon-violet-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-etalon-violet-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                {t.addCategory}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">{t.categories}</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : categories.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No categories yet. Add your first category above!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Slug
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            English
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Русский
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Հայերեն
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded text-violet-700 font-mono">
                                                    {category.slug}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {category.name?.en || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {category.name?.ru || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {category.name?.am || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id, category.name?.[lang] || category.slug)}
                                                    className="text-red-600 hover:text-red-800 transition p-2 hover:bg-red-50 rounded-lg"
                                                    title={t.deleteCategory}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
