import React from 'react';
import { Customer, Artisan } from '../types';
import { ShoppingBag, Heart, User, LayoutDashboard, Package, MessageCircle, Hammer, LogOut } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <a 
          href="#" 
          className="group flex items-baseline gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C533C]"
        >
          <span className="font-serif text-2xl font-bold tracking-tight text-[#2C221E] group-hover:text-[#8C533C] transition-colors">
            Kala Kriya
          </span>
          <span className="text-xs text-[#7A7067] font-medium tracking-widest hidden xl:inline">
            STUDIO KERAJINAN
          </span>
        </a>

        {/* Zone 2: Clean Nav Links + Pesanan & Chat Links */}
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

        {/* Zone 3: Action Buttons (Pesanan Saya, Chat, Admin, Auth, Wishlist, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Pesanan Saya Quick Button */}
          <button
            onClick={onOpenOrders}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#2C221E] hover:text-[#8C533C] bg-white hover:bg-[#F2EAE1] rounded-lg border border-[#E8DFD5] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Pantau & Lacak Pesanan Kriya Saya"
          >
            <Package className="w-3.5 h-3.5 text-[#8C533C]" />
            <span className="hidden xs:inline">Pesanan Saya</span>
            {customerOrderCount > 0 && (
              <span className="bg-[#8C533C] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {customerOrderCount}
              </span>
            )}
          </button>

          {/* Chat Studio Quick Button */}
          <button
            onClick={onOpenChat}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#2C221E] hover:text-[#8C533C] bg-white hover:bg-[#F2EAE1] rounded-lg border border-[#E8DFD5] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Buka Ruang Obrolan dengan Tim Studio"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#8C533C]" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          {/* Admin Switcher Button */}
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#8C533C] hover:text-[#2C221E] bg-[#F2EAE1] hover:bg-[#E8DFD5] rounded-lg border border-[#DECBB7] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Masuk ke Halaman Admin Studio"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#8C533C]" />
            <span className="hidden md:inline">Panel Admin</span>
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
                <span className="hidden sm:inline font-bold">
                  {artisan.name.split(' ')[0]}
                </span>
                <span className="sm:hidden font-bold text-[11px]">Mitra</span>
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
              <span className="hidden sm:inline font-bold">Masuk Pengrajin</span>
              <span className="sm:hidden font-bold text-[11px]">Pengrajin</span>
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
              <span className="max-w-[70px] truncate hidden md:inline">
                {customer.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#2C221E] hover:text-[#8C533C] hover:bg-[#F2EAE1] rounded-lg transition-all border border-transparent hover:border-[#E8DFD5] whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4 text-[#8C533C]" />
              <span className="hidden sm:inline">Masuk</span>
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
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 text-xs font-semibold text-[#FAF7F2] bg-[#2C221E] hover:bg-[#43352F] active:scale-[0.98] transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C533C]"
            aria-label={`Buka Keranjang (${cartCount} barang)`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Keranjang</span>
            <span className="inline-flex items-center justify-center bg-[#8C533C] text-white text-[11px] font-bold px-1.5 py-0.2 rounded min-w-[20px] tabular-nums">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
