import React, { useState } from 'react';
import { Product } from '../types';
import { formatIDR } from '../data/products';
import { parseProductCode } from '../utils/productCode';
import {
  X,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Star,
  Check,
  Store,
  Tag,
  PackageX,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailModalProps {
  product: Product | null;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product: rawProduct,
  isWishlisted,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
}) => {
  const { language, translateProduct, getMaterialHexLabel } = useLanguage();
  const product = rawProduct ? translateProduct(rawProduct) : null;
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'code'>('desc');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // CRITICAL FIX: Only reset activeTab, quantity, and selectedImage when product ID changes,
  // NOT on every re-render (which previously reset activeTab immediately back to 'desc').
  React.useEffect(() => {
    if (rawProduct) {
      setSelectedImage(rawProduct.image);
      setQuantity(1);
      setActiveTab('desc');
      setAddedSuccess(false);
    }
  }, [rawProduct?.id]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const parsedCode = parseProductCode(product.productCode);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const images = product.secondaryImages && product.secondaryImages.length > 0
    ? product.secondaryImages
    : [product.image];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF7F2] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E8DFD5] my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD5] bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-[#7A7067]">
            <span className="font-semibold text-[#8C533C]">{product.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-[#2C221E] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8DFD5]">
              {language === 'en' ? 'Code:' : 'Kode:'} #{product.productCode}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1] transition-colors cursor-pointer touch-manipulation"
            aria-label={language === 'en' ? 'Close product details' : 'Tutup detail produk'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Image Gallery Viewer */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border border-[#E8DFD5] bg-[#F5EFEB]">
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isOutOfStock ? 'filter blur-[5px] grayscale-[35%] opacity-75' : ''
                  }`}
                  referrerPolicy="no-referrer"
                />

                {/* Overlay saat Stok 0 */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-10">
                    <div className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-lg flex items-center gap-1.5">
                      <PackageX className="w-4 h-4" />
                      <span>{language === 'en' ? 'Sold Out (0 Units)' : 'Stok Habis (0 Unit)'}</span>
                    </div>
                    <p className="text-xs text-white/95 mt-2 font-medium max-w-xs drop-shadow-sm">
                      {language === 'en'
                        ? 'Product image is blurred because current stock is depleted. Please contact the artisan for the next production schedule.'
                        : 'Foto produk diburamkan karena stok saat ini habis. Silakan hubungi pengrajin untuk jadwal produksi berikutnya.'}
                    </p>
                  </div>
                )}

                {product.tag && (
                  <div className="absolute top-3 left-3 bg-white/95 text-[#8C533C] text-[11px] font-semibold px-2.5 py-0.5 rounded border border-[#E8DFD5] z-20">
                    {product.tag}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer touch-manipulation ${
                        selectedImage === img
                          ? 'border-[#8C533C] shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt="Thumbnail"
                        className={`w-full h-full object-cover ${
                          isOutOfStock ? 'filter blur-[2px]' : ''
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Artisan Business Profile Card */}
              <div className="mt-4 p-4 rounded-xl bg-white border border-[#E8DFD5] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C533C] uppercase tracking-wider">
                    <Store className="w-4 h-4" />
                    <span>{language === 'en' ? 'Partner Artisan Studio' : 'Usaha Pengrajin Mitra'}</span>
                  </div>
                  <span className="text-[10px] text-[#7A7067] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8DFD5]">
                    {language === 'en' ? 'Artisan' : 'Pengrajin'} #{parsedCode.artisanHex}
                  </span>
                </div>

                <div className="text-base font-serif font-bold text-[#2C221E]">
                  {product.artisan.workshopName}
                </div>

                <div className="text-xs text-[#574E47] font-medium flex items-center gap-2">
                  <span>
                    {language === 'en' ? 'Owner:' : 'Pemilik:'} <strong>{product.artisan.name}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{product.artisan.location}</span>
                </div>

                <p className="text-xs text-[#7A7067] leading-relaxed pt-1 border-t border-[#F2ECE3]">
                  {product.artisan.bio}
                </p>
              </div>
            </div>

            {/* Right Column: Contiguous Purchase Module */}
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                {/* Nama Usaha Badge */}
                <div className="inline-flex items-center gap-1.5 text-xs text-[#8C533C] font-semibold bg-[#8C533C]/10 px-2.5 py-1 rounded-md mb-2">
                  <Store className="w-3.5 h-3.5" />
                  <span>{product.artisan.workshopName}</span>
                </div>

                <h2 className="font-serif text-2xl font-semibold text-[#2C221E] leading-snug">
                  {product.name}
                </h2>

                {/* Rating & Stock Counter */}
                <div className="mt-2.5 flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1 text-[#61574F]">
                    <Star className="w-4 h-4 fill-[#D99B26] text-[#D99B26]" />
                    <span className="font-bold tabular-nums">{product.rating}</span>
                    <span className="text-[#A89F95]">
                      {language === 'en'
                        ? `(${product.reviewCount} ${product.reviewCount === 1 ? 'review' : 'reviews'})`
                        : `(${product.reviewCount} ulasan)`}
                    </span>
                  </div>
                  <span aria-hidden="true" className="text-[#D5C6B7]">·</span>

                  {/* Stock Display */}
                  {isOutOfStock ? (
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-800 font-bold rounded border border-red-200">
                      {language === 'en' ? 'Sold Out (0 units)' : 'Stok Habis (0 unit)'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-semibold rounded border border-emerald-200">
                      {language === 'en' ? 'Available Stock:' : 'Stok Tersedia:'}{' '}
                      <strong className="font-bold font-mono">{product.stock}</strong>{' '}
                      {language === 'en' ? (product.stock === 1 ? 'unit' : 'units') : 'unit'}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#2C221E] font-mono tabular-nums">
                    {formatIDR(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-[#A89F95] line-through font-mono tabular-nums">
                      {formatIDR(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Information Tabs (Red Box) with Reliable Click & Touch Switching */}
                <div className="mt-6 border-b border-[#E8DFD5] flex gap-2 sm:gap-4 text-xs font-semibold overflow-x-auto relative z-10 scrollbar-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('desc');
                    }}
                    className={`pb-2.5 px-1 border-b-2 whitespace-nowrap cursor-pointer touch-manipulation transition-all duration-150 ${
                      activeTab === 'desc'
                        ? 'border-[#8C533C] text-[#8C533C] font-bold'
                        : 'border-transparent text-[#7A7067] hover:text-[#2C221E]'
                    }`}
                  >
                    {language === 'en' ? 'Description' : 'Deskripsi'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('specs');
                    }}
                    className={`pb-2.5 px-1 border-b-2 whitespace-nowrap cursor-pointer touch-manipulation transition-all duration-150 ${
                      activeTab === 'specs'
                        ? 'border-[#8C533C] text-[#8C533C] font-bold'
                        : 'border-transparent text-[#7A7067] hover:text-[#2C221E]'
                    }`}
                  >
                    {language === 'en' ? 'Materials & Dimensions' : 'Bahan & Ukuran'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('care');
                    }}
                    className={`pb-2.5 px-1 border-b-2 whitespace-nowrap cursor-pointer touch-manipulation transition-all duration-150 ${
                      activeTab === 'care'
                        ? 'border-[#8C533C] text-[#8C533C] font-bold'
                        : 'border-transparent text-[#7A7067] hover:text-[#2C221E]'
                    }`}
                  >
                    {language === 'en' ? 'Care Guide' : 'Perawatan'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('code');
                    }}
                    className={`pb-2.5 px-1 border-b-2 whitespace-nowrap cursor-pointer touch-manipulation flex items-center gap-1 transition-all duration-150 ${
                      activeTab === 'code'
                        ? 'border-[#8C533C] text-[#8C533C] font-bold'
                        : 'border-transparent text-[#7A7067] hover:text-[#2C221E]'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{language === 'en' ? '10-Digit Code' : 'Kode Barang 10-Digit'}</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="py-4 text-xs sm:text-sm text-[#61574F] leading-relaxed min-h-[90px]">
                  {activeTab === 'desc' && <p>{product.description}</p>}
                  {activeTab === 'specs' && (
                    <div className="space-y-2">
                      <div>
                        <span className="font-bold text-[#2C221E]">
                          {language === 'en' ? 'Materials:' : 'Material:'}{' '}
                        </span>
                        <span>{product.materials.join(', ')}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#2C221E]">
                          {language === 'en' ? 'Dimensions:' : 'Dimensi:'}{' '}
                        </span>
                        <span>{product.dimensions}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#2C221E]">
                          {language === 'en' ? 'Workshop Name:' : 'Nama Usaha:'}{' '}
                        </span>
                        <span>{product.artisan.workshopName}</span>
                      </div>
                    </div>
                  )}
                  {activeTab === 'care' && <p>{product.careGuide}</p>}
                  {activeTab === 'code' && (
                    <div className="p-3 bg-white rounded-lg border border-[#E8DFD5] space-y-2 text-xs">
                      <div className="font-mono font-bold text-sm text-[#2C221E] tracking-widest bg-[#FAF7F2] p-2 rounded border border-[#E8DFD5] text-center">
                        #{product.productCode}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div className="p-2 bg-[#FAF7F2] rounded border border-[#E8DFD5]">
                          <div className="font-bold text-[#8C533C]">Digit 1 - 5 (Hex)</div>
                          <div className="font-mono font-bold text-[#2C221E]">{parsedCode.artisanHex}</div>
                          <div className="text-[10px] text-[#7A7067]">
                            {language === 'en'
                              ? `Artisan Sequence No. (#${parsedCode.artisanSeqDec})`
                              : `No. Urut Pengrajin (#{parsedCode.artisanSeqDec})`}
                          </div>
                        </div>
                        <div className="p-2 bg-[#FAF7F2] rounded border border-[#E8DFD5]">
                          <div className="font-bold text-[#8C533C]">Digit 6 - 7 (Hex)</div>
                          <div className="font-mono font-bold text-[#2C221E]">{parsedCode.materialHex}</div>
                          <div className="text-[10px] text-[#7A7067]">
                            {getMaterialHexLabel(parsedCode.materialHex)}
                          </div>
                        </div>
                        <div className="p-2 bg-[#FAF7F2] rounded border border-[#E8DFD5]">
                          <div className="font-bold text-[#8C533C]">Digit 8 - 10 (Hex)</div>
                          <div className="font-mono font-bold text-[#2C221E]">{parsedCode.itemHex}</div>
                          <div className="text-[10px] text-[#7A7067]">
                            {language === 'en'
                              ? `Item Sequence No. (#${parsedCode.itemSeqDec})`
                              : `No. Urut Barang (#{parsedCode.itemSeqDec})`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity Stepper */}
                {!isOutOfStock ? (
                  <div className="mt-2 pt-3 border-t border-[#E8DFD5] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#2C221E]">
                        {language === 'en' ? 'Quantity:' : 'Jumlah:'}
                      </span>
                      <div className="flex items-center border border-[#E8DFD5] rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-1.5 text-xs text-[#574E47] hover:bg-[#F2EAE1] transition-colors cursor-pointer touch-manipulation"
                          aria-label={language === 'en' ? 'Decrease quantity' : 'Kurangi jumlah'}
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-xs font-semibold text-[#2C221E] font-mono tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-3 py-1.5 text-xs text-[#574E47] hover:bg-[#F2EAE1] transition-colors cursor-pointer touch-manipulation"
                          aria-label={language === 'en' ? 'Increase quantity' : 'Tambah jumlah'}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-[#7A7067]">
                      {language === 'en'
                        ? `Max order: ${product.stock} units`
                        : `Maksimal order: ${product.stock} unit`}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800">
                    <strong>{language === 'en' ? 'Stock Notice:' : 'Pemberitahuan Stok:'}</strong>{' '}
                    {language === 'en'
                      ? 'This handcrafted item is currently sold out. The artisan is crafting the next batch.'
                      : 'Kriya ini sedang habis terjual. Pengrajin sedang memproduksi batch berikutnya.'}
                  </div>
                )}
              </div>

              {/* Action Buttons & Trust Strip */}
              <div className="mt-6 pt-4 border-t border-[#E8DFD5] space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer touch-manipulation ${
                      isOutOfStock
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                        : addedSuccess
                        ? 'bg-[#3A4D39] text-white'
                        : 'bg-[#2C221E] hover:bg-[#43352F] text-white active:scale-[0.98]'
                    }`}
                  >
                    {isOutOfStock ? (
                      <>
                        <PackageX className="w-4 h-4" />
                        <span>{language === 'en' ? 'Sold Out (0)' : 'Stok Habis (0)'}</span>
                      </>
                    ) : addedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{language === 'en' ? 'Added to Cart!' : 'Berhasil Ditambahkan!'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{language === 'en' ? '+ Add to Cart' : '+ Tambah ke Keranjang'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onBuyNow(product, quantity)}
                    disabled={isOutOfStock}
                    className={`py-3 px-5 font-semibold text-xs rounded-lg transition-all cursor-pointer touch-manipulation ${
                      isOutOfStock
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-[#8C533C] hover:bg-[#73432F] text-white active:scale-[0.98]'
                    }`}
                  >
                    {language === 'en' ? 'Buy Now' : 'Beli Langsung'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product.id)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer touch-manipulation ${
                      isWishlisted
                        ? 'border-[#8C533C] bg-[#8C533C] text-white'
                        : 'border-[#E8DFD5] bg-white text-[#574E47] hover:text-[#8C533C]'
                    }`}
                    aria-label={language === 'en' ? 'Save to wishlist' : 'Simpan ke wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Delivery & Assurance info */}
                <div className="flex items-center justify-between text-[11px] text-[#7A7067] pt-1">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#8C533C]" />
                    <span>{language === 'en' ? 'Ships Across Indonesia' : 'Siap Kirim se-Indonesia'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3A4D39]" />
                    <span>{language === 'en' ? 'Fragile Replacement Guarantee' : 'Garansi Ganti Barang Pecah'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
