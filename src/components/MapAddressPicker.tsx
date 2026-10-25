import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Search, Check, AlertCircle } from 'lucide-react';

interface MapAddressPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelected: (data: {
    lat: number;
    lng: number;
    formattedAddress?: string;
    city?: string;
    postalCode?: string;
  }) => void;
  onCancel?: () => void;
}

// Preset cities and craft hubs in Indonesia
const PRESET_LOCATIONS = [
  { name: 'Kasongan (Bantul, DIY)', lat: -7.8427, lng: 110.3346, city: 'Bantul', postal: '55184' },
  { name: 'Pusat Kota Yogyakarta', lat: -7.7956, lng: 110.3695, city: 'Yogyakarta', postal: '55213' },
  { name: 'Kebayoran Baru (Jakarta Sel.)', lat: -6.2418, lng: 106.8003, city: 'Jakarta Selatan', postal: '12160' },
  { name: 'Dago (Bandung)', lat: -6.8833, lng: 107.6167, city: 'Bandung', postal: '40135' },
  { name: 'Ubud (Bali)', lat: -8.5069, lng: 115.2625, city: 'Gianyar', postal: '80571' },
  { name: 'Tasikmalaya (Pusat Anyaman)', lat: -7.3274, lng: 108.2207, city: 'Tasikmalaya', postal: '46111' },
];

function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [center, map]);
  return null;
}

export const MapAddressPicker: React.FC<MapAddressPickerProps> = ({
  initialLat = -7.7956,
  initialLng = 110.3695,
  onLocationSelected,
  onCancel,
}) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyDZJ-OTrv2oqzHaXom7dObgBqR7R7R-374';

  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [addressDetails, setAddressDetails] = useState<{
    street: string;
    city: string;
    postal: string;
  }>({
    street: 'Jl. Malioboro No. 42',
    city: 'Yogyakarta',
    postal: '55213',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);

  // Reverse geocoding simulation / client helper based on coordinates
  const updateAddressFromCoords = useCallback((lat: number, lng: number) => {
    setPosition({ lat, lng });

    // Look for nearest preset or generate representative Indonesian location
    const nearest = PRESET_LOCATIONS.reduce((prev, curr) => {
      const dPrev = Math.hypot(prev.lat - lat, prev.lng - lng);
      const dCurr = Math.hypot(curr.lat - lat, curr.lng - lng);
      return dCurr < dPrev ? curr : prev;
    }, PRESET_LOCATIONS[0]);

    if (Math.hypot(nearest.lat - lat, nearest.lng - lng) < 0.15) {
      setAddressDetails({
        street: `Jl. Menuju Lokasi (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        city: nearest.city,
        postal: nearest.postal,
      });
    } else {
      setAddressDetails({
        street: `Koordinat Pengiriman: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
        city: nearest.city,
        postal: nearest.postal,
      });
    }
  }, []);

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      updateAddressFromCoords(lat, lng);
    }
  };

  const handleDragEnd = (e: any) => {
    if (e.latLng) {
      const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
      const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
      updateAddressFromCoords(lat, lng);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur geolokasi tidak didukung pada peramban Anda.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        updateAddressFromCoords(latitude, longitude);
      },
      () => {
        setIsLocating(false);
        alert('Tidak dapat mendeteksi lokasi saat ini. Silakan pilih titik pada peta.');
      },
      { timeout: 8000 }
    );
  };

  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setPosition({ lat: preset.lat, lng: preset.lng });
    setAddressDetails({
      street: `Jl. Sekitar Kawasan ${preset.name}`,
      city: preset.city,
      postal: preset.postal,
    });
  };

  const handleConfirm = () => {
    onLocationSelected({
      lat: position.lat,
      lng: position.lng,
      formattedAddress: addressDetails.street,
      city: addressDetails.city,
      postalCode: addressDetails.postal,
    });
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl overflow-hidden shadow-sm flex flex-col space-y-3 p-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#8C533C]/10 text-[#8C533C] rounded-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2C221E]">
              Pilih Titik Pengiriman via Google Map
            </div>
            <div className="text-[11px] text-[#7A7067]">
              Klik pada peta atau geser pin untuk menentukan titik rumah/kantor
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className="px-3 py-1.5 bg-white hover:bg-[#F2EAE1] text-[#2C221E] text-xs font-semibold rounded-lg border border-[#E8DFD5] flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Navigation className={`w-3.5 h-3.5 text-[#8C533C] ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Mencari...' : 'Lokasi Saya'}</span>
        </button>
      </div>

      {/* Preset Quick Select Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] text-[#7A7067] whitespace-nowrap">Kota cepat:</span>
        {PRESET_LOCATIONS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="px-2.5 py-1 bg-white hover:bg-[#F2EAE1] text-[#574E47] border border-[#E8DFD5] rounded-md text-[11px] whitespace-nowrap transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Embedded Map Container */}
      <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-[#E8DFD5] bg-[#EAE2D8]">
        {!hasMapError && apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={position}
              defaultZoom={14}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              onClick={handleMapClick}
              gestureHandling="cooperative"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              <MapController center={position} />
              <AdvancedMarker
                position={position}
                draggable={true}
                onDragEnd={handleDragEnd}
                title="Titik Pengiriman Kriya"
              />
            </Map>
          </APIProvider>
        ) : (
          /* Interactive Fallback Grid if key error or network offline */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F2ECE3]">
            <AlertCircle className="w-8 h-8 text-[#8C533C] mb-2" />
            <div className="text-xs font-bold text-[#2C221E]">
              Mode Penentuan Koordinat
            </div>
            <div className="text-[11px] text-[#7A7067] max-w-xs mt-1">
              Silakan pilih salah satu kota cepat di atas atau masukkan koordinat langsung.
            </div>
            <div className="mt-3 text-xs font-mono bg-white px-3 py-1.5 rounded border border-[#E8DFD5] tabular-nums">
              Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
            </div>
          </div>
        )}

        {/* Floating Coordinates Bar */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#E8DFD5] text-[11px] font-mono text-[#2C221E] shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3A4D39]" />
          <span>
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </span>
        </div>
      </div>

      {/* Detected / Refined Address Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
        <div className="sm:col-span-6">
          <label className="block text-[11px] font-semibold text-[#574E47] mb-1">
            Alamat / Catatan Patokan dari Peta:
          </label>
          <input
            type="text"
            value={addressDetails.street}
            onChange={(e) =>
              setAddressDetails((prev) => ({ ...prev, street: e.target.value }))
            }
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
            placeholder="Nama jalan atau patokan..."
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-[#574E47] mb-1">
            Kota / Wilayah:
          </label>
          <input
            type="text"
            value={addressDetails.city}
            onChange={(e) =>
              setAddressDetails((prev) => ({ ...prev, city: e.target.value }))
            }
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-[#574E47] mb-1">
            Kode Pos:
          </label>
          <input
            type="text"
            value={addressDetails.postal}
            onChange={(e) =>
              setAddressDetails((prev) => ({ ...prev, postal: e.target.value }))
            }
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8DFD5] rounded-lg focus:outline-none focus:border-[#8C533C]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFD5]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-[#574E47] hover:text-[#2C221E] hover:bg-[#F2EAE1] rounded-lg transition-colors"
          >
            Batal
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Terapkan Alamat dari Peta</span>
        </button>
      </div>
    </div>
  );
};
