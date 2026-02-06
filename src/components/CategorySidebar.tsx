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
        <aside className="w-full md:w-80 flex-shrink-0 md:border-r-2 border-gray-50 md:pr-10 mb-12 md:mb-0">
            {/* Search Bar */}
            <div className="relative mb-10 group">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchProducts}
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-14 pr-6 py-4.5 focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none transition-all text-sm font-black uppercase tracking-widest placeholder:text-gray-300 shadow-sm group-hover:border-gray-200"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-300 w-6 h-6 group-focus-within:text-[#39FF14] transition-colors" />
            </div>

            {/* Language Switcher */}
            <div className="flex gap-3 mb-12 overflow-x-auto pb-2 scrollbar-hide">
                {flags.map((flag) => (
                    <button
                        key={flag.code}
                        onClick={() => setLang(flag.code)}
                        className={`text-xl p-4 rounded-2xl transition-all font-black border-2 ${lang === flag.code
                            ? 'bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)] scale-105'
                            : 'bg-white text-gray-300 border-gray-50 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {flag.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 mb-8 px-2">
                <div className="h-6 w-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]"></div>
                <h3 className="font-black text-[12px] text-gray-900 uppercase tracking-[0.4em] italic">
                    {t.categories}
                </h3>
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="flex md:hidden overflow-x-auto pb-6 gap-4 scrollbar-hide">
                {allCategories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onSelectCategory(category.slug)}
                        className={`whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${activeCategory === category.slug
                            ? 'bg-black text-[#39FF14] border-black shadow-2xl scale-105'
                            : 'bg-white text-gray-400 border-gray-50 hover:bg-gray-50'
                            }`}
                    >
                        {category.name?.[lang] || category.name?.en || category.slug}
                    </button>
                ))}
            </div>

            {/* Desktop: Vertical List */}
            <div className="hidden md:flex flex-col gap-3">
                {allCategories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onSelectCategory(category.slug)}
                        className={`text-left px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${activeCategory === category.slug
                            ? 'bg-[#39FF14] text-black border-[#39FF14] shadow-[0_15px_30px_rgba(57,255,20,0.2)] transform translate-x-4 italic scale-105'
                            : 'bg-white text-gray-400 border-transparent hover:border-gray-100 hover:bg-gray-50 hover:text-gray-900 group'
                            }`}
                    >
                        <span className="flex items-center justify-between">
                            {category.name?.[lang] || category.name?.en || category.slug}
                            {activeCategory === category.slug ? (
                                <div className="w-2 h-2 rounded-full bg-black shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-[#39FF14] transition-colors"></div>
                            )}
                        </span>
                    </button>
                ))}
            </div>
        </aside>
    );
}
