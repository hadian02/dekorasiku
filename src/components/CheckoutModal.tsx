import React, { useState, useEffect } from 'react';
import { CartItem, OrderDetails, Customer, ShippingAddress } from '../types';
import { formatIDR } from '../data/products';
import { MapAddressPicker } from './MapAddressPicker';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, QrCode, Banknote, ArrowRight, Copy, Check, MapPin, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  giftWrapping: boolean;
  appliedPromo: string;
  customer: Customer | null;
  onClose: () => void;
  onOrderSuccess: (order: OrderDetails) => void;
  onOpenAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  giftWrapping,
  appliedPromo,
  customer,
  onClose,
  onOrderSuccess,
  onOpenAuth,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Yogyakarta');
  const [postalCode, setPostalCode] = useState('55184');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -7.7956,
    lng: 110.3695,
  });
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [shippingMethod, setShippingMethod] = useState<'reguler' | 'kilat' | 'kargo'>('reguler');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca' | 'cod'>('qris');
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Sync with customer data when available
  useEffect(() => {
    if (customer && customer.addresses.length > 0) {
      const defaultAddr = customer.addresses.find((a) => a.isDefault) || customer.addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setName(defaultAddr.recipientName || customer.name);
      setPhone(defaultAddr.phone || customer.phone || '0812-9876-5432');
      setAddress(defaultAddr.address);
      setCity(defaultAddr.city);
      setPostalCode(defaultAddr.postalCode);
      setCoords({ lat: defaultAddr.lat, lng: defaultAddr.lng });
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setCity('Yogyakarta');
      setPostalCode('55184');
    }
    setStep('form');
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSelectCustomerAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (!customer) return;
    const addr = customer.addresses.find((a) => a.id === addrId);
    if (addr) {
      setName(addr.recipientName);
      if (addr.phone) setPhone(addr.phone);
      setAddress(addr.address);
      setCity(addr.city);
      setPostalCode(addr.postalCode);
      setCoords({ lat: addr.lat, lng: addr.lng });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const giftCost = giftWrapping ? 15000 : 0;
  const discountRate = appliedPromo === 'KRIYAHANGAT' ? 0.1 : 0;
  const discountAmount = Math.round(subtotal * discountRate);

  // Free shipping threshold >= Rp 350.000
  let shippingCost = 18000;
  if (shippingMethod === 'kilat') shippingCost = 32000;
  if (shippingMethod === 'kargo') shippingCost = 45000;
  if (subtotal >= 350000 && shippingMethod === 'reguler') {
    shippingCost = 0;
  }

  const grandTotal = subtotal - discountAmount + giftCost + shippingCost;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      alert('Mohon lengkapi nama penerima dan alamat pengiriman.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: OrderDetails = {
      orderId: `KK-${randomNum}`,
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: name,
      phone: phone || '(Tidak dicantumkan)',
      address,
      city,
      shippingMethod:
        shippingMethod === 'reguler'
          ? 'Reguler Aman (Bebas Ongkir Promo)'
          : shippingMethod === 'kilat'
          ? 'Ekspedisi Kilat 1-2 Hari'
          : 'Kargo Khusus Kriya Berat',
      paymentMethod:
        paymentMethod === 'qris'
          ? 'QRIS Otomatis (Gopay/OVO/BCA/Dana)'
          : paymentMethod === 'bca'
          ? 'Transfer Bank BCA Virtual Account'
          : 'COD (Bayar Tunai saat Kurir Tiba)',
      paymentStatus: 'menunggu_pembayaran',
      orderStatus: 'menunggu_pembayaran',
      customerEmail: customer?.email || undefined,
      paymentReference:
        paymentMethod === 'qris'
          ? `QRIS-ID-${Date.now().toString().slice(-8)}`
          : paymentMethod === 'bca'
          ? `BCA-VA-82910${randomNum}`
          : undefined,
      items: [...items],
      subtotal,
      shippingCost,
      discount: discountAmount,
      giftWrapping,
      total: grandTotal,
      coordinates: coords,
    };

    setCompletedOrder(newOrder);
    setStep('success');
    onOrderSuccess(newOrder);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#8C533C', '#D9C3B0', '#F5EFEB', '#3A4D39'],
      });
    } catch {
      // ignore
    }
  };

  const handleCopyInvoice = () => {
    if (!completedOrder) return;
    const text = `Pesanan Kala Kriya #${completedOrder.orderId} - Total: ${formatIDR(completedOrder.total)} untuk ${completedOrder.customerName}`;
    navigator.clipboard.writeText(text);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF7F2] rounded-t-3xl sm:rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E8DFD5] flex flex-col h-[92vh] sm:h-auto sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E8DFD5] bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base sm:text-lg font-bold text-[#2C221E]">
              {step === 'form' ? 'Konfirmasi & Pengiriman Kriya' : 'Struk Pembelian Berhasil'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 overscroll-contain">
          {step === 'form' ? (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Customer Account Indicator */}
              <div className="p-3 bg-white rounded-xl border border-[#E8DFD5] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className="p-1.5 bg-[#F2EAE1] text-[#8C533C] rounded-lg">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  {customer ? (
                    <div>
                      <span className="font-bold text-[#2C221E]">Masuk sebagai: </span>
                      <span className="text-[#8C533C] font-semibold">{customer.name}</span>{' '}
                      <span className="text-[#7A7067]">({customer.email})</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-[#2C221E]">Belum Masuk Akun: </span>
                      <span className="text-[#7A7067]">Checkout sebagai tamu atau masuk untuk memakai alamat tersimpan.</span>
                    </div>
                  )}
                </div>

                {!customer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="text-xs font-semibold text-[#8C533C] hover:underline whitespace-nowrap"
                  >
                    Masuk / Sign In
                  </button>
                )}
              </div>

              {/* Recipient Details & Address Selector */}
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>1. Alamat Kirim & Penerima</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="text-xs font-semibold text-[#8C533C] hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{showMapPicker ? 'Tutup Google Map' : 'Set Titik via Google Map'}</span>
                  </button>
                </div>

                {/* If Customer has multiple addresses, show address picker */}
                {customer && customer.addresses.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#2C221E]">
                      Pilih dari Alamat Tersimpan:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customer.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectCustomerAddress(addr.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-[#8C533C] bg-[#FDF9F6] shadow-xs'
                              : 'border-[#E8DFD5] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[#2C221E]">
                            <span>{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] text-[#8C533C] bg-[#F2EAE1] px-1.5 py-0.2 rounded">
                                Utama
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#61574F] mt-0.5 truncate">
                            Penerima: {addr.recipientName}
                          </div>
                          <div className="text-[11px] text-[#7A7067] truncate">
                            {addr.address}, {addr.city}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Embedded Google Map Picker */}
                {showMapPicker && (
                  <div className="pt-2">
                    <MapAddressPicker
                      initialLat={coords.lat}
                      initialLng={coords.lng}
                      onLocationSelected={(data) => {
                        setCoords({ lat: data.lat, lng: data.lng });
                        if (data.formattedAddress) setAddress(data.formattedAddress);
                        if (data.city) setCity(data.city);
                        if (data.postalCode) setPostalCode(data.postalCode);
                        setShowMapPicker(false);
                      }}
                      onCancel={() => setShowMapPicker(false)}
                    />
                  </div>
                )}

                {/* Inputs for Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Nama Lengkap Penerima <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian Anggoro"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Nomor HP Penerima <span className="text-xs text-[#7A7067] font-normal">(opsional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>
                </div>

                {/* Address Text */}
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Alamat Lengkap & Patokan Rumah <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan pengiriman"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="text-[11px] text-[#7A7067] flex items-center justify-between pt-1 border-t border-[#F2ECE3]">
                  <span>
                    Koordinat Google Map: <span className="font-mono text-[#2C221E]">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                  </span>
                  {!showMapPicker && (
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="text-[#8C533C] hover:underline"
                    >
                      Ubah Titik Map
                    </button>
                  )}
                </div>
              </div>

              {/* Shipping Method Options */}
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] space-y-3">
                <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>2. Opsi Pengiriman Aman</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('reguler')}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer select-none ${
                      shippingMethod === 'reguler'
                        ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                        : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C221E]">Reguler Kriya</span>
                        {shippingMethod === 'reguler' && (
                          <span className="w-4 h-4 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7A7067] mt-0.5">2-4 hari kerja</div>
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#8C533C] mt-2">
                      {subtotal >= 350000 ? 'GRATIS ONGKIR' : formatIDR(18000)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('kilat')}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer select-none ${
                      shippingMethod === 'kilat'
                        ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                        : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C221E]">Kilat Prioritas</span>
                        {shippingMethod === 'kilat' && (
                          <span className="w-4 h-4 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7A7067] mt-0.5">1-2 hari sampai</div>
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#2C221E] mt-2">
                      {formatIDR(32000)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('kargo')}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer select-none ${
                      shippingMethod === 'kargo'
                        ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                        : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C221E]">Peti Kayu Khusus</span>
                        {shippingMethod === 'kargo' && (
                          <span className="w-4 h-4 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7A7067] mt-0.5">Perlindungan ganda</div>
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#2C221E] mt-2">
                      {formatIDR(45000)}
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Method Options */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8DFD5] space-y-3">
                <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>3. Metode Pembayaran</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                      paymentMethod === 'qris'
                        ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                        : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-5 h-5 text-[#8C533C] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#2C221E]">QRIS Instan</div>
                        <div className="text-[10px] sm:text-[11px] text-[#7A7067]">BCA/GoPay/OVO/Dana</div>
                      </div>
                    </div>
                    {paymentMethod === 'qris' && (
                      <span className="w-4 h-4 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bca')}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                      paymentMethod === 'bca'
                        ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                        : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-[#8C533C] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#2C221E]">Transfer Virtual</div>
                        <div className="text-[10px] sm:text-[11px] text-[#7A7067]">BCA / Mandiri / BNI</div>
                      </div>
                    </div>
                    {paymentMethod === 'bca' && (
                      <span className="w-4 h-4 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                      paymentMethod === 'cod'
                        ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                        : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-5 h-5 text-[#8C533C] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#2C221E]">Bayar di Tempat</div>
                        <div className="text-[10px] sm:text-[11px] text-[#7A7067]">COD Saat Sampai</div>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && (
                      <span className="w-4 h-4 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Order Final Summary */}
              <div className="bg-[#F2EAE1] p-5 rounded-xl border border-[#E0D5C9] space-y-2 text-xs text-[#61574F]">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} item kriya)</span>
                  <span className="font-mono tabular-nums">{formatIDR(subtotal)}</span>
                </div>
                {giftWrapping && (
                  <div className="flex justify-between">
                    <span>Kemasan Kado & Kartu</span>
                    <span className="font-mono tabular-nums">{formatIDR(giftCost)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#3A4D39] font-medium">
                    <span>Potongan Promo</span>
                    <span className="font-mono tabular-nums">-{formatIDR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ongkos Kirim Aman</span>
                  <span className="font-mono tabular-nums">
                    {shippingCost === 0 ? 'GRATIS' : formatIDR(shippingCost)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#DECBB7] flex justify-between text-base font-bold text-[#2C221E]">
                  <span>Total Pembayaran</span>
                  <span className="font-mono text-lg text-[#8C533C] tabular-nums">
                    {formatIDR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#8C533C] hover:bg-[#73432F] text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Konfirmasi & Buat Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Order Success Receipt / Struk Resmi */
            completedOrder && (
              <div className="space-y-6">
                <div className="text-center space-y-2 py-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF3EA] text-[#3A4D39] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
                    Pesanan Berhasil Diterima!
                  </h3>
                  <p className="text-xs text-[#7A7067] max-w-md mx-auto">
                    Terima kasih telah mendukung pengrajin lokal nusantara. Pesanan Anda sedang disiapkan dengan cermat di bengkel kriya kami.
                  </p>
                </div>

                {/* Printable Struk Card */}
                <div className="p-6 bg-white rounded-xl border border-[#E8DFD5] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-3 text-xs">
                    <div>
                      <div className="font-bold text-[#8C533C] text-sm">
                        {completedOrder.orderId}
                      </div>
                      <div className="text-[#A89F95] mt-0.5">{completedOrder.date}</div>
                    </div>
                    <button
                      onClick={handleCopyInvoice}
                      className="px-2.5 py-1 text-xs border border-[#E8DFD5] rounded flex items-center gap-1 text-[#61574F] hover:bg-[#FAF7F2]"
                    >
                      {copiedInvoice ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin ID Pesanan</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Recipient & Payment recap */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-[#61574F]">
                    <div>
                      <span className="text-[#A89F95]">Penerima & Alamat:</span>
                      <div className="font-semibold text-[#2C221E]">{completedOrder.customerName}</div>
                      <div className="text-[#7A7067]">{completedOrder.phone}</div>
                      <div className="text-[#7A7067] mt-0.5 leading-snug">
                        {completedOrder.address}, {completedOrder.city}
                      </div>
                      {completedOrder.coordinates && (
                        <div className="text-[11px] text-[#8C533C] mt-1 font-mono">
                          Titik Peta: {completedOrder.coordinates.lat.toFixed(4)}, {completedOrder.coordinates.lng.toFixed(4)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[#A89F95]">Metode Pembayaran:</span>
                      <div className="font-semibold text-[#2C221E]">{completedOrder.paymentMethod}</div>
                      <span className="text-[#A89F95] block mt-2">Pengiriman:</span>
                      <div className="font-semibold text-[#2C221E]">{completedOrder.shippingMethod}</div>
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="border-t border-[#F2ECE3] pt-3 space-y-2">
                    <span className="text-xs font-bold text-[#2C221E]">Daftar Kriya:</span>
                    {completedOrder.items.map((i) => (
                      <div key={i.product.id} className="flex justify-between text-xs text-[#61574F]">
                        <span>
                          {i.product.name} × {i.quantity}
                        </span>
                        <span className="font-mono tabular-nums text-[#2C221E]">
                          {formatIDR(i.product.price * i.quantity)}
                        </span>
                      </div>
                    ))}
                    {completedOrder.giftWrapping && (
                      <div className="flex justify-between text-xs text-[#61574F]">
                        <span>Bungkus Kado & Kartu Ucapan</span>
                        <span className="font-mono tabular-nums">{formatIDR(15000)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t border-[#E8DFD5] pt-3 flex justify-between font-bold text-sm text-[#2C221E]">
                    <span>Total Pembayaran</span>
                    <span className="font-mono text-base text-[#8C533C] tabular-nums">
                      {formatIDR(completedOrder.total)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                      `Halo Kala Kriya, saya telah memesan kriya #${completedOrder.orderId} atas nama ${completedOrder.customerName}. Mohon konfirmasi jadwal pengiriman.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-[#3A4D39] hover:bg-[#2F3E2E] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Konfirmasi via WhatsApp Kami
                  </a>

                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#2C221E] text-xs font-semibold rounded-lg border border-[#E8DFD5] transition-colors"
                  >
                    Kembali Berbelanja
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
