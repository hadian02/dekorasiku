import React, { useState } from 'react';
import {
  OrderDetails,
  ChatMessage,
  AdminTab,
  ArtisanProposal,
  ArtisanProposalChat,
  ArtisanPayout,
  Artisan,
  Product
} from '../types';
import { formatIDR } from '../data/products';
import {
  Package,
  CreditCard,
  MessageCircle,
  TrendingUp,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  QrCode,
  Zap,
  Check,
  Send,
  MapPin,
  ExternalLink,
  Info,
  User,
  Filter,
  Hammer,
  Wallet,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Upload,
  Users,
  Calendar,
  XCircle,
  Phone,
  Mail,
  Lock,
  CalendarRange,
  BarChart3,
  Layers,
  ChevronRight
} from 'lucide-react';

interface AdminDashboardProps {
  orders: OrderDetails[];
  chatMessages: ChatMessage[];
  proposals: ArtisanProposal[];
  proposalChats: ArtisanProposalChat[];
  payouts: ArtisanPayout[];
  artisans?: Artisan[];
  products?: Product[];
  onBackToStore: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderDetails['orderStatus']) => void;
  onConfirmOrderArtisan?: (orderId: string) => void;
  onShipOrder?: (orderId: string, trackingNumber: string, courierName: string) => void;
  onVerifyPayment: (orderId: string, mode: 'otomatis' | 'manual') => void;
  onAdminSendMessage: (customerId: string, customerEmail: string, text: string) => void;
  onApproveProposal: (proposalId: string) => void;
  onAdminSendProposalChat: (proposalId: string, text: string) => void;
  onProcessPayout: (payoutId: string) => void;
  onApproveArtisan?: (artisanId: string) => void;
  onRejectArtisan?: (artisanId: string) => void;
  onAdminLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  chatMessages,
  proposals,
  proposalChats,
  payouts,
  artisans = [],
  products = [],
  onBackToStore,
  onUpdateOrderStatus,
  onConfirmOrderArtisan,
  onShipOrder,
  onVerifyPayment,
  onAdminSendMessage,
  onApproveProposal,
  onAdminSendProposalChat,
  onProcessPayout,
  onApproveArtisan,
  onRejectArtisan,
  onAdminLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchOrder, setSearchOrder] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-demo-1');
  const [replyText, setReplyText] = useState<string>('');
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    proposals.length > 0 ? proposals[0].id : 'prop-101'
  );
  const [proposalChatInput, setProposalChatInput] = useState<string>('');

  // Shipping Tracking Modal State
  const [shippingModalOrder, setShippingModalOrder] = useState<OrderDetails | null>(null);
  const [shippingCourierInput, setShippingCourierInput] = useState<string>('J&T Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');

  // Artisan Verification Filter & Search State
  const [artisanFilter, setArtisanFilter] = useState<'all' | 'menunggu_verifikasi' | 'disetujui'>('all');
  const [searchArtisan, setSearchArtisan] = useState<string>('');

  // Mitra Products & Omset View State
  const [selectedMitraId, setSelectedMitraId] = useState<string>('all');
  const [mitraDateRange, setMitraDateRange] = useState<'all' | 'today' | '7days' | '30days' | 'this_month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Robust date parser for orders
  const parseOrderDate = (order: OrderDetails): Date => {
    if ((order as any).createdAt) {
      const parsed = new Date((order as any).createdAt);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (order.date) {
      const months: Record<string, string> = {
        januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
        juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12',
        jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', agu: '08', sep: '09', okt: '10', nov: '11', des: '12'
      };
      const parts = order.date.toLowerCase().split(' ');
      if (parts.length >= 3) {
        const day = parts[0].padStart(2, '0');
        const mStr = parts[1];
        const year = parts[2];
        const month = months[mStr] || '01';
        const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      const direct = new Date(order.date);
      if (!isNaN(direct.getTime())) return direct;
    }
    return new Date();
  };

  // Check if order date falls into the chosen date range
  const isOrderInDateRange = (order: OrderDetails): boolean => {
    if (mitraDateRange === 'all') return true;
    const oDate = parseOrderDate(order);
    const now = new Date();

    if (mitraDateRange === 'today') {
      return (
        oDate.getFullYear() === now.getFullYear() &&
        oDate.getMonth() === now.getMonth() &&
        oDate.getDate() === now.getDate()
      );
    }
    if (mitraDateRange === '7days') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return oDate >= cutoff;
    }
    if (mitraDateRange === '30days') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return oDate >= cutoff;
    }
    if (mitraDateRange === 'this_month') {
      return (
        oDate.getFullYear() === now.getFullYear() &&
        oDate.getMonth() === now.getMonth()
      );
    }
    if (mitraDateRange === 'custom') {
      if (customStartDate) {
        const s = new Date(customStartDate + 'T00:00:00');
        if (oDate < s) return false;
      }
      if (customEndDate) {
        const e = new Date(customEndDate + 'T23:59:59');
        if (oDate > e) return false;
      }
      return true;
    }
    return true;
  };

  // Helper matching product to artisan
  const checkProductBelongsToArtisan = (prod: Product, art: Artisan): boolean => {
    if (prod.artisan?.id && prod.artisan.id === art.id) return true;
    if (prod.artisan?.name && art.name && prod.artisan.name.toLowerCase() === art.name.toLowerCase()) return true;
    if (prod.artisan?.workshopName && art.workshopName && prod.artisan.workshopName.toLowerCase() === art.workshopName.toLowerCase()) return true;
    return false;
  };

  // Calculations for KPI Cards & Badges
  const pendingArtisansCount = artisans.filter(
    (a) => a.approvalStatus === 'menunggu_verifikasi'
  ).length;

  const approvedArtisansCount = artisans.filter(
    (a) => a.approvalStatus === 'disetujui'
  ).length;

  const pendingProposalsCount = proposals.filter(
    (p) => p.status === 'menunggu_review' || p.status === 'dalam_negosiasi'
  ).length;

  const readyPayoutsCount = payouts.filter(
    (p) => p.status === 'siap_dicairkan'
  ).length;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus !== 'menunggu_pembayaran' && o.paymentStatus !== 'batal')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingPayments = orders.filter(
    (o) => o.paymentStatus === 'menunggu_pembayaran'
  ).length;

  const activeProcessing = orders.filter(
    (o) => o.orderStatus === 'diproses' || o.orderStatus === 'dikirim'
  ).length;

  const unreadChats = chatMessages.filter((m) => m.sender === 'customer' && !m.read).length;
  const pesananBaruCount = orders.filter(
    (o) =>
      (o.orderStatus === 'menunggu_konfirmasi' || o.orderStatus === 'menunggu_pembayaran') &&
      o.paymentStatus !== 'batal'
  ).length;

  const sudahDikonfirmasiCount = orders.filter((o) => o.orderStatus === 'diproses').length;

  const dikonfirmasiBelumSelesaiCount = orders.filter((o) => o.orderStatus === 'dikirim').length;

  const pesananSelesaiCount = orders.filter((o) => o.orderStatus === 'selesai').length;

  const pesananDibatalkanCount = orders.filter(
    (o) => o.orderStatus === 'dibatalkan' || o.paymentStatus === 'batal'
  ).length;

  // Filtered orders list based on requested 5 Tabs:
  // 1. Pesanan baru
  // 2. Pesanan yang sudah dikonfirmasi
  // 3. Pesanan yang sudah dikonfirmasi tapi belum selesai
  // 4. Pesanan yang sudah selesai
  // 5. Pesanan yang dibatalkan
  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      orderFilter === 'all' ||
      (orderFilter === 'pesanan_baru' &&
        (o.orderStatus === 'menunggu_konfirmasi' || o.orderStatus === 'menunggu_pembayaran') &&
        o.paymentStatus !== 'batal') ||
      (orderFilter === 'sudah_dikonfirmasi' && o.orderStatus === 'diproses') ||
      (orderFilter === 'dikonfirmasi_belum_selesai' && o.orderStatus === 'dikirim') ||
      (orderFilter === 'selesai' && o.orderStatus === 'selesai') ||
      (orderFilter === 'dibatalkan' && (o.orderStatus === 'dibatalkan' || o.paymentStatus === 'batal'));

    const matchesSearch =
      searchOrder.trim() === '' ||
      o.orderId.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.city.toLowerCase().includes(searchOrder.toLowerCase()) ||
      (o.shippingTrackingNumber && o.shippingTrackingNumber.toLowerCase().includes(searchOrder.toLowerCase())) ||
      o.items.some((it) => it.product.name.toLowerCase().includes(searchOrder.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Filtered artisans list
  const filteredArtisans = artisans.filter((a: Artisan) => {
    const matchesFilter =
      artisanFilter === 'all' || a.approvalStatus === artisanFilter;
    const matchesSearch =
      !searchArtisan.trim() ||
      a.name.toLowerCase().includes(searchArtisan.toLowerCase()) ||
      (a.workshopName && a.workshopName.toLowerCase().includes(searchArtisan.toLowerCase())) ||
      a.workshopAddress.toLowerCase().includes(searchArtisan.toLowerCase()) ||
      a.productTypes.toLowerCase().includes(searchArtisan.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group chat conversations by customer
  const customerMap: Record<
    string,
    { customerId: string; customerName: string; customerEmail: string; messages: ChatMessage[] }
  > = {};

  chatMessages.forEach((msg) => {
    if (!customerMap[msg.customerId]) {
      customerMap[msg.customerId] = {
        customerId: msg.customerId,
        customerName: msg.senderName,
        customerEmail: msg.customerEmail,
        messages: [],
      };
    }
    customerMap[msg.customerId].messages.push(msg);
  });

  const customerList = Object.values(customerMap);
  const activeConversation =
    customerList.find((c) => c.customerId === selectedCustomerId) || customerList[0];

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;
    onAdminSendMessage(
      activeConversation.customerId,
      activeConversation.customerEmail,
      replyText.trim()
    );
    setReplyText('');
  };

  const activeProposal =
    proposals.find((p) => p.id === selectedProposalId) || proposals[0];

  const activeProposalChats = proposalChats.filter(
    (c) => c.proposalId === (activeProposal ? activeProposal.id : '')
  );

  const handleSendProposalChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalChatInput.trim() || !activeProposal) return;
    onAdminSendProposalChat(activeProposal.id, proposalChatInput.trim());
    setProposalChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#2C221E] text-white border-b border-[#43352F] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#D9C3B0] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Toko</span>
            </button>
            {onAdminLogout && (
              <button
                type="button"
                onClick={onAdminLogout}
                className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-800/40 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Kunci sesi administrator"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Kunci / Keluar</span>
              </button>
            )}
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight">
                Panel Admin Studio dekorasiku
              </h1>
              <p className="text-[11px] text-[#D9C3B0] hidden sm:block">
                Pesanan Masuk, QRIS, Chat Pelanggan, Kurasi Pengrajin & Escrow
              </p>
            </div>
          </div>

          {/* Tab Navigation Segmented Buttons */}
          <nav className="flex items-center gap-1 bg-white/10 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-[#8C533C] text-white shadow-xs'
                  : 'text-[#D9C3B0] hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Pesanan</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full tabular-nums">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'bg-[#8C533C] text-white shadow-xs'
                  : 'text-[#D9C3B0] hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>QRIS</span>
              {pendingPayments > 0 && (
                <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                  {pendingPayments}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'chats'
                  ? 'bg-[#8C533C] text-white shadow-xs'
                  : 'text-[#D9C3B0] hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Pelanggan</span>
              {unreadChats > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                  {unreadChats}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('proposals')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'proposals'
                  ? 'bg-[#8C533C] text-white shadow-xs'
                  : 'text-[#D9C3B0] hover:text-white'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Penawaran Kriya</span>
              {pendingProposalsCount > 0 && (
                <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                  {pendingProposalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'payouts'
                  ? 'bg-[#8C533C] text-white shadow-xs'
                  : 'text-[#D9C3B0] hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Escrow Pengrajin</span>
              {readyPayoutsCount > 0 && (
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                  {readyPayoutsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('artisans')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'artisans'
                  ? 'bg-[#8C533C] text-white shadow-xs'
                  : 'text-[#D9C3B0] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Verifikasi Pengrajin</span>
              {pendingArtisansCount > 0 ? (
                <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                  {pendingArtisansCount} baru
                </span>
              ) : (
                <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full tabular-nums">
                  {artisans.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('mitra_products')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'mitra_products'
                  ? 'bg-[#8C533C] text-white shadow-xs'
                  : 'text-[#D9C3B0] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Produk & Omset Mitra</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full tabular-nums">
                {products.length} kriya
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Total Pesanan Masuk</span>
              <Package className="w-4 h-4 text-[#8C533C]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#2C221E]">
              {orders.length}
            </div>
            <div className="text-[11px] text-[#7A7067] mt-1">
              {activeProcessing} sedang diproses/kirim
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Omset Terverifikasi</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#2C221E]">
              {formatIDR(totalRevenue)}
            </div>
            <div className="text-[11px] text-[#3A4D39] font-medium mt-1">
              Dari pembayaran lunas
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Verifikasi QRIS</span>
              <QrCode className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-600">
              {pendingPayments}
            </div>
            <div className="text-[11px] text-[#7A7067] mt-1">
              Perlu verifikasi
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Chat Customer</span>
              <MessageCircle className="w-4 h-4 text-[#8C533C]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#2C221E]">
              {chatMessages.length}
            </div>
            <div className="text-[11px] text-[#7A7067] mt-1">
              {unreadChats} pesan baru
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Verifikasi Pengrajin</span>
              <Users className="w-4 h-4 text-[#8C533C]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#2C221E] flex items-baseline gap-2">
              <span className={pendingArtisansCount > 0 ? 'text-amber-600' : 'text-[#2C221E]'}>
                {pendingArtisansCount}
              </span>
              <span className="text-xs font-normal text-[#7A7067]">
                / {artisans.length} mitra
              </span>
            </div>
            <div className="text-[11px] text-[#7A7067] mt-1">
              {pendingArtisansCount > 0 ? 'Perlu kunjungan workshop & approval' : 'Semua pendaftaran telah diproses'}
            </div>
          </div>
        </div>

        {/* TAB 1: INCOMING ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DFD5]">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                {/* Tab: Semua */}
                <button
                  type="button"
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    orderFilter === 'all'
                      ? 'bg-[#2C221E] text-white shadow-xs font-bold'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                >
                  <span>Semua</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      orderFilter === 'all' ? 'bg-white/20 text-white font-bold' : 'bg-[#E8DFD5] text-[#554C45]'
                    }`}
                  >
                    {orders.length}
                  </span>
                </button>

                {/* Tab 1: Pesanan Baru */}
                <button
                  type="button"
                  onClick={() => setOrderFilter('pesanan_baru')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    orderFilter === 'pesanan_baru'
                      ? 'bg-amber-700 text-white shadow-xs font-bold ring-1 ring-amber-800'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan baru masuk yang menunggu konfirmasi pengrajin / verifikasi pembayaran"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pesanan Baru</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      orderFilter === 'pesanan_baru'
                        ? 'bg-white text-amber-900'
                        : pesananBaruCount > 0
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-[#E8DFD5] text-[#554C45]'
                    }`}
                  >
                    {pesananBaruCount}
                  </span>
                </button>

                {/* Tab 2: Pesanan yang Sudah Dikonfirmasi */}
                <button
                  type="button"
                  onClick={() => setOrderFilter('sudah_dikonfirmasi')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    orderFilter === 'sudah_dikonfirmasi'
                      ? 'bg-[#8C533C] text-white shadow-xs font-bold ring-1 ring-[#73432F]'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan yang sudah dikonfirmasi pengrajin & sedang diproses dalam batas 1x24 jam"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Sudah Dikonfirmasi</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      orderFilter === 'sudah_dikonfirmasi'
                        ? 'bg-white text-[#8C533C]'
                        : 'bg-[#E8DFD5] text-[#554C45]'
                    }`}
                  >
                    {sudahDikonfirmasiCount}
                  </span>
                </button>

                {/* Tab 3: Pesanan yang Sudah Dikonfirmasi tapi Belum Selesai */}
                <button
                  type="button"
                  onClick={() => setOrderFilter('dikonfirmasi_belum_selesai')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    orderFilter === 'dikonfirmasi_belum_selesai'
                      ? 'bg-blue-600 text-white shadow-xs font-bold ring-1 ring-blue-700'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan yang sudah dikonfirmasi & dikirim kurir, belum selesai karena menunggu konfirmasi penerimaan oleh pembeli"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dikonfirmasi Belum Selesai</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      orderFilter === 'dikonfirmasi_belum_selesai'
                        ? 'bg-white text-blue-900'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {dikonfirmasiBelumSelesaiCount}
                  </span>
                </button>

                {/* Tab 4: Pesanan yang Sudah Selesai */}
                <button
                  type="button"
                  onClick={() => setOrderFilter('selesai')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    orderFilter === 'selesai'
                      ? 'bg-emerald-700 text-white shadow-xs font-bold ring-1 ring-emerald-800'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan yang sudah selesai dan kriya telah diterima pembeli"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pesanan Selesai</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      orderFilter === 'selesai'
                        ? 'bg-white text-emerald-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {pesananSelesaiCount}
                  </span>
                </button>

                {/* Tab 5: Pesanan yang Dibatalkan */}
                <button
                  type="button"
                  onClick={() => setOrderFilter('dibatalkan')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    orderFilter === 'dibatalkan'
                      ? 'bg-red-600 text-white shadow-xs font-bold ring-1 ring-red-700'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan yang dibatalkan"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dibatalkan</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      orderFilter === 'dibatalkan'
                        ? 'bg-white text-red-900'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pesananDibatalkanCount}
                  </span>
                </button>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#A89F95] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ID pesanan, nama, kota..."
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-dashed border-[#E8DFD5] text-[#7A7067] text-xs">
                  Tidak ada pesanan yang sesuai dengan filter.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-xl border border-[#E8DFD5] p-5 shadow-xs hover:border-[#D5C6B7] transition-all space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE3] pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-[#8C533C]">
                          #{order.orderId}
                        </span>
                        <span className="text-xs text-[#7A7067]">·</span>
                        <span className="text-xs text-[#7A7067]">{order.date}</span>
                        <span className="text-xs text-[#7A7067]">·</span>
                        <span className="text-xs font-semibold text-[#2C221E]">
                          {order.customerName}
                        </span>
                      </div>

                      {/* Badges: Payment & Order Status */}
                      <div className="flex items-center gap-2">
                        {/* Payment badge */}
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${
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
                              <span>Lunas Terverifikasi Manual</span>
                            </>
                          )}
                          {order.paymentStatus === 'menunggu_pembayaran' && (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Menunggu Pembayaran</span>
                            </>
                          )}
                        </span>

                        {/* Order status badge */}
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            order.orderStatus === 'selesai'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : order.orderStatus === 'dikirim'
                              ? 'bg-blue-100 text-blue-800'
                              : order.orderStatus === 'diproses'
                              ? 'bg-[#F2EAE1] text-[#8C533C]'
                              : order.orderStatus === 'menunggu_konfirmasi'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : order.orderStatus === 'dibatalkan'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          Status: {order.orderStatus === 'menunggu_konfirmasi' ? 'MENUNGGU KONFIRMASI PENGRAJIN' : order.orderStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Content Columns: Delivery Details vs Items */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                      {/* Recipient & Address with Google Maps coordinate pin */}
                      <div className="md:col-span-5 space-y-2">
                        <div className="font-bold text-[#8C533C] uppercase tracking-wider text-[11px]">
                          Tujuan Pengiriman & Penerima
                        </div>
                        <div>
                          <span className="font-semibold text-[#2C221E]">{order.customerName}</span>{' '}
                          <span className="text-[#7A7067]">({order.phone})</span>
                        </div>
                        <p className="text-[#61574F] leading-relaxed">
                          {order.address}, {order.city}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8C533C]">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kurir: {order.shippingMethod}</span>
                        </div>

                        {order.coordinates && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#3A4D39] font-mono bg-[#EBF3EA] px-2 py-1 rounded border border-[#D0E2CE] w-fit">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              Titik Google Map: {order.coordinates.lat.toFixed(4)},{' '}
                              {order.coordinates.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Items Purchased */}
                      <div className="md:col-span-4 space-y-2">
                        <div className="font-bold text-[#8C533C] uppercase tracking-wider text-[11px]">
                          Kriya Dipesan ({order.items.reduce((a, b) => a + b.quantity, 0)} unit)
                        </div>
                        <div className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[#61574F]">
                              <span className="truncate pr-2">
                                {item.product.name} × {item.quantity}
                              </span>
                              <span className="font-mono tabular-nums text-[#2C221E] shrink-0">
                                {formatIDR(item.product.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                          {order.giftWrapping && (
                            <div className="text-[11px] text-[#8C533C] font-medium">
                              + Termasuk Kemasan Kado & Kartu Ucapan
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial Total & Actions */}
                      <div className="md:col-span-3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#F2ECE3] pt-3 md:pt-0 md:pl-5">
                        <div>
                          <div className="text-[11px] text-[#7A7067]">Total Tagihan:</div>
                          <div className="text-lg font-bold font-mono text-[#8C533C] tabular-nums">
                            {formatIDR(order.total)}
                          </div>
                          <div className="text-[11px] text-[#7A7067] mt-0.5">
                            Metode: {order.paymentMethod}
                          </div>
                        </div>

                        {/* Order Status Action Buttons */}
                        <div className="pt-3 space-y-2">
                          {order.orderStatus === 'menunggu_konfirmasi' && (
                            <div className="space-y-1">
                              <button
                                onClick={() => {
                                  if (onConfirmOrderArtisan) {
                                    onConfirmOrderArtisan(order.orderId);
                                  } else {
                                    onUpdateOrderStatus(order.orderId, 'diproses');
                                  }
                                }}
                                className="w-full py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Konfirmasi Pesanan (Pengrajin)</span>
                              </button>
                              <p className="text-[10px] text-[#7A7067] text-center">
                                Mulai tenggat 1x24 jam pengiriman & resi
                              </p>
                            </div>
                          )}

                          {order.orderStatus === 'diproses' && (
                            <div className="space-y-1.5">
                              {order.shipmentDeadline && (
                                <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-900 flex items-center justify-between">
                                  <span className="font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Batas 1x24 Jam:</span>
                                  </span>
                                  <span className="font-mono font-bold text-amber-800 truncate ml-1">{order.shipmentDeadline}</span>
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  setShippingModalOrder(order);
                                  setShippingCourierInput(order.shippingMethod.split(' ')[0] || 'J&T Express');
                                  setTrackingNumberInput(`DKR-${order.orderId}-${Math.floor(1000 + Math.random() * 9000)}`);
                                }}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Kirim Pesanan & Input Resi</span>
                              </button>
                            </div>
                          )}

                          {order.orderStatus === 'dikirim' && (
                            <div className="space-y-1.5">
                              <div className="p-1.5 bg-blue-50 rounded border border-blue-100 text-[10px] text-blue-900">
                                <div className="font-bold">{order.shippingCourier || 'Kurir Ekspedisi'}</div>
                                <div className="font-mono text-[11px] truncate">Resi: {order.shippingTrackingNumber || '-'}</div>
                              </div>
                              <button
                                onClick={() => onUpdateOrderStatus(order.orderId, 'selesai')}
                                className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Tandai Sampai & Selesai</span>
                              </button>
                            </div>
                          )}

                          {order.orderStatus === 'menunggu_pembayaran' && (
                            <button
                              onClick={() => onVerifyPayment(order.orderId, 'manual')}
                              className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verifikasi Pembayaran Manual</span>
                            </button>
                          )}

                          {order.orderStatus === 'dibatalkan' && (
                            <div className="text-center p-2 bg-red-50 text-red-700 rounded-lg border border-red-200 text-[11px] space-y-0.5">
                              <div className="font-bold">Pesanan Dibatalkan</div>
                              {order.refundStatus === 'proses_refund' && (
                                <div className="text-[10px] text-red-600">Refund 100% diproses</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT & QRIS RECONCILIATION */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Direct Answer & Explanation Banner about QRIS Automation */}
            <div className="p-5 bg-white rounded-xl border border-[#E8DFD5] space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#8C533C]/10 text-[#8C533C] rounded-lg shrink-0 mt-0.5">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-[#2C221E]">
                    Penjelasan: Apakah Pembayaran QRIS Bisa Dicek Otomatis atau Harus Manual?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-[#61574F]">
                    <div className="p-3 bg-[#EBF3EA] rounded-lg border border-[#D0E2CE]">
                      <div className="font-bold text-[#245920] flex items-center gap-1.5 mb-1">
                        <Zap className="w-4 h-4" />
                        <span>1. Mode Otomatis (Production / Payment Gateway)</span>
                      </div>
                      <p>
                        <strong>BISA 100% OTOMATIS!</strong> Jika toko terhubung dengan Payment Gateway resmi seperti Midtrans, Xendit, atau Doku, saat pelanggan memindai QRIS via GoPay/BCA/ShopeePay/Dana, server gateway langsung menembak <em>HTTP Webhook Notification</em> ke sistem toko. Pesanan akan langsung otomatis berstatus <strong>Lunas Terverifikasi</strong> dalam waktu 1-3 detik tanpa perlu konfirmasi admin.
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E8DFD5]">
                      <div className="font-bold text-[#8C533C] flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>2. Mode Manual (QRIS Statis UMKM)</span>
                      </div>
                      <p>
                        Jika menggunakan QRIS Statis cetak tanpa payment gateway pihak ketiga, admin dapat memeriksa mutasi rekening bank/e-wallet lalu mengklik tombol <strong>Verifikasi Pembayaran Manual</strong> di panel ini untuk mengubah status pesanan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-xl border border-[#E8DFD5] overflow-hidden">
              <div className="p-4 border-b border-[#F2ECE3] flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-[#2C221E]">
                  Daftar Transaksi Masuk & Rekonsiliasi QRIS
                </h4>
                <span className="text-xs text-[#7A7067]">
                  Menampilkan {orders.length} transaksi
                </span>
              </div>

              <div className="divide-y divide-[#F2ECE3] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#7A7067] font-semibold border-b border-[#E8DFD5]">
                    <tr>
                      <th className="p-3.5">ID Pesanan</th>
                      <th className="p-3.5">Pelanggan</th>
                      <th className="p-3.5">Metode Bayar</th>
                      <th className="p-3.5">Ref Transaksi</th>
                      <th className="p-3.5">Nominal</th>
                      <th className="p-3.5">Status Pembayaran</th>
                      <th className="p-3.5 text-right">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE3]">
                    {orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#8C533C]">
                          #{order.orderId}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-[#2C221E]">{order.customerName}</div>
                          <div className="text-[11px] text-[#7A7067]">{order.phone}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-[#2C221E]">{order.paymentMethod}</span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-[#7A7067]">
                          {order.paymentReference || '-'}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#2C221E] tabular-nums">
                          {formatIDR(order.total)}
                        </td>
                        <td className="p-3.5">
                          {order.paymentStatus === 'terverifikasi_otomatis' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                              <Zap className="w-3 h-3" />
                              <span>Lunas Otomatis</span>
                            </span>
                          ) : order.paymentStatus === 'terverifikasi_manual' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Lunas Manual</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Menunggu Pembayaran</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {order.paymentStatus === 'menunggu_pembayaran' ? (
                            <>
                              <button
                                onClick={() => onVerifyPayment(order.orderId, 'otomatis')}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs"
                                title="Simulasikan penerimaan webhook otomatis dari gateway QRIS"
                              >
                                <Zap className="w-3 h-3" />
                                <span>Simulasi Auto-Check</span>
                              </button>
                              <button
                                onClick={() => onVerifyPayment(order.orderId, 'manual')}
                                className="px-2.5 py-1 bg-[#2C221E] hover:bg-[#43352F] text-white rounded text-[11px] font-semibold inline-flex items-center gap-1"
                                title="Verifikasi manual jika mutasi bank telah dicek manual"
                              >
                                <Check className="w-3 h-3" />
                                <span>Verifikasi Manual</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-[#7A7067]">
                              {order.verifiedAt || 'Terverifikasi'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER CHAT CONSOLE */}
        {activeTab === 'chats' && (
          <div className="bg-white rounded-xl border border-[#E8DFD5] overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
            {/* Left Column: Customer Conversations List */}
            <div className="md:col-span-4 border-r border-[#E8DFD5] flex flex-col bg-[#FAF7F2]/50">
              <div className="p-4 border-b border-[#E8DFD5] bg-white">
                <h4 className="font-serif text-sm font-bold text-[#2C221E]">
                  Kotak Masuk Chat Pelanggan
                </h4>
                <p className="text-[11px] text-[#7A7067]">
                  {customerList.length} ruang percakapan aktif
                </p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#F2ECE3]">
                {customerList.map((conv) => {
                  const isSelected = conv.customerId === activeConversation?.customerId;
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  const hasUnread = conv.messages.some((m) => m.sender === 'customer' && !m.read);

                  return (
                    <div
                      key={conv.customerId}
                      onClick={() => setSelectedCustomerId(conv.customerId)}
                      className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        isSelected ? 'bg-white shadow-xs border-l-4 border-l-[#8C533C]' : 'hover:bg-white/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#8C533C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {conv.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#2C221E] truncate">
                            {conv.customerName}
                          </span>
                          <span className="text-[10px] text-[#A89F95]">
                            {lastMsg?.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A7067] truncate mt-0.5">
                          {lastMsg?.text || 'Mulai percakapan'}
                        </p>
                        {hasUnread && (
                          <span className="mt-1 inline-block text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-semibold">
                            Pesan Baru
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Chat Dialogue and Reply Form */}
            <div className="md:col-span-8 flex flex-col justify-between bg-white">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2]/40">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#2C221E]">
                        {activeConversation.customerName}
                      </h4>
                      <p className="text-[11px] text-[#7A7067]">
                        {activeConversation.customerEmail}
                      </p>
                    </div>

                    <div className="text-xs text-[#8C533C] font-semibold bg-[#F2EAE1] px-2.5 py-1 rounded-md">
                      Customer Aktif Terverifikasi
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#FAF7F2]/20">
                    {activeConversation.messages.map((m) => {
                      const isCustomer = m.sender === 'customer';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                        >
                          <div
                            className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isCustomer
                                ? 'bg-white border border-[#E8DFD5] text-[#2C221E] rounded-bl-xs'
                                : 'bg-[#2C221E] text-white rounded-br-xs'
                            }`}
                          >
                            <div className="font-serif font-bold text-[11px] mb-1 text-[#8C533C]">
                              {isCustomer ? m.senderName : 'Atelier Kala Kriya (Admin)'}
                            </div>
                            <div>{m.text}</div>
                            {m.orderId && (
                              <div className="mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 inline-block">
                                Ref: #{m.orderId}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-[#A89F95] mt-0.5 px-1">
                            {m.timestamp}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input Form */}
                  <form
                    onSubmit={handleSendAdminReply}
                    className="p-3 border-t border-[#E8DFD5] bg-white flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Balas sebagai Atelier dekorasiku ke ${activeConversation.customerName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C]"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Balasan</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-[#7A7067]">
                  Pilih ruang percakapan di sebelah kiri untuk melihat pesan.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ARTISAN PROPOSALS & CHAT NEGOTIATION */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h3 className="font-serif text-base font-bold text-[#2C221E] flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-[#8C533C]" />
                  <span>Kurasi Penawaran Kriya & Negosiasi dengan Pengrajin</span>
                </h3>
                <p className="text-xs text-[#7A7067] mt-1 leading-relaxed">
                  Tinjau usulan kriya dari pengrajin mitra, diskusikan melalui ruang chat khusus per kriya, dan klik <strong>Setujui Penawaran (Approve)</strong> agar pengrajin dapat melengkapi foto resmi, harga, stok, dan opsi pengiriman.
                </p>
              </div>
              <div className="text-xs text-[#8C533C] font-semibold bg-[#F2EAE1] px-3 py-1.5 rounded-lg whitespace-nowrap self-start sm:self-auto">
                {pendingProposalsCount} usulan dalam proses kurasi
              </div>
            </div>

            {/* Split Screen: Proposals List (Left) vs Proposal Chat Room (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
              {/* Left Column: Proposals List */}
              <div className="lg:col-span-5 space-y-3">
                {proposals.map((prop) => {
                  const isSelected = prop.id === selectedProposalId;

                  return (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedProposalId(prop.id)}
                      className={`p-4 bg-white rounded-xl border cursor-pointer transition-all space-y-3 ${
                        isSelected
                          ? 'border-[#8C533C] shadow-sm ring-1 ring-[#8C533C] bg-[#FDFBF9]'
                          : 'border-[#E8DFD5] hover:border-[#D5C6B7]'
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={prop.sampleImage}
                          alt={prop.title}
                          className="w-16 h-16 rounded-lg object-cover border border-[#E8DFD5] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase font-bold text-[#8C533C] tracking-wider">
                              {prop.categoryLabel}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                prop.status === 'disetujui'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : prop.status === 'tayang_di_toko'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : prop.status === 'dalam_negosiasi'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {prop.status === 'disetujui' && 'Disetujui Admin'}
                              {prop.status === 'tayang_di_toko' && 'Tayang di Toko'}
                              {prop.status === 'dalam_negosiasi' && 'Dalam Negosiasi'}
                              {prop.status === 'menunggu_review' && 'Menunggu Review'}
                            </span>
                          </div>

                          <h4 className="font-serif text-xs font-bold text-[#2C221E] truncate mt-1">
                            {prop.title}
                          </h4>

                          <div className="text-[11px] text-[#7A7067]">
                            Pengrajin: <span className="font-semibold text-[#2C221E]">{prop.artisanName}</span> ({prop.workshopName})
                          </div>

                          <div className="text-xs font-mono font-semibold text-[#8C533C] mt-0.5 tabular-nums">
                            Usulan Harga: {formatIDR(prop.proposedPrice)}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#61574F] leading-relaxed line-clamp-2">
                        {prop.initialDescription}
                      </p>

                      {/* Approval Action Bar */}
                      <div className="pt-2 border-t border-[#F2ECE3] flex items-center justify-between gap-2">
                        {prop.status === 'disetujui' ? (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Telah Disetujui (Menunggu Pengrajin Input Detail)</span>
                          </span>
                        ) : prop.status === 'tayang_di_toko' ? (
                          <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Produk Aktif Tayang di Toko</span>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApproveProposal(prop.id);
                            }}
                            className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui Usulan Kriya Ini (Approve)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Chat Room with Artisan for this proposal */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#E8DFD5] flex flex-col justify-between overflow-hidden shadow-xs">
                {activeProposal ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-[#E8DFD5] bg-[#FAF7F2] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={activeProposal.sampleImage}
                          alt={activeProposal.title}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E8DFD5]"
                        />
                        <div>
                          <div className="text-[10px] text-[#8C533C] font-bold uppercase tracking-wider">
                            Chat Negosiasi dengan {activeProposal.artisanName}
                          </div>
                          <h4 className="font-serif text-sm font-bold text-[#2C221E]">
                            {activeProposal.title}
                          </h4>
                          <span className="text-[11px] text-[#7A7067]">
                            {activeProposal.workshopName} · Usulan {formatIDR(activeProposal.proposedPrice)}
                          </span>
                        </div>
                      </div>

                      {activeProposal.status !== 'disetujui' && activeProposal.status !== 'tayang_di_toko' && (
                        <button
                          onClick={() => onApproveProposal(activeProposal.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                      )}
                    </div>

                    {/* Messages Stream */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]/30 max-h-[390px]">
                      <div className="text-center py-1">
                        <span className="text-[10px] text-[#7A7067] bg-white px-2.5 py-1 rounded-full border border-[#E8DFD5]">
                          Ruang negosiasi penawaran barang #{activeProposal.id}
                        </span>
                      </div>

                      {activeProposalChats.length === 0 ? (
                        <div className="text-center py-12 text-xs text-[#7A7067]">
                          Belum ada riwayat pesan untuk usulan ini. Kirim masukan atau kesepakatan harga ke pengrajin melalui formulir di bawah.
                        </div>
                      ) : (
                        activeProposalChats.map((c) => {
                          const isAdmin = c.sender === 'admin';
                          return (
                            <div
                              key={c.id}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                  isAdmin
                                    ? 'bg-[#2C221E] text-white rounded-br-xs'
                                    : 'bg-white border border-[#E8DFD5] text-[#2C221E] rounded-bl-xs'
                                }`}
                              >
                                <div className="font-serif font-bold text-[11px] mb-1 text-[#8C533C]">
                                  {isAdmin ? 'Tim Kurator Kala Kriya (Admin)' : `${activeProposal.artisanName} (Pengrajin)`}
                                </div>
                                <div>{c.text}</div>
                              </div>
                              <span className="text-[10px] text-[#A89F95] mt-0.5 px-1">
                                {c.timestamp}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input */}
                    <form
                      onSubmit={handleSendProposalChatReply}
                      className="p-3 border-t border-[#E8DFD5] bg-white flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder={`Tulis pesan kesepakatan / kurasi ke ${activeProposal.artisanName}...`}
                        value={proposalChatInput}
                        onChange={(e) => setProposalChatInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C]"
                      />
                      <button
                        type="submit"
                        disabled={!proposalChatInput.trim()}
                        className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Balasan</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-[#7A7067]">
                    Pilih usulan kriya di sebelah kiri.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ESCROW PAYOUTS & ARTISAN PAYMENTS */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Escrow Rule Banner */}
            <div className="p-5 bg-white rounded-xl border border-[#E8DFD5] space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#8C533C]/10 text-[#8C533C] rounded-lg shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif text-base font-bold text-[#2C221E]">
                    Kebijakan Escrow Penjualan: Pembayaran ke Pengrajin
                  </h3>
                  <p className="text-xs text-[#61574F] leading-relaxed">
                    Sesuai ketentuan, <strong>dana penjualan kriya disimpan sementara dalam rekening escrow studio</strong>. Pembayaran baru dapat dicairkan dan ditransfer ke rekening pengrajin mitra <strong>setelah customer mengonfirmasi bahwa barang telah diterima dengan baik</strong>.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-[#7A7067]">
                    <span className="flex items-center gap-1 text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Status Tertahan: Paket masih dalam proses/perjalanan</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Status Siap Cair: Customer telah klik konfirmasi penerimaan kriya</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-xl border border-[#E8DFD5] overflow-hidden">
              <div className="p-4 border-b border-[#F2ECE3] flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-[#2C221E]">
                  Daftar Transaksi Escrow Pengrajin Mitra
                </h4>
                <span className="text-xs text-[#7A7067]">
                  {payouts.length} transaksi tercatat
                </span>
              </div>

              <div className="divide-y divide-[#F2ECE3] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#7A7067] font-semibold border-b border-[#E8DFD5]">
                    <tr>
                      <th className="p-3.5">ID Escrow</th>
                      <th className="p-3.5">Pengrajin & Workshop</th>
                      <th className="p-3.5">Ref Pesanan / Produk</th>
                      <th className="p-3.5">Nominal Bersih</th>
                      <th className="p-3.5">Rekening Tujuan</th>
                      <th className="p-3.5">Status Escrow</th>
                      <th className="p-3.5 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE3]">
                    {payouts.map((pay) => (
                      <tr key={pay.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#8C533C]">
                          #{pay.id}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-[#2C221E]">{pay.artisanName}</div>
                          <div className="text-[11px] text-[#7A7067]">Studio Mitra</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-[#2C221E]">{pay.productName}</div>
                          <div className="text-[11px] text-[#7A7067] font-mono">Pesanan #{pay.orderId}</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-800 tabular-nums">
                          {formatIDR(pay.amount)}
                        </td>
                        <td className="p-3.5 text-[11px] text-[#61574F]">
                          {pay.bankInfo}
                        </td>
                        <td className="p-3.5">
                          {pay.status === 'siap_dicairkan' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Customer Konfirmasi Terima (Siap Cair)</span>
                            </span>
                          ) : pay.status === 'dicairkan_ke_rekening' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded font-semibold">
                              <Check className="w-3 h-3" />
                              <span>Sudah Ditransfer ke Pengrajin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Tertahan (Menunggu Customer)</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          {pay.status === 'siap_dicairkan' ? (
                            <button
                              onClick={() => onProcessPayout(pay.id)}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs"
                            >
                              <Wallet className="w-3 h-3" />
                              <span>Konfirmasi Transfer Bank</span>
                            </button>
                          ) : pay.status === 'dicairkan_ke_rekening' ? (
                            <span className="text-[11px] text-[#7A7067]">
                              {pay.paidOutAt || 'Lunas'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#7A7067] italic">
                              Menunggu paket sampai
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: VERIFIKASI PENGRAJIN BARU (SIGN IN APPROVAL & VISIT) */}
        {activeTab === 'artisans' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#F2EAE1] text-[#8C533C] rounded-lg">
                    <Users className="w-5 h-5" />
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#2C221E]">
                    Verifikasi Pendaftaran & Kunjungan Workshop Pengrajin
                  </h2>
                </div>
                <p className="text-xs text-[#7A7067]">
                  Pengrajin yang mendaftar (SIGN IN) wajib disetujui (diapprove) oleh admin setelah tim melakukan verifikasi langsung ke alamat workshop dan memastikan mutu produk kriya.
                </p>
              </div>

              {pendingArtisansCount > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Ada <strong>{pendingArtisansCount} pendaftaran pengrajin</strong> menunggu kunjungan tim & approval.</span>
                </div>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DFD5]">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                <button
                  onClick={() => setArtisanFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    artisanFilter === 'all'
                      ? 'bg-[#2C221E] text-white'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                >
                  Semua ({artisans.length})
                </button>
                <button
                  onClick={() => setArtisanFilter('menunggu_verifikasi')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    artisanFilter === 'menunggu_verifikasi'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Menunggu Verifikasi & Kunjungan ({pendingArtisansCount})</span>
                </button>
                <button
                  onClick={() => setArtisanFilter('disetujui')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    artisanFilter === 'disetujui'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Telah Disetujui ({approvedArtisansCount})</span>
                </button>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7067]" />
                <input
                  type="text"
                  placeholder="Cari nama, workshop, alamat, produk..."
                  value={searchArtisan}
                  onChange={(e) => setSearchArtisan(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>
            </div>

            {/* Artisans List */}
            {filteredArtisans.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-[#E8DFD5] space-y-2">
                <Users className="w-10 h-10 text-[#D9C3B0] mx-auto" />
                <h4 className="font-serif font-bold text-base text-[#2C221E]">
                  Tidak Ada Data Pengrajin
                </h4>
                <p className="text-xs text-[#7A7067]">
                  Tidak ditemukan pengrajin mitra dengan kriteria filter saat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArtisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    className={`bg-white rounded-xl border overflow-hidden transition-all shadow-xs ${
                      artisan.approvalStatus === 'menunggu_verifikasi'
                        ? 'border-amber-300 ring-1 ring-amber-100'
                        : artisan.approvalStatus === 'disetujui'
                        ? 'border-[#E8DFD5]'
                        : 'border-red-200'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5 border-b border-[#E8DFD5] bg-[#FAF7F2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EFE8DF] text-[#8C533C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#D9C3B0]">
                          {artisan.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-base font-bold text-[#2C221E]">
                              {artisan.name}
                            </h3>
                            {artisan.workshopName ? (
                              <span className="text-xs font-medium text-[#7A7067] px-2 py-0.5 bg-white rounded border border-[#E8DFD5]">
                                {artisan.workshopName}
                              </span>
                            ) : (
                              <span className="text-[11px] italic text-[#8C533C] px-2 py-0.5 bg-[#FAF7F2] rounded border border-[#E0D5C9]">
                                Pengrajin Mandiri (Tanpa nama workshop)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#7A7067]">
                            Mendaftar pada: {artisan.createdAt} · Lokasi: {artisan.location || 'Nusantara'}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {artisan.approvalStatus === 'menunggu_verifikasi' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Menunggu Kunjungan Tim & Approval</span>
                          </span>
                        ) : artisan.approvalStatus === 'disetujui' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Akun Telah Disetujui (Aktif)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Pendaftaran Ditolak</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body: 3 Required Verification Blocks */}
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* 1. Alamat Workshop (Wajib) */}
                        <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C533C]">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>Alamat Workshop / Studio</span>
                          </div>
                          <p className="text-xs text-[#2C221E] font-medium leading-relaxed">
                            {artisan.workshopAddress || 'Belum dicantumkan'}
                          </p>
                          <p className="text-[10px] text-[#7A7067]">
                            *Lokasi fisik yang wajib dikunjungi tim verifikasi Kala Kriya
                          </p>
                        </div>

                        {/* 2. Jenis Produk (Wajib) */}
                        <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C533C]">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>Jenis Produk Kerajinan</span>
                          </div>
                          <p className="text-xs text-[#2C221E] font-medium leading-relaxed">
                            {artisan.productTypes || artisan.specialty}
                          </p>
                          <p className="text-[10px] text-[#7A7067]">
                            *Kategori produk yang akan ditawarkan di portal
                          </p>
                        </div>

                        {/* 3. Kapan Bisa Dikunjungi untuk Verifikasi (Wajib) */}
                        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                            <span>Jadwal Kesediaan Kunjungan Tim</span>
                          </div>
                          <p className="text-xs text-[#2C221E] font-semibold leading-relaxed">
                            {artisan.preferredVisitSchedule || 'Hubungi pengrajin untuk konfirmasi waktu'}
                          </p>
                          <p className="text-[10px] text-amber-800">
                            *Waktu luang yang dipilih pengrajin untuk dikunjungi tim admin
                          </p>
                        </div>
                      </div>

                      {/* Contact and Escrow Bank Info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#61574F] border-t border-[#F2EAE1]">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#8C533C]" />
                            <span>{artisan.phone || '-'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-[#8C533C]" />
                            <span>{artisan.email}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-[#8C533C]" />
                            <span>{artisan.bankName} {artisan.bankAccount} (a.n {artisan.bankAccountName})</span>
                          </span>
                        </div>

                        {artisan.bio && (
                          <div className="text-[11px] text-[#7A7067] italic w-full">
                            "{artisan.bio}"
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-[#E8DFD5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF7F2]/40 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5">
                        <div className="text-xs text-[#7A7067]">
                          {artisan.approvalStatus === 'menunggu_verifikasi' ? (
                            <span className="text-amber-800 font-medium flex items-center gap-1.5">
                              <Info className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Setelah kunjungan fisik selesai dan terkonfirmasi, klik tombol <strong>"Setujui & Aktifkan Akun"</strong>.</span>
                            </span>
                          ) : artisan.approvalStatus === 'disetujui' ? (
                            <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Akun telah aktif (Disetujui: {artisan.approvedAt || 'Telah diverifikasi'}).</span>
                            </span>
                          ) : (
                            <span className="text-red-700">Pendaftaran ditolak.</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {artisan.approvalStatus === 'menunggu_verifikasi' && (
                            <>
                              {onRejectArtisan && (
                                <button
                                  onClick={() => onRejectArtisan(artisan.id)}
                                  className="px-3 py-2 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              )}

                              {onApproveArtisan && (
                                <button
                                  onClick={() => onApproveArtisan(artisan.id)}
                                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Setujui & Aktifkan Akun (Approve)</span>
                                </button>
                              )}
                            </>
                          )}

                          {artisan.approvalStatus === 'disetujui' && (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMitraId(artisan.id);
                                  setActiveTab('mitra_products');
                                }}
                                className="px-3.5 py-2 bg-[#2C221E] hover:bg-[#43352F] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-[#E6C285]" />
                                <span>Lihat Produk & Omset Mitra ➔</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('proposals');
                                }}
                                className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#61574F] border border-[#E8DFD5] text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                              >
                                <Hammer className="w-3.5 h-3.5 text-[#8C533C]" />
                                <span>Penawaran Kriya</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PRODUK & OMSET MITRA PENGRAJIN */}
        {activeTab === 'mitra_products' && (() => {
          // Calculate sales & omset for all products
          const productsWithStats = products.map((prod) => {
            let soldInPeriod = 0;
            let allTimeSold = 0;

            orders.forEach((ord) => {
              if (
                ord.paymentStatus === 'batal' ||
                ord.paymentStatus === 'menunggu_pembayaran' ||
                ord.orderStatus === 'dibatalkan'
              ) {
                return;
              }

              const isInPeriod = isOrderInDateRange(ord);
              ord.items.forEach((it) => {
                if (it.product.id === prod.id || it.product.name === prod.name) {
                  allTimeSold += it.quantity;
                  if (isInPeriod) {
                    soldInPeriod += it.quantity;
                  }
                }
              });
            });

            const omsetInPeriod = soldInPeriod * prod.price;
            const allTimeOmset = allTimeSold * prod.price;

            return {
              ...prod,
              soldInPeriod,
              allTimeSold,
              omsetInPeriod,
              allTimeOmset
            };
          });

          // Filter by selected artisan
          const activeArtisan = artisans.find((a) => a.id === selectedMitraId);
          const filteredByArtisan = selectedMitraId === 'all'
            ? productsWithStats
            : productsWithStats.filter((p) => activeArtisan && checkProductBelongsToArtisan(p, activeArtisan));

          // Filter by search query
          const filteredBySearch = filteredByArtisan.filter((p) => {
            if (!productSearchQuery.trim()) return true;
            const q = productSearchQuery.toLowerCase().trim();
            const matchName = p.name.toLowerCase().includes(q);
            const matchCode = p.productCode?.toLowerCase().includes(q);
            const matchWorkshop = p.artisan.workshopName?.toLowerCase().includes(q);
            const matchCat = p.categoryLabel.toLowerCase().includes(q);
            const matchArtisan = p.artisan.name.toLowerCase().includes(q);
            return matchName || matchCode || matchWorkshop || matchCat || matchArtisan;
          });

          // Filter by stock status
          const finalProducts = filteredBySearch.filter((p) => {
            if (stockStatusFilter === 'in_stock') return p.stock > 5;
            if (stockStatusFilter === 'low_stock') return p.stock > 0 && p.stock <= 5;
            if (stockStatusFilter === 'out_of_stock') return p.stock === 0;
            return true;
          });

          // Aggregate KPIs for the current selection
          const totalOmsetPeriod = filteredByArtisan.reduce((acc, p) => acc + p.omsetInPeriod, 0);
          const totalUnitsSoldPeriod = filteredByArtisan.reduce((acc, p) => acc + p.soldInPeriod, 0);
          const totalStockCount = filteredByArtisan.reduce((acc, p) => acc + p.stock, 0);
          const totalOutStockCount = filteredByArtisan.filter((p) => p.stock === 0).length;

          // Date range description text
          const dateRangeLabel =
            mitraDateRange === 'all'
              ? 'Seluruh Waktu (All Time)'
              : mitraDateRange === 'today'
              ? 'Hari Ini'
              : mitraDateRange === '7days'
              ? '7 Hari Terakhir'
              : mitraDateRange === '30days'
              ? '30 Hari Terakhir'
              : mitraDateRange === 'this_month'
              ? 'Bulan Ini'
              : `Rentang Kustom: ${customStartDate} s/d ${customEndDate}`;

          return (
            <div className="space-y-6">
              {/* Header Title & Print Action */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FAF7F2] text-[#8C533C] rounded-xl border border-[#E8DFD5]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C221E]">
                      Katalog Produk & Laporan Omset Mitra
                    </h2>
                    <p className="text-xs text-[#7A7067] mt-0.5">
                      Pantau detail kriya per pengrajin, kode barang, ketersediaan stok fisik, unit terjual, dan akumulasi omset per jangka waktu.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] border border-[#E8DFD5] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-[#8C533C]" />
                    <span>Cetak / Ekspor Laporan</span>
                  </button>
                </div>
              </div>

              {/* Filter Section: Mitra Selector & Date Range Filter */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-5">
                {/* 1. Mitra Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-[#2C221E] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#8C533C]" />
                      <span>Pilih Mitra Pengrajin:</span>
                    </label>
                    <span className="text-[11px] text-[#7A7067]">
                      {selectedMitraId === 'all'
                        ? 'Menampilkan ringkasan seluruh mitra'
                        : `Mitra aktif: ${activeArtisan?.name} (${activeArtisan?.workshopName || 'Studio'})`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMitraId('all')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                        selectedMitraId === 'all'
                          ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#61574F] border-[#E8DFD5] hover:bg-white hover:text-[#2C221E]'
                      }`}
                    >
                      <span>Semua Mitra</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedMitraId === 'all' ? 'bg-white/20 text-white' : 'bg-[#E8DFD5] text-[#2C221E]'
                      }`}>
                        {artisans.length}
                      </span>
                    </button>

                    {artisans.map((art) => {
                      const isSelected = selectedMitraId === art.id;
                      const artProdCount = products.filter((p) => checkProductBelongsToArtisan(p, art)).length;
                      return (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => setSelectedMitraId(art.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-[#8C533C] text-white border-[#8C533C] shadow-xs'
                              : 'bg-[#FAF7F2] text-[#61574F] border-[#E8DFD5] hover:bg-white hover:text-[#2C221E]'
                          }`}
                        >
                          <span className="font-mono text-[10px] opacity-75">#{String(art.seqNumber || 1).padStart(2, '0')}</span>
                          <span>{art.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-black/25 text-white' : 'bg-[#E8DFD5] text-[#2C221E]'
                          }`}>
                            {artProdCount} kriya
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Jangka Waktu Perhitungan Omset (Date Range Filter) */}
                <div className="pt-4 border-t border-[#F2ECE3]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <label className="text-xs font-bold text-[#2C221E] flex items-center gap-1.5">
                      <CalendarRange className="w-4 h-4 text-[#8C533C]" />
                      <span>Jangka Waktu Perhitungan Omset Penjualan:</span>
                    </label>
                    <div className="text-[11px] font-semibold text-[#8C533C] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block self-start sm:self-auto">
                      Periode Aktif: <strong>{dateRangeLabel}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'Semua Waktu' },
                      { id: 'today', label: 'Hari Ini' },
                      { id: '7days', label: '7 Hari Terakhir' },
                      { id: '30days', label: '30 Hari Terakhir' },
                      { id: 'this_month', label: 'Bulan Ini' },
                      { id: 'custom', label: 'Rentang Tanggal Kustom...' },
                    ].map((preset) => {
                      const isActive = mitraDateRange === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setMitraDateRange(preset.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#3A4D39] text-white border-[#3A4D39] shadow-xs'
                              : 'bg-white text-[#574E47] border-[#E8DFD5] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Date Range Picker */}
                  {mitraDateRange === 'custom' && (
                    <div className="mt-3.5 p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex flex-wrap items-center gap-4 text-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#574E47]">Mulai Tanggal:</span>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-[#E8DFD5] rounded-lg text-xs font-medium text-[#2C221E] focus:outline-none focus:border-[#8C533C]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#574E47]">Sampai Tanggal:</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-[#E8DFD5] rounded-lg text-xs font-medium text-[#2C221E] focus:outline-none focus:border-[#8C533C]"
                        />
                      </div>
                      <span className="text-[11px] text-[#7A7067]">
                        *Omset dan barang terjual akan dihitung khusus untuk pesanan pada rentang tanggal ini.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Omset dalam Periode */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
                  <div className="flex items-center justify-between text-[#7A7067] text-xs">
                    <span>Omset Terjual ({dateRangeLabel})</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-700">
                    {formatIDR(totalOmsetPeriod)}
                  </div>
                  <div className="text-[11px] text-[#7A7067] mt-1">
                    {selectedMitraId === 'all' ? 'Total seluruh 5 mitra' : `Khusus omset ${activeArtisan?.name}`}
                  </div>
                </div>

                {/* 2. Jumlah Terjual */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
                  <div className="flex items-center justify-between text-[#7A7067] text-xs">
                    <span>Kriya Terjual ({dateRangeLabel})</span>
                    <ShoppingBag className="w-4 h-4 text-[#8C533C]" />
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#2C221E]">
                    {totalUnitsSoldPeriod} <span className="text-xs font-normal text-[#7A7067]">unit</span>
                  </div>
                  <div className="text-[11px] text-[#7A7067] mt-1">
                    Pesanan terkonfirmasi & lunas
                  </div>
                </div>

                {/* 3. Ketersediaan Stok */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
                  <div className="flex items-center justify-between text-[#7A7067] text-xs">
                    <span>Total Stok Fisik Tersedia</span>
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#2C221E] flex items-baseline gap-2">
                    <span>{totalStockCount}</span>
                    <span className="text-xs font-normal text-[#7A7067]">unit</span>
                    {totalOutStockCount > 0 && (
                      <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md font-semibold">
                        {totalOutStockCount} habis
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#7A7067] mt-1">
                    Dimaintain langsung pengrajin
                  </div>
                </div>

                {/* 4. Total Katalog Produk */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
                  <div className="flex items-center justify-between text-[#7A7067] text-xs">
                    <span>Jumlah Kriya Tayang</span>
                    <Layers className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#2C221E]">
                    {filteredByArtisan.length} <span className="text-xs font-normal text-[#7A7067]">item kriya</span>
                  </div>
                  <div className="text-[11px] text-[#7A7067] mt-1">
                    {selectedMitraId === 'all' ? 'Seluruh katalog toko' : `Diproduksi ${activeArtisan?.workshopName || activeArtisan?.name}`}
                  </div>
                </div>
              </div>

              {/* Breakdown Omset per Mitra (If "Semua Mitra" is selected) */}
              {selectedMitraId === 'all' && (
                <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-sm font-bold text-[#2C221E] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#8C533C]" />
                      <span>Ringkasan Omset per Mitra ({dateRangeLabel})</span>
                    </h3>
                    <span className="text-[11px] text-[#7A7067]">Klik mitra untuk filter detail produk</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {artisans.map((art) => {
                      const artProducts = productsWithStats.filter((p) => checkProductBelongsToArtisan(p, art));
                      const artOmset = artProducts.reduce((sum, p) => sum + p.omsetInPeriod, 0);
                      const artSold = artProducts.reduce((sum, p) => sum + p.soldInPeriod, 0);
                      const artStock = artProducts.reduce((sum, p) => sum + p.stock, 0);

                      return (
                        <div
                          key={art.id}
                          onClick={() => setSelectedMitraId(art.id)}
                          className="p-3.5 rounded-xl border border-[#E8DFD5] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] hover:border-[#8C533C] transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-xs text-[#2C221E] group-hover:text-[#8C533C] transition-colors truncate">
                                {art.name}
                              </div>
                              <div className="text-[10px] text-[#7A7067] truncate">
                                {art.workshopName || 'Studio Mitra'}
                              </div>
                            </div>
                            <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#E8DFD5] text-[#7A7067]">
                              #{String(art.seqNumber || 1).padStart(2, '0')}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-[#E8DFD5]/60 space-y-1 text-[11px]">
                            <div className="flex justify-between items-center text-[#7A7067]">
                              <span>Omset Periode:</span>
                              <span className="font-mono font-bold text-emerald-700">{formatIDR(artOmset)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[#7A7067]">
                              <span>Terjual:</span>
                              <span className="font-semibold text-[#2C221E]">{artSold} unit</span>
                            </div>
                            <div className="flex justify-between items-center text-[#7A7067]">
                              <span>Stok Tersisa:</span>
                              <span className={`font-semibold ${artStock === 0 ? 'text-red-600' : 'text-[#2C221E]'}`}>
                                {artStock} unit
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search & Stock Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8DFD5] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#7A7067] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan nama kriya, kode hex 10 digit, nama pengrajin, bahan..."
                    className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-xs font-medium text-[#2C221E] focus:outline-none focus:border-[#8C533C]"
                  />
                  {productSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A7067] hover:text-[#2C221E]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7A7067] font-medium hidden md:inline">Filter Stok:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'Semua Stok' },
                      { id: 'in_stock', label: 'Tersedia (>5)' },
                      { id: 'low_stock', label: 'Menipis (1-5)' },
                      { id: 'out_of_stock', label: 'Habis (0) · Buram' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStockStatusFilter(st.id as any)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          stockStatusFilter === st.id
                            ? 'bg-[#2C221E] text-white shadow-xs'
                            : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Daftar Produk Table / Card List */}
              <div className="bg-white rounded-2xl border border-[#E8DFD5] shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F2ECE3] flex items-center justify-between">
                  <div className="font-serif text-sm font-bold text-[#2C221E]">
                    Daftar Produk Kriya ({finalProducts.length} karya ditemukan)
                  </div>
                  <span className="text-xs text-[#7A7067]">
                    Keterangan: Barang dengan stok 0 otomatis tampil dengan foto buram di etalase pembeli
                  </span>
                </div>

                {finalProducts.length === 0 ? (
                  <div className="p-12 text-center text-[#7A7067] space-y-2">
                    <Package className="w-10 h-10 mx-auto text-[#D9C3B0]" />
                    <div className="text-sm font-bold text-[#2C221E]">Tidak ada produk yang cocok</div>
                    <p className="text-xs">Silakan ubah filter mitra, kata kunci pencarian, atau status stok.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-[#574E47] font-bold border-b border-[#E8DFD5]">
                        <tr>
                          <th className="py-3 px-4">Kriya & Foto</th>
                          <th className="py-3 px-4">Kode Barang (10 Digit)</th>
                          <th className="py-3 px-4">Pengrajin & Workshop</th>
                          <th className="py-3 px-4 text-right">Harga Satuan</th>
                          <th className="py-3 px-4 text-center">Ketersediaan Stok</th>
                          <th className="py-3 px-4 text-center">Terjual ({dateRangeLabel})</th>
                          <th className="py-3 px-4 text-right">Omset ({dateRangeLabel})</th>
                          <th className="py-3 px-4 text-center">All-Time Terjual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE3]">
                        {finalProducts.map((p) => {
                          const isOutOfStock = p.stock === 0;
                          const isLowStock = p.stock > 0 && p.stock <= 5;

                          return (
                            <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                              {/* Kriya & Foto */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#E8DFD5] bg-[#FAF7F2]">
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className={`w-full h-full object-cover transition-all ${
                                        isOutOfStock ? 'filter blur-[1.5px] grayscale contrast-75 opacity-60' : ''
                                      }`}
                                    />
                                    {isOutOfStock && (
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-[9px] font-bold text-white tracking-wider uppercase px-1 py-0.5 rounded bg-red-600/90 text-center leading-none">
                                          Habis
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-[#2C221E] truncate max-w-xs">{p.name}</div>
                                    <div className="text-[11px] text-[#7A7067] flex items-center gap-1.5 mt-0.5">
                                      <span className="bg-[#FAF7F2] px-1.5 py-0.2 rounded border border-[#E8DFD5]">
                                        {p.categoryLabel}
                                      </span>
                                      {p.materials && p.materials[0] && (
                                        <span className="truncate max-w-[140px] text-[#8C533C]">
                                          · {p.materials[0]}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Kode Barang 10 Digit Hexadecimal */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <div className="font-mono font-bold text-[#8C533C] text-xs bg-[#FAF7F2] px-2 py-1 rounded-md border border-[#E8DFD5] inline-block">
                                    #{p.productCode || 'KODE-BARANG'}
                                  </div>
                                  {p.productCode && p.productCode.length === 10 && (
                                    <div className="text-[10px] text-[#7A7067] font-mono">
                                      [{p.productCode.slice(0, 5)}]-[{p.productCode.slice(5, 7)}]-[{p.productCode.slice(7, 10)}]
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Pengrajin & Workshop */}
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#2C221E]">{p.artisan.name}</div>
                                <div className="text-[11px] text-[#7A7067] flex items-center gap-1">
                                  <span>{p.artisan.workshopName || 'Studio Mitra'}</span>
                                  {p.artisan.location && <span>· {p.artisan.location}</span>}
                                </div>
                              </td>

                              {/* Harga Satuan */}
                              <td className="py-3 px-4 text-right font-mono font-semibold text-[#2C221E] whitespace-nowrap">
                                {formatIDR(p.price)}
                              </td>

                              {/* Ketersediaan Stok */}
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                {isOutOfStock ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                    <span>0 Unit (Habis & Buram)</span>
                                  </span>
                                ) : isLowStock ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Menipis: {p.stock} Unit</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Tersedia: {p.stock} Unit</span>
                                  </span>
                                )}
                              </td>

                              {/* Terjual Dalam Periode */}
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className={`font-mono font-bold text-xs ${
                                  p.soldInPeriod > 0 ? 'text-[#8C533C]' : 'text-[#7A7067]'
                                }`}>
                                  {p.soldInPeriod} unit
                                </span>
                              </td>

                              {/* Omset Dalam Periode */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <span className={`font-mono font-bold text-xs ${
                                  p.omsetInPeriod > 0 ? 'text-emerald-700' : 'text-[#7A7067]'
                                }`}>
                                  {formatIDR(p.omsetInPeriod)}
                                </span>
                              </td>

                              {/* All-time Terjual */}
                              <td className="py-3 px-4 text-center whitespace-nowrap text-[#7A7067] font-mono text-[11px]">
                                {p.allTimeSold} unit ({formatIDR(p.allTimeOmset)})
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </main>

      {/* Modal Input Nomor Resi Pengiriman */}
      {shippingModalOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShippingModalOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E8DFD5] space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE3]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2C221E]">
                    Kirim & Input Resi Pengiriman
                  </h3>
                  <p className="text-xs text-[#7A7067]">
                    Pesanan #{shippingModalOrder.orderId} · {shippingModalOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShippingModalOrder(null)}
                className="p-1 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1] cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* 1x24h Reminder Box */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Ketentuan Batas Pengiriman Kriya (1x24 Jam)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Pengrajin wajib mengirimkan paket dan menginput nomor resi resmi ekspedisi maksimal 1x24 jam setelah pesanan dikonfirmasi.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!trackingNumberInput.trim()) return;
                if (onShipOrder) {
                  onShipOrder(shippingModalOrder.orderId, trackingNumberInput.trim(), shippingCourierInput);
                } else {
                  onUpdateOrderStatus(shippingModalOrder.orderId, 'dikirim');
                }
                setShippingModalOrder(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[#574E47] mb-1">Pilih Ekspedisi / Kurir:</label>
                <select
                  value={shippingCourierInput}
                  onChange={(e) => setShippingCourierInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg text-xs font-medium focus:outline-none focus:border-[#8C533C]"
                >
                  <option value="J&T Express">J&T Express (Reguler / EZ)</option>
                  <option value="JNE Express">JNE Express (YES / REG)</option>
                  <option value="SiCepat Ekspres">SiCepat Ekspres (GOKIL / BEST)</option>
                  <option value="Pos Indonesia">Pos Indonesia (Kilat Khusus)</option>
                  <option value="GoSend Instant">GoSend Instant (Kurir Khusus Area Jogja)</option>
                  <option value="Lion Parcel">Lion Parcel (REGPACK)</option>
                  <option value="Anteraja">Anteraja (Regular)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#574E47]">Nomor Resi Pengiriman:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingNumberInput(`DKR-${shippingModalOrder.orderId}-${Math.floor(1000 + Math.random() * 9000)}`);
                    }}
                    className="text-[10px] text-[#8C533C] hover:underline font-semibold cursor-pointer"
                  >
                    + Generate Resi Acak
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JNT-9823104928"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#8C533C]"
                />
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E8DFD5] text-[11px] text-[#7A7067] space-y-1">
                <div><strong>Alamat Tujuan:</strong> {shippingModalOrder.address}, {shippingModalOrder.city}</div>
                <div><strong>Penerima:</strong> {shippingModalOrder.customerName} ({shippingModalOrder.phone})</div>
                <div><strong>Kriya:</strong> {shippingModalOrder.items.map((it) => `${it.product.name} (${it.quantity})`).join(', ')}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  className="px-4 py-2 border border-[#E8DFD5] text-[#574E47] hover:bg-[#F2EAE1] rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!trackingNumberInput.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Kirim Pesanan & Terbitkan Resi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
