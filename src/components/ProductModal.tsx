'use client';

import { X, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguageStore } from "../store/useLanguageStore";
import { translations } from "../lib/translations";

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    image_url?: string;
    description?: string;
    nutrition?: string;
    nutritional_info?: {
        calories?: number | string;
        protein?: string;
        carbs?: string;
        fat?: string;
    };
    isLocal?: boolean;
    stock_quantity?: number;
}

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
    const [quantity, setQuantity] = useState(1);
    const { lang } = useLanguageStore();
    const t = translations[lang];

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQuantity(1); // Reset quantity when modal opens
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const imageUrl = product.image_url || product.image || 'https://via.placeholder.com/400x400?text=No+Image';

    const isOutOfStock = (product.stock_quantity ?? 0) <= 0;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        // Add the item multiple times based on quantity
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-100 relative z-10 flex flex-col md:flex-row">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-gray-50 p-3 rounded-full hover:bg-gray-100 transition-all shadow-md active:scale-95 border border-gray-100"
                    aria-label="Close modal"
                >
                    <X className="w-6 h-6 text-gray-500" />
                </button>

                <div className="relative w-full md:w-1/2 h-72 md:h-auto bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-[#FF3131] text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(255,49,49,0.5)] border border-red-400/30 rotate-[-5deg]">
                                {t.outOfStockBadge}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:hidden" />
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col h-full bg-white">
                    <div className="mb-auto">
                        <div className="flex flex-col items-center mb-8">
                            <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.3em] mb-4">
                                {(product as any).category || '88 Selection'}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 text-center uppercase tracking-tight">{(product as any).display_names?.[lang] || product.name}</h2>
                            <div className="h-1 w-12 bg-[#39FF14] rounded-full shadow-sm mb-4"></div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{product.price.toFixed(0)} <span className="text-xs font-bold uppercase opacity-40">AMD</span></p>
                        </div>

                        <p className="text-gray-500 mb-10 leading-relaxed text-center font-medium">
                            {product.description || t.premiumFallback}
                        </p>

                        {((product as any).nutritional_info || product.nutrition) && (
                            <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100">
                                <h3 className="font-black text-gray-400 mb-6 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                    <div className="h-px w-8 bg-gray-200"></div>
                                    {t.nutritionalFacts}
                                    <div className="h-px w-8 bg-gray-200"></div>
                                </h3>
                                {product.nutritional_info ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 text-center tracking-widest">{t.calories}</p>
                                            <p className="text-xl font-black text-gray-900 text-center">{(product as any).nutritional_info?.calories || '0'}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 text-center tracking-widest">{t.protein}</p>
                                            <p className="text-xl font-black text-gray-900 text-center">{(product as any).nutritional_info?.protein || '0g'}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 text-center tracking-widest">{t.carbs}</p>
                                            <p className="text-xl font-black text-gray-900 text-center">{(product as any).nutritional_info?.carbs || '0g'}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 text-center tracking-widest">{t.fat}</p>
                                            <p className="text-xl font-black text-gray-900 text-center">{(product as any).nutritional_info?.fat || '0g'}</p>
                                        </div>
                                    </div>
                                ) : product.nutrition && (
                                    <p className="text-gray-500 whitespace-pre-line leading-relaxed text-sm bg-white p-4 rounded-xl border border-gray-100 text-center font-medium italic">{product.nutrition}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-3 text-gray-400 hover:text-[#39FF14] transition-colors"
                            >
                                <Minus className="w-5 h-5 stroke-[3px]" />
                            </button>
                            <span className="flex-1 text-center font-black text-xl text-gray-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-3 text-gray-400 hover:text-[#39FF14] transition-colors"
                            >
                                <Plus className="w-5 h-5 stroke-[3px]" />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`flex-[2] font-black text-xs uppercase tracking-widest py-5 px-8 rounded-2xl transition-all shadow-lg active:scale-95 ${isOutOfStock
                                    ? 'bg-gray-100 text-red-500 cursor-not-allowed border-2 border-red-500/20 opacity-80'
                                    : 'bg-[#39FF14] hover:bg-[#32E612] text-black hover:-translate-y-1'
                                }`}
                        >
                            {isOutOfStock ? t.outOfStockBadge : t.addToCart}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
