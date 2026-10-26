import React, { useState } from 'react';
import { OrderDetails } from '../types';
import { formatIDR } from '../data/products';
import {
  X,
  QrCode,
  CreditCard,
  Banknote,
  Check,
  Copy,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentInstructionModalProps {
  isOpen: boolean;
  order: OrderDetails | null;
  onClose: () => void;
  onVerifyPayment?: (orderId: string, mode: 'otomatis' | 'manual') => void;
  onOpenChatWithOrder?: (orderId: string) => void;
}

export const PaymentInstructionModal: React.FC<PaymentInstructionModalProps> = ({
  isOpen,
  order,
  onClose,
  onVerifyPayment,
  onOpenChatWithOrder,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isProcessingSim, setIsProcessingSim] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isQris =
    order.paymentMethod.toLowerCase().includes('qris') ||
    (order.paymentReference && order.paymentReference.startsWith('QRIS'));

  const isTransfer =
    order.paymentMethod.toLowerCase().includes('transfer') ||
    order.paymentMethod.toLowerCase().includes('bca') ||
    order.paymentMethod.toLowerCase().includes('virtual');

  const isCod = order.paymentMethod.toLowerCase().includes('cod') || order.paymentMethod.toLowerCase().includes('tempat');

  const vaNumber = order.paymentReference?.replace(/[^0-9]/g, '') || '8291081234567890';
  const qrisRef = order.paymentReference || `QRIS-ID-${order.orderId.replace(/[^0-9]/g, '') || '8829103847'}`;

  const handleSimulatePayment = (mode: 'otomatis' | 'manual') => {
    setIsProcessingSim(true);
    setTimeout(() => {
      setIsProcessingSim(false);
      if (onVerifyPayment) {
        onVerifyPayment(order.orderId, mode);
      }
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#8C533C', '#3A4D39', '#D9C3B0'],
        });
      } catch {
        // ignore
      }
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF7F2] rounded-t-3xl sm:rounded-2xl max-w-xl w-full shadow-2xl border border-[#E8DFD5] flex flex-col h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E8DFD5] bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8C533C]/10 text-[#8C533C] rounded-lg">
              {isQris ? (
                <QrCode className="w-5 h-5" />
              ) : isTransfer ? (
                <CreditCard className="w-5 h-5" />
              ) : (
                <Banknote className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C221E]">
                Instruksi & Halaman Pembayaran
              </h3>
              <p className="text-xs text-[#7A7067]">
                Pesanan <span className="font-mono font-semibold text-[#8C533C]">#{order.orderId}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1] transition-colors cursor-pointer"
            aria-label="Tutup halaman pembayaran"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {/* Amount Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#7A7067] font-semibold block">
                Total Tagihan Pembayaran
              </span>
              <div className="text-2xl font-serif font-bold text-[#8C533C] tabular-nums mt-0.5">
                {formatIDR(order.total)}
              </div>
              <span className="text-xs text-[#61574F] mt-0.5 block">
                Metode: <strong>{order.paymentMethod}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(order.total.toString(), 'nominal')}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-xs font-semibold text-[#2C221E] rounded-lg border border-[#E8DFD5] transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              {copiedText === 'nominal' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Nominal Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#7A7067]" />
                  <span>Salin Jumlah</span>
                </>
              )}
            </button>
          </div>

          {/* Status Alert */}
          {order.paymentStatus === 'menunggu_pembayaran' ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">Status: Menunggu Pembayaran.</span> Selesaikan pembayaran sebelum batas waktu agar pesanan kriya segera diproses oleh bengkel pengrajin.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Pembayaran Telah Lunas Terverifikasi.</span> Karya Anda sedang disiapkan dengan cermat.
              </div>
            </div>
          )}

          {/* 1. QRIS Payment Section */}
          {isQris && (
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-[#8C533C] uppercase tracking-wider block">
                  Scan QRIS Nasional
                </span>
                <p className="text-xs text-[#7A7067]">
                  Mendukung BCA Mobile, GoPay, OVO, Dana, ShopeePay, LinkAja & Semua m-Banking.
                </p>
              </div>

              {/* Dynamic QRIS Visual */}
              <div className="max-w-[240px] mx-auto bg-white p-4 rounded-2xl border-2 border-[#2C221E] shadow-md flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                  <span className="font-black tracking-widest text-[#2C221E] text-xs">QRIS</span>
                  <span className="text-[10px] text-gray-500 font-mono">KALA KRIYA</span>
                </div>

                {/* Stylized QR Code SVG */}
                <div className="w-44 h-44 bg-white p-2 border border-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-full h-full text-[#2C221E]" viewBox="0 0 100 100" fill="currentColor">
                    {/* Corner markers */}
                    <rect x="5" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="13" y="13" width="10" height="10" />
                    
                    <rect x="69" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="77" y="13" width="10" height="10" />
                    
                    <rect x="5" y="69" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="13" y="77" width="10" height="10" />

                    {/* QR Matrix Pattern Dots */}
                    <rect x="37" y="8" width="6" height="6" />
                    <rect x="49" y="8" width="6" height="6" />
                    <rect x="43" y="18" width="6" height="6" />
                    <rect x="55" y="18" width="6" height="6" />
                    
                    <rect x="8" y="37" width="6" height="6" />
                    <rect x="8" y="49" width="6" height="6" />
                    <rect x="18" y="43" width="6" height="6" />
                    <rect x="18" y="55" width="6" height="6" />

                    {/* Center body */}
                    <rect x="37" y="37" width="8" height="8" />
                    <rect x="49" y="37" width="8" height="8" />
                    <rect x="61" y="37" width="8" height="8" />
                    <rect x="37" y="49" width="8" height="8" />
                    <rect x="55" y="49" width="10" height="10" fill="#8C533C" />
                    <rect x="37" y="61" width="8" height="8" />
                    <rect x="49" y="61" width="8" height="8" />
                    <rect x="61" y="61" width="8" height="8" />

                    {/* Bottom right dots */}
                    <rect x="69" y="73" width="6" height="6" />
                    <rect x="81" y="73" width="6" height="6" />
                    <rect x="75" y="83" width="6" height="6" />
                    <rect x="87" y="83" width="6" height="6" />
                  </svg>
                </div>

                <div className="text-[10px] text-gray-500 font-mono mt-2 text-center truncate max-w-full">
                  NMID: ID1029481920
                </div>
              </div>

              {/* Reference ID copy */}
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#7A7067] uppercase block font-semibold">
                    Kode Referensi Transaksi
                  </span>
                  <span className="font-mono font-bold text-[#2C221E]">{qrisRef}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(qrisRef, 'qrisRef')}
                  className="p-1.5 text-[#7A7067] hover:text-[#2C221E] transition-colors"
                  title="Salin referensi"
                >
                  {copiedText === 'qrisRef' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-2 text-xs text-[#61574F]">
                <span className="font-bold text-[#2C221E] block">Cara Bayar via QRIS:</span>
                <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                  <li>Buka aplikasi m-Banking atau e-wallet (BCA Mobile, GoPay, OVO, Dana, dll).</li>
                  <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
                  <li>Arahkan kamera ke QR Code di atas.</li>
                  <li>Periksa nama penerima <strong>Kala Kriya Atelier</strong> dan nominal <strong>{formatIDR(order.total)}</strong>.</li>
                  <li>Masukkan PIN Anda. Pembayaran akan terkonfirmasi secara instan.</li>
                </ol>
              </div>

              {/* Simulation button for test */}
              {order.paymentStatus === 'menunggu_pembayaran' && onVerifyPayment && (
                <div className="pt-2 border-t border-[#F2ECE3]">
                  <button
                    type="button"
                    disabled={isProcessingSim}
                    onClick={() => handleSimulatePayment('otomatis')}
                    className="w-full py-3 bg-[#3A4D39] hover:bg-[#2C3B2B] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {isProcessingSim ? 'Memproses Gateway...' : 'Simulasikan Pembayaran QRIS Sukses (Uji Coba)'}
                    </span>
                  </button>
                  <p className="text-[10px] text-center text-[#7A7067] mt-1.5">
                    Klik tombol di atas untuk menguji konfirmasi otomatis tanpa transfer nyata.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. Bank Transfer / Virtual Account Section */}
          {isTransfer && (
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-[#8C533C] uppercase tracking-wider block">
                  Transfer Bank / Virtual Account
                </span>
                <p className="text-xs text-[#7A7067]">
                  Mendukung Bank BCA, Mandiri, BNI, dan Bank Lainnya.
                </p>
              </div>

              {/* Virtual Account Box */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#00529C] text-white flex items-center justify-center font-bold text-[10px]">
                      BCA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2C221E]">BCA Virtual Account</div>
                      <div className="text-[10px] text-[#7A7067]">Atas Nama: KALA KRIYA ATELIER</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Otomatis
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E8DFD5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#7A7067] uppercase block">Nomor Virtual Account</span>
                    <span className="font-mono text-base font-bold text-[#2C221E] tracking-wider">
                      {vaNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(vaNumber, 'va')}
                    className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-xs font-semibold text-[#8C533C] rounded-lg border border-[#E8DFD5] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedText === 'va' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin No. VA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2 text-xs text-[#61574F]">
                <span className="font-bold text-[#2C221E] block">Cara Pembayaran m-BCA:</span>
                <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                  <li>Buka aplikasi BCA Mobile / myBCA Anda.</li>
                  <li>Pilih menu <strong>m-Transfer &gt; BCA Virtual Account</strong>.</li>
                  <li>Masukkan nomor Virtual Account di atas: <strong>{vaNumber}</strong>.</li>
                  <li>Masukkan jumlah transfer tepat: <strong>{formatIDR(order.total)}</strong>.</li>
                  <li>Masukkan PIN m-BCA Anda dan simpan bukti transfer.</li>
                </ol>
              </div>

              {/* Simulation button for test */}
              {order.paymentStatus === 'menunggu_pembayaran' && onVerifyPayment && (
                <div className="pt-2 border-t border-[#F2ECE3]">
                  <button
                    type="button"
                    disabled={isProcessingSim}
                    onClick={() => handleSimulatePayment('manual')}
                    className="w-full py-3 bg-[#8C533C] hover:bg-[#73432F] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>
                      {isProcessingSim ? 'Memverifikasi...' : 'Saya Sudah Transfer (Konfirmasi Sekarang)'}
                    </span>
                  </button>
                  <p className="text-[10px] text-center text-[#7A7067] mt-1.5">
                    Klik tombol ini untuk mensimulasikan konfirmasi pelunasan transfer.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. COD Section */}
          {isCod && (
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-3 text-xs text-[#61574F]">
              <div className="flex items-center gap-2 text-[#8C533C] font-bold">
                <Banknote className="w-5 h-5" />
                <span>Bayar di Tempat (COD)</span>
              </div>
              <p className="leading-relaxed">
                Pesanan Anda telah dicatat dan masuk antrean bengkel. Silakan siapkan uang tunai pas sebesar{' '}
                <strong className="text-[#2C221E] font-mono text-sm">{formatIDR(order.total)}</strong> saat kurir ekspedisi mengantarkan paket ke alamat Anda:
              </p>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5]">
                <div className="font-semibold text-[#2C221E]">{order.customerName}</div>
                <div className="text-[11px] text-[#7A7067]">{order.address}, {order.city}</div>
              </div>
            </div>
          )}

          {/* Help & Studio Chat */}
          <div className="bg-[#F2EAE1]/60 p-4 rounded-xl border border-[#E0D5C9] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#61574F]">
              <HelpCircle className="w-4 h-4 text-[#8C533C] shrink-0" />
              <span>Butuh bantuan atau ingin konfirmasi manual?</span>
            </div>
            {onOpenChatWithOrder && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChatWithOrder(order.orderId);
                }}
                className="text-[#8C533C] hover:underline font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 bg-white border-t border-[#E8DFD5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#7A7067]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kala Kriya Escrow & Garansi Nusantara</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#2C221E] hover:bg-[#43352F] text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
