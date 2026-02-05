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
        <section className="bg-gradient-to-br from-etalon-violet-100 to-white py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              {t.heroTitle} <br />
              <span className="text-etalon-violet-600">{t.heroSubtitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Experience Etalon. Curated exclusively for those who demand the finest organic produce and artisanal goods.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); scrollToProductGrid(); }}
              className="bg-etalon-violet-600 text-white text-lg font-semibold px-8 py-3 rounded-full hover:bg-etalon-violet-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              {t.shopCollection}
            </button>
          </div>

          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-etalon-violet-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
        </section>

        {/* Featured Categories */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">{t.browseAisles}</h2>

            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
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
        <section id="product-grid" className="py-12 bg-gray-50 border-t border-gray-100">
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
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCategory === 'all'
                        ? (lang === 'en' ? 'All Products' : lang === 'ru' ? 'Все продукты' : 'Բոլոր ապրանքները')
                        : selectedCategory}
                    </h2>
                    <p className="text-gray-500 mt-1">
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
                          description: product.description || "Premium quality product.",
                          isLocal: product.category === 'Produce' || product.category === 'Bakery',
                          nutritional_info: { calories: 0, protein: "0g", carbs: "0g", fat: "0g" },
                          stock_quantity: product.stock_quantity
                        }}
                        onOpenModal={setSelectedProduct}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xl font-medium text-gray-900 mb-2">{t.noProducts}</p>
                    <p className="text-sm">Try adjusting your filters or search query.</p>
                    <button
                      onClick={() => { setSelectedCategory("all"); setSearchQuery(''); }}
                      className="mt-4 text-etalon-violet-600 font-medium hover:underline"
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

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6 text-white">
              <span className="font-extrabold text-2xl tracking-tighter text-etalon-violet-400">Etalon Market</span>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Defining the standard for premium online grocery shopping.
            </p>
            <div className="text-sm space-y-2 opacity-80">
              <p>Etalon Plaza, 77 Standard Ave</p>
              <p>Opening Hours:</p>
              <p className="font-semibold text-white">8 AM - 10 PM Daily</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t.shop}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Weekly Ads</Link></li>
              <li><Link href="#" className="hover:text-white">{t.browseAisles}</Link></li>
              <li><Link href="#" className="hover:text-white">Meat & Seafood</Link></li>
              <li><Link href="#" className="hover:text-white">Bakery</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t.support}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white">Return Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/admin" className="hover:text-white opacity-50 text-xs mt-4 block">Admin Access</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t.stayConnected}</h4>
            <p className="text-sm mb-4 opacity-70">{t.joinClub}</p>
            <div className="flex">
              <input type="email" placeholder="Email address" className="bg-gray-800 border-none rounded-l-lg px-4 py-2 w-full focus:ring-1 focus:ring-etalon-violet-500" />
              <button className="bg-etalon-violet-600 px-4 py-2 rounded-r-lg text-white font-medium hover:bg-etalon-violet-500">
                {t.join}
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm opacity-50">
          © {new Date().getFullYear()} Etalon Market. All rights reserved.
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
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl group-hover:border-etalon-violet-100 transition-all duration-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
      </div>
      <span className="text-lg font-semibold text-gray-800 group-hover:text-etalon-violet-700 transition-colors">{title}</span>
    </button>
  );
}
