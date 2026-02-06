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
                    className="absolute top-6 right-6 z-20 bg-white p-4 rounded-2xl hover:bg-[#39FF14] hover:text-black transition-all shadow-xl active:scale-95 border-2 border-gray-50 hover:border-[#39FF14]"
                    aria-label="Close modal"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="relative w-full md:w-1/2 h-80 md:h-auto bg-gray-50 p-6">
                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center">
                                <span className="bg-[#FF3131] text-white px-10 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(255,49,49,0.5)] border-2 border-red-400/30 rotate-[-5deg] scale-110">
                                    {t.outOfStockBadge}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col h-full bg-white relative">
                    <div className="mb-auto">
                        <div className="flex flex-col items-center mb-10 text-center">
                            <span className="text-[12px] font-black text-[#39FF14] uppercase tracking-[0.4em] mb-4 drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                                {(product as any).category || '88 Selection'}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">{(product as any).display_names?.[lang] || product.name}</h2>
                            <div className="h-1.5 w-16 bg-[#39FF14] rounded-full shadow-[0_0_10px_#39FF14] mb-6"></div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">
                                {product.price.toLocaleString()} <span className="text-xs font-black text-[#39FF14] uppercase tracking-widest ml-1">AMD</span>
                            </p>
                        </div>

                        <p className="text-gray-400 mb-12 leading-relaxed text-center font-medium italic text-lg opacity-80">
                            {product.description || t.premiumFallback}
                        </p>

                        {((product as any).nutritional_info || product.nutrition) && (
                            <div className="bg-gray-50 rounded-[2.5rem] p-8 mb-12 border-2 border-gray-100/50 shadow-inner">
                                <h3 className="font-black text-gray-400 mb-8 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                                    <div className="h-px w-10 bg-gray-200"></div>
                                    <span className="text-[#39FF14] drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">{t.nutritionalFacts}</span>
                                    <div className="h-px w-10 bg-gray-200"></div>
                                </h3>
                                {product.nutritional_info ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-50 flex flex-col items-center shadow-sm hover:border-[#39FF14]/30 transition-colors group">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest group-hover:text-[#39FF14] transition-colors">{t.calories}</p>
                                            <p className="text-2xl font-black text-gray-900">{(product as any).nutritional_info?.calories || '0'}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-50 flex flex-col items-center shadow-sm hover:border-[#39FF14]/30 transition-colors group">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest group-hover:text-[#39FF14] transition-colors">{t.protein}</p>
                                            <p className="text-2xl font-black text-gray-900">{(product as any).nutritional_info?.protein || '0g'}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-50 flex flex-col items-center shadow-sm hover:border-[#39FF14]/30 transition-colors group">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest group-hover:text-[#39FF14] transition-colors">{t.carbs}</p>
                                            <p className="text-2xl font-black text-gray-900">{(product as any).nutritional_info?.carbs || '0g'}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border-2 border-gray-50 flex flex-col items-center shadow-sm hover:border-[#39FF14]/30 transition-colors group">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest group-hover:text-[#39FF14] transition-colors">{t.fat}</p>
                                            <p className="text-2xl font-black text-gray-900">{(product as any).nutritional_info?.fat || '0g'}</p>
                                        </div>
                                    </div>
                                ) : product.nutrition && (
                                    <p className="text-gray-500 whitespace-pre-line leading-relaxed text-sm bg-white p-6 rounded-2xl border-2 border-gray-50 text-center font-bold italic shadow-sm">{product.nutrition}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-6 mt-auto">
                        <div className="flex-1 flex items-center bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-4 py-1">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-4 text-gray-300 hover:text-[#39FF14] transition-colors"
                            >
                                <Minus className="w-6 h-6 stroke-[4px]" />
                            </button>
                            <span className="flex-1 text-center font-black text-2xl text-gray-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-4 text-gray-300 hover:text-[#39FF14] transition-colors"
                            >
                                <Plus className="w-6 h-6 stroke-[4px]" />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`flex-[1.8] font-black text-xs uppercase tracking-[0.2em] py-6 px-10 rounded-[1.5rem] transition-all shadow-2xl active:scale-95 flex items-center justify-center ${isOutOfStock
                                ? 'bg-gray-100 text-red-500 cursor-not-allowed border-2 border-red-500/20 grayscale opacity-40'
                                : 'bg-black text-[#39FF14] hover:bg-[#39FF14] hover:text-black hover:-translate-y-2'
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
