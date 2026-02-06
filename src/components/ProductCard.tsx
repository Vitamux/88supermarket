'use client';

// import Image from "next/image";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useLanguageStore } from "../store/useLanguageStore";
import { translations } from "../lib/translations";

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
        <div className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#39FF14]/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div
                className="aspect-square bg-gray-50 rounded-xl mb-4 relative overflow-hidden cursor-pointer border border-gray-100"
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
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                        <span className="bg-[#FF3131] text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,49,49,0.4)] border border-red-400/30">
                            {t.outOfStockBadge}
                        </span>
                    </div>
                )}

                {product.isLocal && (
                    <div className="absolute top-2 left-2 bg-[#39FF14] px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="text-[10px] font-black text-black uppercase tracking-wider">Local</span>
                    </div>
                )}
            </div>

            <div onClick={() => onOpenModal(product)} className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                        {(product as any).category || 'Premium'}
                    </span>
                </div>
                <h3 className="font-bold text-gray-900 truncate text-lg">{(product as any).display_names?.[lang] || product.name}</h3>
                <p className="text-gray-500 text-xs truncate mb-4">{product.description || '88 Supermarket Selection'}</p>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                    <span className="text-xl font-black text-gray-900 tracking-tighter">
                        {product.price.toFixed(0)} <span className="text-xs font-bold opacity-40 uppercase">AMD</span>
                    </span>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`p-3 rounded-xl transition-all shadow-lg active:scale-90 ${isOutOfStock
                        ? 'bg-gray-50 text-red-500 cursor-not-allowed border-2 border-red-500/20 shadow-none scale-95 opacity-80'
                        : isAdded
                            ? 'bg-black text-white shadow-xl'
                            : 'bg-[#39FF14] hover:bg-[#32E612] text-black shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)]'
                        }`}
                >
                    {isOutOfStock ? <span className="text-[10px] font-black uppercase tracking-widest px-1 drop-shadow-sm font-black">SOLD</span> : <Plus className="w-6 h-6 stroke-[3px]" />}
                </button>
            </div>
        </div>
    );
}
