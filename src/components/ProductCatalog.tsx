import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, language, translateProduct } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const translatedProducts = useMemo(() => {
    return products.map(translateProduct);
  }, [products, translateProduct]);

  const filteredProducts = useMemo(() => {
    return translatedProducts
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
  }, [translatedProducts, activeCategory, searchQuery, sortBy]);

  const getCategoryLabel = (catId: string, defaultLabel: string) => {
    if (language !== 'en') return defaultLabel;
    switch (catId) {
      case 'semua':
        return 'All Crafts';
      case 'keramik':
        return 'Ceramics & Pottery';
      case 'anyaman':
        return 'Weaving & Natural Fibers';
      case 'kayu':
        return 'Woodcraft & Mini Furniture';
      case 'tekstil':
        return 'Textiles & Handloom';
      case 'aromaterapi':
        return 'Aromatherapy & Candles';
      default:
        return defaultLabel;
    }
  };

  return (
    <section id="koleksi" className="py-12 lg:py-18 bg-[#FAF7F2] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#8C533C] tracking-widest uppercase mb-1.5">
              {language === 'en' ? 'Curated Showcase' : 'Etalase Kurasi'}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C221E] tracking-tight">
              {t('catalog.title')}
            </h2>
            <p className="text-sm text-[#7A7067] mt-1 max-w-xl">
              {t('catalog.subtitle')}
            </p>
          </div>

          <div className="text-xs text-[#7A7067] font-medium">
            {language === 'en' ? 'Showing' : 'Menampilkan'}{' '}
            <span className="font-bold text-[#2C221E] tabular-nums">{filteredProducts.length}</span>{' '}
            {language === 'en' ? 'crafts' : 'karya'}
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
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                    isActive
                      ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-sm'
                      : 'bg-white text-[#61574F] border-[#E8DFD5] hover:bg-[#F2EAE1] hover:text-[#2C221E]'
                  }`}
                >
                  {getCategoryLabel(cat.id, cat.label)}
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
                placeholder={
                  language === 'en'
                    ? 'Search code (#0000101001), artisan workshop, craft name...'
                    : 'Cari kode barang (#0000101001), nama usaha pengrajin, produk...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-xs text-[#2C221E] bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C] focus:ring-1 focus:ring-[#8C533C] placeholder:text-[#A89F95] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F95] hover:text-[#2C221E] cursor-pointer"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#7A7067]" />
              <span className="text-xs text-[#7A7067]">{t('catalog.sort_label')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-medium text-[#2C221E] bg-white border border-[#E8DFD5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#8C533C] cursor-pointer"
              >
                <option value="featured">{t('catalog.sort_newest')}</option>
                <option value="price-asc">{t('catalog.sort_price_low')}</option>
                <option value="price-desc">{t('catalog.sort_price_high')}</option>
                <option value="rating">{t('catalog.sort_popular')}</option>
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
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DFD5] max-w-lg mx-auto p-8 shadow-xs">
            <div className="text-3xl mb-3">🏺</div>
            <h3 className="font-serif text-lg font-bold text-[#2C221E] mb-2">
              {language === 'en' ? 'No crafts match your search' : 'Tidak ada kriya yang sesuai'}
            </h3>
            <p className="text-xs text-[#7A7067] mb-5 leading-relaxed">
              {language === 'en'
                ? 'Try using different keywords or reset the category filters.'
                : 'Coba ubah kata kunci pencarian atau bersihkan filter kategori untuk melihat koleksi lainnya.'}
            </p>
            <button
              onClick={() => {
                setActiveCategory('semua');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#8C533C] text-white text-xs font-semibold rounded-lg hover:bg-[#73432F] transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Reset All Filters' : 'Reset Semua Filter'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
