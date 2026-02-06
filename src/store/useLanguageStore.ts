import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ru' | 'am';

interface LanguageStore {
    lang: Language;
    setLang: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set) => ({
            lang: 'en',
            setLang: (lang) => set({ lang }),
        }),
        {
            name: 'eighty-eight-language-storage',
        }
    )
);
