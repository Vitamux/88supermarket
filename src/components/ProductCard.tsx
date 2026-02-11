'use client';

// import Image from "next/image";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useLanguageStore } from "../store/useLanguageStore";
import { translations } from "../lib/translations";
import { getTranslation } from "../lib/i18n";

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    description?: string;
    nutrition?: {
        calories: number;
        protein: string;
        carbs: string;
        fat: string;
    };
    isLocal?: boolean;
    stock_quantity?: number;
    display_names?: {
        en: string;
        ru: string;
        am: string;
        [key: string]: string;
    };
}

interface ProductCardProps {
    product: Product;
    onOpenModal: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onOpenModal, onAddToCart }: ProductCardProps) {
    const [isAdded, setIsAdded] = useState(false);
    const { lang } = useLanguageStore();
    const t = translations[lang];

    const isOutOfStock = (product.stock_quantity ?? 0) <= 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOutOfStock) return; // Prevent adding if out of stock
        onAddToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 500);
    };

    return (
        <div className="bg-white rounded-[2rem] p-5 border-2 border-gray-50 hover:border-[#39FF14]/30 hover:shadow-[0_20px_50px_rgba(57,255,20,0.1)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
            <div
                className="aspect-square bg-gray-50 rounded-2xl mb-6 relative overflow-hidden cursor-pointer border border-gray-100"
                onClick={() => onOpenModal(product)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center rounded-xl">
                        <span className="bg-[#FF3131] text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(255,49,49,0.4)] border border-red-400/30">
                            {t.outOfStockBadge}
                        </span>
                    </div>
                )}

                {product.isLocal && (
                    <div className="absolute top-3 left-3 bg-[#39FF14] text-black px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Local</span>
                    </div>
                )}
            </div>

            <div onClick={() => onOpenModal(product)} className="cursor-pointer mb-6 text-center">
                <div className="flex flex-col items-center gap-1 mb-2">
                    <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                        {(product as any).category || 'Premium Selection'}
                    </span>
                    <div className="h-0.5 w-8 bg-[#39FF14]/30 rounded-full group-hover:w-12 transition-all duration-500"></div>
                </div>
                <h3 className="font-black text-gray-900 truncate text-xl uppercase tracking-tighter italic">
                    {getTranslation(product.display_names || product.name, lang)}
                </h3>
                <p className="text-gray-400 text-xs truncate mt-1 font-medium italic opacity-60">
                    {/* Handle description being either a string (legacy) or object (new) with robust fallback */}
                    {getTranslation(product.description, lang) || '88 Supermarket Quality'}
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">
                        {product.price.toLocaleString()} <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest block -mt-1 drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">AMD</span>
                    </span>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`h-14 w-14 rounded-2xl transition-all shadow-xl active:scale-90 flex items-center justify-center border-2 ${isOutOfStock
                        ? 'bg-gray-50 text-red-500 border-red-500/10 grayscale opacity-40 shadow-none'
                        : isAdded
                            ? 'bg-black text-[#39FF14] border-black scale-110 shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                            : 'bg-[#39FF14] hover:bg-black text-black hover:text-[#39FF14] border-[#39FF14] shadow-[0_10px_20px_rgba(57,255,20,0.2)] hover:shadow-[0_15px_30px_rgba(57,255,20,0.3)]'
                        }`}
                >
                    {isOutOfStock ? (
                        <span className="text-[8px] font-black uppercase leading-none text-center">No<br />Stock</span>
                    ) : isAdded ? (
                        <div className="animate-bounce-elastic">
                            <Plus className="w-7 h-7 stroke-[4px]" />
                        </div>
                    ) : (
                        <Plus className="w-7 h-7 stroke-[4px]" />
                    )}
                </button>
            </div>
        </div>
    );
}
