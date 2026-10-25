import React, { useState } from 'react';
import { Customer, ShippingAddress } from '../types';
import { MapAddressPicker } from './MapAddressPicker';
import { X, User, Mail, Phone, Lock, MapPin, Plus, Check, ShieldCheck, Hammer } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (customer: Customer) => void;
  existingCustomer: Customer | null;
  onOpenArtisanPortal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  existingCustomer,
  onOpenArtisanPortal,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('hadian02@gmail.com');
  const [loginPassword, setLoginPassword] = useState('kriyabersahaja');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Initial shipping address for new customer
  const [addressLabel, setAddressLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [city, setCity] = useState('Yogyakarta');
  const [postalCode, setPostalCode] = useState('55184');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -7.7956,
    lng: 110.3695,
  });
  const [showMapPicker, setShowMapPicker] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      alert('Mohon masukkan alamat email Anda.');
      return;
    }

    // Check if matching registered customer in storage
    const stored = localStorage.getItem('kala_kriya_registered_users');
    let users: Customer[] = stored ? JSON.parse(stored) : [];

    const found = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (found) {
      onLoginSuccess(found);
      onClose();
    } else {
      // Create user or fallback to demo profile
      const demoUser: Customer = {
        id: `cust-${Date.now()}`,
        name: loginEmail.split('@')[0].toUpperCase(),
        email: loginEmail,
        phone: '0812-9876-5432',
        createdAt: new Date().toISOString(),
        addresses: [
          {
            id: 'addr-1',
            label: 'Rumah',
            recipientName: loginEmail.split('@')[0],
            address: 'Jl. Kaliurang Km 5.2 No. 18, Sleman',
            city: 'Yogyakarta',
            postalCode: '55281',
            lat: -7.7588,
            lng: 110.3804,
            isDefault: true,
          },
          {
            id: 'addr-2',
            label: 'Kantor / Studio',
            recipientName: `${loginEmail.split('@')[0]} (Penerima)`,
            address: 'Kawasan Kriya Kasongan No. 8',
            city: 'Bantul',
            postalCode: '55184',
            lat: -7.8427,
            lng: 110.3346,
            isDefault: false,
          },
        ],
      };
      users.push(demoUser);
      localStorage.setItem('kala_kriya_registered_users', JSON.stringify(users));
      onLoginSuccess(demoUser);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      alert('Nama dan Email wajib diisi.');
      return;
    }

    const firstAddress: ShippingAddress = {
      id: `addr-${Date.now()}`,
      label: addressLabel || 'Rumah',
      recipientName: recipientName.trim() || regName.trim(),
      phone: regPhone.trim() || undefined,
      address: addressText.trim() || 'Jl. Malioboro No. 42',
      city: city.trim() || 'Yogyakarta',
      postalCode: postalCode.trim() || '55213',
      lat: coords.lat,
      lng: coords.lng,
      isDefault: true,
    };

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || undefined,
      createdAt: new Date().toISOString(),
      addresses: [firstAddress], // Minimal 1 alamat pengiriman terisi
    };

    const stored = localStorage.getItem('kala_kriya_registered_users');
    const users: Customer[] = stored ? JSON.parse(stored) : [];
    users.push(newCustomer);
    localStorage.setItem('kala_kriya_registered_users', JSON.stringify(users));

    onLoginSuccess(newCustomer);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF7F2] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#E8DFD5] my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mode Tabs */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DFD5] bg-white">
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#E8DFD5]">
            <button
              onClick={() => setMode('login')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'text-[#61574F] hover:text-[#2C221E]'
              }`}
            >
              Masuk (Log In)
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'text-[#61574F] hover:text-[#2C221E]'
              }`}
            >
              Daftar Akun Baru (Sign In)
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1]"
            aria-label="Tutup form login"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Artisan Portal Direct Link Banner */}
          {onOpenArtisanPortal && (
            <div className="p-3.5 bg-[#F5EDE4] rounded-xl border border-[#DFCBB7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="space-y-0.5">
                <div className="font-bold text-[#8C533C] flex items-center gap-1.5">
                  <Hammer className="w-3.5 h-3.5 text-[#8C533C]" />
                  <span>Anda Mitra Pengrajin Kriya?</span>
                </div>
                <p className="text-[11px] text-[#61574F]">
                  Tawarkan karya kriya baru, negosiasi dengan admin, dan pantau pencairan escrow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenArtisanPortal();
                }}
                className="px-3.5 py-1.5 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap transition-colors shadow-xs flex items-center gap-1 self-end sm:self-auto cursor-pointer"
              >
                <span>Log In Pengrajin</span>
                <span>→</span>
              </button>
            </div>
          )}

          {mode === 'login' ? (
            /* Log In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C221E]">
                  Selamat Datang Kembali di Kala Kriya
                </h3>
                <p className="text-xs text-[#7A7067] mt-1">
                  Masuk untuk mengelola daftar alamat pengiriman dan memantau pesanan kriya Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Alamat Email Customer
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A89F95] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A89F95] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  />
                </div>
              </div>

              {/* Demo Account Callout */}
              <div className="p-3 bg-[#F2EAE1] rounded-xl border border-[#E0D5C9] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#8C533C] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#61574F] leading-relaxed">
                  <span className="font-bold text-[#2C221E]">Akun Demo Siap Pakai:</span> Email{' '}
                  <span className="font-mono text-[#8C533C]">hadian02@gmail.com</span> telah dilengkapi 2 alamat pengiriman dengan titik Google Map di Yogyakarta.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <User className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </button>
            </form>
          ) : (
            /* Sign In / Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C221E]">
                  Pendaftaran Akun Customer Baru
                </h3>
                <p className="text-xs text-[#7A7067] mt-1">
                  Isi data customer dan atur alamat pengiriman pertama Anda menggunakan Google Maps.
                </p>
              </div>

              {/* Customer Personal Details */}
              <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] space-y-3">
                <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider">
                  Data Pribadi Customer
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Anggoro"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (!recipientName) setRecipientName(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Alamat Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Nomor HP <span className="text-xs text-[#7A7067] font-normal">(opsional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0812xxxxxxx"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Kata Sandi (Password) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  />
                </div>
              </div>

              {/* Initial Shipping Address with Google Maps */}
              <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Alamat Pengiriman Utama (Wajib Min. 1)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="text-xs font-semibold text-[#8C533C] hover:underline flex items-center gap-1"
                  >
                    <span>{showMapPicker ? 'Tutup Peta' : 'Buka Google Map'}</span>
                  </button>
                </div>

                {/* Embedded Google Map Toggle Picker */}
                {showMapPicker && (
                  <div className="pt-2">
                    <MapAddressPicker
                      initialLat={coords.lat}
                      initialLng={coords.lng}
                      onLocationSelected={(data) => {
                        setCoords({ lat: data.lat, lng: data.lng });
                        if (data.formattedAddress) setAddressText(data.formattedAddress);
                        if (data.city) setCity(data.city);
                        if (data.postalCode) setPostalCode(data.postalCode);
                        setShowMapPicker(false);
                      }}
                      onCancel={() => setShowMapPicker(false)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Label Alamat
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Rumah, Kantor, Toko"
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Nama Penerima di Lokasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama orang yang menerima paket"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Alamat Lengkap & Patokan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Nama jalan, nomor bangunan, RT/RW, kelurahan"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Kota / Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Kode Pos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-[#7A7067] flex items-center justify-between">
                  <span>
                    Titik Peta: <span className="font-mono text-[#2C221E]">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                  </span>
                  {!showMapPicker && (
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="text-[#8C533C] hover:underline"
                    >
                      Ubah Titik Peta
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Daftar & Masuk ke Akun</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
