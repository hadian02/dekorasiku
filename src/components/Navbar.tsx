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
  X,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Menu,
  Check,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Compass
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  const { language, setLanguage, t } = useLanguage();

  // Distinct Sub-menus
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isStudioMenuOpen, setIsStudioMenuOpen] = useState(false); // Kotak Merah Sub-menu
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false); // Kotak Biru 3-Lines Sub-menu
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); // Language Selector

  const userMenuRef = useRef<HTMLDivElement>(null);
  const studioMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (studioMenuRef.current && !studioMenuRef.current.contains(target)) {
        setIsStudioMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsStudioMenuOpen(false);
        setIsNavMenuOpen(false);
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all max-w-full overflow-visible">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
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
            {t('nav.catalog')}
          </a>
          <a
            href="#galeri"
            className="hover:text-[#8C533C] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8"
          >
            {t('nav.gallery')}
          </a>
          <a
            href="#filosofi"
            className="hover:text-[#8C533C] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8"
          >
            {t('nav.stories')}
          </a>
          <a
            href="#garansi"
            className="hover:text-[#8C533C] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8"
          >
            {t('nav.ethics')}
          </a>
        </nav>

        {/* Zone 3: Actions & Sub-menus Area */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* A. LANGUAGE PICKER BUTTON (Indonesia / English) */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsUserMenuOpen(false);
                setIsStudioMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#E8DFD5] bg-white hover:bg-[#F2EAE1] text-xs font-semibold text-[#2C221E] transition-all cursor-pointer shadow-2xs"
              title={language === 'id' ? 'Ganti Bahasa (Indonesia / English)' : 'Switch Language (Indonesian / English)'}
              aria-label="Language Selector"
            >
              {language === 'id' ? (
                <>
                  <span className="text-sm leading-none" role="img" aria-label="Bendera Indonesia">
                    🇮🇩
                  </span>
                  <span className="font-bold text-[11px] text-[#2C221E]">ID</span>
                </>
              ) : (
                <>
                  <span className="text-sm leading-none" role="img" aria-label="English UK Flag">
                    🇬🇧
                  </span>
                  <span className="font-bold text-[11px] text-[#2C221E]">EN</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-[#7A7067]" />
            </button>

            {/* Language Dropdown */}
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E8DFD5] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-[#F2ECE3] text-[10px] font-bold text-[#8C533C] uppercase tracking-wider">
                  {t('lang.title')}
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('id');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      language === 'id'
                        ? 'bg-[#FAF7F2] text-[#8C533C] font-bold'
                        : 'text-[#2C221E] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">🇮🇩</span>
                      <span>Bahasa Indonesia</span>
                    </div>
                    {language === 'id' && <Check className="w-3.5 h-3.5 text-[#8C533C]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      language === 'en'
                        ? 'bg-[#FAF7F2] text-[#8C533C] font-bold'
                        : 'text-[#2C221E] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">🇬🇧</span>
                      <span>English</span>
                    </div>
                    {language === 'en' && <Check className="w-3.5 h-3.5 text-[#8C533C]" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* B. SUB-MENU KOTAK MERAH (Studio, Mitra & Admin) - DEDICATED MENU */}
          <div className="relative" ref={studioMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsStudioMenuOpen(!isStudioMenuOpen);
                setIsUserMenuOpen(false);
                setIsLangMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                isStudioMenuOpen
                  ? 'bg-[#8C533C] text-white border-[#8C533C] ring-2 ring-[#8C533C]/20'
                  : 'bg-[#F5EDE4] hover:bg-[#EBDDCF] border-[#DFCBB7] text-[#8C533C]'
              }`}
              title={language === 'id' ? 'Sub-menu: Portal Pengrajin, Panel Admin, Chat Studio' : 'Sub-menu: Artisan Portal, Admin Panel, Studio Chat'}
              aria-label="Studio and Partners Sub-menu"
            >
              <Hammer className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-bold">{t('red.title')}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  isStudioMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Kotak Merah Sub-menu Dropdown */}
            {isStudioMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#E8DFD5] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
                <div className="px-2 py-1 border-b border-[#F2ECE3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C533C]">
                      {t('red.title')}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#7A7067]">
                    {language === 'id' ? 'Ruang Khusus Mitra' : 'Partner Workspace'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* 1. Portal Pengrajin */}
                  {artisan ? (
                    <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#DFCBB7] flex items-center justify-between">
                      <button
                        onClick={() => {
                          setIsStudioMenuOpen(false);
                          onOpenArtisanPortal();
                        }}
                        className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#8C533C] text-white flex items-center justify-center shrink-0">
                          <Hammer className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] text-[#7A7067] font-semibold">
                            {language === 'id' ? 'Mitra Login Aktif' : 'Active Partner'}
                          </div>
                          <div className="text-xs font-bold text-[#2C221E]">{artisan.name}</div>
                        </div>
                      </button>
                      {onLogoutArtisan && (
                        <button
                          onClick={() => {
                            setIsStudioMenuOpen(false);
                            onLogoutArtisan();
                          }}
                          className="px-2 py-1 text-xs text-[#8C533C] hover:text-red-600 hover:bg-white rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                          title={language === 'id' ? 'Keluar Akun Pengrajin' : 'Logout Artisan'}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{language === 'id' ? 'Keluar' : 'Logout'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsStudioMenuOpen(false);
                        onOpenArtisanPortal();
                      }}
                      className="w-full p-2.5 bg-[#FAF7F2] hover:bg-[#F2EAE1] rounded-xl border border-[#DFCBB7] flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#8C533C] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Hammer className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#2C221E]">{t('red.artisan_portal')}</div>
                          <div className="text-[10px] text-[#7A7067]">{t('red.artisan_desc')}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8C533C] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}

                  {/* 2. Panel Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsStudioMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full p-2.5 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#2C221E] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2C221E]">{t('red.admin_panel')}</div>
                        <div className="text-[10px] text-[#7A7067]">{t('red.admin_desc')}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7A7067] group-hover:text-[#2C221E] group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* 3. Chat Studio */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsStudioMenuOpen(false);
                      onOpenChat();
                    }}
                    className="w-full p-2.5 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#8C533C]/10 text-[#8C533C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2C221E]">{t('red.chat_studio')}</div>
                        <div className="text-[10px] text-[#7A7067]">{t('red.chat_desc')}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#7A7067] group-hover:text-[#8C533C] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* C. USER ACCOUNT MENU [H] (Clean: Edit Profile, My Favorite, My Orders, Logout) */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsStudioMenuOpen(false);
                setIsLangMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                isUserMenuOpen
                  ? 'bg-white border-[#8C533C] text-[#8C533C] ring-2 ring-[#8C533C]/20'
                  : 'bg-white hover:bg-[#F2EAE1] border-[#E8DFD5] text-[#2C221E]'
              }`}
              aria-label="User Account Menu"
              title={customer ? `Akun: ${customer.name}` : 'Menu Akun Pengguna'}
            >
              {customer ? (
                <div className="w-6 h-6 rounded-full bg-[#8C533C] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#F2EAE1] text-[#8C533C] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="hidden sm:inline font-semibold max-w-[90px] truncate">
                {customer ? customer.name.split(' ')[0] : (language === 'id' ? 'Akun' : 'Account')}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[#7A7067] transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180 text-[#8C533C]' : ''
                }`}
              />
            </button>

            {/* User Dropdown Sub-menu */}
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
                      <div className="text-xs font-bold text-[#2C221E]">{t('user.welcome')}</div>
                      <div className="text-[11px] text-[#7A7067]">{t('user.welcome_sub')}</div>
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
                      <div className="font-semibold text-[#2C221E]">{t('user.profile')}</div>
                      <div className="text-[10px] text-[#7A7067]">{t('user.profile_desc')}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#A89F95]" />
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
                        <div className="font-semibold text-[#2C221E]">{t('user.favorites')}</div>
                        <div className="text-[10px] text-[#7A7067]">{t('user.favorites_desc')}</div>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="bg-[#8C533C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#A89F95]" />
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
                        <div className="font-semibold text-[#2C221E]">{t('user.orders')}</div>
                        <div className="text-[10px] text-[#7A7067]">{t('user.orders_desc')}</div>
                      </div>
                      {customerOrderCount > 0 && (
                        <span className="bg-[#8C533C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                          {customerOrderCount}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#A89F95]" />
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
                        <div className="font-semibold">{t('user.logout')}</div>
                        <div className="text-[10px] text-red-500/80">{t('user.logout_desc')}</div>
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
                        <div className="font-semibold">{t('user.login')}</div>
                        <div className="text-[10px] text-emerald-600/80">{t('user.login_desc')}</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* D. CART CTA BUTTON */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-[#FAF7F2] bg-[#2C221E] hover:bg-[#43352F] active:scale-[0.98] transition-all rounded-xl shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={`${t('nav.cart')} (${cartCount})`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.cart')}</span>
            <span className="inline-flex items-center justify-center bg-[#8C533C] text-white text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded min-w-[18px] tabular-nums">
              {cartCount}
            </span>
          </button>

          {/* E. SUB-MENU KOTAK BIRU DENGAN ICON 3 GARIS (☰ HAMBURGER MENU) */}
          <button
            type="button"
            onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
            className={`p-2 rounded-xl border text-[#2C221E] transition-all cursor-pointer shadow-2xs ${
              isNavMenuOpen
                ? 'bg-[#8C533C] text-white border-[#8C533C]'
                : 'bg-white hover:bg-[#F2EAE1] border-[#E8DFD5] hover:text-[#8C533C]'
            }`}
            title={language === 'id' ? 'Navigasi Menu (Icon 3 Garis)' : 'Navigation Menu (3 Bars)'}
            aria-label="Navigation Menu with 3 lines"
          >
            {isNavMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MODAL / DRAWER SUB-MENU KOTAK BIRU (Opened by the 3-line hamburger menu icon) */}
      {isNavMenuOpen && (
        <div className="border-t border-[#E8DFD5] bg-[#FAF7F2] px-4 py-4 shadow-xl animate-in slide-in-from-top-3 duration-200">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2C221E]">
                  {t('blue.title')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNavMenuOpen(false)}
                className="text-xs text-[#7A7067] hover:text-[#2C221E] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kotak Biru 4 Main Navigation Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 1. Katalog Kriya Lengkap */}
              <a
                href="#koleksi"
                onClick={() => setIsNavMenuOpen(false)}
                className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] hover:border-[#8C533C] flex items-center justify-between text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-[#8C533C] group-hover:text-white transition-colors">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C221E] group-hover:text-[#8C533C] transition-colors">
                      {t('blue.catalog_full')}
                    </div>
                    <div className="text-[10px] text-[#7A7067]">
                      {language === 'id' ? 'Eksplorasi tembikar, anyaman & kayu' : 'Explore pottery, weaving & woodcraft'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89F95] group-hover:text-[#8C533C] group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* 2. Galeri Estetik & Lookbook Ruang */}
              <a
                href="#galeri"
                onClick={() => setIsNavMenuOpen(false)}
                className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] hover:border-[#8C533C] flex items-center justify-between text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-800 group-hover:bg-[#8C533C] group-hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C221E] group-hover:text-[#8C533C] transition-colors">
                      {t('blue.gallery_full')}
                    </div>
                    <div className="text-[10px] text-[#7A7067]">
                      {language === 'id' ? 'Inspirasi penataan ruang bernyawa' : 'Soulful interior styling inspiration'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89F95] group-hover:text-[#8C533C] group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* 3. Kisah & Etika Pengrajin */}
              <a
                href="#filosofi"
                onClick={() => setIsNavMenuOpen(false)}
                className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] hover:border-[#8C533C] flex items-center justify-between text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-[#8C533C] group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C221E] group-hover:text-[#8C533C] transition-colors">
                      {t('blue.stories_full')}
                    </div>
                    <div className="text-[10px] text-[#7A7067]">
                      {language === 'id' ? 'Filosofi ketelatenan tangan seniman' : 'Philosophy of handcrafted heritage'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89F95] group-hover:text-[#8C533C] group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* 4. Garansi Aman & Ekspedisi Nusantara */}
              <a
                href="#garansi"
                onClick={() => setIsNavMenuOpen(false)}
                className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] hover:border-[#8C533C] flex items-center justify-between text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-800 group-hover:bg-[#8C533C] group-hover:text-white transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C221E] group-hover:text-[#8C533C] transition-colors">
                      {t('blue.shipping_full')}
                    </div>
                    <div className="text-[10px] text-[#7A7067]">
                      {language === 'id' ? 'Garansi pecah belah 100% aman' : '100% Fragile safe shipping guarantee'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A89F95] group-hover:text-[#8C533C] group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
