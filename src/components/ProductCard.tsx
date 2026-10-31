import React from 'react';
import { Product } from '../types';
import { formatIDR } from '../data/products';
import { ShoppingBag, Heart, Star, Check, Store, PackageX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
}) => {
  const { language } = useLanguage();
  const [justAdded, setJustAdded] = React.useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  return (
    <article
      onClick={() => onSelectProduct(product)}
      className="group cursor-pointer flex flex-col bg-white rounded-xl border border-[#E8DFD5] overflow-hidden hover:border-[#D5C6B7] hover:shadow-md transition-all duration-200"
    >
      {/* Product Image Area - Buram jika stock === 0 */}
      <div className="relative aspect-4/3 w-full bg-[#F5EFEB] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isOutOfStock
              ? 'filter blur-[4px] grayscale-[35%] opacity-75 scale-105'
              : 'group-hover:scale-105 transition-transform duration-500 ease-out'
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* Fallback pattern in case image fails */}
        <div className="absolute inset-0 -z-10 bg-[#EFE9E0] flex items-center justify-center text-xs text-[#8C533C]">
          dekorasiku Atelier
        </div>

        {/* Overlay Buram & Label Stok Habis jika stock === 0 */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center z-10">
            <div className="px-3 py-1 bg-red-600/95 text-white text-[11px] font-bold uppercase tracking-wider rounded-md shadow-md flex items-center gap-1.5">
              <PackageX className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Sold Out (0)' : 'Stok Habis (0)'}</span>
            </div>
            <span className="text-[10px] text-white/90 mt-1.5 font-medium drop-shadow-sm">
              {language === 'en'
                ? 'Image blurred · Awaiting artisan crafting batch'
                : 'Foto diburamkan · Menunggu produksi pengrajin'}
            </span>
          </div>
        )}

        {/* 10-Digit Hexadecimal Product Code Badge (Top Left) */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 items-start">
          <div className="bg-[#2C221E]/85 backdrop-blur-md text-[#F5EFEB] text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs tracking-wider border border-white/20">
            #{product.productCode}
          </div>
          {product.tag && (
            <div className="bg-[#FAF7F2]/95 backdrop-blur-sm text-[#8C533C] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#E8DFD5]">
              {product.tag}
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? (language === 'en' ? "Remove from wishlist" : "Hapus dari wishlist") : (language === 'en' ? "Add to wishlist" : "Tambah ke wishlist")}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-[#8C533C] text-white shadow-sm'
              : 'bg-white/80 text-[#574E47] hover:text-[#8C533C] hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay Button on Hover (Disabled if out of stock) */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-2.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                justAdded
                  ? 'bg-[#3A4D39] text-white'
                  : 'bg-[#2C221E] hover:bg-[#8C533C] text-white active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Added to Cart!' : 'Masuk Keranjang!'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? '+ Quick Add' : '+ Keranjang Cepat'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Nama Usaha Pengrajin & Lokasi */}
          <div className="flex items-center gap-1.5 text-xs text-[#8C533C] font-semibold mb-1">
            <Store className="w-3.5 h-3.5 shrink-0 text-[#8C533C]" />
            <span className="truncate" title={product.artisan.workshopName}>
              {product.artisan.workshopName}
            </span>
          </div>

          {/* Kategori & Pembuat */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#7A7067] mb-1.5">
            <span>{product.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{language === 'en' ? 'by' : 'oleh'} {product.artisan.name}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base font-semibold text-[#2C221E] group-hover:text-[#8C533C] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-[#7A7067] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer: Price, Rating & Stock Display */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE3] space-y-2">
          {/* Price & Rating Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm sm:text-base text-[#2C221E] tabular-nums font-mono">
                {formatIDR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#A89F95] line-through tabular-nums font-mono">
                  {formatIDR(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-[#61574F]">
              <Star className="w-3.5 h-3.5 fill-[#D99B26] text-[#D99B26]" />
              <span className="font-medium tabular-nums">{product.rating}</span>
              <span className="text-[#A89F95] tabular-nums">({product.reviewCount})</span>
            </div>
          </div>

          {/* Baris Kode Barang & Jumlah Stock (Wajib Tampil Sesuai Permintaan) */}
          <div className="flex items-center justify-between pt-1 border-t border-dashed border-[#F2ECE3] text-[11px]">
            <div className="flex items-center gap-1 text-[#7A7067]">
              <span className="text-[10px] text-[#A89F95]">{language === 'en' ? 'Code:' : 'Kode:'}</span>
              <span className="font-mono font-bold text-[#574E47]">#{product.productCode}</span>
            </div>

            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                  {language === 'en' ? 'Stock: 0 (Sold)' : 'Stok: 0 (Habis)'}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {language === 'en' ? 'Stock:' : 'Stok:'}{' '}
                  <strong className="ml-1 font-mono font-bold">{product.stock}</strong>{' '}
                  {language === 'en' ? 'units' : 'unit'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
