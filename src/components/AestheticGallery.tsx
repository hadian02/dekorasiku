import React, { useState } from 'react';
import { GalleryItem, Product } from '../types';
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '../data/gallery';
import { formatIDR } from '../data/products';
import { Heart, Maximize2, X, ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';

interface AestheticGalleryProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const AestheticGallery: React.FC<AestheticGalleryProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('semua');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [likedGalleryIds, setLikedGalleryIds] = useState<Record<string, boolean>>({});

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'semua') return true;
    return item.category === activeCategory;
  });

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedGalleryIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const currentLightboxItem =
    selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;

  const handleNextLightbox = () => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex((selectedItemIndex + 1) % filteredItems.length);
    }
  };

  const handlePrevLightbox = () => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex(
        (selectedItemIndex - 1 + filteredItems.length) % filteredItems.length
      );
    }
  };

  return (
    <section id="galeri" className="py-14 lg:py-22 bg-[#F5EFEB] border-y border-[#E8DFD5] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-semibold text-[#8C533C] tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspirasi Ruang & Lookbook</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#2C221E] tracking-tight">
              Galeri Foto Estetik & Kehangatan Ruang
            </h2>
            <p className="text-sm text-[#7A7067] mt-1.5 max-w-2xl leading-relaxed">
              Lihat bagaimana karya kerajinan tangan kami menghadirkan nuansa hangat, tenteram, dan bersahaja dalam berbagai sudut rumah Anda.
            </p>
          </div>

          {/* Interactive Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {GALLERY_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-[#2C221E] text-white border-[#2C221E]'
                      : 'bg-white/80 text-[#61574F] border-[#E8DFD5] hover:bg-white hover:text-[#2C221E]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lookbook Masonry / Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item, index) => {
            const isLiked = !!likedGalleryIds[item.id];
            const displayLikes = item.likes + (isLiked ? 1 : 0);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemIndex(index)}
                className="group relative cursor-pointer bg-white rounded-xl overflow-hidden border border-[#E8DFD5] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Photo Container */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-[#EAE2D8]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="p-3 bg-white/90 backdrop-blur-md rounded-full text-[#2C221E] shadow-sm">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Corner Category Tag */}
                  <div className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-[#8C533C] border border-[#E8DFD5]">
                    {item.categoryLabel}
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => toggleLike(e, item.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                      isLiked
                        ? 'bg-[#8C533C] text-white'
                        : 'bg-white/80 text-[#574E47] hover:text-[#8C533C]'
                    }`}
                    aria-label="Sukai foto ini"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Caption & Story Snippet */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#2C221E] group-hover:text-[#8C533C] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#7A7067] line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-center justify-between text-xs text-[#7A7067]">
                    <span className="text-[#8C533C] font-medium hover:underline flex items-center gap-1">
                      <span>Buka Detail & Kriya Terkait</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="tabular-nums font-mono">
                      {displayLikes} inspirasi
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Lightbox Modal */}
      {currentLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedItemIndex(null)}
        >
          <div
            className="relative bg-[#FAF7F2] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E8DFD5] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemIndex(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 text-[#2C221E] hover:bg-white shadow transition-colors"
              aria-label="Tutup Galeri"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevLightbox}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 text-[#2C221E] hover:bg-white shadow transition-colors hidden sm:block"
              aria-label="Foto Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextLightbox}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 text-[#2C221E] hover:bg-white shadow transition-colors hidden sm:block"
              aria-label="Foto Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Lightbox Split: Big Photo on Top / Left, Context & Shop The Look on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
              <div className="lg:col-span-7 bg-[#2C221E] flex items-center justify-center relative min-h-[300px] sm:min-h-[420px]">
                <img
                  src={currentLightboxItem.image}
                  alt={currentLightboxItem.title}
                  className="w-full h-full object-cover max-h-[60vh] lg:max-h-[85vh]"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Content Details */}
              <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#8C533C] font-semibold tracking-wide uppercase mb-2">
                    <span>{currentLightboxItem.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>Lookbook Kala Kriya</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2C221E] leading-snug">
                    {currentLightboxItem.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-[#61574F] leading-relaxed">
                    {currentLightboxItem.caption}
                  </p>

                  {/* Styling Tip Card */}
                  <div className="mt-5 p-3.5 bg-[#F2EAE1] rounded-xl border border-[#E5DACD]">
                    <div className="text-xs font-bold text-[#8C533C] flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tips Penataan Cozy:</span>
                    </div>
                    <p className="text-xs text-[#574E47] leading-relaxed">
                      {currentLightboxItem.stylingTip}
                    </p>
                  </div>

                  {/* Shop the Look / Kriya dalam Foto Ini */}
                  <div className="mt-6 pt-5 border-t border-[#E8DFD5]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-3">
                      Kriya dalam Foto Ini:
                    </h4>

                    <div className="space-y-2.5">
                      {currentLightboxItem.relatedProductIds.map((pId) => {
                        const relProd = products.find((p) => p.id === pId);
                        if (!relProd) return null;

                        return (
                          <div
                            key={relProd.id}
                            className="p-2.5 bg-white rounded-lg border border-[#E8DFD5] flex items-center justify-between gap-3 hover:border-[#D5C6B7] transition-all"
                          >
                            <div
                              onClick={() => {
                                setSelectedItemIndex(null);
                                onSelectProduct(relProd);
                              }}
                              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                            >
                              <img
                                src={relProd.image}
                                alt={relProd.name}
                                className="w-11 h-11 rounded object-cover border border-[#E8DFD5] shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#2C221E] truncate">
                                  {relProd.name}
                                </div>
                                <div className="text-[11px] text-[#8C533C] font-semibold tabular-nums font-mono">
                                  {formatIDR(relProd.price)}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => onAddToCart(relProd)}
                              className="px-2.5 py-1.5 bg-[#2C221E] hover:bg-[#8C533C] text-white text-[11px] font-semibold rounded flex items-center gap-1 shrink-0 transition-colors"
                              title="Beli Produk Ini"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Beli</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-6 pt-4 border-t border-[#E8DFD5] flex items-center justify-between text-xs text-[#7A7067]">
                  <button
                    onClick={(e) => toggleLike(e, currentLightboxItem.id)}
                    className="flex items-center gap-1.5 font-medium text-[#8C533C] hover:underline"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedGalleryIds[currentLightboxItem.id]
                          ? 'fill-[#8C533C] text-[#8C533C]'
                          : ''
                      }`}
                    />
                    <span>
                      {likedGalleryIds[currentLightboxItem.id]
                        ? 'Disimpan ke Favorit'
                        : 'Simpan Inspirasi'}
                    </span>
                  </button>

                  <span className="text-xs text-[#7A7067]">
                    Foto {(selectedItemIndex ?? 0) + 1} dari {filteredItems.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
