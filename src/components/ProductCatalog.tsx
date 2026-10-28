import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  wishlistIds: string[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesCategory =
          activeCategory === 'semua' || item.category === activeCategory;
        const cleanQuery = searchQuery.trim().toLowerCase();
        const matchesSearch =
          cleanQuery === '' ||
          item.productCode?.toLowerCase().includes(cleanQuery) ||
          item.artisan.workshopName?.toLowerCase().includes(cleanQuery) ||
          item.name.toLowerCase().includes(cleanQuery) ||
          item.description.toLowerCase().includes(cleanQuery) ||
          item.artisan.name.toLowerCase().includes(cleanQuery) ||
          item.materials.some((m) => m.toLowerCase().includes(cleanQuery));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured default
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <section id="koleksi" className="py-12 lg:py-18 bg-[#FAF7F2] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#8C533C] tracking-widest uppercase mb-1.5">
              Etalase Kurasi
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C221E] tracking-tight">
              Koleksi Kriya Terpilih
            </h2>
            <p className="text-sm text-[#7A7067] mt-1 max-w-xl">
              Dibuat satu per satu dengan tangan terampil dan bahan alami nusantara untuk keindahan rumah yang abadi.
            </p>
          </div>

          <div className="text-xs text-[#7A7067] font-medium">
            Menampilkan <span className="font-bold text-[#2C221E] tabular-nums">{filteredProducts.length}</span> karya
          </div>
        </div>

        {/* Filter Bar & Controls */}
        <div className="space-y-4 mb-8">
          {/* Category Tabs (Segmented Interactive Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-sm'
                      : 'bg-white text-[#61574F] border-[#E8DFD5] hover:bg-[#F2EAE1] hover:text-[#2C221E]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#A89F95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kode barang (#0000101001), nama usaha pengrajin, produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-xs text-[#2C221E] bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C] focus:ring-1 focus:ring-[#8C533C] placeholder:text-[#A89F95] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F95] hover:text-[#2C221E]"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#7A7067]" />
              <span className="text-xs text-[#7A7067]">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-medium text-[#2C221E] bg-white border border-[#E8DFD5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#8C533C] cursor-pointer"
              >
                <option value="featured">Karya Pilihan</option>
                <option value="price-asc">Harga: Rendah ke Tinggi</option>
                <option value="price-desc">Harga: Tinggi ke Rendah</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid - 3 Columns Desktop, 2 Tablet, 1 Mobile */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#E8DFD5] p-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F2EAE1] flex items-center justify-center text-[#8C533C]">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2C221E]">
              Tidak Menemukan Kriya yang Dicari
            </h3>
            <p className="text-xs text-[#7A7067] mt-1 max-w-sm mx-auto">
              Cobalah mencari kata kunci lain seperti "keramik", "rotan", "jati", atau atur ulang kategori.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('semua');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-[#8C533C] bg-[#FAF7F2] hover:bg-[#F2EAE1] rounded-lg border border-[#E8DFD5] transition-colors"
            >
              Kembalikan Semua Kriya
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
