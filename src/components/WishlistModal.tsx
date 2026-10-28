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
            wishlistProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              return (
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
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E8DFD5] shrink-0 bg-[#FAF7F2]">
                      <img
                        src={p.image}
                        alt={p.name}
                        className={`w-full h-full object-cover transition-all ${
                          isOutOfStock ? 'filter blur-[3px] grayscale-[30%] opacity-70' : ''
                        }`}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white uppercase bg-red-600 px-1 py-0.2 rounded">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-[#8C533C] font-semibold truncate">
                        {p.artisan.workshopName} · <span className="font-mono font-bold">#{p.productCode}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#2C221E] truncate">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#8C533C] font-semibold font-mono tabular-nums">
                          {formatIDR(p.price)}
                        </span>
                        <span className="text-[10px] text-[#D5C6B7]">·</span>
                        {isOutOfStock ? (
                          <span className="text-[10px] text-red-600 font-bold">Stok: 0</span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold">Stok: {p.stock}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => !isOutOfStock && onAddToCart(p)}
                      disabled={isOutOfStock}
                      className={`p-2 rounded-lg text-xs transition-colors ${
                        isOutOfStock
                          ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          : 'bg-[#2C221E] hover:bg-[#8C533C] text-white cursor-pointer'
                      }`}
                      title={isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onRemoveFromWishlist(p.id)}
                      className="p-2 text-[#A89F95] hover:text-red-600 transition-colors cursor-pointer"
                      title="Hapus dari Favorit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
