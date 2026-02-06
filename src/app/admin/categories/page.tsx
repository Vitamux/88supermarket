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
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="container mx-auto px-4 py-16 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-8 mb-16">
                    <button
                        onClick={() => router.push('/admin')}
                        className="p-5 bg-white border-2 border-gray-100 rounded-[1.5rem] hover:border-[#39FF14] hover:shadow-xl transition-all group"
                    >
                        <ArrowLeft className="w-8 h-8 text-gray-400 group-hover:text-[#39FF14] transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">88 <span className="text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">Categories</span></h1>
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2">{categories.length} active departments managed</p>
                    </div>
                </div>

                {/* Add Category Form */}
                <div className="bg-white rounded-[4rem] shadow-2xl border-2 border-gray-50 p-14 mb-16 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#39FF14] shadow-[5px_0_20px_rgba(57,255,20,0.2)]"></div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-12 flex items-center gap-4 italic">
                        <Plus className="w-8 h-8 text-[#39FF14]" />
                        {t.addCategory}
                    </h2>
                    <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 items-end">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 pl-1">
                                {t.categoryName} (EN)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameEn}
                                onChange={e => setNewCategory({ ...newCategory, nameEn: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-6 py-5 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none transition-all font-black text-gray-900 placeholder-gray-300"
                                placeholder="Grains..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 pl-1">
                                {t.categoryName} (RU)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameRu}
                                onChange={e => setNewCategory({ ...newCategory, nameRu: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-6 py-5 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none transition-all font-black text-gray-900 placeholder-gray-300"
                                placeholder="..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 pl-1">
                                {t.categoryName} (AM)
                            </label>
                            <input
                                type="text"
                                value={newCategory.nameAm}
                                onChange={e => setNewCategory({ ...newCategory, nameAm: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-6 py-5 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none transition-all font-black text-gray-900 placeholder-gray-300"
                                placeholder="..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 pl-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={newCategory.slug}
                                onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-6 py-5 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none transition-all font-black text-gray-900 placeholder-gray-300"
                                placeholder="grains..."
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-black text-[#39FF14] font-black text-[10px] uppercase tracking-[0.4em] py-6 px-8 rounded-[1.5rem] hover:bg-[#39FF14] hover:text-black transition-all shadow-2xl flex items-center justify-center gap-3 h-[68px] border-2 border-black active:scale-95"
                            >
                                <Plus className="w-6 h-6 stroke-[3px]" />
                                {t.addNew}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-[4rem] shadow-2xl border-2 border-gray-50 overflow-hidden">
                    <div className="p-12 border-b-2 border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">{t.categories}</h2>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm">
                            System Lock: Public Access
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-32 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#39FF14] border-t-transparent mx-auto mb-6 shadow-[0_0_20px_rgba(57,255,20,0.2)]"></div>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing Departments...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-32 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner border-2 border-white grayscale opacity-50">
                                📂
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">No Departments</h2>
                            <p className="text-gray-400 max-w-sm mx-auto font-medium italic">Initialize your inventory by adding your first category above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b-2 border-gray-50">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Slug Reference</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">English (Primary)</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Русский</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Հայերեն</th>
                                        <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Manage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-50">
                                    {categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-10 py-8 whitespace-nowrap">
                                                <code className="text-[10px] bg-black text-[#39FF14] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10">
                                                    {category.slug}
                                                </code>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap text-lg font-black text-gray-900 italic tracking-tighter">
                                                {category.name?.en || '-'}
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap text-sm font-black text-gray-400 tracking-tight">
                                                {category.name?.ru || '-'}
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap text-sm font-black text-gray-400 tracking-tight">
                                                {category.name?.am || '-'}
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id, category.name?.[lang] || category.slug)}
                                                    className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-[1.2rem] transition-all border-2 border-gray-50 bg-white shadow-sm"
                                                    title={t.deleteCategory}
                                                >
                                                    <Trash2 className="w-6 h-6" />
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
