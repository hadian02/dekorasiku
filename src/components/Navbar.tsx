import React, { useState, useRef, useEffect } from 'react';
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
  LogIn,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  UserCheck
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
  onLogoutCustomer?: () => void;
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
  onLogoutCustomer,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleMobileAction = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all max-w-full overflow-visible">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand Logo */}
        <a 
          href="#" 
          className="group flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C533C]"
          title="dekorasiku - Studio Kerajinan & Dekorasi"
        >
          <img
            src="/assets/aistudio/1000297830_4688d260.png"
            alt="dekorasiku"
            className="h-7 sm:h-8.5 w-auto object-contain transition-transform group-hover:scale-105"
          />
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

        {/* Zone 3 Desktop: Action Area */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* USER MENU WITH SUB-MENUS (Edit Profile, My Favorite, My Orders, Login/Logout) */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isUserMenuOpen
                  ? 'bg-white border-[#8C533C] text-[#8C533C] ring-2 ring-[#8C533C]/20 shadow-xs'
                  : 'bg-white hover:bg-[#F2EAE1] border-[#E8DFD5] text-[#2C221E]'
              }`}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              title="Menu Pengguna: Edit Profile, My Favorite, My Orders, Login/Logout"
            >
              {customer ? (
                <div className="w-6 h-6 rounded-full bg-[#8C533C] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#F2EAE1] text-[#8C533C] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="font-semibold max-w-[100px] truncate">
                {customer ? customer.name.split(' ')[0] : 'Akun User'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7A7067] transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180 text-[#8C533C]' : ''
                }`}
              />
            </button>

            {/* Dropdown Sub-menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8DFD5] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Header Info */}
                <div className="px-4 py-3 border-b border-[#F2ECE3] bg-[#FAF7F2]/60">
                  {customer ? (
                    <div>
                      <div className="text-xs font-bold text-[#2C221E] truncate">{customer.name}</div>
                      <div className="text-[11px] text-[#7A7067] truncate">{customer.email}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-[#2C221E]">Selamat Datang!</div>
                      <div className="text-[11px] text-[#7A7067]">Silakan masuk untuk akses akun penuh</div>
                    </div>
                  )}
                </div>

                <div className="py-1">
                  {/* 1. Edit Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (customer) {
                        onOpenProfile();
                      } else {
                        onOpenAuth();
                      }
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-[#FAF7F2] transition-colors text-xs text-[#2C221E] group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#8C533C] group-hover:bg-[#8C533C] group-hover:text-white transition-colors">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#2C221E]">Edit Profile</div>
                      <div className="text-[10px] text-[#7A7067]">Kelola data diri & alamat kirim</div>
                    </div>
                  </button>

                  {/* 2. My Favorite */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenWishlist();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-[#FAF7F2] transition-colors text-xs text-[#2C221E] group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#8C533C] group-hover:bg-[#8C533C] group-hover:text-white transition-colors">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#2C221E]">My Favorite</div>
                        <div className="text-[10px] text-[#7A7067]">Kriya tersimpan</div>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="bg-[#8C533C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* 3. My Orders */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenOrders();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-[#FAF7F2] transition-colors text-xs text-[#2C221E] group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#8C533C] group-hover:bg-[#8C533C] group-hover:text-white transition-colors">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#2C221E]">My Orders</div>
                        <div className="text-[10px] text-[#7A7067]">Pantau status & lacak pesanan</div>
                      </div>
                      {customerOrderCount > 0 && (
                        <span className="bg-[#8C533C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                          {customerOrderCount}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="my-1 border-t border-[#F2ECE3]" />

                  {/* 4. Login / Logout */}
                  {customer ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onLogoutCustomer) onLogoutCustomer();
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors text-xs group cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Logout</div>
                        <div className="text-[10px] text-red-500/80">Keluar dari akun Anda</div>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-emerald-50 text-emerald-700 transition-colors text-xs group cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Login / Masuk</div>
                        <div className="text-[10px] text-emerald-600/80">Masuk atau daftar akun kriya</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat Studio Button */}
          <button
            onClick={onOpenChat}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#2C221E] hover:text-[#8C533C] bg-white hover:bg-[#F2EAE1] rounded-lg border border-[#E8DFD5] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Buka Ruang Obrolan dengan Tim Studio"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#8C533C]" />
            <span className="hidden xl:inline">Chat</span>
          </button>

          {/* Admin Switcher Button */}
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#8C533C] hover:text-[#2C221E] bg-[#F2EAE1] hover:bg-[#E8DFD5] rounded-lg border border-[#DECBB7] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Masuk ke Halaman Admin Studio"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#8C533C]" />
            <span className="hidden xl:inline">Admin</span>
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
              className="px-2.5 py-1.5 text-xs font-semibold text-[#8C533C] hover:text-[#2C221E] bg-[#F5EDE4] hover:bg-[#EBDDCF] rounded-lg border border-[#DFCBB7] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              title="Masuk atau Daftar Akun Pengrajin"
            >
              <Hammer className="w-3.5 h-3.5 text-[#8C533C]" />
              <span className="font-bold hidden xl:inline">Pengrajin</span>
            </button>
          )}

          {/* Cart Primary CTA */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FAF7F2] bg-[#2C221E] hover:bg-[#43352F] active:scale-[0.98] transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={`Buka Keranjang (${cartCount} barang)`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden lg:inline">Keranjang</span>
            <span className="inline-flex items-center justify-center bg-[#8C533C] text-white text-[11px] font-bold px-1.5 py-0.2 rounded min-w-[20px] tabular-nums">
              {cartCount}
            </span>
          </button>
        </div>

        {/* Zone 3 Mobile: Compact View */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Mobile User Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-[#2C221E] hover:text-[#8C533C] rounded-lg hover:bg-[#F2EAE1]"
            title="Menu Akun User"
          >
            {customer ? (
              <div className="w-6 h-6 rounded-full bg-[#8C533C] text-white flex items-center justify-center text-[10px] font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User className="w-5 h-5 text-[#8C533C]" />
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
            className="p-1.5 text-[#2C221E] hover:text-[#8C533C] bg-[#F2EAE1] hover:bg-[#E8DFD5] border border-[#DECBB7] rounded-lg transition-colors cursor-pointer"
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
        <div className="md:hidden border-t border-[#E8DFD5] bg-[#FAF7F2] px-4 py-4 space-y-4 shadow-lg max-h-[85vh] overflow-y-auto">
          {/* USER SUB-MENU GROUP (Edit Profile, My Favorite, My Orders, Login/Logout) */}
          <div className="bg-white rounded-2xl border border-[#E8DFD5] p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE3]">
              <div className="flex items-center gap-2">
                {customer ? (
                  <div className="w-7 h-7 rounded-full bg-[#8C533C] text-white flex items-center justify-center text-xs font-bold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#F2EAE1] text-[#8C533C] flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-[#2C221E]">
                    {customer ? customer.name : 'Menu Akun Pengguna'}
                  </div>
                  <div className="text-[10px] text-[#7A7067]">
                    {customer ? customer.email : 'Akses profil & pesanan'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {/* 1. Edit Profile */}
              <button
                onClick={() => handleMobileAction(customer ? onOpenProfile : onOpenAuth)}
                className="w-full p-2.5 rounded-xl hover:bg-[#FAF7F2] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#8C533C]" />
                  <span className="text-xs font-semibold text-[#2C221E]">Edit Profile</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#7A7067]" />
              </button>

              {/* 2. My Favorite */}
              <button
                onClick={() => handleMobileAction(onOpenWishlist)}
                className="w-full p-2.5 rounded-xl hover:bg-[#FAF7F2] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-[#8C533C]" />
                  <span className="text-xs font-semibold text-[#2C221E]">My Favorite</span>
                </div>
                {wishlistCount > 0 ? (
                  <span className="bg-[#8C533C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                    {wishlistCount}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#7A7067]" />
                )}
              </button>

              {/* 3. My Orders */}
              <button
                onClick={() => handleMobileAction(onOpenOrders)}
                className="w-full p-2.5 rounded-xl hover:bg-[#FAF7F2] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#8C533C]" />
                  <span className="text-xs font-semibold text-[#2C221E]">My Orders</span>
                </div>
                {customerOrderCount > 0 ? (
                  <span className="bg-[#8C533C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                    {customerOrderCount}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#7A7067]" />
                )}
              </button>

              {/* 4. Login / Logout */}
              {customer ? (
                <button
                  onClick={() => {
                    if (onLogoutCustomer) onLogoutCustomer();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2.5 text-left transition-colors font-semibold text-xs"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => handleMobileAction(onOpenAuth)}
                  className="w-full p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-700 flex items-center gap-2.5 text-left transition-colors font-semibold text-xs"
                >
                  <LogIn className="w-4 h-4 text-emerald-700" />
                  <span>Login / Masuk</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Tiles (Admin, Artisan, Chat) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Portal Pengrajin Tile */}
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

            {/* Panel Admin Button */}
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

            {/* Chat Studio Button */}
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
