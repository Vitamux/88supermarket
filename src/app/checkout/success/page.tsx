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
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-elastic">
                    <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Received!</h1>
                <p className="text-xl text-kaiser-green-600 font-semibold mb-6">
                    {latestOrder ? `Order #${latestOrder.id}` : 'Order Processing...'}
                </p>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    We are currently picking your fresh items at Kaiser Supermarket.
                    You will receive a confirmation email shortly.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-500">
                    <p>Next: Our driver will navigate to your location.</p>
                </div>

                <Link
                    href="/"
                    className="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
