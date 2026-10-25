import React from 'react';
import { Product } from '../types';
import { formatIDR } from '../data/products';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  wishlistProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  wishlistProducts,
  onClose,
  onAddToCart,
  onRemoveFromWishlist,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F2] rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-[#E8DFD5] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E8DFD5] bg-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#8C533C] fill-[#8C533C]" />
            <h3 className="font-serif text-lg font-bold text-[#2C221E]">
              Kriya Favorit Anda
            </h3>
            <span className="text-xs bg-[#F2EAE1] text-[#8C533C] font-bold px-2 py-0.5 rounded-full tabular-nums">
              {wishlistProducts.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-10">
              <Heart className="w-10 h-10 mx-auto text-[#D5C6B7] stroke-1 mb-2" />
              <p className="text-xs text-[#7A7067]">
                Belum ada kriya yang disimpan ke daftar favorit.
              </p>
            </div>
          ) : (
            wishlistProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white rounded-xl border border-[#E8DFD5] flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => {
                    onClose();
                    onSelectProduct(p);
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 rounded-lg object-cover border border-[#E8DFD5] shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#2C221E] truncate">{p.name}</h4>
                    <span className="text-xs text-[#8C533C] font-semibold font-mono tabular-nums">
                      {formatIDR(p.price)}
                    </span>
                    <div className="text-[11px] text-[#A89F95]">{p.categoryLabel}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onAddToCart(p)}
                    className="p-2 bg-[#2C221E] hover:bg-[#8C533C] text-white text-xs rounded-lg transition-colors"
                    title="Tambah ke Keranjang"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(p.id)}
                    className="p-2 text-[#A89F95] hover:text-red-600 transition-colors"
                    title="Hapus dari Favorit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
