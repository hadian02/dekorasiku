import React, { useState } from 'react';
import {
  Artisan,
  ArtisanProposal,
  ArtisanProposalChat,
  ArtisanPayout,
  Product,
  OrderDetails
} from '../types';
import { formatIDR } from '../data/products';
import {
  Hammer,
  ArrowLeft,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  Wallet,
  ShieldCheck,
  Send,
  AlertCircle,
  Package,
  Sparkles,
  Upload,
  LogOut,
  UserCheck,
  Building,
  CreditCard,
  Check,
  ShoppingBag,
  Truck,
  MapPin,
  Calendar,
  XCircle,
  Info,
  Phone,
  Mail,
  HelpCircle,
  ArrowRight,
  Copy,
  Store,
  Tag,
  PackageX,
  Eye,
  Layers,
  Search,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { parseProductCode } from '../utils/productCode';

interface ArtisanPortalProps {
  artisan: Artisan | null;
  registeredArtisans?: Artisan[];
  proposals: ArtisanProposal[];
  proposalChats: ArtisanProposalChat[];
  payouts: ArtisanPayout[];
  orders?: OrderDetails[];
  onBackToStore: () => void;
  onLoginArtisan: (artisan: Artisan) => void;
  onLogoutArtisan: () => void;
  onRegisterArtisan?: (artisan: Artisan) => void;
  onConfirmOrderArtisan?: (orderId: string) => void;
  onShipOrder?: (orderId: string, trackingNumber: string, courierName: string) => void;
  onCreateProposal: (data: {
    title: string;
    category: ArtisanProposal['category'];
    categoryLabel: string;
    initialDescription: string;
    proposedPrice: number;
    sampleImage: string;
    sampleImages?: string[];
  }) => void;
  onSendProposalChat: (proposalId: string, text: string) => void;
  onPublishCraftDetails: (proposalId: string, details: {
    officialName: string;
    finalPrice: number;
    stock: number;
    images: string[];
    materials: string[];
    dimensions: string;
    careGuide: string;
    shippingOptions: string[];
  }) => void;
  onRequestPayout: (payoutId: string) => void;
  catalogProducts?: Product[];
  onUpdateProductStock?: (productId: string, newStock: number) => void;
  onGoToAdmin?: () => void;
  isSubdomain?: boolean;
}

export const ArtisanPortal: React.FC<ArtisanPortalProps> = ({
  artisan,
  registeredArtisans = [],
  proposals,
  proposalChats,
  payouts,
  orders = [],
  catalogProducts = [],
  onUpdateProductStock,
  onBackToStore,
  onLoginArtisan,
  onLogoutArtisan,
  isSubdomain = false,
  onRegisterArtisan,
  onConfirmOrderArtisan,
  onShipOrder,
  onCreateProposal,
  onSendProposalChat,
  onPublishCraftDetails,
  onRequestPayout,
  onGoToAdmin,
}) => {
  // Auth Form State (if not logged in)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('wayan.sujana@kriya.id');

  // Registration Form Required Fields (Per Request)
  // 1. Nama Pengrajin (wajib)
  const [regName, setRegName] = useState('');
  // 2. Alamat Workshop (wajib)
  const [regWorkshopAddress, setRegWorkshopAddress] = useState('');
  // 3. Nama Workshop (opsional)
  const [regWorkshopName, setRegWorkshopName] = useState('');
  // 4. Jenis Produk (wajib)
  const [regProductTypes, setRegProductTypes] = useState('');
  // 5. Kapan bisa dikunjungi oleh team admin untuk verifikasi (wajib)
  const [regVisitSchedule, setRegVisitSchedule] = useState('');

  // Additional Supporting Credentials
  const [regSpecialty, setRegSpecialty] = useState('Keramik & Gerabah');
  const [regLocation, setRegLocation] = useState('Bantul, D.I. Yogyakarta');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBank, setRegBank] = useState('BCA');
  const [regAccount, setRegAccount] = useState('');
  const [regAccountName, setRegAccountName] = useState('');
  const [regBio, setRegBio] = useState('');

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'proposals' | 'stock' | 'wallet'>('orders');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockFilterMode, setStockFilterMode] = useState<'all' | 'mine' | 'out_of_stock'>('all');
  const [customStockInputs, setCustomStockInputs] = useState<Record<string, string>>({});

  // Order Tabs (5 requested tabs) & Search State for Artisan Portal
  const [artisanOrderFilter, setArtisanOrderFilter] = useState<
    'all' | 'pesanan_baru' | 'sudah_dikonfirmasi' | 'dikonfirmasi_belum_selesai' | 'selesai' | 'dibatalkan'
  >('all');
  const [artisanOrderSearch, setArtisanOrderSearch] = useState<string>('');

  // Shipping Modal State for Artisan
  const [shippingModalOrder, setShippingModalOrder] = useState<OrderDetails | null>(null);
  const [shippingCourierInput, setShippingCourierInput] = useState<string>('J&T Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');

  // Proposal Creation Modal
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propCategory, setPropCategory] = useState<ArtisanProposal['category']>('keramik');
  const [propDesc, setPropDesc] = useState('');
  const [propPrice, setPropPrice] = useState<number>(200000);
  const [propImages, setPropImages] = useState<string[]>([
    '/assets/images/product_ceramic_mug_1792844459730.jpg'
  ]);

  // Active Proposal Chat Thread
  const [selectedProposalId, setSelectedProposalId] = useState<string>('prop-101');
  const [chatInput, setChatInput] = useState('');

  // Publishing Modal for Approved Proposal
  const [publishingProposal, setPublishingProposal] = useState<ArtisanProposal | null>(null);
  const [pubOfficialName, setPubOfficialName] = useState('');
  const [pubPrice, setPubPrice] = useState(260000);
  const [pubStock, setPubStock] = useState(20);
  const [pubMaterials, setPubMaterials] = useState('Tanah Liat Vulkanik, Glasir Abu Sekam');
  const [pubDimensions, setPubDimensions] = useState('Tinggi 16 cm, Diameter 14 cm (Kapasitas 650 ml)');
  const [pubCare, setPubCare] = useState('Cuci dengan sabun lembut, bilas air hangat, aman air panas 100°C.');
  const [pubImage, setPubImage] = useState('/assets/images/product_ceramic_mug_1792844459730.jpg');
  const [pubShippingReguler, setPubShippingReguler] = useState(true);
  const [pubShippingKilat, setPubShippingKilat] = useState(true);
  const [pubShippingPeti, setPubShippingPeti] = useState(true);

  // Escrow Calculations
  const artisanPayouts = artisan
    ? payouts.filter((p) => p.artisanId === artisan.id)
    : payouts;

  const escrowLockedAmount = artisanPayouts
    .filter((p) => p.status === 'tertahan_menunggu_terima')
    .reduce((sum, p) => sum + p.amount, 0);

  const readyPayoutAmount = artisanPayouts
    .filter((p) => p.status === 'siap_dicairkan')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayoutAmount = artisanPayouts
    .filter((p) => p.status === 'dicairkan_ke_rekening')
    .reduce((sum, p) => sum + p.amount, 0);

  // Filter proposals for current artisan
  const artisanProposals = artisan
    ? proposals.filter((p) => p.artisanId === artisan.id)
    : proposals;

  // Filter orders relevant to this artisan
  const artisanOrders = artisan
    ? orders.filter((o) => {
        if (o.artisanId && o.artisanId === artisan.id) return true;
        if (o.artisanName && artisan.name && o.artisanName.toLowerCase() === artisan.name.toLowerCase()) return true;
        return o.items.some((it) => {
          if (!it.product?.artisan) return false;
          if (it.product.artisan.id && it.product.artisan.id === artisan.id) return true;
          if (it.product.artisan.name && artisan.name && it.product.artisan.name.toLowerCase() === artisan.name.toLowerCase()) return true;
          if (it.product.artisan.workshopName && artisan.workshopName && it.product.artisan.workshopName.toLowerCase() === artisan.workshopName.toLowerCase()) return true;
          return false;
        });
      })
    : orders;

  const relevantOrders = artisan ? artisanOrders : orders;

  const pesananBaruCount = relevantOrders.filter(
    (o) =>
      (o.orderStatus === 'menunggu_konfirmasi' || o.orderStatus === 'menunggu_pembayaran') &&
      o.paymentStatus !== 'batal'
  ).length;

  const sudahDikonfirmasiCount = relevantOrders.filter((o) => o.orderStatus === 'diproses').length;

  const dikonfirmasiBelumSelesaiCount = relevantOrders.filter((o) => o.orderStatus === 'dikirim').length;

  const pesananSelesaiCount = relevantOrders.filter((o) => o.orderStatus === 'selesai').length;

  const pesananDibatalkanCount = relevantOrders.filter(
    (o) => o.orderStatus === 'dibatalkan' || o.paymentStatus === 'batal'
  ).length;

  // Filtered orders for the active order tab & search in Artisan Portal
  const filteredArtisanOrders = relevantOrders.filter((ord) => {
    const matchesFilter =
      artisanOrderFilter === 'all' ||
      (artisanOrderFilter === 'pesanan_baru' &&
        (ord.orderStatus === 'menunggu_konfirmasi' || ord.orderStatus === 'menunggu_pembayaran') &&
        ord.paymentStatus !== 'batal') ||
      (artisanOrderFilter === 'sudah_dikonfirmasi' && ord.orderStatus === 'diproses') ||
      (artisanOrderFilter === 'dikonfirmasi_belum_selesai' && ord.orderStatus === 'dikirim') ||
      (artisanOrderFilter === 'selesai' && ord.orderStatus === 'selesai') ||
      (artisanOrderFilter === 'dibatalkan' && (ord.orderStatus === 'dibatalkan' || ord.paymentStatus === 'batal'));

    const matchesSearch =
      artisanOrderSearch.trim() === '' ||
      ord.orderId.toLowerCase().includes(artisanOrderSearch.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(artisanOrderSearch.toLowerCase()) ||
      ord.city.toLowerCase().includes(artisanOrderSearch.toLowerCase()) ||
      (ord.shippingTrackingNumber && ord.shippingTrackingNumber.toLowerCase().includes(artisanOrderSearch.toLowerCase())) ||
      ord.items.some((it) => it.product.name.toLowerCase().includes(artisanOrderSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Helper untuk mengecek apakah kriya milik pengrajin yang sedang login
  const checkIsMine = (p: Product): boolean => {
    if (!artisan) return true;
    if (p.artisan.name.toLowerCase() === artisan.name.toLowerCase()) return true;
    if (artisan.workshopName && p.artisan.workshopName) {
      return p.artisan.workshopName.toLowerCase() === artisan.workshopName.toLowerCase();
    }
    return false;
  };

  // Filter kriya untuk Tab Kelola Stok & Kode Barang
  const filteredStockProducts = catalogProducts.filter((p) => {
    const isMine = checkIsMine(p);
    if (stockFilterMode === 'mine' && !isMine) return false;
    if (stockFilterMode === 'out_of_stock' && p.stock > 0) return false;

    if (stockSearchQuery.trim()) {
      const q = stockSearchQuery.toLowerCase().trim();
      const matchCode = p.productCode?.toLowerCase().includes(q);
      const matchName = p.name.toLowerCase().includes(q);
      const matchWorkshop = p.artisan.workshopName?.toLowerCase().includes(q);
      const matchCategory = p.categoryLabel.toLowerCase().includes(q);
      return matchCode || matchName || matchWorkshop || matchCategory;
    }
    return true;
  });

  const activeProposal = proposals.find((p) => p.id === selectedProposalId) || proposals[0];
  const activeChats = proposalChats.filter((c) => c.proposalId === selectedProposalId);

  // Auth Submit Handlers
  const handleArtisanLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();

    // 1. Check existing registered artisans in state
    const matched = registeredArtisans.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );
    if (matched) {
      onLoginArtisan(matched);
      return;
    }

    // 2. Special pre-approved default Wayan Sujana
    if (cleanEmail === 'wayan.sujana@kriya.id') {
      const demoArtisan: Artisan = {
        id: 'artisan-wayan',
        name: 'Wayan Sujana',
        workshopName: 'Studio Tembikar Kasongan',
        workshopAddress: 'Jl. Kasongan No. 42, Dusun Kajen, Bangunjiwo, Kasihan, Bantul, D.I. Yogyakarta 55184',
        productTypes: 'Keramik Bakar Tungku, Tembikar Tanah Liat & Teko Seduh Estetik',
        preferredVisitSchedule: 'Senin s/d Jumat, 09:00 - 15:00 WIB',
        specialty: 'Keramik & Gerabah Tradisional',
        location: 'Kasongan, Bantul, D.I. Yogyakarta',
        email: 'wayan.sujana@kriya.id',
        phone: '0812-7788-9900',
        bankName: 'BCA (Bank Central Asia)',
        bankAccount: '8820-192-384',
        bankAccountName: 'WAYAN SUJANA',
        bio: 'Pengrajin tembikar generasi ketiga yang memadukan tanah liat lokal vulkanik dengan teknik pembakaran tungku kayu tradisional.',
        createdAt: '2026-01-15',
        approvalStatus: 'disetujui',
        approvedAt: '2026-01-18',
      };
      onLoginArtisan(demoArtisan);
      return;
    }

    // 3. Fallback for new email entered in login
    const newArtisan: Artisan = {
      id: `artisan-${Date.now()}`,
      name: loginEmail.split('@')[0],
      workshopName: `Bengkel Kriya ${loginEmail.split('@')[0]}`,
      workshopAddress: 'Sentra Industri Kriya Nusantara No. 10',
      productTypes: 'Kerajinan Seni Tradisional Nusantara',
      preferredVisitSchedule: 'Hari kerja, pukul 10:00 - 15:00 WIB',
      specialty: 'Kerajinan Tangan Nusantara',
      location: 'Yogyakarta',
      email: cleanEmail,
      phone: '0812-3456-7890',
      bankName: 'BCA',
      bankAccount: '1234-567-890',
      bankAccountName: loginEmail.split('@')[0].toUpperCase(),
      bio: 'Pengrajin mitra terdaftar Studio Kala Kriya.',
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      approvalStatus: 'menunggu_verifikasi',
      verificationNotes: 'Pendaftaran menunggu verifikasi dan kunjungan lapangan oleh tim admin.',
    };

    if (onRegisterArtisan) {
      onRegisterArtisan(newArtisan);
    } else {
      onLoginArtisan(newArtisan);
    }
  };

  const handleArtisanRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      alert('Nama Pengrajin wajib diisi.');
      return;
    }
    if (!regWorkshopAddress.trim()) {
      alert('Alamat Workshop wajib diisi untuk verifikasi kunjungan tim admin.');
      return;
    }
    if (!regProductTypes.trim()) {
      alert('Jenis Produk kerajinan wajib diisi.');
      return;
    }
    if (!regVisitSchedule.trim()) {
      alert('Kapan workshop bisa dikunjungi oleh team admin untuk verifikasi wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      alert('Email aktif wajib diisi.');
      return;
    }

    const formattedDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newArtisan: Artisan = {
      id: `artisan-${Date.now()}`,
      name: regName.trim(),
      workshopName: regWorkshopName.trim() || undefined, // Opsional
      workshopAddress: regWorkshopAddress.trim(), // Wajib
      productTypes: regProductTypes.trim(), // Wajib
      preferredVisitSchedule: regVisitSchedule.trim(), // Wajib
      specialty: regSpecialty,
      location: regLocation.trim() || 'Yogyakarta',
      email: regEmail.trim(),
      phone: regPhone.trim() || '0812-3456-7890',
      bankName: regBank,
      bankAccount: regAccount.trim() || '8888-999-000',
      bankAccountName: regAccountName.trim() || regName.toUpperCase(),
      bio: regBio.trim() || 'Pengrajin seni kriya mitra terdaftar.',
      createdAt: formattedDate,
      approvalStatus: 'menunggu_verifikasi', // WAJIB DIAPPROVE OLEH ADMIN
      verificationNotes: 'Pendaftaran baru masuk. Workshop menunggu dikunjungi oleh tim kurator admin.',
    };

    if (onRegisterArtisan) {
      onRegisterArtisan(newArtisan);
    } else {
      onLoginArtisan(newArtisan);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - propImages.length;
    if (remainingSlots <= 0) {
      alert('Maksimal 5 foto karya kriya telah tercapai. Hapus foto terlebih dahulu jika ingin mengganti.');
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`Hanya ${remainingSlots} foto pertama yang akan ditambahkan karena batas maksimal 5 foto.`);
    }

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          const resultUrl = event.target.result;
          setPropImages((prev) => {
            if (prev.length >= 5) return prev;
            return [...prev, resultUrl];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPropImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSamplePhoto = (sampleUrl: string) => {
    if (propImages.length >= 5) {
      alert('Maksimal 5 foto karya kriya.');
      return;
    }
    if (propImages.includes(sampleUrl)) {
      alert('Foto contoh ini sudah ada di daftar usulan.');
      return;
    }
    setPropImages((prev) => [...prev, sampleUrl]);
  };

  const handleSubmitNewProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || !propDesc.trim()) {
      alert('Mohon isi nama kriya dan deskripsi usulan.');
      return;
    }

    if (propImages.length === 0) {
      alert('Mohon sertakan minimal 1 foto karya kriya.');
      return;
    }

    const catLabels: Record<string, string> = {
      keramik: 'Keramik & Tembikar',
      anyaman: 'Anyaman & Serat Alami',
      kayu: 'Kayu & Perabot Mini',
      tekstil: 'Tekstil & Tenun',
      aromaterapi: 'Aromaterapi & Lilin',
    };

    onCreateProposal({
      title: propTitle.trim(),
      category: propCategory,
      categoryLabel: catLabels[propCategory] || 'Kerajinan Tangan',
      initialDescription: propDesc.trim(),
      proposedPrice: Number(propPrice) || 200000,
      sampleImage: propImages[0],
      sampleImages: propImages,
    });

    setIsCreatingProposal(false);
    setPropTitle('');
    setPropDesc('');
    setPropImages(['/assets/images/product_ceramic_mug_1792844459730.jpg']);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedProposalId) return;
    onSendProposalChat(selectedProposalId, chatInput.trim());
    setChatInput('');
  };

  const handleOpenPublishModal = (proposal: ArtisanProposal) => {
    setPublishingProposal(proposal);
    setPubOfficialName(proposal.title);
    setPubPrice(proposal.proposedPrice);
    setPubStock(25);
    setPubImage(proposal.sampleImage);
  };

  const handleSubmitPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishingProposal) return;

    const shippingOptions: string[] = [];
    if (pubShippingReguler) shippingOptions.push('Reguler Aman');
    if (pubShippingKilat) shippingOptions.push('Ekspedisi Kilat 1-2 Hari');
    if (pubShippingPeti) shippingOptions.push('Peti Kayu Khusus');

    const publishedImages =
      publishingProposal.sampleImages && publishingProposal.sampleImages.length > 0
        ? publishingProposal.sampleImages
        : [pubImage, '/assets/images/hero_artisanal_studio_1792844458806.jpg'];

    onPublishCraftDetails(publishingProposal.id, {
      officialName: pubOfficialName.trim(),
      finalPrice: Number(pubPrice),
      stock: Number(pubStock),
      images: publishedImages,
      materials: pubMaterials.split(',').map((m) => m.trim()),
      dimensions: pubDimensions.trim(),
      careGuide: pubCare.trim(),
      shippingOptions,
    });

    setPublishingProposal(null);
  };

  // If NOT Logged In as Artisan -> Show Sign In / Log In Screen
  if (!artisan) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col justify-between">
        {/* Simple Header */}
        <header className="p-4 sm:p-6 border-b border-[#E8DFD5] bg-white flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-[#E8DFD5]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Toko</span>
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="font-serif font-bold text-lg text-[#2C221E]">
                Portal Mitra Pengrajin dekorasiku
              </div>
              {isSubdomain && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  subdomain mitra/pengrajin aktif
                </span>
              )}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-[#8C533C] font-semibold tracking-wider uppercase block">
              Khusus Pengrajin & Studio Mitra
            </span>
            <span className="text-[10px] font-mono text-[#7A7067]">
              Subdomain: mitra.dekorasiku.* / pengrajin.*
            </span>
          </div>
        </header>

        {/* Auth Body */}
        <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full bg-white rounded-2xl border border-[#E8DFD5] shadow-xl overflow-hidden">
            {/* Mode Tabs */}
            <div className="flex border-b border-[#E8DFD5] bg-[#FAF7F2]/60 p-2 gap-2">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  authMode === 'login'
                    ? 'bg-[#2C221E] text-white shadow-xs'
                    : 'text-[#61574F] hover:text-[#2C221E]'
                }`}
              >
                Masuk (Log In Pengrajin)
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  authMode === 'register'
                    ? 'bg-[#2C221E] text-white shadow-xs'
                    : 'text-[#61574F] hover:text-[#2C221E]'
                }`}
              >
                Daftar Mitra Baru (Sign In)
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {authMode === 'login' ? (
                /* Login Form */
                <form onSubmit={handleArtisanLogin} className="space-y-4">
                  <div className="text-center space-y-1 mb-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#F2EAE1] text-[#8C533C] flex items-center justify-center">
                      <Hammer className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#2C221E]">
                      Masuk ke Ruang Kerja Pengrajin
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      Tawarkan kriya baru, negosiasikan dengan admin, dan pantau pencairan dana pesanan.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Alamat Email Pengrajin
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="wayan.sujana@kriya.id"
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      required
                      defaultValue="pengrajinkasongan"
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>

                  {/* 1-Click Demo Accounts Selector */}
                  <div className="p-3 bg-[#F2EAE1] rounded-xl border border-[#E0D5C9] text-[11px] text-[#61574F] space-y-2">
                    <div className="font-bold text-[#8C533C] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pilih Cepat Akun Demo:</span>
                    </div>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setLoginEmail('wayan.sujana@kriya.id')}
                        className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors flex items-center justify-between ${
                          loginEmail === 'wayan.sujana@kriya.id'
                            ? 'bg-white border-[#8C533C] font-semibold text-[#2C221E] shadow-2xs'
                            : 'bg-white/60 border-transparent hover:bg-white text-[#61574F]'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[#2C221E]">Wayan Sujana (Studio Kasongan)</div>
                          <div className="text-[10px] text-[#7A7067]">wayan.sujana@kriya.id</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Disetujui (Aktif)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginEmail('bambang.anyam@gmail.com')}
                        className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors flex items-center justify-between ${
                          loginEmail === 'bambang.anyam@gmail.com'
                            ? 'bg-white border-[#8C533C] font-semibold text-[#2C221E] shadow-2xs'
                            : 'bg-white/60 border-transparent hover:bg-white text-[#61574F]'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[#2C221E]">Bambang Triyono (Bambu Minggir)</div>
                          <div className="text-[10px] text-[#7A7067]">bambang.anyam@gmail.com</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Menunggu Verifikasi
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginEmail('nyoman.wood@gmail.com')}
                        className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors flex items-center justify-between ${
                          loginEmail === 'nyoman.wood@gmail.com'
                            ? 'bg-white border-[#8C533C] font-semibold text-[#2C221E] shadow-2xs'
                            : 'bg-white/60 border-transparent hover:bg-white text-[#61574F]'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[#2C221E]">I Nyoman Sudarsa (Pahat Ubud)</div>
                          <div className="text-[10px] text-[#7A7067]">nyoman.wood@gmail.com (Tanpa workshop)</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Menunggu Verifikasi
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Masuk sebagai Pengrajin</span>
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleArtisanRegister} className="space-y-4">
                  <div className="text-center space-y-1 mb-3">
                    <h3 className="font-serif text-lg font-bold text-[#2C221E]">
                      Pendaftaran Pengrajin Mitra Baru (SIGN IN)
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      Bergabung bersama Kala Kriya. Setiap pendaftaran wajib disetujui (diapprove) oleh admin setelah tim melakukan kunjungan verifikasi ke workshop.
                    </p>
                  </div>

                  {/* Notice Approval Workflow */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Syarat Kurasi:</strong> Akun Anda akan berstatus <em>Menunggu Verifikasi</em>. Tim admin akan mengunjungi workshop Anda sesuai jadwal yang diisi di bawah sebelum menyetujui akun Anda.
                    </div>
                  </div>

                  {/* FIELD 1: Nama Pengrajin (Wajib) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      1. Nama Pengrajin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap pengrajin (contoh: Wayan Sujana, Bambang Triyono)"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>

                  {/* FIELD 2: Alamat Workshop (Wajib) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      2. Alamat Lengkap Workshop / Studio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Alamat jalan, nomor, dusun/RT/RW, desa/kelurahan, kecamatan, kabupaten/kota, serta patokan arah untuk kunjungan tim admin"
                      value={regWorkshopAddress}
                      onChange={(e) => setRegWorkshopAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                    <p className="text-[10px] text-[#7A7067] mt-0.5">
                      Alamat ini akan dikunjungi langsung oleh tim kurator dekorasiku untuk inspeksi alat & mutu bahan.
                    </p>
                  </div>

                  {/* FIELD 3: Nama Workshop (Opsional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#2C221E]">
                        3. Nama Workshop / Studio <span className="text-[#8C533C] font-normal text-[11px]">(Opsional)</span>
                      </label>
                      <span className="text-[10px] text-[#7A7067]">Boleh dikosongkan jika kriya rumahan</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: Studio Keramik Kasongan (Opsional)"
                      value={regWorkshopName}
                      onChange={(e) => setRegWorkshopName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>

                  {/* FIELD 4: Jenis Produk (Wajib) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      4. Jenis Produk Kerajinan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Keramik & Tembikar Tanah Liat, Anyaman Bambu, Pahat Kayu Jati"
                      value={regProductTypes}
                      onChange={(e) => setRegProductTypes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                    {/* Quick suggestion pills */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[10px] text-[#7A7067] self-center">Pilihan cepat:</span>
                      {[
                        'Keramik Bakar Tungku & Tembikar',
                        'Anyaman Bambu & Serat Alam',
                        'Pahat & Ukiran Kayu Jati',
                        'Tenun Ikat & Batik Alami',
                        'Aromaterapi & Lilin Kedelai'
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRegProductTypes(preset)}
                          className="px-2 py-0.5 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[10px] text-[#61574F] rounded border border-[#E8DFD5] transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FIELD 5: Kapan Bisa Dikunjungi oleh Team Admin untuk Verifikasi (Wajib) */}
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-2">
                    <label className="block text-xs font-bold text-[#8C533C] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>5. Kapan Bisa Dikunjungi oleh Team Admin untuk Verifikasi? <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Sabtu, 31 Oktober 2026 pukul 10:00 - 14:00 WIB"
                      value={regVisitSchedule}
                      onChange={(e) => setRegVisitSchedule(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C] font-medium"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-[#7A7067] self-center">Pilihan jadwal:</span>
                      {[
                        'Hari Sabtu (Pukul 10:00 - 14:00 WIB)',
                        'Hari Minggu (Pukul 13:00 - 16:00 WIB)',
                        'Senin s/d Jumat (Jam Kerja 09:00 - 15:00 WIB)',
                        'Kapan saja dengan konfirmasi WhatsApp H-1'
                      ].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setRegVisitSchedule(slot)}
                          className="px-2 py-0.5 bg-white hover:bg-[#F2EAE1] text-[10px] text-[#61574F] rounded border border-[#E8DFD5] transition-colors"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account Credentials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                        Email Aktif <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="pengrajin@email.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                        No. HP / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0812-xxxx-xxxx"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                      />
                    </div>
                  </div>

                  {/* Bank Account for Escrow Payouts */}
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-2">
                    <div className="text-[11px] font-bold text-[#8C533C] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Rekening Bank untuk Pencairan Hasil Penjualan</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#7A7067]">Bank</label>
                        <select
                          value={regBank}
                          onChange={(e) => setRegBank(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-[#E8DFD5] rounded"
                        >
                          <option value="BCA">BCA</option>
                          <option value="Mandiri">Mandiri</option>
                          <option value="BRI">BRI</option>
                          <option value="BNI">BNI</option>
                          <option value="BSI">BSI</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-[#7A7067]">Nomor Rekening</label>
                        <input
                          type="text"
                          placeholder="Nomor rekening"
                          value={regAccount}
                          onChange={(e) => setRegAccount(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-[#E8DFD5] rounded font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#7A7067]">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        placeholder="Sesuai buku tabungan"
                        value={regAccountName}
                        onChange={(e) => setRegAccountName(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-[#E8DFD5] rounded uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Daftar Mitra (Kirim Permohonan & Jadwal Kunjungan)</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>

        <footer className="p-4 text-center text-xs text-[#7A7067] border-t border-[#E8DFD5]">
          © {new Date().getFullYear()} Studio Kala Kriya — Kemitraan Kriya Berkeadilan
        </footer>
      </div>
    );
  }

  // IF ARTISAN IS REGISTERED BUT PENDING ADMIN APPROVAL & PHYSICAL VISIT
  if (artisan && artisan.approvalStatus === 'menunggu_verifikasi') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col justify-between">
        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-[#E8DFD5] bg-white sticky top-0 z-30">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLogoutArtisan}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-red-200 transition-colors cursor-pointer"
                title="Keluar dari akun pengrajin"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
              <div className="font-serif font-bold text-lg text-[#2C221E]">
                Portal Mitra Pengrajin Kala Kriya
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A7067] hidden sm:inline">
                Akun: <strong>{artisan.name}</strong>
              </span>
              <button
                onClick={onLogoutArtisan}
                className="px-3 py-1.5 border border-[#E8DFD5] hover:bg-red-50 hover:text-red-600 text-xs font-semibold rounded-lg text-[#61574F] flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </header>

        {/* Pending Body */}
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-6">
          {/* Status Alert Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wider mb-1">
                    Status: Menunggu Verifikasi & Kunjungan Tim Admin
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C221E]">
                    Pendaftaran Pengrajin Anda Sedang Diproses
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#61574F] leading-relaxed">
              Halo <strong>{artisan.name}</strong>, formulir pendaftaran mitra pengrajin Anda telah kami terima. Sesuai ketentuan kurasi studio dekorasiku, <strong>SIGN IN pengrajin wajib diapprove oleh admin</strong> setelah tim kurator admin melakukan kunjungan verifikasi fisik langsung ke alamat workshop Anda untuk menjamin mutu dan keaslian karya kriya.
            </p>
          </div>

          {/* Stepper Timeline */}
          <div className="bg-white rounded-2xl border border-[#E8DFD5] p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#2C221E]">
              Tahapan Verifikasi & Pembukaan Ruang Kerja
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Pendaftaran Terkirim</span>
                </div>
                <p className="text-[11px] text-[#61574F]">
                  Data nama, alamat workshop, jenis produk, dan jadwal kunjungan telah tersimpan di sistem.
                </p>
                <div className="text-[10px] text-emerald-800 font-semibold">
                  ✓ Selesai ({artisan.createdAt})
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 ring-1 ring-amber-200">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>2. Kunjungan Tim Kurator</span>
                </div>
                <p className="text-[11px] text-[#61574F]">
                  Tim admin akan menghubungi WA Anda dan mendatangi alamat workshop Anda.
                </p>
                <div className="text-[10px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  Sedang Menunggu Kunjungan
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2 opacity-75">
                <div className="flex items-center gap-2 text-[#7A7067] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. Approval Admin</span>
                </div>
                <p className="text-[11px] text-[#7A7067]">
                  Admin menyetujui akun setelah hasil kunjungan memenuhi standar mutu kurasi.
                </p>
                <div className="text-[10px] text-[#7A7067]">
                  Belum Aktif
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2 opacity-75">
                <div className="flex items-center gap-2 text-[#7A7067] font-bold text-xs">
                  <Hammer className="w-4 h-4" />
                  <span>4. Menawarkan Kriya & Escrow</span>
                </div>
                <p className="text-[11px] text-[#7A7067]">
                  Tawarkan karya kriya baru, negosiasi chat, terbitkan ke toko, dan terima pencairan dana.
                </p>
                <div className="text-[10px] text-[#7A7067]">
                  Terkunci hingga diapprove
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Permohonan Pendaftaran yang Diisi */}
          <div className="bg-white rounded-2xl border border-[#E8DFD5] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2EAE1] pb-3">
              <h3 className="font-serif text-base font-bold text-[#2C221E] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C533C]" />
                <span>Ringkasan Data Pendaftaran yang Anda Ajukan</span>
              </h3>
              <span className="text-xs text-[#7A7067]">ID: {artisan.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-1">
                <div className="text-[11px] font-bold text-[#8C533C] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Nama Pengrajin</span>
                </div>
                <div className="text-sm font-bold text-[#2C221E]">{artisan.name}</div>
                <div className="text-[11px] text-[#7A7067]">
                  {artisan.workshopName ? `Nama Workshop: ${artisan.workshopName}` : 'Pengrajin Mandiri (Tanpa nama workshop)'}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Jadwal Kunjungan Tim Verifikasi Admin</span>
                </div>
                <div className="text-sm font-bold text-[#2C221E]">
                  {artisan.preferredVisitSchedule}
                </div>
                <div className="text-[11px] text-amber-800">
                  Waktu kesediaan Anda untuk dikunjungi oleh tim kurator Kala Kriya
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-1 sm:col-span-2">
                <div className="text-[11px] font-bold text-[#8C533C] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Alamat Lengkap Workshop untuk Kunjungan Fisik</span>
                </div>
                <div className="text-xs font-semibold text-[#2C221E] leading-relaxed">
                  {artisan.workshopAddress}
                </div>
                <p className="text-[10px] text-[#7A7067]">
                  Tim akan menavigasi ke alamat ini untuk meninjau proses pembuatan kriya secara langsung.
                </p>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-1">
                <div className="text-[11px] font-bold text-[#8C533C] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>Jenis Produk Kriya</span>
                </div>
                <div className="text-xs font-semibold text-[#2C221E]">
                  {artisan.productTypes}
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-1">
                <div className="text-[11px] font-bold text-[#8C533C] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Rekening Bank untuk Pencairan Escrow</span>
                </div>
                <div className="text-xs font-semibold text-[#2C221E]">
                  {artisan.bankName} — {artisan.bankAccount}
                </div>
                <div className="text-[11px] text-[#7A7067]">
                  a.n {artisan.bankAccountName}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Simulator Box */}
          <div className="p-5 bg-[#F2EAE1] rounded-2xl border border-[#E0D5C9] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C533C]">
              <Sparkles className="w-4 h-4" />
              <span>Simulasi Uji Coba (Fitur Demo):</span>
            </div>
            <p className="text-xs text-[#61574F] leading-relaxed">
              Ingin langsung melihat bagaimana Admin melakukan approval pendaftaran pengrajin? Buka Panel Admin di tab <strong>"Verifikasi Pengrajin"</strong> untuk menyetujui akun ini secara langsung, atau Anda juga bisa beralih ke akun demo Wayan Sujana yang telah terverifikasi.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {onGoToAdmin && (
                <button
                  onClick={onGoToAdmin}
                  className="px-4 py-2 bg-[#2C221E] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Buka Panel Admin & Setujui Akun Ini</span>
                </button>
              )}

              <button
                onClick={() => {
                  const demoArtisan: Artisan = {
                    id: 'artisan-wayan',
                    name: 'Wayan Sujana',
                    workshopName: 'Studio Tembikar Kasongan',
                    workshopAddress: 'Jl. Kasongan No. 42, Dusun Kajen, Bangunjiwo, Kasihan, Bantul, D.I. Yogyakarta 55184',
                    productTypes: 'Keramik Bakar Tungku, Tembikar Tanah Liat & Teko Seduh Estetik',
                    preferredVisitSchedule: 'Senin s/d Jumat, 09:00 - 15:00 WIB',
                    specialty: 'Keramik & Gerabah Tradisional',
                    location: 'Kasongan, Bantul, D.I. Yogyakarta',
                    email: 'wayan.sujana@kriya.id',
                    phone: '0812-7788-9900',
                    bankName: 'BCA (Bank Central Asia)',
                    bankAccount: '8820-192-384',
                    bankAccountName: 'WAYAN SUJANA',
                    bio: 'Pengrajin tembikar generasi ketiga yang memadukan tanah liat lokal vulkanik dengan teknik pembakaran tungku kayu tradisional.',
                    createdAt: '2026-01-15',
                    approvalStatus: 'disetujui',
                    approvedAt: '2026-01-18',
                  };
                  onLoginArtisan(demoArtisan);
                }}
                className="px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#2C221E] text-xs font-semibold rounded-xl border border-[#D9C3B0] transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-[#8C533C]" />
                <span>Masuk Akun Pre-Approved (Wayan Sujana)</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="p-4 text-center text-xs text-[#7A7067] border-t border-[#E8DFD5]">
          © {new Date().getFullYear()} Studio dekorasiku — Kemitraan Kriya Berkeadilan
        </footer>
      </div>
    );
  }

  // IF ARTISAN IS REJECTED
  if (artisan && artisan.approvalStatus === 'ditolak') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col justify-between">
        <header className="p-4 sm:p-6 border-b border-[#E8DFD5] bg-white flex items-center justify-between max-w-7xl mx-auto w-full">
          <button
            onClick={onBackToStore}
            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-[#E8DFD5]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Toko</span>
          </button>
          <button
            onClick={onLogoutArtisan}
            className="px-3 py-1.5 border border-[#E8DFD5] hover:bg-gray-100 text-xs font-semibold rounded-lg text-[#61574F]"
          >
            Keluar Akun
          </button>
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-red-200 p-6 sm:p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#2C221E]">
              Pendaftaran Belum Disetujui
            </h2>
            <p className="text-xs text-[#7A7067] leading-relaxed">
              Mohon maaf, permohonan kemitraan pengrajin atas nama <strong>{artisan.name}</strong> belum dapat disetujui pada periode kurasi ini. Anda dapat memperbaiki data workshop atau menghubungi tim studio kami.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={onLogoutArtisan}
                className="w-full py-2.5 bg-[#8C533C] text-white text-xs font-semibold rounded-xl"
              >
                Daftar Ulang dengan Data Baru
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // LOGGED IN ARTISAN DASHBOARD
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col">
      {/* Top Artisan Navbar */}
      <header className="sticky top-0 z-40 bg-[#2C221E] text-white border-b border-[#43352F] shadow-md">
        {/* Row 1: Workshop & Artisan Header Info + Logout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#8C533C] text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
                <span className="truncate">{artisan.workshopName || artisan.name}</span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-sans font-medium flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span>Mitra Terverifikasi</span>
                </span>
                {isSubdomain && (
                  <span className="text-[10px] bg-[#8C533C] text-white border border-[#D9C3B0]/40 px-2 py-0.5 rounded-full font-mono shrink-0">
                    mitra.*
                  </span>
                )}
              </div>
              <p className="text-xs text-[#D9C3B0] mt-0.5 truncate">
                Pengrajin: {artisan.name} · {artisan.location || 'Nusantara'} · {artisan.specialty || 'Kriya Tradisional'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onLogoutArtisan}
              className="px-3.5 py-2 bg-red-900/50 hover:bg-red-800/70 text-red-200 hover:text-white border border-red-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Keluar dari akun pengrajin"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Row 2: Full-Width Horizontal Tab Navigation Bar (Under Page Title) */}
        <div className="border-t border-[#43352F]/80 bg-[#241B18]/95 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
            <nav className="flex items-center gap-1.5 min-w-max">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-[#8C533C] text-white shadow-xs font-bold'
                    : 'text-[#D9C3B0] hover:text-white hover:bg-white/10'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Pesanan Kriya Masuk</span>
                {relevantOrders.filter((o) => o.orderStatus === 'menunggu_konfirmasi').length > 0 ? (
                  <span className="text-[10px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {relevantOrders.filter((o) => o.orderStatus === 'menunggu_konfirmasi').length} Baru
                  </span>
                ) : (
                  <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full">
                    {relevantOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('proposals')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'proposals'
                    ? 'bg-[#8C533C] text-white shadow-xs font-bold'
                    : 'text-[#D9C3B0] hover:text-white hover:bg-white/10'
                }`}
              >
                <Hammer className="w-4 h-4" />
                <span>Penawaran Kriya & Chat Studio</span>
                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full">
                  {artisanProposals.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('stock')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'stock'
                    ? 'bg-[#8C533C] text-white shadow-xs font-bold'
                    : 'text-[#D9C3B0] hover:text-white hover:bg-white/10'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Kelola Stok & Kode Kriya</span>
                {catalogProducts.some((p) => p.stock === 0) ? (
                  <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                    {catalogProducts.filter((p) => p.stock === 0).length} Habis
                  </span>
                ) : (
                  <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full">
                    {catalogProducts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'wallet'
                    ? 'bg-[#8C533C] text-white shadow-xs font-bold'
                    : 'text-[#D9C3B0] hover:text-white hover:bg-white/10'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Pencairan Dana Escrow</span>
                {readyPayoutAmount > 0 && (
                  <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">
                    Siap Dicairkan
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* KPI Strip: Escrow Status & Proposals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Dana Tertahan (Escrow)</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono tabular-nums text-amber-600">
              {formatIDR(escrowLockedAmount)}
            </div>
            <div className="text-[10px] text-[#7A7067] mt-1 leading-snug">
              Menunggu customer konfirmasi barang diterima
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Dana Siap Dicairkan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono tabular-nums text-emerald-700">
              {formatIDR(readyPayoutAmount)}
            </div>
            <div className="text-[10px] text-[#3A4D39] font-medium mt-1">
              Customer sudah konfirmasi kriya sampai
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Total Dicairkan</span>
              <Wallet className="w-4 h-4 text-[#8C533C]" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono tabular-nums text-[#2C221E]">
              {formatIDR(completedPayoutAmount)}
            </div>
            <div className="text-[10px] text-[#7A7067] mt-1">
              Telah ditransfer ke rekening {artisan.bankName}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
            <div className="flex items-center justify-between text-[#7A7067] text-xs">
              <span>Penawaran Kriya</span>
              <Hammer className="w-4 h-4 text-[#8C533C]" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono tabular-nums text-[#2C221E]">
              {artisanProposals.length}
            </div>
            <div className="text-[10px] text-[#7A7067] mt-1">
              {artisanProposals.filter((p) => p.status === 'disetujui').length} disetujui & siap tayang
            </div>
          </div>
        </div>

        {/* TAB 0: PESANAN KRIYA MASUK */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Explanatory Rule Banner */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-[#8C533C]">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Ketentuan Pemrosesan & Pengiriman Kriya Mitra</span>
              </div>
              <p className="text-xs text-[#5C4524] leading-relaxed">
                <strong>1. Konfirmasi Pengrajin:</strong> Status pesanan baru akan menjadi <em>Diproses</em> setelah Anda menekan tombol <strong>Konfirmasi Pesanan</strong>. Sebelum Anda konfirmasi/proses, pelanggan masih berhak membatalkan pesanan.
                <br />
                <strong>2. Batas Pengiriman 1x24 Jam:</strong> Setelah pesanan dikonfirmasi, Anda memiliki waktu <strong>1x24 jam</strong> untuk menyiapkan karya kriya, melakukan packing aman, mengirimkannya via kurir/ekspedisi, dan menginput nomor resi resmi.
              </p>
            </div>

            {/* Filter & Search Bar for Artisan Orders */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                {/* Tab: Semua */}
                <button
                  type="button"
                  onClick={() => setArtisanOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    artisanOrderFilter === 'all'
                      ? 'bg-[#2C221E] text-white shadow-xs font-bold'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                >
                  <span>Semua</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      artisanOrderFilter === 'all' ? 'bg-white/20 text-white font-bold' : 'bg-[#E8DFD5] text-[#554C45]'
                    }`}
                  >
                    {relevantOrders.length}
                  </span>
                </button>

                {/* Tab 1: Pesanan Baru */}
                <button
                  type="button"
                  onClick={() => setArtisanOrderFilter('pesanan_baru')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    artisanOrderFilter === 'pesanan_baru'
                      ? 'bg-amber-700 text-white shadow-xs font-bold ring-1 ring-amber-800'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan baru masuk yang menunggu konfirmasi kesiapan kriya dari Anda"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pesanan Baru</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      artisanOrderFilter === 'pesanan_baru'
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
                  onClick={() => setArtisanOrderFilter('sudah_dikonfirmasi')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    artisanOrderFilter === 'sudah_dikonfirmasi'
                      ? 'bg-[#8C533C] text-white shadow-xs font-bold ring-1 ring-[#73432F]'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan yang sudah Anda konfirmasi dan sedang dalam persiapan/packing (Batas 1x24 jam)"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Sudah Dikonfirmasi</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      artisanOrderFilter === 'sudah_dikonfirmasi'
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
                  onClick={() => setArtisanOrderFilter('dikonfirmasi_belum_selesai')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    artisanOrderFilter === 'dikonfirmasi_belum_selesai'
                      ? 'bg-blue-600 text-white shadow-xs font-bold ring-1 ring-blue-700'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan yang sudah dikirim ke ekspedisi, belum selesai karena menunggu konfirmasi penerimaan pembeli"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dikonfirmasi Belum Selesai</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      artisanOrderFilter === 'dikonfirmasi_belum_selesai'
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
                  onClick={() => setArtisanOrderFilter('selesai')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    artisanOrderFilter === 'selesai'
                      ? 'bg-emerald-700 text-white shadow-xs font-bold ring-1 ring-emerald-800'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan yang telah selesai diterima oleh pembeli dan dana escrow siap dicairkan"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pesanan Selesai</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      artisanOrderFilter === 'selesai'
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
                  onClick={() => setArtisanOrderFilter('dibatalkan')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    artisanOrderFilter === 'dibatalkan'
                      ? 'bg-red-600 text-white shadow-xs font-bold ring-1 ring-red-700'
                      : 'bg-[#FAF7F2] text-[#61574F] hover:bg-[#F2EAE1]'
                  }`}
                  title="Pesanan kriya yang dibatalkan"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dibatalkan</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      artisanOrderFilter === 'dibatalkan'
                        ? 'bg-white text-red-900'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pesananDibatalkanCount}
                  </span>
                </button>
              </div>

              {/* Search Order in Artisan Portal */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[#A89F95] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ID pesanan, nama kriya, kota..."
                  value={artisanOrderSearch}
                  onChange={(e) => setArtisanOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredArtisanOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-[#E8DFD5] space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] text-[#8C533C] flex items-center justify-center">
                  {artisanOrderFilter === 'pesanan_baru' && <Clock className="w-6 h-6 text-amber-600" />}
                  {artisanOrderFilter === 'sudah_dikonfirmasi' && <Package className="w-6 h-6 text-[#8C533C]" />}
                  {artisanOrderFilter === 'dikonfirmasi_belum_selesai' && <Truck className="w-6 h-6 text-blue-600" />}
                  {artisanOrderFilter === 'selesai' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                  {artisanOrderFilter === 'dibatalkan' && <XCircle className="w-6 h-6 text-red-600" />}
                  {artisanOrderFilter === 'all' && <Package className="w-6 h-6 text-[#8C533C]" />}
                </div>
                <h4 className="font-serif text-base font-bold text-[#2C221E]">
                  {artisanOrderFilter === 'pesanan_baru' && 'Tidak Ada Pesanan Baru'}
                  {artisanOrderFilter === 'sudah_dikonfirmasi' && 'Tidak Ada Pesanan yang Sedang Diproses'}
                  {artisanOrderFilter === 'dikonfirmasi_belum_selesai' && 'Tidak Ada Pesanan dalam Pengiriman'}
                  {artisanOrderFilter === 'selesai' && 'Belum Ada Pesanan yang Selesai'}
                  {artisanOrderFilter === 'dibatalkan' && 'Tidak Ada Pesanan yang Dibatalkan'}
                  {artisanOrderFilter === 'all' && 'Belum Ada Riwayat Pesanan'}
                </h4>
                <p className="text-xs text-[#7A7067] max-w-md mx-auto">
                  {artisanOrderFilter === 'pesanan_baru' &&
                    'Pesanan baru yang menunggu konfirmasi kesiapan kriya Anda akan muncul di tab ini.'}
                  {artisanOrderFilter === 'sudah_dikonfirmasi' &&
                    'Pesanan yang telah Anda konfirmasi dan sedang dalam proses penyiapan kriya / batas 1x24 jam akan muncul di tab ini.'}
                  {artisanOrderFilter === 'dikonfirmasi_belum_selesai' &&
                    'Pesanan yang telah Anda serahkan ke ekspedisi kurir & diinput resinya akan muncul di sini hingga kriya diterima pembeli.'}
                  {artisanOrderFilter === 'selesai' &&
                    'Pesanan kriya yang telah berhasil diterima oleh pelanggan dan dananya siap/telah dicairkan ke rekening Anda.'}
                  {artisanOrderFilter === 'dibatalkan' && 'Tidak ada transaksi atau pesanan kriya yang dibatalkan.'}
                  {artisanOrderFilter === 'all' &&
                    'Saat pembeli menyelesaikan pembayaran untuk produk kriya Anda, pesanan akan langsung muncul di sini untuk dikonfirmasi.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArtisanOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="bg-white rounded-2xl border border-[#E8DFD5] p-5 sm:p-6 shadow-xs hover:border-[#D5C6B7] transition-all space-y-4"
                  >
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE3] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-bold text-[#8C533C]">
                          #{ord.orderId}
                        </span>
                        <span className="text-xs text-[#7A7067]">·</span>
                        <span className="text-xs text-[#7A7067]">{ord.date}</span>
                        <span className="text-xs text-[#7A7067]">·</span>
                        <span className="text-xs font-semibold text-[#2C221E]">
                          {ord.customerName}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        {ord.orderStatus === 'menunggu_konfirmasi' && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Perlu Konfirmasi Pengrajin</span>
                          </span>
                        )}
                        {ord.orderStatus === 'diproses' && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-[#F2EAE1] text-[#8C533C] border border-[#E8DFD5]">
                            <Package className="w-3.5 h-3.5 text-[#8C533C]" />
                            <span>Diproses (Batas 1x24 Jam)</span>
                          </span>
                        )}
                        {ord.orderStatus === 'dikirim' && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Dalam Pengiriman</span>
                          </span>
                        )}
                        {ord.orderStatus === 'selesai' && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Selesai Diterima Customer</span>
                          </span>
                        )}
                        {ord.orderStatus === 'dibatalkan' && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Pesanan Dibatalkan</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                      {/* Products */}
                      <div className="md:col-span-5 space-y-2">
                        <div className="font-bold text-[#8C533C] uppercase tracking-wider text-[11px]">
                          Karya Dipesan:
                        </div>
                        <div className="space-y-1.5">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[#61574F]">
                              <span className="font-medium text-[#2C221E]">
                                {it.product.name} × {it.quantity}
                              </span>
                              <span className="font-mono text-[#8C533C]">
                                {formatIDR(it.product.price * it.quantity)}
                              </span>
                            </div>
                          ))}
                          {ord.giftWrapping && (
                            <div className="text-[11px] text-[#8C533C] font-semibold">
                              + Bungkus Kado & Kartu Ucapan
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recipient Address */}
                      <div className="md:col-span-4 space-y-2">
                        <div className="font-bold text-[#8C533C] uppercase tracking-wider text-[11px]">
                          Tujuan Pengiriman:
                        </div>
                        <div className="text-[#2C221E] font-medium">
                          {ord.customerName} ({ord.phone})
                        </div>
                        <div className="text-[#7A7067] leading-relaxed">
                          {ord.address}, {ord.city}
                        </div>
                        <div className="text-[11px] text-[#8C533C] flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kurir yang dipilih: {ord.shippingMethod}</span>
                        </div>
                      </div>

                      {/* Actions & 1x24h countdown */}
                      <div className="md:col-span-3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#F2ECE3] pt-3 md:pt-0 md:pl-5 space-y-3">
                        <div>
                          <div className="text-[11px] text-[#7A7067]">Total Tagihan Pesanan:</div>
                          <div className="text-base font-bold font-mono text-[#8C533C]">
                            {formatIDR(ord.total)}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-2">
                          {ord.orderStatus === 'menunggu_konfirmasi' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onConfirmOrderArtisan) {
                                  onConfirmOrderArtisan(ord.orderId);
                                }
                              }}
                              className="w-full py-2 px-3 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Konfirmasi Pesanan</span>
                            </button>
                          )}

                          {ord.orderStatus === 'diproses' && (
                            <div className="space-y-1.5">
                              {ord.shipmentDeadline && (
                                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 space-y-0.5">
                                  <div className="font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Batas Waktu Pengiriman 1x24 Jam:</span>
                                  </div>
                                  <div className="font-mono font-semibold text-amber-950">
                                    {ord.shipmentDeadline}
                                  </div>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setShippingModalOrder(ord);
                                  setShippingCourierInput(ord.shippingMethod.split(' ')[0] || 'J&T Express');
                                  setTrackingNumberInput(`DKR-${ord.orderId}-${Math.floor(1000 + Math.random() * 9000)}`);
                                }}
                                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Kirim Pesanan & Input Resi</span>
                              </button>
                            </div>
                          )}

                          {ord.orderStatus === 'dikirim' && (
                            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-[11px] text-blue-900 space-y-1">
                              <div className="font-bold">Kurir: {ord.shippingCourier || 'Ekspedisi'}</div>
                              <div className="font-mono text-xs font-bold truncate">Resi: {ord.shippingTrackingNumber || '-'}</div>
                              <div className="text-[10px] text-blue-700">Dikirim: {ord.shippedAt || 'Hari Ini'}</div>
                            </div>
                          )}

                          {ord.orderStatus === 'selesai' && (
                            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 text-center font-semibold">
                              ✓ Kriya Diterima & Escrow Dicairkan
                            </div>
                          )}

                          {ord.orderStatus === 'dibatalkan' && (
                            <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-[11px] text-red-700 text-center">
                              Pesanan Dibatalkan oleh Pelanggan
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

        {/* TAB 1: PENAWARAN KRIYA & CHAT DENGAN ADMIN */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DFD5]">
              <div>
                <h3 className="font-serif text-base font-bold text-[#2C221E]">
                  Daftar Penawaran Barang Kerajinan
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Tawarkan karya baru Anda. Diskusikan harga & spesifikasi di ruang chat dengan admin hingga disetujui (*Approved*).
                </p>
              </div>

              <button
                onClick={() => setIsCreatingProposal(true)}
                className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tawarkan Kriya Baru</span>
              </button>
            </div>

            {/* Split Screen: Proposals List (Left) vs Chat Room dengan Admin (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
              {/* Left Column: Proposals Cards */}
              <div className="lg:col-span-5 space-y-3">
                {artisanProposals.map((prop) => {
                  const isSelected = prop.id === selectedProposalId;

                  return (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedProposalId(prop.id)}
                      className={`p-4 bg-white rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#8C533C] shadow-sm bg-[#FDFBF9] ring-1 ring-[#8C533C]'
                          : 'border-[#E8DFD5] hover:border-[#D5C6B7]'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={prop.sampleImage}
                            alt={prop.title}
                            className="w-16 h-16 rounded-lg object-cover border border-[#E8DFD5]"
                          />
                          {prop.sampleImages && prop.sampleImages.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>{prop.sampleImages.length}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase font-bold text-[#8C533C] tracking-wider">
                              {prop.categoryLabel}
                            </span>
                            {/* Status badge */}
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
                              {prop.status === 'disetujui' && 'Disetujui Admin!'}
                              {prop.status === 'tayang_di_toko' && 'Tayang di Toko'}
                              {prop.status === 'dalam_negosiasi' && 'Diskusi / Negosiasi'}
                              {prop.status === 'menunggu_review' && 'Menunggu Review'}
                            </span>
                          </div>

                          <h4 className="font-serif text-xs font-bold text-[#2C221E] truncate mt-1">
                            {prop.title}
                          </h4>

                          <div className="text-xs font-mono font-semibold text-[#8C533C] mt-0.5 tabular-nums">
                            Usulan: {formatIDR(prop.proposedPrice)}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#61574F] mt-2 line-clamp-2 leading-relaxed">
                        {prop.initialDescription}
                      </p>

                      {/* Unlock Action if Approved: Input Details & Publish */}
                      {prop.status === 'disetujui' && (
                        <div className="mt-3 pt-2.5 border-t border-[#F2ECE3] flex items-center justify-between">
                          <span className="text-[10px] text-emerald-700 font-medium">
                            ✓ Kesepakatan tercapai.
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPublishModal(prop);
                            }}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Input Rincian & Terbitkan</span>
                          </button>
                        </div>
                      )}

                      {prop.status === 'tayang_di_toko' && (
                        <div className="mt-2 text-[10px] text-blue-700 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Kriya ini telah aktif tayang dan dapat dibeli customer di katalog toko.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Chat Room Tied to This Proposal */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#E8DFD5] flex flex-col justify-between overflow-hidden shadow-xs">
                {activeProposal ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-[#E8DFD5] bg-[#FAF7F2] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={activeProposal.sampleImage}
                          alt={activeProposal.title}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E8DFD5]"
                        />
                        <div>
                          <div className="text-[10px] text-[#8C533C] font-bold uppercase tracking-wider">
                            Chat Negosiasi & Kurasi Produk #{activeProposal.id}
                          </div>
                          <h4 className="font-serif text-xs font-bold text-[#2C221E]">
                            {activeProposal.title}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-[#7A7067]">Usulan Harga:</div>
                        <div className="font-mono text-xs font-bold text-[#8C533C] tabular-nums">
                          {formatIDR(activeProposal.proposedPrice)}
                        </div>
                      </div>
                    </div>

                    {/* Multi-Photo Preview Strip for Artisan */}
                    {activeProposal.sampleImages && activeProposal.sampleImages.length > 1 && (
                      <div className="px-4 py-2 bg-white border-b border-[#E8DFD5] flex items-center gap-2 overflow-x-auto">
                        <span className="text-[10px] font-bold text-[#8C533C] whitespace-nowrap flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-[#8C533C]" />
                          <span>{activeProposal.sampleImages.length} Foto Purwarupa:</span>
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {activeProposal.sampleImages.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`${activeProposal.title} ${i + 1}`}
                              className="w-9 h-9 rounded-lg object-cover border border-[#E8DFD5] shrink-0 hover:scale-105 transition-transform"
                              title={`Foto ${i + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages Scroll Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]/30 max-h-[400px]">
                      <div className="text-center py-2">
                        <span className="text-[10px] text-[#7A7067] bg-white px-2.5 py-1 rounded-full border border-[#E8DFD5]">
                          Ruang obrolan langsung antara Pengrajin & Tim Kurator Admin
                        </span>
                      </div>

                      {activeChats.length === 0 ? (
                        <div className="text-center py-10 text-xs text-[#7A7067]">
                          Belum ada pesan untuk penawaran ini. Tulis pesan pertama Anda ke kurator admin di bawah.
                        </div>
                      ) : (
                        activeChats.map((c) => {
                          const isArtisan = c.sender === 'artisan';
                          return (
                            <div
                              key={c.id}
                              className={`flex flex-col ${isArtisan ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                  isArtisan
                                    ? 'bg-[#8C533C] text-white rounded-br-xs'
                                    : 'bg-white border border-[#E8DFD5] text-[#2C221E] rounded-bl-xs'
                                }`}
                              >
                                <div className="font-serif font-bold text-[11px] mb-1 text-[#D9C3B0]">
                                  {isArtisan ? 'Anda (Pengrajin)' : 'Tim Kurator Kala Kriya (Admin)'}
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
                      onSubmit={handleSendChat}
                      className="p-3 border-t border-[#E8DFD5] bg-white flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Diskusikan spesifikasi, harga pas, atau waktu pembuatan..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C]"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-[#7A7067]">
                    Pilih salah satu penawaran kriya di sebelah kiri untuk membuka ruang chat.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOMPET & PENCAIRAN DANA ESCROW */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Escrow Rule Explanation Card */}
            <div className="p-5 bg-white rounded-xl border border-[#E8DFD5] space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#8C533C]/10 text-[#8C533C] rounded-lg shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif text-base font-bold text-[#2C221E]">
                    Aturan Pencairan Dana Hasil Penjualan Kriya (Sistem Rekening Bersama / Escrow)
                  </h3>
                  <p className="text-xs text-[#61574F] leading-relaxed">
                    Sesuai kesepakatan etika kriya, <strong>pembayaran ke pengrajin baru dapat dicairkan setelah customer mengonfirmasi bahwa kriya telah diterima dalam kondisi utuh dan baik</strong>. Hal ini memberikan rasa aman bagi pembeli sekaligus menjamin kualitas karya pengrajin mitra.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-[#7A7067]">
                    <span className="flex items-center gap-1 text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Status Tertahan: Sedang dikirim ke customer</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Status Siap Cair: Customer telah klik konfirmasi terima</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rekening Info & Ready Balance Box */}
            <div className="p-5 bg-[#F2EAE1] rounded-xl border border-[#E0D5C9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider">
                  Rekening Penerimaan Pengrajin
                </div>
                <div className="font-serif text-base font-bold text-[#2C221E] mt-0.5">
                  {artisan.bankName} — {artisan.bankAccount}
                </div>
                <div className="text-xs text-[#7A7067]">
                  Atas Nama: <span className="font-semibold text-[#2C221E]">{artisan.bankAccountName}</span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-2">
                <div>
                  <div className="text-xs text-[#7A7067]">Saldo yang Siap Ditransfer:</div>
                  <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
                    {formatIDR(readyPayoutAmount)}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={readyPayoutAmount === 0}
                  onClick={() => {
                    const ready = artisanPayouts.find((p) => p.status === 'siap_dicairkan');
                    if (ready) onRequestPayout(ready.id);
                  }}
                  className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Ajukan Pencairan Saldo ke Rekening</span>
                </button>
              </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-xl border border-[#E8DFD5] overflow-hidden">
              <div className="p-4 border-b border-[#F2ECE3] flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-[#2C221E]">
                  Riwayat Penjualan & Status Pelepasan Dana Escrow
                </h4>
                <span className="text-xs text-[#7A7067]">
                  {artisanPayouts.length} transaksi penjualan
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#7A7067] font-semibold border-b border-[#E8DFD5]">
                    <tr>
                      <th className="p-3.5">ID Pesanan</th>
                      <th className="p-3.5">Karya Kriya</th>
                      <th className="p-3.5">Tanggal Beli</th>
                      <th className="p-3.5">Hasil Bersih Pengrajin</th>
                      <th className="p-3.5">Status Penerimaan Customer</th>
                      <th className="p-3.5">Status Dana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE3]">
                    {artisanPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#8C533C]">
                          #{payout.orderId}
                        </td>
                        <td className="p-3.5 font-semibold text-[#2C221E]">
                          {payout.productName}
                        </td>
                        <td className="p-3.5 text-[#7A7067]">{payout.orderDate}</td>
                        <td className="p-3.5 font-mono font-bold text-[#2C221E] tabular-nums">
                          {formatIDR(payout.amount)}
                        </td>
                        <td className="p-3.5">
                          {payout.status === 'tertahan_menunggu_terima' ? (
                            <span className="text-amber-700 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Sedang dalam perjalanan</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Telah Diterima ({payout.customerReceivedAt})</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {payout.status === 'tertahan_menunggu_terima' && (
                            <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              Tertahan di Escrow
                            </span>
                          )}
                          {payout.status === 'siap_dicairkan' && (
                            <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              Siap Dicairkan
                            </span>
                          )}
                          {payout.status === 'dicairkan_ke_rekening' && (
                            <span className="inline-block bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              Telah Ditransfer
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

        {/* TAB 3: KELOLA STOK KRIYA & KODE BARANG 10-DIGIT */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            {/* Rule & Specification Box */}
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50/70 rounded-2xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#8C533C]">
                <Tag className="w-4 h-4 text-[#8C533C]" />
                <span>Ketentuan Kode Barang 10-Digit & Maintenance Stok Pengrajin</span>
              </div>
              
              <div className="text-xs text-[#5C4524] leading-relaxed space-y-2">
                <p>
                  <strong>1. Struktur Kode Barang (10 Digit Heksadesimal):</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                    <span className="font-bold text-[#8C533C] block mb-0.5">Digit 1 - 5 (Heksa)</span>
                    <strong className="text-[#2C221E] font-mono">Nomor Urut Pengrajin</strong>
                    <p className="text-[11px] text-[#7A7067] mt-0.5">Pengrajin #1 = <code className="font-mono font-bold text-[#8C533C]">00001</code>, #2 = <code className="font-mono font-bold text-[#8C533C]">00002</code>, #10 = <code className="font-mono font-bold text-[#8C533C]">0000A</code></p>
                  </div>
                  <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                    <span className="font-bold text-[#8C533C] block mb-0.5">Digit 6 - 7 (Heksa)</span>
                    <strong className="text-[#2C221E] font-mono">Kode Bahan Baku Kriya</strong>
                    <p className="text-[11px] text-[#7A7067] mt-0.5"><code className="font-mono font-bold text-[#8C533C]">01</code>: Keramik, <code className="font-mono font-bold text-[#8C533C]">02</code>: Anyaman, <code className="font-mono font-bold text-[#8C533C]">03</code>: Kayu, <code className="font-mono font-bold text-[#8C533C]">04</code>: Lilin, <code className="font-mono font-bold text-[#8C533C]">05</code>: Tekstil</p>
                  </div>
                  <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                    <span className="font-bold text-[#8C533C] block mb-0.5">Digit 8 - 10 (Heksa)</span>
                    <strong className="text-[#2C221E] font-mono">Nomor Urut Barang</strong>
                    <p className="text-[11px] text-[#7A7067] mt-0.5">Barang ke-1 = <code className="font-mono font-bold text-[#8C533C]">001</code>, ke-2 = <code className="font-mono font-bold text-[#8C533C]">002</code>, ke-16 = <code className="font-mono font-bold text-[#8C533C]">010</code></p>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-amber-200 flex items-start gap-2.5">
                  <PackageX className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2C221E]">2. Ketentuan Stok 0 & Foto Buram:</strong>
                    <p className="text-[11px] text-[#5C4524] mt-0.5">
                      Jumlah stok dimaintain langsung oleh pengrajin. Jika Anda mengatur stok menjadi <strong>0 unit</strong>, foto barang di etalase toko dekorasiku otomatis ditampilkan <strong>buram (blurred)</strong> dengan badge peringatan <em>"Stok Habis (0)"</em> dan tombol pembelian dinonaktifkan hingga Anda menambah stok kembali.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DFD5]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStockFilterMode('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    stockFilterMode === 'all'
                      ? 'bg-[#2C221E] text-white'
                      : 'bg-[#FAF7F2] text-[#574E47] hover:bg-[#F2EAE1]'
                  }`}
                >
                  Semua Kriya di Toko ({catalogProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilterMode('mine')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    stockFilterMode === 'mine'
                      ? 'bg-[#2C221E] text-white'
                      : 'bg-[#FAF7F2] text-[#574E47] hover:bg-[#F2EAE1]'
                  }`}
                >
                  Kriya Usaha Saya ({catalogProducts.filter(checkIsMine).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilterMode('out_of_stock')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    stockFilterMode === 'out_of_stock'
                      ? 'bg-red-700 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  Stok 0 / Foto Buram ({catalogProducts.filter((p) => p.stock === 0).length})
                </button>
              </div>

              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  placeholder="Cari kode (#0000101001), kriya, usaha..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>
            </div>

            {/* List of Products for Stock Maintenance */}
            <div className="space-y-4">
              {filteredStockProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const parsed = parseProductCode(p.productCode);
                const currentInputValue = customStockInputs[p.id] ?? String(p.stock);

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
                      isOutOfStock ? 'border-red-200 bg-red-50/20' : 'border-[#E8DFD5]'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* Product Image (Buram jika stok 0) */}
                      <div className="md:col-span-3">
                        <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border border-[#E8DFD5] bg-[#F5EFEB]">
                          <img
                            src={p.image}
                            alt={p.name}
                            className={`w-full h-full object-cover transition-all duration-300 ${
                              isOutOfStock ? 'filter blur-[4px] grayscale-[35%] opacity-75' : ''
                            }`}
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
                              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded shadow-xs">
                                Stok 0 · Foto Buram
                              </span>
                              <span className="text-[9px] text-white/90 mt-1">
                                Tampil buram di toko
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-[#2C221E]/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/20">
                            #{p.productCode}
                          </div>
                        </div>
                      </div>

                      {/* Product Metadata & 10-Digit Code Breakdown */}
                      <div className="md:col-span-5 space-y-2">
                        {/* Nama Usaha Pengrajin */}
                        <div className="flex items-center gap-1.5 text-xs text-[#8C533C] font-bold">
                          <Store className="w-3.5 h-3.5" />
                          <span>{p.artisan.workshopName}</span>
                          <span className="text-[#A89F95] font-normal">({p.artisan.location})</span>
                        </div>

                        <h4 className="font-serif text-base font-bold text-[#2C221E]">
                          {p.name}
                        </h4>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-[#8C533C]">{formatIDR(p.price)}</span>
                          <span className="text-[#D5C6B7]">·</span>
                          <span className="text-[#7A7067]">{p.categoryLabel}</span>
                        </div>

                        {/* Breakdown 10 Digit Hex */}
                        <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E8DFD5] text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-mono font-bold text-[#2C221E]">
                            <span>Kode: #{p.productCode}</span>
                            <span className="text-[10px] text-[#7A7067] font-sans font-normal">(10 Digit Hexa)</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-[#574E47]">
                            <div>Pengrajin: <strong className="font-mono font-bold text-[#8C533C]">{parsed.artisanHex}</strong></div>
                            <div>Bahan: <strong className="font-mono font-bold text-[#8C533C]">{parsed.materialHex}</strong></div>
                            <div>Barang: <strong className="font-mono font-bold text-[#8C533C]">{parsed.itemHex}</strong></div>
                          </div>
                        </div>
                      </div>

                      {/* Stock Maintainer Controls */}
                      <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#F2ECE3] pt-3 md:pt-0 md:pl-5 space-y-3">
                        <div>
                          <div className="text-[11px] text-[#7A7067] font-medium">Status Stok Saat Ini:</div>
                          <div className="flex items-center gap-2 mt-1">
                            {isOutOfStock ? (
                              <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg border border-red-200">
                                Stok: 0 Unit (Habis - Foto Buram)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                                Stok Tersedia: {p.stock} Unit
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Stepper & Simulation Buttons */}
                        <div className="space-y-2">
                          <div className="text-[11px] text-[#574E47] font-semibold">Ubah Stok Kriya:</div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onUpdateProductStock && onUpdateProductStock(p.id, Math.max(0, p.stock - 1))}
                              className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] text-xs font-bold rounded-md border border-[#E8DFD5] cursor-pointer"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateProductStock && onUpdateProductStock(p.id, p.stock + 1)}
                              className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] text-xs font-bold rounded-md border border-[#E8DFD5] cursor-pointer"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateProductStock && onUpdateProductStock(p.id, p.stock + 5)}
                              className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] text-xs font-bold rounded-md border border-[#E8DFD5] cursor-pointer"
                            >
                              +5
                            </button>

                            {/* Tombol Khusus untuk Menguji Syarat: Jika stock 0 foto barang buram */}
                            <button
                              type="button"
                              onClick={() => onUpdateProductStock && onUpdateProductStock(p.id, 0)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-md shadow-xs cursor-pointer"
                              title="Setel stok menjadi 0 untuk menguji efek foto barang buram di toko"
                            >
                              Set 0 (Tes Buram)
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateProductStock && onUpdateProductStock(p.id, 10)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-md shadow-xs cursor-pointer"
                            >
                              Restok 10
                            </button>
                          </div>

                          {/* Custom Number Input */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="number"
                              min="0"
                              value={currentInputValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomStockInputs((prev) => ({ ...prev, [p.id]: val }));
                              }}
                              className="w-20 px-2.5 py-1 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg font-mono font-bold focus:outline-none focus:border-[#8C533C]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const num = parseInt(currentInputValue, 10);
                                if (!isNaN(num) && onUpdateProductStock) {
                                  onUpdateProductStock(p.id, Math.max(0, num));
                                }
                              }}
                              className="px-3 py-1 bg-[#2C221E] hover:bg-[#8C533C] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Simpan Stok
                            </button>
                            <button
                              type="button"
                              onClick={onBackToStore}
                              className="text-[11px] text-[#8C533C] hover:underline flex items-center gap-1 font-semibold ml-auto cursor-pointer"
                              title="Lihat tampilan di toko"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat di Toko</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: BUAT USULAN KRIYA BARU */}
      {isCreatingProposal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setIsCreatingProposal(false)}
        >
          <div
            className="bg-[#FAF7F2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8DFD5] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E8DFD5] bg-white flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#2C221E]">
                Formulir Usulan Penawaran Kriya
              </h3>
              <button
                onClick={() => setIsCreatingProposal(false)}
                className="text-[#7A7067] hover:text-[#2C221E]"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmitNewProposal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Nama Karya Kriya yang Ditawarkan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Teko Seduh Tanah Liat Kasongan"
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Kategori Kriya
                  </label>
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  >
                    <option value="keramik">Keramik & Tembikar</option>
                    <option value="anyaman">Anyaman & Serat Alami</option>
                    <option value="kayu">Kayu & Perabot Mini</option>
                    <option value="tekstil">Tekstil & Tenun</option>
                    <option value="aromaterapi">Aromaterapi & Lilin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Usulan Harga Jual (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    step="5000"
                    value={propPrice}
                    onChange={(e) => setPropPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Deskripsi Bahan & Cerita Proses Pembuatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan asal tanah liat / kayu, teknik pembakaran, keistimewaan karya..."
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#2C221E]">
                    Foto Contoh / Purwarupa Kriya <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[11px] font-bold ${propImages.length >= 5 ? 'text-amber-800 bg-amber-100' : 'text-[#8C533C] bg-[#8C533C]/10'} px-2 py-0.5 rounded-full`}>
                    {propImages.length}/5 Foto
                  </span>
                </div>

                {/* Photo Previews Grid (Up to 5 Photos) */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-2.5">
                  {propImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#E8DFD5] bg-white shadow-2xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`Foto Kriya ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 right-1 bg-[#8C533C]/90 text-white text-[9px] font-bold text-center py-0.5 rounded shadow-xs">
                          Foto Utama
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-xs"
                        title="Hapus foto ini"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Tile if less than 5 photos */}
                  {propImages.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-[#8C533C]/50 hover:border-[#8C533C] bg-[#FAF7F2] hover:bg-[#F2EAE1] flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group shadow-2xs">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 text-[#8C533C] group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-[10px] font-bold text-[#8C533C] leading-tight">
                        + Unggah Foto
                      </span>
                      <span className="text-[9px] text-[#7A7067] mt-0.5">
                        ({5 - propImages.length} slot lagi)
                      </span>
                    </label>
                  )}
                </div>

                <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] text-[11px] text-[#61574F] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#2C221E]">
                    <Upload className="w-3.5 h-3.5 text-[#8C533C]" />
                    <span>Bisa unggah hingga 5 foto langsung dari kamera/HP/PC</span>
                  </div>
                  <p className="text-[10px] text-[#7A7067]">
                    Sertakan foto karya dari berbagai sudut (tampak depan, samping, detail tekstur pahatan/anyaman/glasir) untuk mempermudah tim kurator memeriksa mutu kriya.
                  </p>
                </div>

                {/* Quick Add Preset Buttons */}
                <div className="mt-2.5 pt-2 border-t border-[#E8DFD5]/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#7A7067] font-medium">Atau tambah foto preset:</span>
                  {[
                    { label: 'Teko Keramik', url: '/assets/images/product_ceramic_mug_1792844459730.jpg' },
                    { label: 'Anyaman Lamun', url: '/assets/images/product_woven_basket_1792844459724.jpg' },
                    { label: 'Baki Kayu Jati', url: '/assets/images/product_teak_tray_1792844460545.jpg' },
                    { label: 'Lilin Kedelai', url: '/assets/images/product_soy_candle_1792844460159.jpg' },
                    { label: 'Meja Bengkel', url: '/assets/images/hero_artisanal_studio_1792844458806.jpg' },
                  ].map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      disabled={propImages.length >= 5 || propImages.includes(sample.url)}
                      onClick={() => handleAddSamplePhoto(sample.url)}
                      className="px-2 py-0.5 bg-white hover:bg-[#F2EAE1] disabled:opacity-40 text-[10px] text-[#574E47] border border-[#E8DFD5] rounded-lg transition-colors cursor-pointer"
                    >
                      + {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setIsCreatingProposal(false)}
                  className="px-4 py-2 text-xs text-[#574E47] hover:bg-[#F2EAE1] rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Kirim Usulan ke Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INPUT RINCIAN LENGKAP SETELAH DISETUJUI ADMIN */}
      {publishingProposal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setPublishingProposal(null)}
        >
          <div
            className="bg-[#FAF7F2] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#E8DFD5] my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E8DFD5] bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                  Tahap Publikasi (Approved)
                </span>
                <h3 className="font-serif text-base font-bold text-[#2C221E]">
                  Lengkapi Informasi Kriya untuk Tayang di Toko
                </h3>
              </div>
              <button
                onClick={() => setPublishingProposal(null)}
                className="text-[#7A7067] hover:text-[#2C221E]"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmitPublish} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Nama Resmi Kriya di Toko
                </label>
                <input
                  type="text"
                  required
                  value={pubOfficialName}
                  onChange={(e) => setPubOfficialName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Harga Jual Resmi (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    step="5000"
                    value={pubPrice}
                    onChange={(e) => setPubPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Stok Siap Jual (Unit)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pubStock}
                    onChange={(e) => setPubStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Bahan / Material Kriya
                </label>
                <input
                  type="text"
                  required
                  value={pubMaterials}
                  onChange={(e) => setPubMaterials(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  placeholder="Pisahkan dengan koma..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Ukuran & Dimensi
                </label>
                <input
                  type="text"
                  required
                  value={pubDimensions}
                  onChange={(e) => setPubDimensions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Panduan Perawatan untuk Pembeli
                </label>
                <textarea
                  rows={2}
                  required
                  value={pubCare}
                  onChange={(e) => setPubCare(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                />
              </div>

              {/* Opsi Pengiriman */}
              <div className="p-3 bg-white rounded-lg border border-[#E8DFD5] space-y-2">
                <div className="text-xs font-semibold text-[#2C221E] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#8C533C]" />
                  <span>Opsi Pengiriman yang Didukung</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pubShippingReguler}
                      onChange={(e) => setPubShippingReguler(e.target.checked)}
                      className="accent-[#8C533C]"
                    />
                    <span>Reguler Aman</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pubShippingKilat}
                      onChange={(e) => setPubShippingKilat(e.target.checked)}
                      className="accent-[#8C533C]"
                    />
                    <span>Ekspedisi Kilat</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pubShippingPeti}
                      onChange={(e) => setPubShippingPeti(e.target.checked)}
                      className="accent-[#8C533C]"
                    />
                    <span>Peti Kayu</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setPublishingProposal(null)}
                  className="px-4 py-2 text-xs text-[#574E47] hover:bg-[#F2EAE1] rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Terbitkan Kriya ke Toko Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Nomor Resi Pengiriman oleh Pengrajin */}
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
                    Kirim & Input Resi Pengiriman Kriya
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
                Pengrajin wajib mengirimkan paket kriya dan menginput nomor resi resmi maksimal 1x24 jam setelah pesanan dikonfirmasi.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!trackingNumberInput.trim()) return;
                if (onShipOrder) {
                  onShipOrder(shippingModalOrder.orderId, trackingNumberInput.trim(), shippingCourierInput);
                }
                setShippingModalOrder(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[#574E47] mb-1">Pilih Ekspedisi / Kurir Pengiriman:</label>
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
                  <label className="block font-bold text-[#574E47]">Nomor Resi Pengiriman Resmi:</label>
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
