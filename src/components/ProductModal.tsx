'use client';

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

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
}

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                >
                    <X className="w-6 h-6 text-gray-500" />
                </button>

                <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col h-full">
                    <div className="mb-auto">
                        {product.isLocal && (
                            <span className="inline-flex items-center gap-1.5 bg-kaiser-green-100 text-kaiser-green-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Kaiser Local Farm
                            </span>
                        )}
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                        <p className="text-2xl font-bold text-kaiser-green-700 mb-6">${product.price.toFixed(2)}</p>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {product.description || "Fresh, high-quality product sourced directly for you. Enjoy the best flavors of the season with this premium selection."}
                        </p>

                        <div className="bg-gray-50 rounded-xl p-5 mb-8">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Nutrition Facts</h3>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{product.nutrition?.calories || 120}</div>
                                    <div className="text-xs text-gray-500">Cals</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{product.nutrition?.protein || '2g'}</div>
                                    <div className="text-xs text-gray-500">Protein</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{product.nutrition?.carbs || '15g'}</div>
                                    <div className="text-xs text-gray-500">Carbs</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{product.nutrition?.fat || '0g'}</div>
                                    <div className="text-xs text-gray-500">Fat</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex items-center border border-gray-200 rounded-full px-4">
                            <button className="p-2 text-gray-500 hover:text-kaiser-green-700">-</button>
                            <span className="flex-1 text-center font-semibold">1</span>
                            <button className="p-2 text-gray-500 hover:text-kaiser-green-700">+</button>
                        </div>
                        <button
                            onClick={() => {
                                onAddToCart(product);
                                onClose();
                            }}
                            className="flex-[2] bg-kaiser-green-600 hover:bg-kaiser-green-700 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
