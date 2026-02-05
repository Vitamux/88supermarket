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
        <aside className="w-full md:w-64 flex-shrink-0 md:border-r border-gray-200 md:pr-8 mb-8 md:mb-0">
            {/* Search Bar */}
            <div className="relative mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-etalon-violet-500 focus:border-transparent outline-none transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Language Switcher */}
            <div className="flex gap-2 mb-6">
                {flags.map((flag) => (
                    <button
                        key={flag.code}
                        onClick={() => setLang(flag.code)}
                        className={`text-xl p-2 rounded-lg transition-colors ${lang === flag.code
                            ? 'bg-violet-100 ring-1 ring-violet-200'
                            : 'hover:bg-gray-100'
                            }`}
                    >
                        {flag.label}
                    </button>
                ))}
            </div>

            <h3 className="font-bold text-gray-900 mb-4 px-2 hidden md:block">
                {t.categories}
            </h3>

            {/* Mobile: Horizontal Scroll */}
            <div className="flex md:hidden overflow-x-auto pb-4 gap-2 scrollbar-hide">
                {allCategories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onSelectCategory(category.slug)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category.slug
                            ? 'bg-violet-100 text-violet-900 shadow-sm ring-1 ring-violet-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category.name?.[lang] || category.name?.en || category.slug}
                    </button>
                ))}
            </div>

            {/* Desktop: Vertical List */}
            <div className="hidden md:flex flex-col gap-1">
                {allCategories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onSelectCategory(category.slug)}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeCategory === category.slug
                            ? 'bg-violet-100 text-violet-900 border-l-4 border-violet-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        {category.name?.[lang] || category.name?.en || category.slug}
                    </button>
                ))}
            </div>
        </aside>
    );
}
