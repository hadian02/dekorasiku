import React, { useState } from 'react';
import {
  Artisan,
  ArtisanProposal,
  ArtisanProposalChat,
  ArtisanPayout,
  Product
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
  ArrowRight
} from 'lucide-react';

interface ArtisanPortalProps {
  artisan: Artisan | null;
  registeredArtisans?: Artisan[];
  proposals: ArtisanProposal[];
  proposalChats: ArtisanProposalChat[];
  payouts: ArtisanPayout[];
  onBackToStore: () => void;
  onLoginArtisan: (artisan: Artisan) => void;
  onLogoutArtisan: () => void;
  onRegisterArtisan?: (artisan: Artisan) => void;
  onCreateProposal: (data: {
    title: string;
    category: ArtisanProposal['category'];
    categoryLabel: string;
    initialDescription: string;
    proposedPrice: number;
    sampleImage: string;
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
  onGoToAdmin?: () => void;
}

export const ArtisanPortal: React.FC<ArtisanPortalProps> = ({
  artisan,
  registeredArtisans = [],
  proposals,
  proposalChats,
  payouts,
  onBackToStore,
  onLoginArtisan,
  onLogoutArtisan,
  onRegisterArtisan,
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
  const [activeTab, setActiveTab] = useState<'proposals' | 'publish' | 'wallet'>('proposals');

  // Proposal Creation Modal
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propCategory, setPropCategory] = useState<ArtisanProposal['category']>('keramik');
  const [propDesc, setPropDesc] = useState('');
  const [propPrice, setPropPrice] = useState(250000);
  const [propImage, setPropImage] = useState('/src/assets/images/product_ceramic_mug_1792844459730.jpg');

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
  const [pubImage, setPubImage] = useState('/src/assets/images/product_ceramic_mug_1792844459730.jpg');
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

  const handleSubmitNewProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || !propDesc.trim()) {
      alert('Mohon isi nama kriya dan deskripsi usulan.');
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
      sampleImage: propImage,
    });

    setIsCreatingProposal(false);
    setPropTitle('');
    setPropDesc('');
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

    onPublishCraftDetails(publishingProposal.id, {
      officialName: pubOfficialName.trim(),
      finalPrice: Number(pubPrice),
      stock: Number(pubStock),
      images: [pubImage, '/src/assets/images/hero_artisanal_studio_1792844458806.jpg'],
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
            <div className="font-serif font-bold text-lg text-[#2C221E]">
              Portal Mitra Pengrajin Kala Kriya
            </div>
          </div>
          <span className="text-xs text-[#8C533C] font-semibold tracking-wider uppercase hidden sm:inline">
            Khusus Pengrajin & Studio Mitra
          </span>
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
                      Alamat ini akan dikunjungi langsung oleh tim kurator Kala Kriya untuk inspeksi alat & mutu bahan.
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
                onClick={onBackToStore}
                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-[#E8DFD5]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ke Toko</span>
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
              Halo <strong>{artisan.name}</strong>, formulir pendaftaran mitra pengrajin Anda telah kami terima. Sesuai ketentuan kurasi studio Kala Kriya, <strong>SIGN IN pengrajin wajib diapprove oleh admin</strong> setelah tim kurator admin melakukan kunjungan verifikasi fisik langsung ke alamat workshop Anda untuk menjamin mutu dan keaslian karya kriya.
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
          © {new Date().getFullYear()} Studio Kala Kriya — Kemitraan Kriya Berkeadilan
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
      <header className="sticky top-0 z-40 bg-[#2C221E] text-white border-b border-[#43352F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#D9C3B0] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ke Toko</span>
            </button>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div>
              <div className="font-serif text-base font-bold text-white flex items-center gap-2">
                <span>{artisan.workshopName || artisan.name}</span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-sans font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span>Disetujui Admin ({artisan.approvedAt || 'Aktif'})</span>
                </span>
              </div>
              <p className="text-[11px] text-[#D9C3B0] hidden sm:block">
                Pengrajin: {artisan.name} · {artisan.location || 'Nusantara'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('proposals')}
                className={`px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'proposals'
                    ? 'bg-[#8C533C] text-white shadow-xs'
                    : 'text-[#D9C3B0] hover:text-white'
                }`}
              >
                <Hammer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Penawaran Kriya & Chat</span>
                <span className="sm:hidden">Penawaran</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full">
                  {artisanProposals.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'wallet'
                    ? 'bg-[#8C533C] text-white shadow-xs'
                    : 'text-[#D9C3B0] hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Pencairan Dana Escrow</span>
                {readyPayoutAmount > 0 && (
                  <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                    Siap
                  </span>
                )}
              </button>
            </nav>

            <button
              onClick={onLogoutArtisan}
              className="p-2 text-[#D9C3B0] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Keluar dari Akun Pengrajin"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Pilih Foto Contoh / Purwarupa
                </label>
                <select
                  value={propImage}
                  onChange={(e) => setPropImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                >
                  <option value="/src/assets/images/product_ceramic_mug_1792844459730.jpg">
                    Cangkir / Teko Keramik Bintik (Studio Kasongan)
                  </option>
                  <option value="/src/assets/images/product_woven_basket_1792844459724.jpg">
                    Keranjang Anyaman Serat Lamun (Pesisir)
                  </option>
                  <option value="/src/assets/images/product_teak_tray_1792844460545.jpg">
                    Baki Saji Pahat Kayu Jati Solid
                  </option>
                  <option value="/src/assets/images/product_soy_candle_1792844460159.jpg">
                    Lilin Kedelai Bejana Tembikar
                  </option>
                  <option value="/src/assets/images/hero_artisanal_studio_1792844458806.jpg">
                    Mangkok Saji & Meja Bengkel
                  </option>
                </select>
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
    </div>
  );
};
