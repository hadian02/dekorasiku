import React, { useState } from 'react';
import { Customer, ShippingAddress } from '../types';
import { MapAddressPicker } from './MapAddressPicker';
import { X, User, Mail, Phone, MapPin, Plus, Trash2, Check, Edit2, LogOut, AlertCircle } from 'lucide-react';

interface CustomerProfileModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onUpdateCustomer: (updatedCustomer: Customer) => void;
  onLogout: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  customer,
  onClose,
  onUpdateCustomer,
  onLogout,
}) => {
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address form fields
  const [label, setLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressText, setAddressText] = useState('');
  const [city, setCity] = useState('Yogyakarta');
  const [postalCode, setPostalCode] = useState('55184');
  const [lat, setLat] = useState(-7.7956);
  const [lng, setLng] = useState(110.3695);
  const [showEmbeddedMap, setShowEmbeddedMap] = useState(true);

  if (!isOpen || !customer) return null;

  const handleOpenAdd = () => {
    setLabel('Kantor');
    setRecipientName(customer.name);
    setAddressPhone(customer.phone || '');
    setAddressText('');
    setCity('Yogyakarta');
    setPostalCode('55184');
    setLat(-7.7956);
    setLng(110.3695);
    setShowEmbeddedMap(true);
    setEditingAddressId(null);
    setIsAddingAddress(true);
  };

  const handleOpenEdit = (addr: ShippingAddress) => {
    setLabel(addr.label);
    setRecipientName(addr.recipientName);
    setAddressPhone(addr.phone || '');
    setAddressText(addr.address);
    setCity(addr.city);
    setPostalCode(addr.postalCode);
    setLat(addr.lat);
    setLng(addr.lng);
    setShowEmbeddedMap(true);
    setEditingAddressId(addr.id);
    setIsAddingAddress(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !addressText.trim()) {
      alert('Nama penerima dan alamat pengiriman wajib diisi.');
      return;
    }

    let updatedAddresses: ShippingAddress[];

    if (editingAddressId) {
      updatedAddresses = customer.addresses.map((a) =>
        a.id === editingAddressId
          ? {
              ...a,
              label,
              recipientName,
              phone: addressPhone || undefined,
              address: addressText,
              city,
              postalCode,
              lat,
              lng,
            }
          : a
      );
    } else {
      const newAddr: ShippingAddress = {
        id: `addr-${Date.now()}`,
        label: label || 'Alamat Baru',
        recipientName: recipientName.trim(),
        phone: addressPhone.trim() || undefined,
        address: addressText.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        lat,
        lng,
        isDefault: customer.addresses.length === 0,
      };
      updatedAddresses = [...customer.addresses, newAddr];
    }

    onUpdateCustomer({
      ...customer,
      addresses: updatedAddresses,
    });
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  const handleDeleteAddress = (id: string) => {
    // Constraint from user request: "Alamat kirim + nama penerima bisa ditambah dan dikurangi, tapi minimal satu"
    if (customer.addresses.length <= 1) {
      alert('Tidak dapat menghapus. Minimal harus ada 1 alamat pengiriman yang terdaftar.');
      return;
    }

    const updated = customer.addresses.filter((a) => a.id !== id);
    // If deleted address was default, set first one as default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }

    onUpdateCustomer({
      ...customer,
      addresses: updated,
    });
  };

  const handleSetDefault = (id: string) => {
    const updated = customer.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    onUpdateCustomer({
      ...customer,
      addresses: updated,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FAF7F2] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E8DFD5] my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DFD5] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8C533C] text-white flex items-center justify-center font-bold text-xs">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">
                Profil & Alamat Pengiriman
              </h3>
              <p className="text-xs text-[#7A7067]">{customer.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7067] hover:text-[#2C221E] hover:bg-[#F2EAE1]"
            aria-label="Tutup profil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Customer Personal Data Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8DFD5] space-y-3">
            <div className="text-xs font-bold text-[#8C533C] uppercase tracking-wider">
              Data Customer
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[#A89F95] block">Nama Lengkap:</span>
                <span className="font-semibold text-[#2C221E]">{customer.name}</span>
              </div>
              <div>
                <span className="text-[#A89F95] block">Alamat Email:</span>
                <span className="font-semibold text-[#2C221E]">{customer.email}</span>
              </div>
              <div>
                <span className="text-[#A89F95] block">Nomor HP:</span>
                <span className="font-semibold text-[#2C221E]">
                  {customer.phone || '(Belum diatur / Opsional)'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Addresses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-[#2C221E]">
                  Daftar Alamat Kirim & Nama Penerima
                </h4>
                <p className="text-xs text-[#7A7067]">
                  Dapat ditambah dan dikurangi (minimal 1 alamat harus tetap tersedia).
                </p>
              </div>

              {!isAddingAddress && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-3 py-1.5 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Alamat</span>
                </button>
              )}
            </div>

            {/* Address Form (Add / Edit) with Embedded Google Maps */}
            {isAddingAddress && (
              <form
                onSubmit={handleSaveAddress}
                className="bg-white p-5 rounded-xl border-2 border-[#8C533C]/40 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-2">
                  <span className="text-xs font-bold text-[#8C533C] uppercase tracking-wider">
                    {editingAddressId ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Pengiriman Baru'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="text-xs text-[#7A7067] hover:underline"
                  >
                    Batal
                  </button>
                </div>

                {/* Embedded Google Map Toggle Picker */}
                {showEmbeddedMap && (
                  <MapAddressPicker
                    initialLat={lat}
                    initialLng={lng}
                    onLocationSelected={(data) => {
                      setLat(data.lat);
                      setLng(data.lng);
                      if (data.formattedAddress) setAddressText(data.formattedAddress);
                      if (data.city) setCity(data.city);
                      if (data.postalCode) setPostalCode(data.postalCode);
                    }}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Label Alamat
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Rumah / Kantor / Studio"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
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
                      placeholder="Nama orang yang menerima kiriman"
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
                    placeholder="Nama jalan, gang, nomor rumah, RT/RW, kelurahan"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      Kota / Kabupaten
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
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                      No. HP Penerima (Opsional)
                    </label>
                    <input
                      type="tel"
                      placeholder="0812xxxx"
                      value={addressPhone}
                      onChange={(e) => setAddressPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 text-xs text-[#574E47] hover:bg-[#F2EAE1] rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    Simpan Alamat
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards List */}
            <div className="space-y-3">
              {customer.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 bg-white rounded-xl border transition-all ${
                    addr.isDefault
                      ? 'border-[#8C533C] bg-[#FDFBF9] shadow-xs'
                      : 'border-[#E8DFD5] hover:border-[#D5C6B7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2C221E] px-2 py-0.5 bg-[#F2EAE1] rounded border border-[#E8DFD5]">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[11px] font-semibold text-[#8C533C] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Alamat Utama</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-[#2C221E] pt-1">
                        Penerima: {addr.recipientName}{' '}
                        {addr.phone && <span className="font-normal text-[#7A7067]">({addr.phone})</span>}
                      </div>

                      <p className="text-xs text-[#61574F] leading-relaxed">
                        {addr.address}, {addr.city} {addr.postalCode}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#8C533C] pt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="font-mono">
                          Titik Peta: {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Address Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr.id)}
                          className="px-2 py-1 text-[11px] text-[#574E47] hover:text-[#2C221E] hover:bg-[#F2EAE1] rounded"
                        >
                          Jadikan Utama
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(addr)}
                        className="p-1.5 text-[#574E47] hover:text-[#8C533C] hover:bg-[#F2EAE1] rounded"
                        title="Edit Alamat"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button: strictly disabled if customer only has 1 address */}
                      <button
                        type="button"
                        disabled={customer.addresses.length <= 1}
                        onClick={() => handleDeleteAddress(addr.id)}
                        className={`p-1.5 rounded transition-colors ${
                          customer.addresses.length <= 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-[#A89F95] hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={
                          customer.addresses.length <= 1
                            ? 'Minimal harus ada 1 alamat pengiriman'
                            : 'Hapus Alamat Ini'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {customer.addresses.length <= 1 && (
                    <div className="mt-2 text-[10px] text-[#A89F95] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-[#A89F95]" />
                      <span>Alamat ini tidak dapat dihapus karena minimal harus ada satu alamat pengiriman.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="p-4 bg-white border-t border-[#E8DFD5] flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Akun (Log Out)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#2C221E] text-white text-xs font-semibold rounded-lg hover:bg-[#43352F] transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
