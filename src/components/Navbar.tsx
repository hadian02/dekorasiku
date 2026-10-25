import React, { useState } from 'react';
import { Customer, Artisan } from '../types';
import {
  ShoppingBag,
  Heart,
  User,
  LayoutDashboard,
  Package,
  MessageCircle,
  Hammer,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  customerOrderCount: number;
  customer: Customer | null;
  artisan?: Artisan | null;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenChat: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenArtisanPortal: () => void;
  onLogoutArtisan?: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  customerOrderCount,
  customer,
  artisan,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenChat,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  onOpenArtisanPortal,
  onLogoutArtisan,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileAction = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <a 
          href="#" 
          className="group flex items-baseline gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C533C]"
        >
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2C221E] group-hover:text-[#8C533C] transition-colors">
            Kala Kriya
          </span>
          <span className="text-[10px] text-[#7A7067] font-medium tracking-widest hidden xl:inline">
            STUDIO KERAJINAN
          </span>
        </a>

        {/* Zone 2: Desktop Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#574E47]">
          <a
            href="#koleksi"
            className="hover:text-[#8C533C] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8"
          >
            Katalog Kriya
          </a>
          <a
            href="#galeri"
            className="hover:text-[#8C533C] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8"
          >
            Galeri Estetik
          </a>
          <a
            href="#filosofi"
            className="hover:text-[#8C533C] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8"
          >
            Kisah Pengrajin
          </a>
          <a
            href="#garansi"
            className="hover:text-[#8C533C] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8"
          >
            Garansi & Etika
          </a>
        </nav>

        {/* Zone 3 Desktop: Full Action Buttons (visible on md screens and up) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Pesanan Saya Button */}
          <button
            onClick={onOpenOrders}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#2C221E] hover:text-[#8C533C] bg-white hover:bg-[#F2EAE1] rounded-lg border border-[#E8DFD5] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Pantau & Lacak Pesanan Kriya Saya"
          >
            <Package className="w-3.5 h-3.5 text-[#8C533C]" />
            <span className="hidden lg:inline">Pesanan</span>
            {customerOrderCount > 0 && (
              <span className="bg-[#8C533C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {customerOrderCount}
              </span>
            )}
          </button>

          {/* Chat Studio Button */}
          <button
            onClick={onOpenChat}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#2C221E] hover:text-[#8C533C] bg-white hover:bg-[#F2EAE1] rounded-lg border border-[#E8DFD5] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Buka Ruang Obrolan dengan Tim Studio"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#8C533C]" />
            <span className="hidden lg:inline">Chat</span>
          </button>

          {/* Admin Switcher Button */}
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#8C533C] hover:text-[#2C221E] bg-[#F2EAE1] hover:bg-[#E8DFD5] rounded-lg border border-[#DECBB7] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Masuk ke Halaman Admin Studio"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#8C533C]" />
            <span className="hidden lg:inline">Panel Admin</span>
          </button>

          {/* Artisan Portal Switcher Button */}
          {artisan ? (
            <div className="flex items-center bg-[#F5EDE4] rounded-lg border border-[#DFCBB7] p-0.5 shadow-2xs">
              <button
                onClick={onOpenArtisanPortal}
                className="px-2.5 py-1 text-xs font-semibold text-[#8C533C] hover:text-[#2C221E] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                title={`Buka Ruang Kerja Pengrajin (${artisan.name})`}
              >
                <Hammer className="w-3.5 h-3.5 text-[#8C533C]" />
                <span className="font-bold">
                  {artisan.name.split(' ')[0]}
                </span>
              </button>
              {onLogoutArtisan && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogoutArtisan();
                  }}
                  className="p-1 text-[#8C533C] hover:text-red-600 hover:bg-white/80 rounded transition-colors"
                  title="Keluar / Ganti Akun Pengrajin"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenArtisanPortal}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#8C533C] hover:text-[#2C221E] bg-[#F5EDE4] hover:bg-[#EBDDCF] rounded-lg border border-[#DFCBB7] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              title="Masuk atau Daftar Akun Pengrajin (LOG IN / SIGN IN)"
            >
              <Hammer className="w-3.5 h-3.5 text-[#8C533C]" />
              <span className="font-bold">Masuk Pengrajin</span>
            </button>
          )}

          {/* Customer Auth / Profile Button */}
          {customer ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#2C221E] bg-white hover:bg-[#F2EAE1] rounded-lg border border-[#E8DFD5] transition-all whitespace-nowrap shrink-0"
              title="Profil & Alamat Pengiriman"
            >
              <div className="w-5 h-5 rounded-full bg-[#8C533C] text-white flex items-center justify-center text-[10px] font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[70px] truncate hidden lg:inline">
                {customer.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#2C221E] hover:text-[#8C533C] hover:bg-[#F2EAE1] rounded-lg transition-all border border-transparent hover:border-[#E8DFD5] whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4 text-[#8C533C]" />
              <span className="hidden lg:inline">Masuk</span>
            </button>
          )}

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            aria-label="Daftar Keinginan"
            className="relative p-2 text-[#574E47] hover:text-[#8C533C] transition-colors rounded-full hover:bg-[#F2EAE1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C533C]"
            title="Daftar Keinginan / Favorit"
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8C533C] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Primary CTA */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FAF7F2] bg-[#2C221E] hover:bg-[#43352F] active:scale-[0.98] transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0"
            aria-label={`Buka Keranjang (${cartCount} barang)`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden lg:inline">Keranjang</span>
            <span className="inline-flex items-center justify-center bg-[#8C533C] text-white text-[11px] font-bold px-1.5 py-0.2 rounded min-w-[20px] tabular-nums">
              {cartCount}
            </span>
          </button>
        </div>

        {/* Zone 3 Mobile: Compact View (Wishlist, Cart, Hamburger Menu) */}
        <div className="flex md:hidden items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Wishlist */}
          <button
            onClick={onOpenWishlist}
            aria-label="Daftar Keinginan"
            className="relative p-1.5 text-[#574E47] hover:text-[#8C533C] rounded-lg hover:bg-[#F2EAE1]"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#8C533C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Mobile Cart Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#FAF7F2] bg-[#2C221E] active:scale-[0.98] rounded-lg shadow-xs"
            aria-label={`Keranjang (${cartCount})`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="bg-[#8C533C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded tabular-nums">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-[#2C221E] hover:text-[#8C533C] bg-[#F2EAE1] hover:bg-[#E8DFD5] border border-[#DECBB7] rounded-lg transition-colors"
            aria-label="Buka Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#8C533C]" />
            ) : (
              <Menu className="w-5 h-5 text-[#2C221E]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD5] bg-[#FAF7F2] px-4 py-4 space-y-3 shadow-lg max-h-[85vh] overflow-y-auto">
          {/* Quick Action Tiles */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Portal Pengrajin Tile */}
            {artisan ? (
              <div className="col-span-2 p-3 bg-[#F5EDE4] rounded-xl border border-[#DFCBB7] flex items-center justify-between">
                <button
                  onClick={() => handleMobileAction(onOpenArtisanPortal)}
                  className="flex items-center gap-2 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#7A7067] font-semibold">Ruang Kerja Pengrajin</div>
                    <div className="text-xs font-bold text-[#2C221E]">{artisan.name}</div>
                  </div>
                </button>
                {onLogoutArtisan && (
                  <button
                    onClick={() => {
                      onLogoutArtisan();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-1.5 text-xs text-[#8C533C] hover:text-red-600 bg-white/70 rounded-lg flex items-center gap-1 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleMobileAction(onOpenArtisanPortal)}
                className="col-span-2 p-3 bg-[#F5EDE4] hover:bg-[#EBDDCF] rounded-xl border border-[#DFCBB7] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#2C221E]">Portal Pengrajin</div>
                    <div className="text-[10px] text-[#7A7067]">Masuk (Log In) atau Daftar (Sign In)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C533C]" />
              </button>
            )}

            {/* 2. Panel Admin Button */}
            <button
              onClick={() => handleMobileAction(onOpenAdmin)}
              className="p-2.5 bg-white hover:bg-[#F2EAE1] rounded-xl border border-[#E8DFD5] flex items-center gap-2 text-left transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#8C533C] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#2C221E]">Panel Admin</div>
                <div className="text-[10px] text-[#7A7067]">Kelola Toko & Mitra</div>
              </div>
            </button>

            {/* 3. Pesanan Saya Button */}
            <button
              onClick={() => handleMobileAction(onOpenOrders)}
              className="p-2.5 bg-white hover:bg-[#F2EAE1] rounded-xl border border-[#E8DFD5] flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#8C533C] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#2C221E]">Pesanan Saya</div>
                  <div className="text-[10px] text-[#7A7067]">Lacak Paket Kriya</div>
                </div>
              </div>
              {customerOrderCount > 0 && (
                <span className="bg-[#8C533C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums">
                  {customerOrderCount}
                </span>
              )}
            </button>

            {/* 4. Chat Studio Button */}
            <button
              onClick={() => handleMobileAction(onOpenChat)}
              className="p-2.5 bg-white hover:bg-[#F2EAE1] rounded-xl border border-[#E8DFD5] flex items-center gap-2 text-left transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#8C533C] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#2C221E]">Chat Studio</div>
                <div className="text-[10px] text-[#7A7067]">Tanya Tim Admin</div>
              </div>
            </button>

            {/* 5. Customer Profile / Login */}
            {customer ? (
              <button
                onClick={() => handleMobileAction(onOpenProfile)}
                className="p-2.5 bg-white hover:bg-[#F2EAE1] rounded-xl border border-[#E8DFD5] flex items-center gap-2 text-left transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#8C533C] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#2C221E] truncate">{customer.name}</div>
                  <div className="text-[10px] text-[#7A7067]">Profil & Alamat</div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => handleMobileAction(onOpenAuth)}
                className="p-2.5 bg-white hover:bg-[#F2EAE1] rounded-xl border border-[#E8DFD5] flex items-center gap-2 text-left transition-colors"
              >
                <User className="w-4 h-4 text-[#8C533C] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#2C221E]">Masuk Akun</div>
                  <div className="text-[10px] text-[#7A7067]">Pelanggan Kriya</div>
                </div>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="pt-2 border-t border-[#E8DFD5] flex flex-col space-y-1 text-xs font-medium text-[#574E47]">
            <a
              href="#koleksi"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#F2EAE1] hover:text-[#2C221E] flex items-center justify-between transition-colors"
            >
              <span>Katalog Kriya Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#7A7067]" />
            </a>
            <a
              href="#galeri"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#F2EAE1] hover:text-[#2C221E] flex items-center justify-between transition-colors"
            >
              <span>Galeri Estetik & Lookbook Ruang</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#7A7067]" />
            </a>
            <a
              href="#filosofi"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#F2EAE1] hover:text-[#2C221E] flex items-center justify-between transition-colors"
            >
              <span>Kisah & Etika Pengrajin</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#7A7067]" />
            </a>
            <a
              href="#garansi"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#F2EAE1] hover:text-[#2C221E] flex items-center justify-between transition-colors"
            >
              <span>Garansi Aman & Ekspedisi Nusantara</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#7A7067]" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
