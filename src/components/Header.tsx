'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "../store/useCartStore";
import { Search, ShoppingCart, Menu, User } from "lucide-react";

export default function Header() {
    const cartCount = useCartStore((state) => state.count());

    const setSearchQuery = useCartStore((state) => state.setSearchQuery);
    const searchQuery = useCartStore((state) => state.searchQuery);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <header className="bg-kaiser-green-700 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <span className="text-3xl">🥬</span>
                    <span>Kaiser Supermarket</span>
                </Link>

                <div className="hidden md:flex flex-1 max-w-xl mx-8">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search for apples, bread, milk..."
                            className="w-full bg-white/10 border border-white/20 rounded-full py-2 px-6 pl-12 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
                        />
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
                    </div>
                </div>

                <nav className="flex items-center gap-6 text-sm font-medium">
                    <div className="hidden sm:flex items-center gap-1 cursor-pointer hover:text-kaiser-green-100 transition-colors">
                        <Menu className="w-6 h-6" />
                        <span>Categories</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 cursor-pointer hover:text-kaiser-green-100 transition-colors">
                        <User className="w-6 h-6" />
                        <span className="hidden sm:inline">Account</span>
                    </div>
                    <Link href="/checkout" className="flex items-center gap-1 cursor-pointer hover:text-kaiser-green-100 transition-colors relative">
                        <ShoppingCart className="w-6 h-6" />
                        {mounted && cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-kaiser-accent text-kaiser-green-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce-elastic">
                                {cartCount}
                            </span>
                        )}
                        <span className="hidden sm:inline">Cart</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
