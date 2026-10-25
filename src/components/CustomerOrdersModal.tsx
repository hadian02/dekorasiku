import React, { useState } from 'react';
import { Customer, OrderDetails } from '../types';
import { formatIDR } from '../data/products';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MessageCircle,
  MapPin,
  ExternalLink,
  Zap,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  customer: Customer | null;
  orders: OrderDetails[];
  onClose: () => void;
  onOpenChatWithOrder: (orderId: string) => void;
  onExploreProducts: () => void;
  onConfirmReceipt?: (orderId: string) => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  customer,
  orders,
  onClose,
  onOpenChatWithOrder,
  onExploreProducts,
  onConfirmReceipt,
}) => {
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter orders matching current customer
  const customerOrders = customer
    ? orders.filter(
        (o) =>
          (o.customerEmail && o.customerEmail.toLowerCase() === customer.email.toLowerCase()) ||
          o.customerName.toLowerCase() === customer.name.toLowerCase()
      )
    : orders; // fallback to all recent orders if viewing as guest

  const handleCopy = (orderId: string) => {
    navigator.clipboard.writeText(`Nomor Pesanan Kala Kriya: #${orderId}`);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getStepNumber = (status: OrderDetails['orderStatus'], payStatus: OrderDetails['paymentStatus']) => {
    if (payStatus === 'menunggu_pembayaran' && status === 'menunggu_pembayaran') return 1;
    if (status === 'diproses') return 2;
    if (status === 'dikirim') return 3;
    if (status === 'selesai') return 4;
    return 2;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF7F2] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E8DFD5] my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DFD5] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8C533C]/10 text-[#8C533C] rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">
                Pesanan Saya & Lacak Kriya
              </h3>
              <p className="text-xs text-[#7A7067]">
                {customer ? (
                  <>
                    Memantau pesanan untuk{' '}
                    <span className="font-semibold text-[#2C221E]">{customer.name}</span> ({customer.email})
                  </>
                ) : (
                  'Daftar pesanan aktif studio'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1] transition-colors"
            aria-label="Tutup pesanan saya"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {customerOrders.length === 0 ? (
            /* Empty Orders State */
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#E8DFD5] p-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#F2EAE1] text-[#8C533C] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 opacity-70" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#2C221E]">
                Belum Ada Riwayat Pesanan
              </h4>
              <p className="text-xs text-[#7A7067] max-w-sm mx-auto leading-relaxed">
                Anda belum melakukan pemesanan kriya. Mulai jelajahi karya keramik bintik, baki jati, dan anyaman alami kami.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExploreProducts();
                }}
                className="mt-2 px-5 py-2.5 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <span>Mulai Belanja Kriya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            customerOrders.map((order) => {
              const currentStep = getStepNumber(order.orderStatus, order.paymentStatus);

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-xl border border-[#E8DFD5] p-5 shadow-xs hover:border-[#D5C6B7] transition-all space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE3] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#8C533C]">
                        #{order.orderId}
                      </span>
                      <button
                        onClick={() => handleCopy(order.orderId)}
                        className="p-1 text-[#A89F95] hover:text-[#2C221E] transition-colors"
                        title="Salin ID Pesanan"
                      >
                        {copiedOrderId === order.orderId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="text-xs text-[#7A7067]">·</span>
                      <span className="text-xs text-[#7A7067]">{order.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Payment Status Badge */}
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                          order.paymentStatus === 'terverifikasi_otomatis'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.paymentStatus === 'terverifikasi_manual'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.paymentStatus === 'terverifikasi_otomatis' && (
                          <>
                            <Zap className="w-3 h-3" />
                            <span>QRIS Lunas Otomatis</span>
                          </>
                        )}
                        {order.paymentStatus === 'terverifikasi_manual' && (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Lunas Terverifikasi</span>
                          </>
                        )}
                        {order.paymentStatus === 'menunggu_pembayaran' && (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Menunggu Pembayaran</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Progress Tracking Stepper */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {/* Step 1 */}
                      <div className="space-y-1.5 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep >= 1
                              ? 'bg-[#8C533C] text-white'
                              : 'bg-[#F2EAE1] text-[#7A7067]'
                          }`}
                        >
                          1
                        </div>
                        <div className="text-[11px] font-semibold text-[#2C221E]">
                          Pesanan Masuk
                        </div>
                        <div className="text-[10px] text-[#7A7067] hidden sm:block">
                          {order.paymentStatus === 'menunggu_pembayaran'
                            ? 'Menunggu Bayar'
                            : 'Pembayaran Lunas'}
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="space-y-1.5 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep >= 2
                              ? 'bg-[#8C533C] text-white'
                              : 'bg-[#F2EAE1] text-[#7A7067]'
                          }`}
                        >
                          2
                        </div>
                        <div className="text-[11px] font-semibold text-[#2C221E]">
                          Diproses Pengrajin
                        </div>
                        <div className="text-[10px] text-[#7A7067] hidden sm:block">
                          Quality Check Kriya
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="space-y-1.5 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep >= 3
                              ? 'bg-[#8C533C] text-white'
                              : 'bg-[#F2EAE1] text-[#7A7067]'
                          }`}
                        >
                          3
                        </div>
                        <div className="text-[11px] font-semibold text-[#2C221E]">
                          Dalam Pengiriman
                        </div>
                        <div className="text-[10px] text-[#7A7067] hidden sm:block">
                          {order.shippingMethod.split(' ')[0]}
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="space-y-1.5 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentStep >= 4
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#F2EAE1] text-[#7A7067]'
                          }`}
                        >
                          4
                        </div>
                        <div className="text-[11px] font-semibold text-[#2C221E]">
                          Sampai & Selesai
                        </div>
                        <div className="text-[10px] text-[#7A7067] hidden sm:block">
                          Diterima dengan Hangat
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs pt-2 border-t border-[#F2ECE3]">
                    {/* Items */}
                    <div className="sm:col-span-6 space-y-1.5">
                      <span className="font-bold text-[#8C533C] uppercase tracking-wider text-[11px]">
                        Karya Dipesan:
                      </span>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[#61574F]">
                          <span className="truncate pr-2">
                            {it.product.name} × {it.quantity}
                          </span>
                          <span className="font-mono tabular-nums text-[#2C221E] shrink-0">
                            {formatIDR(it.product.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.giftWrapping && (
                        <div className="text-[11px] text-[#8C533C]">
                          + Termasuk Kemasan Kado & Kartu Ucapan
                        </div>
                      )}
                    </div>

                    {/* Shipping & Delivery Location */}
                    <div className="sm:col-span-6 space-y-1 text-[#61574F]">
                      <span className="font-bold text-[#8C533C] uppercase tracking-wider text-[11px]">
                        Alamat Pengiriman:
                      </span>
                      <div className="font-semibold text-[#2C221E]">{order.customerName}</div>
                      <p className="leading-relaxed">
                        {order.address}, {order.city}
                      </p>
                      {order.coordinates && (
                        <div className="flex items-center gap-1 text-[11px] text-[#3A4D39] font-mono mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>
                            Titik Google Map: {order.coordinates.lat.toFixed(4)}, {order.coordinates.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Escrow Confirmation Banner if Shipped or Completed */}
                  {order.customerConfirmedReceipt ? (
                    <div className="p-3 bg-[#EBF3EA] rounded-lg border border-[#D0E2CE] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[#245920]">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>
                          <strong>Kriya Telah Diterima</strong> pada {order.customerConfirmedAt || 'Hari Ini'}. Dana penjualan telah berhasil diteruskan ke rekening pengrajin mitra.
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Escrow Dicairkan
                      </span>
                    </div>
                  ) : order.orderStatus === 'dikirim' ? (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 text-[#5C4524]">
                        <div className="font-bold flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-700" />
                          <span>Paket Sedang Dalam Pengiriman Ekspedisi</span>
                        </div>
                        <p className="text-[11px] text-[#7A6242]">
                          Sudah menerima paket kriya dalam kondisi utuh? Klik konfirmasi untuk meneruskan pembayaran ke pengrajin mitra.
                        </p>
                      </div>

                      {onConfirmReceipt && (
                        <button
                          onClick={() => onConfirmReceipt(order.orderId)}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap self-end sm:self-auto transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Konfirmasi Kriya Telah Diterima</span>
                        </button>
                      )}
                    </div>
                  ) : null}

                  {/* Total & Action Footer */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#E8DFD5]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-[#7A7067]">Total Tagihan:</span>
                      <span className="font-mono text-base font-bold text-[#8C533C] tabular-nums">
                        {formatIDR(order.total)}
                      </span>
                      <span className="text-[11px] text-[#7A7067]">({order.paymentMethod.split(' ')[0]})</span>
                    </div>

                    {/* Direct Chat Button with this Order */}
                    <button
                      onClick={() => {
                        onClose();
                        onOpenChatWithOrder(order.orderId);
                      }}
                      className="px-3.5 py-2 bg-[#2C221E] hover:bg-[#8C533C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#D9C3B0]" />
                      <span>Chat Studio tentang Pesanan Ini</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#E8DFD5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#7A7067]">
            <ShieldCheck className="w-4 h-4 text-[#3A4D39]" />
            <span>Garansi ganti kriya pecah selama dalam perjalanan</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] font-semibold rounded-lg border border-[#E8DFD5] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
