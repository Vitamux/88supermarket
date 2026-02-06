'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import CategorySidebar from "../components/CategorySidebar";
import { useCartStore } from "../store/useCartStore";
import { supabase } from "../lib/supabase";
import { useLanguageStore } from "../store/useLanguageStore";
import { translations } from "../lib/translations";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { lang } = useLanguageStore();
  const t = translations[lang];

  const addItem = useCartStore((state) => state.addItem);
  const searchQuery = useCartStore((state) => state.searchQuery);
  const setSearchQuery = useCartStore((state) => state.setSearchQuery);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
      } else if (data) {
        setProducts(data);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const currentName = product.display_names?.[lang] || product.name || '';
    const matchesSearch = currentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      display_names: product.display_names,
      price: product.price,
      image_url: product.image_url
    });
  };

  const scrollToProductGrid = () => {
    const grid = document.getElementById('product-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow">
        {/* Dynamic Hero Section */}
        <section className="bg-gray-50 py-20 md:py-32 relative overflow-hidden border-b border-gray-100">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 mb-6 bg-[#39FF14]/10 border border-[#39FF14]/20 px-4 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
              </span>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Now Open: 8+ Locations</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-none uppercase">
              {t.heroTitle} <br />
              <span className="text-[#39FF14] drop-shadow-[0_0_2px_rgba(57,255,20,0.5)]">{t.heroSubtitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Premium groceries delivered to your door. Experience the convenience of 88 Supermarket.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); scrollToProductGrid(); }}
              className="bg-[#39FF14] text-black text-xs font-black uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-[#32E612] shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_35px_rgba(57,255,20,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              {t.shopCollection}
            </button>
          </div>

          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-[100px] opacity-10"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#39FF14]/5 rounded-full blur-[100px] opacity-10"></div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-16 px-4">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{t.browseAisles}</h2>
              <div className="h-px flex-1 bg-gray-100 mx-8"></div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-14">
              <CategoryCircle
                title="Bakery"
                image="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
                onClick={() => { setSelectedCategory('Bakery'); scrollToProductGrid(); }}
              />
              <CategoryCircle
                title="Produce"
                image="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80"
                onClick={() => { setSelectedCategory('Produce'); scrollToProductGrid(); }}
              />
              <CategoryCircle
                title="Meat"
                image="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80"
                onClick={() => { setSelectedCategory('Meat'); scrollToProductGrid(); }}
              />
            </div>
          </div>
        </section>

        {/* Main Shop Section */}
        <section id="product-grid" className="py-20 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <CategorySidebar
                activeCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              {/* Product Grid */}
              <div className="flex-1">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">
                      {selectedCategory === 'all'
                        ? (lang === 'en' ? 'All Products' : lang === 'ru' ? 'Все продукты' : 'Բոլոր ապրանքները')
                        : selectedCategory}
                    </h2>
                    <div className="h-1 w-12 bg-[#39FF14] mt-2 rounded-full shadow-[0_0_4px_#39FF14]"></div>
                    <p className="text-gray-400 mt-4 text-xs font-bold uppercase tracking-widest">
                      {filteredProducts.length} {t.resultsFound}
                    </p>
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          name: product.display_names?.[lang] || product.name,
                          image: product.image_url || 'https://via.placeholder.com/300',
                          description: product.description,
                          isLocal: product.category === 'Produce' || product.category === 'Bakery',
                          stock_quantity: product.stock_quantity
                        }}
                        onOpenModal={setSelectedProduct}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="mb-6 text-6xl opacity-20">🔍</div>
                    <p className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{t.noProducts}</p>
                    <p className="text-gray-400 text-sm mb-8">Try adjusting your filters or search query.</p>
                    <button
                      onClick={() => { setSelectedCategory("all"); setSearchQuery(''); }}
                      className="px-8 py-3 bg-[#39FF14] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#32E612] transition-all active:scale-95 shadow-sm"
                    >
                      {t.clearFilters}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-8 text-[#39FF14]">
              <span className="font-black text-3xl tracking-tighter drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]">88 SUPERMARKET</span>
            </div>
            <p className="text-sm opacity-60 mb-8 leading-relaxed">
              Redefining the standard for premium online grocery shopping with 88 Supermarket's fulfillment.
            </p>
            <div className="text-xs space-y-3 opacity-90 uppercase tracking-widest font-bold">
              <p>88 Center Plaza, Armenian Highlands</p>
              <p>Opening Hours:</p>
              <p className="text-white">8 AM - 11 PM Daily</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">{t.shop}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="hover:text-[#39FF14] transition-colors">Weekly Ads</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-colors">{t.browseAisles}</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-colors">Meat & Seafood</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-colors">Bakery</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">{t.support}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="hover:text-[#39FF14] transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-colors">Return Policy</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-colors">Contact Us</Link></li>
              <li><Link href="/admin" className="hover:text-[#39FF14] opacity-30 text-[10px] mt-8 block">ADMIN PORTAL</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">{t.stayConnected}</h4>
            <p className="text-sm mb-6 opacity-60 leading-relaxed">{t.joinClub}</p>
            <div className="flex flex-col gap-3">
              <input type="email" placeholder="Email address" className="bg-gray-800 border-none rounded-xl px-4 py-3 w-full focus:ring-1 focus:ring-[#39FF14] focus:border-[#39FF14] outline-none transition-all text-sm" />
              <button className="bg-[#39FF14] px-4 py-3 rounded-xl text-black font-black text-xs uppercase tracking-widest hover:bg-[#32E612] transition-all shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                {t.join}
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-20 pt-8 text-center text-[10px] uppercase font-bold tracking-[0.3em] opacity-30">
          © {new Date().getFullYear()} 88 SUPERMARKET. ALL RIGHTS RESERVED.
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

function CategoryCircle({ title, image, onClick }: { title: string, image: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center gap-4 cursor-pointer focus:outline-none">
      <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-gray-100 shadow-md group-hover:border-[#39FF14] transition-all duration-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">{title}</span>
    </button>
  );
}
