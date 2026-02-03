'use client';

import Image from "next/image";
import { Plus } from "lucide-react";
import { useState } from "react";

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

interface ProductCardProps {
    product: Product;
    onOpenModal: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onOpenModal, onAddToCart }: ProductCardProps) {
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
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
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
                    className={`p-2 rounded-full transition-all active:scale-95 text-white ${isAdded ? 'bg-fuchsia-500' : 'bg-violet-600 hover:bg-violet-800 shadow-md'
                        }`}
                >
                    <Plus className={`w-5 h-5 ${isAdded ? 'text-white' : ''}`} />
                </button>
            </div>
        </div>
    );
}
