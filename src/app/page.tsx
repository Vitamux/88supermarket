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
    // Helper to get searching name safely
    let nameToSearch = '';

    // 1. Try display_names for current lang
    if (product.display_names?.[lang]) {
      nameToSearch = product.display_names[lang];
    }
    // 2. Try product.name if it's an object
    else if (typeof product.name === 'object' && product.name !== null) {
      nameToSearch = product.name[lang] || product.name['am'] || product.name['ru'] || product.name['en'] || '';
      // Also allow searching by ANY of the names in the object? 
      // For now, let's just search the resolved name or maybe we should search stringified values.
      // Actually, better user experience: search matching any language? 
      // User asked: "It should search within the am (Armenian) key by default."
      // Let's just stick to the resolved name for now to avoid complexity, or checking all values.
      // Let's check all values for better search.
      const allNames = Object.values(product.name).join(' ').toLowerCase();
      if (allNames.includes(searchQuery.toLowerCase())) return true;
    }
    // 3. Fallback to string
    else if (typeof product.name === 'string') {
      nameToSearch = product.name;
    }

    const matchesSearch = nameToSearch.toLowerCase().includes(searchQuery.toLowerCase());
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
        <section className="bg-white py-24 md:py-40 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-3 mb-8 bg-[#39FF14]/10 border-2 border-[#39FF14]/20 px-6 py-2.5 rounded-full shadow-[0_0_30px_rgba(57,255,20,0.1)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#39FF14]"></span>
              </span>
              <span className="text-[12px] font-black text-gray-900 uppercase tracking-[0.3em]">Now Open: 8+ Locations</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black text-gray-900 mb-10 tracking-tighter leading-[0.9] uppercase italic">
              {t.heroTitle} <br />
              <span className="text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">{t.heroSubtitle}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-14 max-w-2xl mx-auto font-bold leading-relaxed italic opacity-80">
              Premium groceries delivered to your door. <br className="hidden md:block" /> Experience the convenience of 88 Supermarket.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); scrollToProductGrid(); }}
              className="bg-black text-[#39FF14] text-xs font-black uppercase tracking-[0.3em] px-14 py-6 rounded-[2rem] hover:bg-[#39FF14] hover:text-black shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(57,255,20,0.4)] transition-all transform hover:-translate-y-2 active:translate-y-0 border-2 border-black"
            >
              {t.shopCollection}
            </button>
          </div>

          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-[#39FF14]/5 rounded-full blur-[150px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] bg-[#39FF14]/10 rounded-full blur-[150px] opacity-20"></div>
        </section>

        {/* Featured Categories */}
        <section className="py-24 bg-gray-50 border-y-2 border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-20 px-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-2 bg-[#39FF14] rounded-full shadow-[0_0_10px_#39FF14]"></div>
                <h2 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.5em] italic">{t.browseAisles}</h2>
              </div>
              <div className="h-0.5 flex-1 bg-gray-200 mx-10 opacity-50"></div>
            </div>

            <div className="flex flex-wrap justify-center gap-10 md:gap-20">
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
        <section id="product-grid" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-12">
              {/* Sidebar */}
              <CategorySidebar
                activeCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              {/* Product Grid */}
              <div className="flex-1">
                <div className="flex justify-between items-end mb-16">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">
                      {selectedCategory === 'all'
                        ? (lang === 'en' ? 'All Products' : lang === 'ru' ? 'Все продукты' : 'Բոլոր ապրանքները')
                        : selectedCategory}
                      <span className="text-[#39FF14] ml-2">.</span>
                    </h2>
                    <div className="h-2 w-16 bg-[#39FF14] mt-4 rounded-full shadow-[0_4px_12px_rgba(57,255,20,0.4)]"></div>
                    <p className="text-gray-400 mt-6 text-[10px] font-black uppercase tracking-[0.3em]">
                      {filteredProducts.length} {t.resultsFound}
                    </p>
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                  <div className="text-center py-32 text-gray-400 bg-gray-50 rounded-[3rem] border-2 border-gray-100 shadow-inner">
                    <div className="mb-8 text-8xl opacity-10 inline-block animate-pulse">🔍</div>
                    <p className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight italic">{t.noProducts}</p>
                    <p className="text-gray-400 text-sm mb-12 font-medium">Try adjusting your filters or search query.</p>
                    <button
                      onClick={() => { setSelectedCategory("all"); setSearchQuery(''); }}
                      className="px-12 py-5 bg-black text-[#39FF14] text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-[#39FF14] hover:text-black transition-all active:scale-95 shadow-2xl"
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

      <footer className="bg-black text-gray-400 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#39FF14] shadow-[0_0_20px_#39FF14] opacity-50"></div>
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-16 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-10 text-[#39FF14]">
              <span className="font-black text-4xl tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.6)] italic">88 SUPERMARKET</span>
            </div>
            <p className="text-sm opacity-50 mb-10 leading-relaxed font-medium italic">
              Redefining the standard for premium online grocery shopping with 88 Supermarket's fulfillment.
            </p>
            <div className="text-[10px] space-y-4 opacity-80 uppercase tracking-[0.3em] font-black">
              <div className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full"></span> 88 Center Plaza, Armenian Highlands</div>
              <div className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full"></span> Opening Hours:</div>
              <p className="text-[#39FF14] bg-[#39FF14]/10 px-4 py-2 rounded-lg inline-block">8 AM - 11 PM Daily</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.5em] mb-10 italic">{t.shop}</h4>
            <ul className="space-y-5 text-xs font-black uppercase tracking-widest">
              <li><Link href="#" className="hover:text-[#39FF14] transition-all hover:translate-x-2 inline-block">Weekly Ads</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-all hover:translate-x-2 inline-block">{t.browseAisles}</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-all hover:translate-x-2 inline-block">Meat & Seafood</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-all hover:translate-x-2 inline-block">Bakery</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.5em] mb-10 italic">{t.support}</h4>
            <ul className="space-y-5 text-xs font-black uppercase tracking-widest">
              <li><Link href="#" className="hover:text-[#39FF14] transition-all hover:translate-x-2 inline-block">Help Center</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-all hover:translate-x-2 inline-block">Return Policy</Link></li>
              <li><Link href="#" className="hover:text-[#39FF14] transition-all hover:translate-x-2 inline-block">Contact Us</Link></li>
              <li><Link href="/admin" className="text-[#39FF14] opacity-50 hover:opacity-100 transition-all mt-10 block border-t border-gray-900 pt-5">ADMIN PORTAL</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.5em] mb-10 italic">{t.stayConnected}</h4>
            <p className="text-sm mb-8 opacity-50 leading-relaxed font-medium italic">{t.joinClub}</p>
            <div className="flex flex-col gap-4">
              <input type="email" placeholder="Email address" className="bg-gray-900/50 border-2 border-gray-800 rounded-2xl px-6 py-4 w-full focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none transition-all text-sm font-bold placeholder:text-gray-700" />
              <button className="bg-[#39FF14] px-6 py-4 rounded-2xl text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all active:scale-95 shadow-xl">
                {t.join}
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-900 mt-24 pt-10 text-center text-[8px] uppercase font-black tracking-[0.8em] opacity-20">
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
