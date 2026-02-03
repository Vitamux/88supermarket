'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import { useCartStore } from "../store/useCartStore";

// Mock Data
const products = [
  {
    id: 1,
    name: "Organic Honeycrisp Apples",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=600&q=80",
    description: "Sustainably grown at the Kaiser Valley Orchard, these apples are hand-picked at peak ripeness. A story of tradition and organic excellence in every bite.",
    nutrition: { calories: 95, protein: "0.5g", carbs: "25g", fat: "0.3g" },
    isLocal: true
  },
  {
    id: 2,
    name: "Artisan Sourdough Bread",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1585476292452-85aa9916b0df?auto=format&fit=crop&w=600&q=80",
    description: "Leavened naturally for 48 hours and baked in stone ovens. Our sourdough tells the tale of wild yeast and premium ancient grains.",
    nutrition: { calories: 180, protein: "7g", carbs: "36g", fat: "1g" },
    isLocal: true
  },
  {
    id: 3,
    name: "Premium Grass-Fed Ribeye",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=600&q=80",
    description: "Sourced from free-roaming herds in the high pastures. This cut delivers exceptional marbling and robust flavor, respecting the animal and the land.",
    nutrition: { calories: 290, protein: "24g", carbs: "0g", fat: "22g" },
    isLocal: false
  },
  {
    id: 4,
    name: "Farm Fresh Eggs (Dozen)",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
    description: "Collected daily from happy, pasture-raised hens. These eggs feature vibrant orange yolks and superior richness, supporting small family farms.",
    nutrition: { calories: 70, protein: "6g", carbs: "0g", fat: "5g" },
    isLocal: true
  }
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const searchQuery = useCartStore((state) => state.searchQuery);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    addItem({ id: product.id, name: product.name, price: product.price });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow">
        {/* Dynamic Hero Section */}
        <section className="bg-gradient-to-br from-kaiser-green-50 to-white py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              Freshness Delivered <br />
              <span className="text-kaiser-green-600">Straight to Your Door</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Experience the finest selection of organic produce, premium meats, and artisan bakery items.
              Quality you can taste, service you can trust.
            </p>
            <button className="bg-kaiser-green-600 text-white text-lg font-semibold px-8 py-3 rounded-full hover:bg-kaiser-green-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              Shop Weekly Deals
            </button>
          </div>

          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-kaiser-green-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-yellow-100 rounded-full blur-3xl opacity-50"></div>
        </section>

        {/* Featured Categories */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Shop by Category</h2>

            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
              <CategoryCircle
                title="Bakery"
                image="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
              />
              <CategoryCircle
                title="Produce"
                image="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80"
              />
              <CategoryCircle
                title="Meat"
                image="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80"
              />
            </div>
          </div>
        </section>

        {/* Featured Products Teaser */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                <p className="text-gray-500 mt-1">Popular items this week</p>
              </div>
              <Link href="#" className="text-kaiser-green-600 font-medium hover:underline">View all</Link>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenModal={setSelectedProduct}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl">No products found for "{searchQuery}"</p>
                <p className="text-sm">Try searching for apples, bread, or meat.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <span className="text-2xl">🥬</span>
              <span className="font-bold text-xl">Kaiser</span>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Your neighborhood premium supermarket, digital and delivered.
            </p>
            <div className="text-sm space-y-2 opacity-80">
              <p>123 Kaiser Blvd, Fresh City</p>
              <p>Opening Hours:</p>
              <p className="font-semibold text-white">8 AM - 10 PM Daily</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Weekly Ads</Link></li>
              <li><Link href="#" className="hover:text-white">Fresh Produce</Link></li>
              <li><Link href="#" className="hover:text-white">Meat & Seafood</Link></li>
              <li><Link href="#" className="hover:text-white">Bakery</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white">Return Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/admin" className="hover:text-white opacity-50 text-xs mt-4 block">Admin Access</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Fresh</h4>
            <p className="text-sm mb-4 opacity-70">Subscribe for exclusive deals.</p>
            <div className="flex">
              <input type="email" placeholder="Email address" className="bg-gray-800 border-none rounded-l-lg px-4 py-2 w-full focus:ring-1 focus:ring-kaiser-green-500" />
              <button className="bg-kaiser-green-600 px-4 py-2 rounded-r-lg text-white font-medium hover:bg-kaiser-green-500">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm opacity-50">
          © {new Date().getFullYear()} Kaiser Supermarket. All rights reserved.
        </div>
      </footer>

      <ProductModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

function CategoryCircle({ title, image }: { title: string, image: string }) {
  return (
    <Link href="#" className="group flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl group-hover:border-kaiser-green-100 transition-all duration-300">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 128px, 160px"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
      </div>
      <span className="text-lg font-semibold text-gray-800 group-hover:text-kaiser-green-700 transition-colors">{title}</span>
    </Link>
  );
}
