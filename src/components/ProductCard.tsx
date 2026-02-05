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
        <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <div
                className="aspect-square bg-gray-100 rounded-xl mb-4 relative overflow-hidden cursor-pointer"
                onClick={() => onOpenModal(product)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                            {t.outOfStockBadge}
                        </span>
                    </div>
                )}

                {product.isLocal && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <svg className="w-3 h-3 text-violet-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Local</span>
                    </div>
                )}
            </div>

            <div onClick={() => onOpenModal(product)} className="cursor-pointer">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-gray-500 text-sm truncate">{product.description || 'Premium selection'}</p>
            </div>

            <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-violet-700">${product.price.toFixed(2)}</span>
                <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`px-4 py-2 rounded-full transition-all font-semibold text-sm ${isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                            : isAdded
                                ? 'bg-fuchsia-500 text-white'
                                : 'bg-violet-600 hover:bg-violet-800 text-white shadow-md active:scale-95'
                        }`}
                >
                    {isOutOfStock ? t.soldOut : <Plus className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}
