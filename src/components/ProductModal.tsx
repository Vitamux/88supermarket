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

    const handleAddToCart = () => {
        // Add the item multiple times based on quantity
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-white/90 p-3 rounded-full hover:bg-white transition-all shadow-md active:scale-95"
                    aria-label="Close modal"
                >
                    <X className="w-6 h-6 text-gray-700" />
                </button>

                <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col h-full">
                    <div className="mb-auto">
                        {product.isLocal && (
                            <div className="flex justify-center mb-4">
                                <span className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    {t.etalonLocal}
                                </span>
                            </div>
                        )}
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{(product as any).display_names?.[lang] || product.name}</h2>
                        <p className="text-2xl font-bold text-violet-700 mb-6 text-center">{product.price.toFixed(0)} AMD</p>

                        <p className="text-gray-600 mb-8 leading-relaxed text-center">
                            {product.description || t.premiumFallback}
                        </p>

                        {((product as any).nutritional_info || product.nutrition) && (
                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-4 bg-etalon-violet-600 rounded-full"></span>
                                    {t.nutritionalFacts}
                                </h3>
                                {product.nutritional_info ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 text-center">{t.calories}</p>
                                            <p className="text-lg font-black text-gray-900 text-center">{product.nutritional_info?.calories || '0'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 text-center">{t.protein}</p>
                                            <p className="text-lg font-black text-gray-900 text-center">{product.nutritional_info?.protein || '0g'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 text-center">{t.carbs}</p>
                                            <p className="text-lg font-black text-gray-900 text-center">{product.nutritional_info?.carbs || '0g'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 text-center">{t.fat}</p>
                                            <p className="text-lg font-black text-gray-900 text-center">{product.nutritional_info?.fat || '0g'}</p>
                                        </div>
                                    </div>
                                ) : product.nutrition && (
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm bg-white p-4 rounded-xl border border-gray-100 text-center">{product.nutrition}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex items-center border border-gray-200 rounded-full px-4">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-2 text-gray-500 hover:text-violet-700"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="flex-1 text-center font-semibold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-2 text-gray-500 hover:text-violet-700"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {t.addToCart}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
