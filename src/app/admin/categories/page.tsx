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
        <div className="min-h-screen bg-[#0F0F0F] text-white">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex items-center gap-6 mb-12">
                    <button
                        onClick={() => router.push('/admin')}
                        className="p-3 bg-[#1A1A1A] border border-gray-800 rounded-2xl hover:border-[#39FF14] transition-all group"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-[#39FF14]" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">88 <span className="text-[#39FF14]">Categories</span></h1>
                        <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">{categories.length} active departments</p>
                    </div>
                </div>

                {/* Add Category Form */}
                <div className="bg-[#1A1A1A] rounded-[2.5rem] shadow-2xl border border-gray-800 p-10 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#39FF14]"></div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-4">
                        <Plus className="w-6 h-6 text-[#39FF14]" />
                        {t.addCategory}
                    </h2>
                    <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 pl-1">
                                {t.categoryName} (English)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameEn}
                                onChange={e => setNewCategory({ ...newCategory, nameEn: e.target.value })}
                                className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all font-black text-white placeholder-gray-700"
                                placeholder="..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 pl-1">
                                {t.categoryName} (Русский)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameRu}
                                onChange={e => setNewCategory({ ...newCategory, nameRu: e.target.value })}
                                className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all font-black text-white placeholder-gray-700"
                                placeholder="..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 pl-1">
                                {t.categoryName} (Հայերեն)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameAm}
                                onChange={e => setNewCategory({ ...newCategory, nameAm: e.target.value })}
                                className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all font-black text-white placeholder-gray-700"
                                placeholder="..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 pl-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={newCategory.slug}
                                onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                                className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all font-black text-white placeholder-gray-700"
                                placeholder="slug..."
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-[#39FF14] text-black font-black text-[10px] uppercase tracking-[0.2em] py-5 px-6 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 h-[58px]"
                            >
                                <Plus className="w-5 h-5" />
                                {t.addCategory}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Categories List */}
                <div className="bg-[#1A1A1A] rounded-[3.5rem] shadow-2xl border border-gray-800 overflow-hidden">
                    <div className="p-10 border-b border-gray-800 bg-black/20">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight italic">{t.categories}</h2>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14] mx-auto mb-4"></div>
                            Processing...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest italic">
                            No categories yet. Add your first department above!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black border-b border-gray-800">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Slug</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">English</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Русский</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Հայերեն</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-black/40 transition-colors group">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <code className="text-[10px] bg-black border border-gray-800 text-[#39FF14] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                                    {category.slug}
                                                </code>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-white italic">
                                                {category.name?.en || '-'}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-gray-400">
                                                {category.name?.ru || '-'}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-gray-400">
                                                {category.name?.am || '-'}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id, category.name?.[lang] || category.slug)}
                                                    className="p-3 text-red-900/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
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
