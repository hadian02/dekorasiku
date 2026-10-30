import React, { useState } from 'react';
import { Customer, OrderDetails, Product } from '../types';
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
  Copy,
  CreditCard,
  XCircle,
  Ban,
  Store,
  Sparkles
} from 'lucide-react';
import { PaymentInstructionModal } from './PaymentInstructionModal';

export type CustomerOrderTab = 'belum_selesai' | 'selesai' | 'dibatalkan';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  customer: Customer | null;
  orders: OrderDetails[];
  onClose: () => void;
  onOpenChatWithOrder: (orderId: string) => void;
  onExploreProducts: () => void;
  onConfirmReceipt?: (orderId: string) => void;
  onVerifyPayment?: (orderIdOrIds: string | string[], mode: 'otomatis' | 'manual') => void;
  onCancelOrder?: (orderIdOrIds: string | string[]) => void;
  onSelectProduct?: (product: Product) => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  customer,
  orders,
  onClose,
  onOpenChatWithOrder,
  onExploreProducts,
  onConfirmReceipt,
  onVerifyPayment,
  onCancelOrder,
  onSelectProduct,
}) => {
  const [activeTab, setActiveTab] = useState<CustomerOrderTab>('belum_selesai');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter orders matching current customer
  const customerOrders = customer
    ? orders.filter(
        (o) =>
          (o.customerEmail && o.customerEmail.toLowerCase() === customer.email.toLowerCase()) ||
          o.customerName.toLowerCase() === customer.name.toLowerCase()
      )
    : orders; // fallback to all recent orders if viewing as guest

  // Categorize orders into the 3 requested tabs
  const uncompletedOrders = customerOrders.filter(
    (o) => o.orderStatus !== 'selesai' && o.orderStatus !== 'dibatalkan' && o.paymentStatus !== 'batal'
  );

  const completedOrders = customerOrders.filter(
    (o) => o.orderStatus === 'selesai'
  );

  const cancelledOrders = customerOrders.filter(
    (o) => o.orderStatus === 'dibatalkan' || o.paymentStatus === 'batal'
  );

  const displayedOrders =
    activeTab === 'belum_selesai'
      ? uncompletedOrders
      : activeTab === 'selesai'
      ? completedOrders
      : cancelledOrders;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getStepNumber = (status: OrderDetails['orderStatus']) => {
    if (status === 'menunggu_pembayaran') return 1;
    if (status === 'menunggu_konfirmasi') return 1;
    if (status === 'diproses') return 2;
    if (status === 'dikirim') return 3;
    if (status === 'selesai') return 4;
    return 1;
  };

  const activePayingOrder = payingOrderId
    ? orders.find((o) => o.orderId === payingOrderId) || null
    : null;

  const activePayingGroup = activePayingOrder?.paymentGroupId
    ? orders.filter(
        (o) =>
          o.paymentGroupId === activePayingOrder.paymentGroupId &&
          (o.orderStatus === 'menunggu_pembayaran' || o.paymentStatus === 'menunggu_pembayaran')
      )
    : null;

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
            className="p-1.5 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1] transition-colors cursor-pointer"
            aria-label="Tutup pesanan saya"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tabs Header: Belum Selesai, Selesai, Dibatalkan */}
        <div className="bg-[#FAF7F2] border-b border-[#E8DFD5] px-4 sm:px-6 pt-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {/* Tab 1: Belum Selesai */}
          <button
            type="button"
            onClick={() => setActiveTab('belum_selesai')}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 -mb-px ${
              activeTab === 'belum_selesai'
                ? 'border-[#8C533C] text-[#8C533C] bg-white shadow-2xs font-bold'
                : 'border-transparent text-[#7A7067] hover:text-[#2C221E] hover:bg-white/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Belum Selesai</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums font-bold ${
                activeTab === 'belum_selesai'
                  ? 'bg-[#8C533C] text-white'
                  : 'bg-[#E8DFD5] text-[#554C45]'
              }`}
            >
              {uncompletedOrders.length}
            </span>
          </button>

          {/* Tab 2: Selesai */}
          <button
            type="button"
            onClick={() => setActiveTab('selesai')}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 -mb-px ${
              activeTab === 'selesai'
                ? 'border-[#8C533C] text-[#8C533C] bg-white shadow-2xs font-bold'
                : 'border-transparent text-[#7A7067] hover:text-[#2C221E] hover:bg-white/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums font-bold ${
                activeTab === 'selesai'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#E8DFD5] text-[#554C45]'
              }`}
            >
              {completedOrders.length}
            </span>
          </button>

          {/* Tab 3: Dibatalkan */}
          <button
            type="button"
            onClick={() => setActiveTab('dibatalkan')}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 -mb-px ${
              activeTab === 'dibatalkan'
                ? 'border-[#8C533C] text-[#8C533C] bg-white shadow-2xs font-bold'
                : 'border-transparent text-[#7A7067] hover:text-[#2C221E] hover:bg-white/40'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Dibatalkan</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums font-bold ${
                activeTab === 'dibatalkan'
                  ? 'bg-red-600 text-white'
                  : 'bg-[#E8DFD5] text-[#554C45]'
              }`}
            >
              {cancelledOrders.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {displayedOrders.length === 0 ? (
            /* Contextual Empty State for current active tab */
            <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-[#E8DFD5] p-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#F2EAE1] text-[#8C533C] flex items-center justify-center">
                {activeTab === 'belum_selesai' && <Clock className="w-8 h-8 opacity-75" />}
                {activeTab === 'selesai' && <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-75" />}
                {activeTab === 'dibatalkan' && <ShieldCheck className="w-8 h-8 text-[#8C533C] opacity-75" />}
              </div>
              <h4 className="font-serif text-base font-bold text-[#2C221E]">
                {activeTab === 'belum_selesai' && 'Tidak Ada Pesanan yang Sedang Berjalan'}
                {activeTab === 'selesai' && 'Belum Ada Pesanan yang Selesai'}
                {activeTab === 'dibatalkan' && 'Tidak Ada Pesanan Dibatalkan'}
              </h4>
              <p className="text-xs text-[#7A7067] max-w-sm mx-auto leading-relaxed">
                {activeTab === 'belum_selesai' &&
                  'Semua pesanan Anda telah terselesaikan atau dibatalkan. Temukan karya kriya etnik terbaru untuk sudut hunian Anda.'}
                {activeTab === 'selesai' &&
                  'Pesanan yang telah Anda terima dan konfirmasi akan tersimpan rapi pada tab ini sebagai riwayat transaksi kriya.'}
                {activeTab === 'dibatalkan' &&
                  'Bagus! Tidak ada transaksi atau pesanan kriya Anda yang mengalami pembatalan.'}
              </p>
              {activeTab === 'belum_selesai' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExploreProducts();
                  }}
                  className="mt-2 px-5 py-2.5 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Mulai Belanja Kriya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {activeTab === 'selesai' && uncompletedOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('belum_selesai')}
                  className="mt-2 px-4 py-2 bg-[#F2EAE1] hover:bg-[#E8DFD5] text-[#8C533C] text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Lihat Pesanan yang Sedang Berjalan ({uncompletedOrders.length})</span>
                </button>
              )}
            </div>
          ) : (
            displayedOrders.map((order) => {
              const currentStep = getStepNumber(order.orderStatus);

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl border border-[#E8DFD5] p-4 sm:p-5 shadow-xs hover:border-[#D5C6B7] transition-all space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE3] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#8C533C]">
                        #{order.orderId}
                      </span>
                      {order.packageIndex && order.totalPackages && order.totalPackages > 1 && (
                        <span className="text-[10px] font-semibold bg-[#8C533C] text-white px-2 py-0.5 rounded-full font-sans">
                          Paket {order.packageIndex}/{order.totalPackages} · {order.artisanName || 'Mitra Kriya'}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopy(`Nomor Pesanan dekorasiku: #${order.orderId}`, order.orderId)}
                        className="p-1 text-[#A89F95] hover:text-[#2C221E] transition-colors cursor-pointer"
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
                      {/* Payment & Order Status Badges */}
                      {order.orderStatus === 'dibatalkan' || order.paymentStatus === 'batal' ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Pesanan Dibatalkan</span>
                        </span>
                      ) : order.orderStatus === 'selesai' ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pesanan Selesai</span>
                        </span>
                      ) : order.paymentStatus === 'menunggu_pembayaran' ? (
                        <button
                          type="button"
                          onClick={() => setPayingOrderId(order.orderId)}
                          className="group text-[11px] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all shadow-xs cursor-pointer active:scale-95 hover:border-amber-400"
                          title="Klik untuk membuka instruksi & melakukan pembayaran"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Menunggu Pembayaran</span>
                          <span className="text-[10px] bg-amber-200/90 text-amber-900 px-1.5 py-0.5 rounded font-bold group-hover:bg-amber-300 transition-colors">
                            Bayar &rarr;
                          </span>
                        </button>
                      ) : order.orderStatus === 'menunggu_konfirmasi' ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Menunggu Konfirmasi Pengrajin</span>
                        </span>
                      ) : order.orderStatus === 'diproses' ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 bg-[#F2EAE1] text-[#8C533C] border border-[#E8DFD5]">
                          <Package className="w-3.5 h-3.5 text-[#8C533C]" />
                          <span>Diproses Pengrajin (1x24 Jam)</span>
                        </span>
                      ) : order.orderStatus === 'dikirim' ? (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dalam Pengiriman</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                            order.paymentStatus === 'terverifikasi_otomatis'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {order.paymentStatus === 'terverifikasi_otomatis' ? (
                            <>
                              <Zap className="w-3 h-3" />
                              <span>QRIS Lunas Otomatis</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Lunas Terverifikasi</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-Step Progress Tracking Stepper OR Cancelled Banner */}
                  {order.orderStatus === 'dibatalkan' || order.paymentStatus === 'batal' ? (
                    <div className="py-2">
                      <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1 text-xs text-red-700">
                        <div className="flex items-center gap-2 font-semibold">
                          <Ban className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Pesanan #{order.orderId} Telah Dibatalkan</span>
                        </div>
                        {order.refundStatus === 'proses_refund' ? (
                          <div className="text-[11px] text-red-600 bg-white/70 p-2 rounded border border-red-200">
                            <strong>Pengembalian Dana 100%:</strong> Dana sebesar <strong>{formatIDR(order.total)}</strong> sedang diproses refund kembali ke rekening / e-wallet Anda.
                          </div>
                        ) : (
                          <div className="text-[11px] text-red-600">
                            Pesanan ini dibatalkan sebelum pembayaran diproses.
                          </div>
                        )}
                        {order.cancelledAt && (
                          <div className="text-[10px] text-red-500">
                            Waktu pembatalan: {order.cancelledAt}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 space-y-3">
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
                            {order.orderStatus === 'menunggu_pembayaran'
                              ? 'Menunggu Bayar'
                              : order.orderStatus === 'menunggu_konfirmasi'
                              ? 'Menunggu Konfirmasi'
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
                            {order.orderStatus === 'menunggu_konfirmasi'
                              ? 'Menunggu Pengrajin'
                              : order.orderStatus === 'diproses'
                              ? 'Batas Kirim 1x24 Jam'
                              : currentStep > 2
                              ? 'Kriya Siap Dikirim'
                              : 'Quality Check Kriya'}
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
                            {order.orderStatus === 'dikirim'
                              ? `${order.shippingCourier || 'Kurir'} On Delivery`
                              : order.shippingMethod.split(' ')[0]}
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
                            {order.orderStatus === 'selesai'
                              ? 'Diterima dengan Hangat'
                              : 'Konfirmasi Diterima'}
                          </div>
                        </div>
                      </div>

                      {/* Contextual Banner for Order Status */}
                      {order.orderStatus === 'menunggu_konfirmasi' && (
                        <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-[#5C4524] space-y-1">
                          <div className="font-bold flex items-center justify-between text-amber-900">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-amber-700 animate-pulse shrink-0" />
                              <span>Pembayaran Lunas — Menunggu Pengrajin Konfirmasi Pesanan</span>
                            </div>
                            <span className="text-[10px] bg-amber-200/90 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                              Bisa Dibatalkan
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A6242] leading-relaxed">
                            Pembayaran sebesar <strong>{formatIDR(order.total)}</strong> telah terverifikasi aman. Studio sedang menunggu konfirmasi kesiapan dari pengrajin kriya.{' '}
                            <strong>Sebelum pesanan dikonfirmasi & diproses, Anda masih berhak membatalkan pesanan ini</strong> dengan pengembalian dana 100%.
                          </p>
                        </div>
                      )}

                      {order.orderStatus === 'diproses' && (
                        <div className="p-3 bg-[#FAF5F0] rounded-xl border border-[#E8DFD5] text-xs text-[#574E47] space-y-2">
                          <div className="font-bold flex items-center justify-between text-[#8C533C]">
                            <div className="flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-[#8C533C] shrink-0" />
                              <span>Pesanan Telah Dikonfirmasi & Sedang Diproses Pengrajin</span>
                            </div>
                            <span className="text-[10px] bg-[#8C533C]/10 text-[#8C533C] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#8C533C]/20">
                              Batas Kirim 1x24 Jam
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A7067] leading-relaxed">
                            Pengrajin telah mengonfirmasi pesanan Anda pada <strong>{order.confirmedByArtisanAt || 'Hari Ini'}</strong>. Pengrajin memiliki batas waktu maksimal 1x24 jam untuk menyelesaikan pengecekan kriya, packing kayu, dan mengisi nomor resi pengiriman.
                          </p>
                          {order.shipmentDeadline && (
                            <div className="p-2 bg-white rounded-lg border border-[#E8DFD5] flex items-center justify-between text-[11px]">
                              <span className="text-[#7A7067] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#8C533C]" />
                                <span>Batas Waktu Pengiriman & Resi:</span>
                              </span>
                              <span className="font-semibold text-[#8C533C]">{order.shipmentDeadline}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-[#A89F95] italic">
                            * Pembatalan pesanan telah ditutup karena kriya sudah mulai disiapkan & dipacking oleh pengrajin.
                          </div>
                        </div>
                      )}

                      {order.orderStatus === 'dikirim' && (
                        <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
                          <div className="flex items-center justify-between font-bold">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-blue-700" />
                              <span>Paket Kriya Telah Dikirim oleh Pengrajin</span>
                            </div>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                              {order.shippingCourier || order.shippingMethod}
                            </span>
                          </div>
                          {order.shippingTrackingNumber && (
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-blue-100">
                              <div>
                                <div className="text-[10px] text-[#7A7067] font-bold uppercase tracking-wider">
                                  Nomor Resi Pengiriman:
                                </div>
                                <div className="font-mono text-xs font-bold text-[#2C221E]">
                                  {order.shippingTrackingNumber}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(order.shippingTrackingNumber || '', `resi-${order.orderId}`)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                {copiedOrderId === `resi-${order.orderId}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Tersalin!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Salin Resi</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                          <div className="text-[11px] text-blue-700">
                            Diserahkan ke kurir pada {order.shippedAt || 'Hari Ini'}.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section: Barang-Barang yang Dipesan beserta Qty, Harga, dan Link-nya */}
                  <div className="space-y-2.5 pt-2 border-t border-[#F2ECE3]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#8C533C] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#8C533C]" />
                        <span>Barang yang Dipesan ({order.items.reduce((s, it) => s + it.quantity, 0)} item)</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((it, idx) => (
                        <div
                          key={`${order.orderId}-item-${idx}`}
                          className="p-3 bg-[#FAF7F2]/70 hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          {/* Image & Product Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={it.product.image}
                              alt={it.product.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-[#E8DFD5] bg-white shrink-0 shadow-2xs"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/assets/images/ceramic_speckled_cup.png';
                              }}
                            />
                            <div className="min-w-0 flex-1 space-y-0.5">
                              {onSelectProduct ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectProduct(it.product)}
                                  className="font-serif font-bold text-xs sm:text-sm text-[#2C221E] hover:text-[#8C533C] transition-colors text-left line-clamp-1 block cursor-pointer group"
                                  title={`Lihat detail produk ${it.product.name}`}
                                >
                                  <span className="group-hover:underline">{it.product.name}</span>
                                </button>
                              ) : (
                                <span className="font-serif font-bold text-xs sm:text-sm text-[#2C221E] line-clamp-1 block">
                                  {it.product.name}
                                </span>
                              )}

                              <div className="text-[11px] text-[#7A7067] flex items-center gap-1.5 truncate">
                                <Store className="w-3 h-3 text-[#8C533C] shrink-0" />
                                <span className="truncate">
                                  {it.product.artisan?.workshopName || it.product.artisan?.name || 'Studio Mitra Pengrajin'}
                                </span>
                              </div>

                              {it.selectedColor && (
                                <div className="text-[10px] text-[#8C533C] font-medium">
                                  Varian: {it.selectedColor}
                                </div>
                              )}

                              {/* Mobile-only compact Qty & unit price */}
                              <div className="flex items-center gap-2 pt-0.5 sm:hidden">
                                <span className="text-[10px] font-semibold text-[#2C221E] bg-[#E8DFD5]/70 px-2 py-0.5 rounded">
                                  Qty: {it.quantity} unit
                                </span>
                                <span className="text-[10px] text-[#7A7067]">
                                  @ {formatIDR(it.product.price)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Qty, Price & Product Link */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E8DFD5]/70">
                            {/* Desktop Qty and price breakdown */}
                            <div className="hidden sm:block text-right">
                              <div className="text-[11px] text-[#7A7067]">
                                <span className="font-semibold text-[#2C221E] bg-[#E8DFD5]/60 px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                                  Qty: {it.quantity}
                                </span>
                                @ {formatIDR(it.product.price)}
                              </div>
                              <div className="font-mono text-xs sm:text-sm font-bold text-[#8C533C] mt-0.5">
                                {formatIDR(it.product.price * it.quantity)}
                              </div>
                            </div>

                            {/* Mobile Price */}
                            <div className="sm:hidden font-mono text-xs font-bold text-[#8C533C]">
                              {formatIDR(it.product.price * it.quantity)}
                            </div>

                            {/* Link / Button to View Product */}
                            {onSelectProduct && (
                              <button
                                type="button"
                                onClick={() => onSelectProduct(it.product)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#8C533C] hover:text-white bg-white hover:bg-[#8C533C] border border-[#DFCBB7] hover:border-[#8C533C] rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer group/btn"
                                title={`Buka halaman detail produk ${it.product.name}`}
                              >
                                <span>Lihat Produk</span>
                                <ExternalLink className="w-3 h-3 text-[#8C533C] group-hover/btn:text-white transition-colors" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {order.giftWrapping && (
                        <div className="text-[11px] text-[#8C533C] bg-amber-50/70 border border-amber-200/70 rounded-lg px-3 py-2 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#8C533C] shrink-0" />
                          <span>Termasuk Kemasan Kado Alami (Kertas Samson & Tali Goni) & Kartu Ucapan Cantik Bertulis Tangan</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery & Cost Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#F2ECE3] bg-[#FAF7F2]/60 p-3 rounded-xl border border-[#E8DFD5]">
                    {/* Alamat Pengiriman */}
                    <div className="space-y-1 text-[#61574F]">
                      <span className="font-bold text-[#8C533C] uppercase tracking-wider text-[10px] block">
                        Alamat Pengiriman:
                      </span>
                      <div className="font-semibold text-[#2C221E]">
                        {order.customerName} {order.phone ? `(${order.phone})` : ''}
                      </div>
                      <p className="leading-relaxed text-[11px]">
                        {order.address}, {order.city}
                      </p>
                      {order.coordinates && (
                        <div className="flex items-center gap-1 text-[10px] text-[#3A4D39] font-mono mt-1">
                          <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>
                            Titik Map: {order.coordinates.lat.toFixed(4)}, {order.coordinates.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rincian Ekspedisi & Pembayaran */}
                    <div className="space-y-1 text-[#61574F] sm:border-l sm:border-[#E8DFD5] sm:pl-3">
                      <span className="font-bold text-[#8C533C] uppercase tracking-wider text-[10px] block">
                        Ekspedisi & Metode Bayar:
                      </span>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#7A7067]">Kurir:</span>
                        <span className="font-medium text-[#2C221E]">{order.shippingCourier || order.shippingMethod}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#7A7067]">Ongkos Kirim:</span>
                        <span className="font-mono text-[#2C221E]">{formatIDR(order.shippingCost)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between items-center text-[11px] text-emerald-700">
                          <span>Diskon Promo:</span>
                          <span className="font-mono">-{formatIDR(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#E8DFD5]">
                        <span className="font-semibold text-[#2C221E]">Metode Pembayaran:</span>
                        <span className="text-[#8C533C] font-semibold">{order.paymentMethod}</span>
                      </div>
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
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shrink-0">
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
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap self-end sm:self-auto transition-all cursor-pointer"
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

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      {/* Case 1: Unpaid Order -> Pay or Cancel */}
                      {order.paymentStatus === 'menunggu_pembayaran' && order.orderStatus !== 'dibatalkan' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPayingOrderId(order.orderId)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-[#8C533C] to-[#A05C42] hover:from-[#76422F] hover:to-[#8C533C] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ring-2 ring-[#8C533C]/20"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Bayar Sekarang</span>
                          </button>

                          {onCancelOrder && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Batalkan pesanan #${order.orderId}? Pesanan yang belum dibayar ini tidak akan diproses.`)) {
                                  onCancelOrder(order.orderId);
                                }
                              }}
                              className="flex-1 sm:flex-none px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg border border-red-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Batalkan pesanan yang belum dibayar"
                            >
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              <span>Batalkan</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* Case 2: Paid Order Before Processed -> User CAN still cancel with 100% refund */}
                      {order.orderStatus === 'menunggu_konfirmasi' && onCancelOrder && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Batalkan pesanan #${order.orderId}?\n\nKarena pengrajin belum memproses kriya, pesanan dapat dibatalkan dan pembayaran sebesar ${formatIDR(
                                  order.total
                                )} akan dikembalikan penuh (100% Refund).`
                              )
                            ) {
                              onCancelOrder(order.orderId);
                            }
                          }}
                          className="flex-1 sm:flex-none px-3.5 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg border border-red-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          title="Batalkan pesanan sebelum diproses pengrajin (Refund 100%)"
                        >
                          <Ban className="w-3.5 h-3.5 text-red-600" />
                          <span>Batalkan Pesanan (Refund 100%)</span>
                        </button>
                      )}

                      {/* Case 3: Already processed -> User cannot cancel, artisan is working within 1x24h */}
                      {order.orderStatus === 'diproses' && (
                        <span className="text-[11px] text-[#8C533C] bg-[#F2EAE1] px-2.5 py-1 rounded-lg font-medium hidden sm:inline-flex items-center gap-1">
                          <Package className="w-3 h-3 text-[#8C533C]" />
                          <span>Sedang Diproses Pengrajin (1x24 Jam)</span>
                        </span>
                      )}

                      {/* Direct Chat Button with this Order */}
                      <button
                        onClick={() => {
                          onClose();
                          onOpenChatWithOrder(order.orderId);
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-[#2C221E] hover:bg-[#8C533C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#D9C3B0]" />
                        <span>Chat Studio</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#E8DFD5] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#7A7067]">
            <ShieldCheck className="w-4 h-4 text-[#3A4D39]" />
            <span>Garansi ganti kriya pecah selama dalam perjalanan kurir</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] font-semibold rounded-lg border border-[#E8DFD5] transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Embedded Payment Instruction Gateway Modal */}
      {activePayingOrder && (
        <PaymentInstructionModal
          isOpen={activePayingOrder !== null}
          order={activePayingOrder}
          ordersGroup={activePayingGroup && activePayingGroup.length > 1 ? activePayingGroup : null}
          onClose={() => setPayingOrderId(null)}
          onVerifyPayment={onVerifyPayment}
          onCancelOrder={(orderIdOrIds) => {
            setPayingOrderId(null);
            if (onCancelOrder) {
              if (Array.isArray(orderIdOrIds)) {
                orderIdOrIds.forEach((id) => onCancelOrder(id));
              } else {
                onCancelOrder(orderIdOrIds);
              }
            }
          }}
          onOpenChatWithOrder={(orderId) => {
            setPayingOrderId(null);
            onClose();
            onOpenChatWithOrder(orderId);
          }}
        />
      )}
    </div>
  );
};
