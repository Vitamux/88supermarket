'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useCartStore } from '../../../store/useCartStore';
import { useState, useEffect } from 'react';

export default function SuccessPage() {
    // Get the latest order (first in the list since we prepend)
    const latestOrder = useCartStore((state) => state.orders[0]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-white"></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg p-10 rounded-3xl shadow-xl text-center">
                <div className="w-24 h-24 bg-[#39FF14]/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-elastic border-2 border-[#39FF14]/20 shadow-lg shadow-[#39FF14]/10">
                    <Check className="w-12 h-12 text-[#32E612]" strokeWidth={4} />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Order Received!</h1>
                <p className="text-xl text-black font-black mb-6 uppercase tracking-widest text-sm">
                    {latestOrder ? `Order #${latestOrder.id.slice(0, 8).toUpperCase()}` : 'Order Processing...'}
                </p>

                <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                    We are currently picking your fresh items at 88 Supermarket.
                    You will receive a confirmation email shortly.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-500">
                    <p>Next: Our driver will navigate to your location.</p>
                </div>

                <Link
                    href="/"
                    className="block w-full bg-black text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-[#39FF14] hover:text-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
