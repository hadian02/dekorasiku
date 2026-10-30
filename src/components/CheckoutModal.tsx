import React, { useState, useEffect, useMemo } from 'react';
import { CartItem, OrderDetails, Customer, ShippingAddress } from '../types';
import { formatIDR } from '../data/products';
import { MapAddressPicker } from './MapAddressPicker';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  ArrowRight,
  Check,
  MapPin,
  UserCheck,
  Package,
  Layers,
  Store
} from 'lucide-react';

interface ArtisanPackage {
  artisanKey: string;
  artisanId?: string;
  artisanName: string;
  workshopName?: string;
  location: string;
  items: CartItem[];
  subtotal: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  giftWrapping: boolean;
  appliedPromo: string;
  customer: Customer | null;
  onClose: () => void;
  onProceedToPayment: (pendingOrders: OrderDetails[]) => void;
  onOpenAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  giftWrapping,
  appliedPromo,
  customer,
  onClose,
  onProceedToPayment,
  onOpenAuth,
}) => {
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

  // Per-package shipping selection: key is artisanKey, value is 'reguler' | 'kilat' | 'kargo'
  const [packageShipping, setPackageShipping] = useState<Record<string, 'reguler' | 'kilat' | 'kargo'>>({});
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca'>('qris');

  // Group items by artisan
  const artisanPackages: ArtisanPackage[] = useMemo(() => {
    const map = new Map<string, ArtisanPackage>();

    items.forEach((item) => {
      const art = item.product.artisan;
      const key = art?.id || art?.name || 'artisan-default';
      const existing = map.get(key);
      const itemSubtotal = item.product.price * item.quantity;

      if (existing) {
        existing.items.push(item);
        existing.subtotal += itemSubtotal;
      } else {
        map.set(key, {
          artisanKey: key,
          artisanId: art?.id,
          artisanName: art?.name || 'Pengrajin Kriya Nusantara',
          workshopName: art?.workshopName || (art?.name ? `Studio ${art.name}` : undefined),
          location: art?.location || 'Sentra Kriya Indonesia',
          items: [item],
          subtotal: itemSubtotal,
        });
      }
    });

    return Array.from(map.values());
  }, [items]);

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

  const getPackageShippingMethod = (key: string): 'reguler' | 'kilat' | 'kargo' => {
    return packageShipping[key] || 'reguler';
  };

  const setPackageShippingMethod = (key: string, method: 'reguler' | 'kilat' | 'kargo') => {
    setPackageShipping((prev) => ({
      ...prev,
      [key]: method,
    }));
  };

  const totalItemsSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const giftCost = giftWrapping ? 15000 : 0;
  const discountRate = appliedPromo === 'KRIYAHANGAT' ? 0.1 : 0;
  const totalDiscountAmount = Math.round(totalItemsSubtotal * discountRate);

  // Calculate individual package shipping cost
  const getPackageShippingCost = (pkg: ArtisanPackage) => {
    const method = getPackageShippingMethod(pkg.artisanKey);
    if (method === 'kilat') return 32000;
    if (method === 'kargo') return 45000;
    // reguler: gratis jika total belanja toko >= 350.000
    if (totalItemsSubtotal >= 350000) return 0;
    return 18000;
  };

  const totalShippingCost = artisanPackages.reduce(
    (sum, pkg) => sum + getPackageShippingCost(pkg),
    0
  );

  const grandTotal = totalItemsSubtotal - totalDiscountAmount + giftCost + totalShippingCost;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      alert('Mohon lengkapi nama penerima dan alamat pengiriman.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const paymentGroupId = `PAY-${randomNum}`;
    const sharedPaymentRef =
      paymentMethod === 'qris'
        ? `QRIS-ID-${Date.now().toString().slice(-8)}`
        : `BCA-VA-82910${randomNum}`;

    const totalPackagesCount = artisanPackages.length;

    // Create a separate order for each artisan package
    const createdOrders: OrderDetails[] = artisanPackages.map((pkg, idx) => {
      const method = getPackageShippingMethod(pkg.artisanKey);
      const pkgShippingCost = getPackageShippingCost(pkg);
      const pkgMethodLabel =
        method === 'reguler'
          ? (totalItemsSubtotal >= 350000 ? 'Reguler Kriya (Bebas Ongkir Promo)' : 'Reguler Kriya Aman (2-4 hari)')
          : method === 'kilat'
          ? 'Ekspedisi Kilat Prioritas (1-2 hari)'
          : 'Kargo Khusus Peti Kayu (4-7 hari)';

      const pkgCourier =
        method === 'reguler'
          ? 'J&T Express Reguler'
          : method === 'kilat'
          ? 'SiCepat BEST Kilat'
          : 'J&T Cargo Peti Kayu';

      // Proportional discount based on subtotal ratio
      const pkgDiscount = totalDiscountAmount > 0
        ? Math.round((pkg.subtotal / totalItemsSubtotal) * totalDiscountAmount)
        : 0;

      // Gift wrapping cost assigned to first package
      const pkgGiftCost = idx === 0 ? giftCost : 0;
      const pkgTotal = pkg.subtotal - pkgDiscount + pkgShippingCost + pkgGiftCost;

      const orderSuffix = totalPackagesCount > 1 ? `-${String.fromCharCode(65 + idx)}` : '';
      const orderId = `KK-${randomNum}${orderSuffix}`;

      return {
        orderId,
        paymentGroupId,
        paymentGroupTotal: grandTotal,
        packageIndex: idx + 1,
        totalPackages: totalPackagesCount,
        artisanId: pkg.artisanId,
        artisanName: pkg.artisanName,
        artisanWorkshopName: pkg.workshopName,
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
        shippingMethod: pkgMethodLabel,
        shippingCourier: pkgCourier,
        paymentMethod:
          paymentMethod === 'qris'
            ? 'QRIS Instan (GoPay, OVO, Dana, LinkAja)'
            : 'Transfer Bank BCA Virtual Account',
        paymentStatus: 'menunggu_pembayaran',
        orderStatus: 'menunggu_pembayaran',
        customerEmail: customer?.email || undefined,
        paymentReference: sharedPaymentRef,
        items: [...pkg.items],
        subtotal: pkg.subtotal,
        shippingCost: pkgShippingCost,
        discount: pkgDiscount,
        giftWrapping: idx === 0 ? giftWrapping : false,
        total: pkgTotal,
        coordinates: coords,
      };
    });

    // Pass all split orders to payment gateway
    onProceedToPayment(createdOrders);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF7F2] rounded-t-3xl sm:rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E8DFD5] flex flex-col h-[94vh] sm:h-auto sm:max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E8DFD5] bg-white shrink-0">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C221E] flex items-center gap-2">
              <span>Checkout Kriya</span>
              {artisanPackages.length > 1 && (
                <span className="text-xs font-sans font-semibold bg-[#8C533C] text-white px-2 py-0.5 rounded-full">
                  {artisanPackages.length} Paket Pengrajin
                </span>
              )}
            </h3>
            <p className="text-xs text-[#7A7067] mt-0.5">
              Alamat pengiriman aman, ekspedisi per pengrajin, dan pembayaran terpadu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7A7067] hover:text-[#2C221E] hover:bg-[#FAF7F2] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Section 1: Data Penerima & Alamat */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>1. Alamat Pengiriman</span>
                </div>
                {customer ? (
                  <span className="text-[11px] text-[#3A4D39] font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Akun: {customer.name}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="text-[11px] text-[#8C533C] hover:underline font-semibold"
                  >
                    Masuk Akun?
                  </button>
                )}
              </div>

              {/* Saved Addresses Selector (if customer has multiple addresses) */}
              {customer && customer.addresses && customer.addresses.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#2C221E]">
                    Pilih dari Alamat Tersimpan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {customer.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectCustomerAddress(addr.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-[#8C533C] bg-[#FDF9F6] shadow-xs ring-1 ring-[#8C533C]'
                            : 'border-[#E8DFD5] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[#2C221E]">
                          <span>{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] text-[#8C533C] bg-[#F2EAE1] px-1.5 py-0.2 rounded font-semibold">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C]"
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
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C]"
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
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C]"
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
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C]"
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
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C]"
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
                    className="text-[#8C533C] hover:underline font-semibold cursor-pointer"
                  >
                    Ubah Titik Map
                  </button>
                )}
              </div>
            </div>

            {/* Section 2: Opsi Pengiriman Per Pengrajin (Multi-Artisan Split Packages) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>2. Opsi Pengiriman Kriya ({artisanPackages.length} Paket)</span>
                </div>
                {artisanPackages.length > 1 && (
                  <span className="text-[11px] text-[#7A7067]">
                    Tiap pengrajin mengirimkan paket dari lokasinya masing-masing
                  </span>
                )}
              </div>

              {artisanPackages.length > 1 && (
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] text-xs text-[#61574F] flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-[#8C533C] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#2C221E]">
                      Pesanan Anda terbagi menjadi {artisanPackages.length} paket pengrajin
                    </div>
                    <div className="text-[11px] text-[#7A7067] mt-0.5">
                      Karena diproduksi langsung oleh sentra kriya berbeda, setiap paket akan memiliki nomor pesanan sendiri & opsi kurir mandiri. Pembayaran tetap <strong>satu tagihan gabungan</strong>.
                    </div>
                  </div>
                </div>
              )}

              {/* Render each artisan package card */}
              <div className="space-y-4">
                {artisanPackages.map((pkg, idx) => {
                  const currentMethod = getPackageShippingMethod(pkg.artisanKey);
                  const pkgCost = getPackageShippingCost(pkg);

                  return (
                    <div
                      key={pkg.artisanKey}
                      className="border border-[#E8DFD5] rounded-2xl p-4 bg-[#FAF7F2]/40 space-y-3"
                    >
                      {/* Package Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DFD5]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#8C533C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-[#2C221E] flex items-center gap-1.5">
                              <span>{pkg.workshopName || pkg.artisanName}</span>
                              <span className="text-[10px] text-[#7A7067] font-normal">
                                ({pkg.artisanName})
                              </span>
                            </div>
                            <div className="text-[11px] text-[#7A7067] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#8C533C]" />
                              <span>{pkg.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#8C533C]">
                            {pkgCost === 0 ? 'GRATIS ONGKIR' : formatIDR(pkgCost)}
                          </span>
                        </div>
                      </div>

                      {/* Package Item Thumbnails */}
                      <div className="flex flex-wrap gap-2 py-1">
                        {pkg.items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-[#E8DFD5] text-xs"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-7 h-7 rounded-lg object-cover border border-[#E8DFD5]"
                            />
                            <div className="max-w-[140px] sm:max-w-[180px] truncate">
                              <span className="font-semibold text-[#2C221E]">{item.product.name}</span>
                              <span className="text-[#7A7067] text-[11px] ml-1">×{item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Package Shipping Courier Options */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-semibold text-[#2C221E]">
                          Pilih Ekspedisi untuk Paket Pengrajin {pkg.artisanName}:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setPackageShippingMethod(pkg.artisanKey, 'reguler')}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              currentMethod === 'reguler'
                                ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                                : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2C221E]">Reguler Kriya</span>
                                {currentMethod === 'reguler' && (
                                  <span className="w-3.5 h-3.5 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                                    <Check className="w-2 h-2" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#7A7067]">2-4 hari kerja (J&T)</div>
                            </div>
                            <div className="text-[11px] font-mono font-semibold text-[#8C533C] mt-1.5">
                              {totalItemsSubtotal >= 350000 ? 'GRATIS' : formatIDR(18000)}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPackageShippingMethod(pkg.artisanKey, 'kilat')}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              currentMethod === 'kilat'
                                ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                                : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2C221E]">Kilat Prioritas</span>
                                {currentMethod === 'kilat' && (
                                  <span className="w-3.5 h-3.5 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                                    <Check className="w-2 h-2" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#7A7067]">1-2 hari sampai (SiCepat)</div>
                            </div>
                            <div className="text-[11px] font-mono font-semibold text-[#2C221E] mt-1.5">
                              {formatIDR(32000)}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPackageShippingMethod(pkg.artisanKey, 'kargo')}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              currentMethod === 'kargo'
                                ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                                : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2C221E]">Peti Kayu Khusus</span>
                                {currentMethod === 'kargo' && (
                                  <span className="w-3.5 h-3.5 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                                    <Check className="w-2 h-2" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#7A7067]">Proteksi pecah belah kargo</div>
                            </div>
                            <div className="text-[11px] font-mono font-semibold text-[#2C221E] mt-1.5">
                              {formatIDR(45000)}
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Metode Pembayaran (Unified Payment) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] space-y-3 shadow-2xs">
              <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>3. Satu Pembayaran Terpadu (Untuk Semua Paket)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                    paymentMethod === 'qris'
                      ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                      : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F2EAE1] text-[#8C533C] rounded-lg shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2C221E]">QRIS Instan Otomatis</div>
                      <div className="text-[10px] sm:text-[11px] text-[#7A7067]">GoPay / OVO / Dana / LinkAja / m-Banking</div>
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
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                    paymentMethod === 'bca'
                      ? 'border-[#8C533C] bg-[#FDF9F6] ring-1.5 ring-[#8C533C] shadow-xs'
                      : 'border-[#E8DFD5] bg-white hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F2EAE1] text-[#8C533C] rounded-lg shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2C221E]">Transfer Virtual Account</div>
                      <div className="text-[10px] sm:text-[11px] text-[#7A7067]">BCA / Mandiri / BNI / BRI</div>
                    </div>
                  </div>
                  {paymentMethod === 'bca' && (
                    <span className="w-4 h-4 rounded-full bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Section 4: Ringkasan Rincian Pembayaran */}
            <div className="bg-[#F2EAE1] p-5 rounded-2xl border border-[#E0D5C9] space-y-2.5 text-xs text-[#61574F]">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} item kriya)</span>
                <span className="font-mono tabular-nums">{formatIDR(totalItemsSubtotal)}</span>
              </div>
              {giftWrapping && (
                <div className="flex justify-between">
                  <span>Kemasan Kado & Kartu</span>
                  <span className="font-mono tabular-nums">{formatIDR(giftCost)}</span>
                </div>
              )}
              {totalDiscountAmount > 0 && (
                <div className="flex justify-between text-[#3A4D39] font-medium">
                  <span>Potongan Promo ({appliedPromo})</span>
                  <span className="font-mono tabular-nums">-{formatIDR(totalDiscountAmount)}</span>
                </div>
              )}

              {/* Shipping Breakdown */}
              <div className="pt-2 border-t border-[#DECBB7]/70 space-y-1.5">
                <div className="flex justify-between font-semibold text-[#2C221E]">
                  <span>Total Ongkos Kirim ({artisanPackages.length} Paket)</span>
                  <span className="font-mono tabular-nums">
                    {totalShippingCost === 0 ? 'GRATIS' : formatIDR(totalShippingCost)}
                  </span>
                </div>
                {artisanPackages.map((pkg, idx) => {
                  const cost = getPackageShippingCost(pkg);
                  const method = getPackageShippingMethod(pkg.artisanKey);
                  return (
                    <div key={pkg.artisanKey} className="flex justify-between text-[11px] text-[#7A7067] pl-3 border-l-2 border-[#8C533C]/40">
                      <span>
                        Paket {idx + 1}: {pkg.artisanName} ({method.toUpperCase()})
                      </span>
                      <span className="font-mono tabular-nums">{cost === 0 ? 'Gratis' : formatIDR(cost)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-[#DECBB7] flex justify-between text-base font-bold text-[#2C221E]">
                <div>
                  <div>Total Pembayaran Terpadu</div>
                  <div className="text-[11px] font-normal text-[#7A7067]">
                    Mencakup {artisanPackages.length} paket pengrajin
                  </div>
                </div>
                <span className="font-mono text-xl text-[#8C533C] tabular-nums">
                  {formatIDR(grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-4 bg-[#8C533C] hover:bg-[#723E2A] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Bayar Sekarang ({formatIDR(grandTotal)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
