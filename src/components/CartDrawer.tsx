import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatIDR } from '../data/products';
import { X, Trash2, ShoppingBag, Gift, Tag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  giftWrapping: boolean;
  appliedPromo: string;
  onClose: () => void;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onToggleGiftWrapping: () => void;
  onApplyPromo: (code: string) => { success: boolean; message: string };
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  giftWrapping,
  appliedPromo,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onToggleGiftWrapping,
  onApplyPromo,
  onProceedCheckout,
}) => {
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoFeedback, setPromoFeedback] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const giftCost = giftWrapping ? 15000 : 0;
  const discountRate = appliedPromo === 'KRIYAHANGAT' ? 0.1 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const total = subtotal - discountAmount + giftCost;

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = onApplyPromo(promoInput.trim());
    setPromoFeedback({ text: res.message, error: !res.success });
    if (res.success) {
      setPromoInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl border-l border-[#E8DFD5] flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#E8DFD5] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8C533C]" />
              <h2 className="font-serif text-lg font-bold text-[#2C221E]">
                Keranjang Belanja
              </h2>
              <span className="text-xs bg-[#F2EAE1] text-[#8C533C] font-bold px-2 py-0.5 rounded-full tabular-nums">
                {items.reduce((acc, i) => acc + i.quantity, 0)} barang
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1] transition-colors"
              aria-label="Tutup keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F2EAE1] flex items-center justify-center text-[#8C533C]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif text-base font-semibold text-[#2C221E]">
                  Keranjang Anda Masih Kosong
                </h3>
                <p className="text-xs text-[#7A7067] max-w-xs mx-auto">
                  Telusuri karya cangkir tembikar, baki jati, atau anyaman alami kami untuk menghangatkan rumah.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-5 py-2.5 bg-[#8C533C] text-white text-xs font-semibold rounded-lg hover:bg-[#73432F] transition-all"
                >
                  Lihat Koleksi Kriya
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-white rounded-xl border border-[#E8DFD5] flex gap-3 items-center"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover border border-[#E8DFD5] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#2C221E] truncate">
                      {item.product.name}
                    </h4>
                    <div className="text-xs text-[#8C533C] font-semibold font-mono tabular-nums mt-0.5">
                      {formatIDR(item.product.price)}
                    </div>

                    {/* Stepper & Trash */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-[#E8DFD5] rounded-md bg-[#FAF7F2] overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#574E47] hover:bg-[#E8DFD5]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#574E47] hover:bg-[#E8DFD5]"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-[#A89F95] hover:text-[#B91C1C] p-1 transition-colors"
                        title="Hapus barang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Gift Wrapping Toggle Option */}
            {items.length > 0 && (
              <div className="p-3 bg-[#F2EAE1] rounded-xl border border-[#E0D5C9] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Gift className="w-5 h-5 text-[#8C533C] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#2C221E]">
                      Kemasan Kado Estetik & Kartu
                    </div>
                    <div className="text-[11px] text-[#7A7067]">
                      Kertas samson, tali rami, & ucapan tulis tangan (+Rp 15.000)
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={giftWrapping}
                  onChange={onToggleGiftWrapping}
                  className="w-4 h-4 accent-[#8C533C] cursor-pointer rounded"
                />
              </div>
            )}

            {/* Voucher Code Form */}
            {items.length > 0 && (
              <div className="pt-2">
                <form onSubmit={handlePromoSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#A89F95] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Kode promo (coba: KRIYAHANGAT)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C] uppercase placeholder:normal-case font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#2C221E] hover:bg-[#43352F] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Gunakan
                  </button>
                </form>

                {promoFeedback && (
                  <div
                    className={`mt-1.5 text-[11px] ${
                      promoFeedback.error ? 'text-red-600' : 'text-[#3A4D39] font-medium'
                    }`}
                  >
                    {promoFeedback.text}
                  </div>
                )}
                {appliedPromo && (
                  <div className="mt-1 text-[11px] text-[#3A4D39] font-medium">
                    ✓ Promo aktif: <span className="font-bold">{appliedPromo}</span> (Diskon 10%)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E8DFD5] bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-[#7A7067]">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-mono tabular-nums text-[#2C221E]">
                    {formatIDR(subtotal)}
                  </span>
                </div>

                {giftWrapping && (
                  <div className="flex justify-between">
                    <span>Kemasan Kado & Kartu</span>
                    <span className="font-mono tabular-nums text-[#2C221E]">
                      {formatIDR(giftCost)}
                    </span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#3A4D39] font-medium">
                    <span>Diskon Promo</span>
                    <span className="font-mono tabular-nums">
                      -{formatIDR(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#F2ECE3] flex justify-between text-sm font-bold text-[#2C221E]">
                  <span>Total Perkiraan</span>
                  <span className="font-mono tabular-nums text-base text-[#8C533C]">
                    {formatIDR(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedCheckout}
                className="w-full py-3.5 bg-[#8C533C] hover:bg-[#73432F] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
