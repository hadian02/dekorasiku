import React from 'react';
import { Product } from '../types';
import { formatIDR } from '../data/products';
import { ShoppingBag, Heart, Star, Check } from 'lucide-react';

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
  const [justAdded, setJustAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      {/* Product Image Area - 68% Visual Weight */}
      <div className="relative aspect-4/3 w-full bg-[#F5EFEB] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            // Zero-broken image policy fallback container
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* Fallback pattern in case image fails */}
        <div className="absolute inset-0 -z-10 bg-[#EFE9E0] flex items-center justify-center text-xs text-[#8C533C]">
          Kala Kriya Atelier
        </div>

        {/* Subtle Text Tag (Single unboxed or clean label) */}
        {product.tag && (
          <div className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-[#8C533C] text-[11px] font-semibold px-2 py-0.5 rounded border border-[#E8DFD5]">
            {product.tag}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-[#8C533C] text-white shadow-sm'
              : 'bg-white/80 text-[#574E47] hover:text-[#8C533C] hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay Button on Hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className={`w-full py-2.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm ${
              justAdded
                ? 'bg-[#3A4D39] text-white'
                : 'bg-[#2C221E] hover:bg-[#8C533C] text-white active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Masuk Keranjang!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ Keranjang Cepat</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata with · separator */}
          <div className="flex items-center gap-1.5 text-xs text-[#7A7067] mb-1.5">
            <span>{product.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{product.artisan.location}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base font-semibold text-[#2C221E] group-hover:text-[#8C533C] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-[#7A7067] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Rating Bar */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
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
      </div>
    </article>
  );
};
