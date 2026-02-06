'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search } from 'lucide-react';
import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../lib/translations';

interface CategorySidebarProps {
    activeCategory: string;
    onSelectCategory: (category: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

interface Category {
    id: number;
    slug: string;
    name: { en: string; ru: string; am: string;[key: string]: string };
}

export default function CategorySidebar({
    activeCategory,
    onSelectCategory,
    searchQuery,
    setSearchQuery
}: CategorySidebarProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const { lang, setLang } = useLanguageStore();
    const t = translations[lang];

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*');
            if (!error && data) {
                setCategories(data);
            }
        };
        fetchCategories();
    }, []);

    const allCategories = [
        // @ts-ignore - Supabase types are inferred differently for static items
        { slug: 'all', name: { en: 'All', ru: 'Все', am: 'Բոլորը' } },
        ...categories
    ];

    const flags = [
        { code: 'am', label: '🇦🇲' },
        { code: 'ru', label: '🇷🇺' },
        { code: 'en', label: '🇺🇸' },
    ] as const;

    return (
        <aside className="w-full md:w-64 flex-shrink-0 md:border-r border-gray-100 md:pr-8 mb-8 md:mb-0">
            {/* Search Bar */}
            <div className="relative mb-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchProducts}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#39FF14]/20 focus:border-[#39FF14] outline-none transition-all text-sm font-medium"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Language Switcher */}
            <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                {flags.map((flag) => (
                    <button
                        key={flag.code}
                        onClick={() => setLang(flag.code)}
                        className={`text-xl p-3 rounded-xl transition-all font-black ${lang === flag.code
                            ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20 scale-105'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                    >
                        {flag.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-4 w-1 bg-[#39FF14] rounded-full"></div>
                <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.3em]">
                    {t.categories}
                </h3>
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="flex md:hidden overflow-x-auto pb-6 gap-3 scrollbar-hide">
                {allCategories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onSelectCategory(category.slug)}
                        className={`whitespace-nowrap px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === category.slug
                            ? 'bg-black text-white shadow-xl scale-105'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        {category.name?.[lang] || category.name?.en || category.slug}
                    </button>
                ))}
            </div>

            {/* Desktop: Vertical List */}
            <div className="hidden md:flex flex-col gap-2">
                {allCategories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onSelectCategory(category.slug)}
                        className={`text-left px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === category.slug
                            ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/10 transform translate-x-2'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 group'
                            }`}
                    >
                        <span className="flex items-center justify-between">
                            {category.name?.[lang] || category.name?.en || category.slug}
                            {activeCategory === category.slug && (
                                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                            )}
                        </span>
                    </button>
                ))}
            </div>
        </aside>
    );
}
