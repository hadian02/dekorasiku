import React, { useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  OrderDetails,
  Customer,
  ChatMessage,
  Artisan,
  ArtisanProposal,
  ArtisanProposalChat,
  ArtisanPayout
} from './types';
import { PRODUCTS, formatIDR } from './data/products';
import { generateProductCode, getMaterialHex } from './utils/productCode';
import {
  INITIAL_ORDERS,
  INITIAL_CHATS,
  INITIAL_ARTISAN,
  INITIAL_REGISTERED_ARTISANS,
  INITIAL_PROPOSALS,
  INITIAL_PROPOSAL_CHATS,
  INITIAL_PAYOUTS,
  DEFAULT_HADIAN_CUSTOMER
} from './data/initialData';
import {
  testConnection,
  subscribeLiveOrders,
  createLiveOrder,
  updateLiveOrder,
  subscribeLiveProducts,
  saveLiveProduct,
  updateLiveProductStock,
  subscribeLiveArtisans,
  saveLiveArtisan,
  subscribeLiveProposals,
  saveLiveProposal,
  subscribeLiveProposalChats,
  saveLiveProposalChat
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { AestheticGallery } from './components/AestheticGallery';
import { StorySection } from './components/StorySection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { AuthModal } from './components/AuthModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { PaymentInstructionModal } from './components/PaymentInstructionModal';
import { CustomerChatWidget } from './components/CustomerChatWidget';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthGate } from './components/AdminAuthGate';
import { ArtisanPortal } from './components/ArtisanPortal';
import { Footer } from './components/Footer';
import { Check, Heart } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

// One-time cleanup of mock demo data for user testing (reset customers, artisans, orders, chats)
const FRESH_TEST_KEY = 'kala_kriya_test_reset_v3_clean';
const ARTISAN_AUTO_LOGIN_FIX_KEY_V8 = 'dekorasiku_artisan_clean_v8_strict';
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(FRESH_TEST_KEY)) {
      localStorage.removeItem('kala_kriya_active_customer');
      localStorage.removeItem('kala_kriya_registered_users');
      localStorage.removeItem('kala_kriya_orders');
      localStorage.removeItem('kala_kriya_chats');
      localStorage.removeItem('kala_kriya_registered_artisans');
      localStorage.removeItem('kala_kriya_active_artisan');
      localStorage.removeItem('kala_kriya_proposals');
      localStorage.removeItem('kala_kriya_proposal_chats');
      localStorage.removeItem('kala_kriya_payouts');
      localStorage.removeItem('kala_kriya_cart');
      localStorage.removeItem('kala_kriya_wishlist');
      localStorage.removeItem('kala_kriya_published_products');
      localStorage.setItem(FRESH_TEST_KEY, 'true');
    }
    if (!localStorage.getItem(ARTISAN_AUTO_LOGIN_FIX_KEY_V8)) {
      localStorage.removeItem('kala_kriya_active_artisan');
      localStorage.removeItem('kala_kriya_active_artisan_v2');
      localStorage.removeItem('kala_kriya_active_artisan_v3');
      localStorage.removeItem('kala_kriya_active_artisan_v4');
      localStorage.removeItem('kala_kriya_active_artisan_v5');
      sessionStorage.removeItem('kala_kriya_active_artisan');
      sessionStorage.removeItem('kala_kriya_active_artisan_v2');
      sessionStorage.removeItem('kala_kriya_active_artisan_v5');
      localStorage.setItem(ARTISAN_AUTO_LOGIN_FIX_KEY_V8, 'true');
    }
  } catch {
    // ignore
  }
}

export default function App() {
  const { t, language } = useLanguage();

  // Subdomain & Path Detection for Admin:
  // Detects admin.dekorasiku.vercel.app, admin.localhost, /admin path, or ?admin=true
  const isSubdomainAdmin = typeof window !== 'undefined' && (
    window.location.hostname.toLowerCase().startsWith('admin.') ||
    window.location.pathname.toLowerCase().startsWith('/admin') ||
    window.location.search.includes('admin=true')
  );

  // Subdomain & Path Detection for Artisan / Mitra:
  // Detects mitra.dekorasiku.com, pengrajin.dekorasiku.com, mitra.localhost, pengrajin.localhost, /mitra, /pengrajin, or ?mitra=true / ?pengrajin=true
  const isSubdomainArtisan = typeof window !== 'undefined' && !isSubdomainAdmin && (
    window.location.hostname.toLowerCase().startsWith('mitra.') ||
    window.location.hostname.toLowerCase().startsWith('pengrajin.') ||
    window.location.pathname.toLowerCase().startsWith('/mitra') ||
    window.location.pathname.toLowerCase().startsWith('/pengrajin') ||
    window.location.search.includes('mitra=true') ||
    window.location.search.includes('pengrajin=true')
  );

  // View mode: Storefront vs Admin Dashboard vs Artisan Portal
  const [viewMode, setViewMode] = useState<'store' | 'admin' | 'artisan'>(() => {
    if (isSubdomainAdmin) return 'admin';
    if (isSubdomainArtisan) return 'artisan';
    return 'store';
  });

  // Admin authentication state (password protected)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('kala_kriya_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Active Customer state: initially null (clean slate for testing)
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_active_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Orders State (synced across Customer and Admin)
  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_orders');
      if (saved) {
        const parsed: OrderDetails[] = JSON.parse(saved.replaceAll('/src/assets/images/', '/assets/images/'));
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasKK1110 = parsed.some((o) => o.orderId === 'KK-1110');
          return hasKK1110 ? parsed : [...INITIAL_ORDERS, ...parsed];
        }
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Chat Messages State (synced across Customer and Admin)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_chats');
      return saved ? JSON.parse(saved) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  });

  // Registered Artisans State (with LocalStorage persistence and auto-merge for pending demo accounts)
  const [registeredArtisans, setRegisteredArtisans] = useState<Artisan[]>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_registered_artisans');
      if (saved) {
        const parsed: Artisan[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingEmails = new Set(parsed.map((a) => a.email.toLowerCase()));
          const missing = INITIAL_REGISTERED_ARTISANS.filter(
            (a) => !existingEmails.has(a.email.toLowerCase())
          );
          if (missing.length > 0) {
            return [...parsed, ...missing];
          }
          return parsed;
        }
      }
      return INITIAL_REGISTERED_ARTISANS;
    } catch {
      return INITIAL_REGISTERED_ARTISANS;
    }
  });

  // Artisan State with LocalStorage persistence: defaults to null (no artisan auto-logged in)
  const [artisan, setArtisan] = useState<Artisan | null>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_active_artisan_v5');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Artisan Proposals State
  const [proposals, setProposals] = useState<ArtisanProposal[]>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_proposals');
      return saved ? JSON.parse(saved.replaceAll('/src/assets/images/', '/assets/images/')) : INITIAL_PROPOSALS;
    } catch {
      return INITIAL_PROPOSALS;
    }
  });

  // Artisan Proposal Chats State
  const [proposalChats, setProposalChats] = useState<ArtisanProposalChat[]>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_proposal_chats');
      return saved ? JSON.parse(saved) : INITIAL_PROPOSAL_CHATS;
    } catch {
      return INITIAL_PROPOSAL_CHATS;
    }
  });

  // Artisan Payouts (Escrow) State
  const [payouts, setPayouts] = useState<ArtisanPayout[]>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_payouts');
      return saved ? JSON.parse(saved) : INITIAL_PAYOUTS;
    } catch {
      return INITIAL_PAYOUTS;
    }
  });

  // Dynamic Catalog Products (Base PRODUCTS + any published by artisan + stock overrides maintained by artisan)
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => {
    try {
      const stockOverridesStr = localStorage.getItem('kala_kriya_stock_overrides');
      const stockOverrides: Record<string, number> = stockOverridesStr ? JSON.parse(stockOverridesStr) : {};

      const saved = localStorage.getItem('kala_kriya_published_products');
      let baseList = PRODUCTS;
      if (saved) {
        const sanitized = saved.replaceAll('/src/assets/images/', '/assets/images/');
        const extra: Product[] = JSON.parse(sanitized);
        baseList = [...extra, ...PRODUCTS];
      }

      return baseList.map((p) => {
        if (typeof stockOverrides[p.id] === 'number') {
          return { ...p, stock: Math.max(0, stockOverrides[p.id]) };
        }
        return p;
      });
    } catch {
      return PRODUCTS;
    }
  });

  // LocalStorage cart & wishlist persistence (only active when customer is logged in)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const activeCustomer = localStorage.getItem('kala_kriya_active_customer');
      if (!activeCustomer) return [];

      const saved = localStorage.getItem('kala_kriya_cart');
      if (saved) {
        const sanitized = saved.replaceAll('/src/assets/images/', '/assets/images/');
        return JSON.parse(sanitized);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const activeCustomer = localStorage.getItem('kala_kriya_active_customer');
      if (!activeCustomer) return [];

      const saved = localStorage.getItem('kala_kriya_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [giftWrapping, setGiftWrapping] = useState<boolean>(false);
  const [appliedPromo, setAppliedPromo] = useState<string>('');

  // Modals and Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState<boolean>(false);
  const [pendingPaymentOrders, setPendingPaymentOrders] = useState<OrderDetails[] | null>(null);
  const pendingPaymentOrder = pendingPaymentOrders && pendingPaymentOrders.length > 0 ? pendingPaymentOrders[0] : null;
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatTargetOrderId, setChatTargetOrderId] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Google Maps Quota State
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; icon?: 'check' | 'heart' } | null>(null);

  // Ensure document body & html scroll styles are clean on initial mount
  useEffect(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.touchAction = '';

    // Automatically migrate any legacy /src/assets/images paths in user's browser localStorage
    try {
      const keys = [
        'kala_kriya_published_products',
        'kala_kriya_cart',
        'kala_kriya_proposals',
        'kala_kriya_orders',
      ];
      keys.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val && val.includes('/src/assets/images/')) {
          localStorage.setItem(key, val.replaceAll('/src/assets/images/', '/assets/images/'));
        }
      });
    } catch {
      // ignore
    }
  }, []);

  // Real-time Cloud Synchronization (Firebase Firestore Live Data)
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  useEffect(() => {
    testConnection();

    // 1. Subscribe to Live Orders across all customer computers, admin, and artisans
    const unsubOrders = subscribeLiveOrders((liveOrders) => {
      setOrders(liveOrders);
      setIsLiveConnected(true);
    });

    // 2. Subscribe to Live Products & Stock (with self-healing fallback for newly published artisan kriya)
    const unsubProducts = subscribeLiveProducts((liveProducts) => {
      try {
        const saved = localStorage.getItem('kala_kriya_published_products');
        if (saved) {
          const localCustom: Product[] = JSON.parse(saved);
          const liveIds = new Set(liveProducts.map((p) => p.id));
          const missingLocals = localCustom.filter((p) => !liveIds.has(p.id));
          if (missingLocals.length > 0) {
            // Include missing locals at the top and write them to Firestore to self-heal
            setCatalogProducts([...missingLocals, ...liveProducts]);
            missingLocals.forEach((p) => saveLiveProduct(p).catch(console.error));
            return;
          }
        }
      } catch (err) {
        console.error('Error reconciling local published products:', err);
      }
      setCatalogProducts(liveProducts);
    });

    // 3. Subscribe to Live Registered Artisans
    const unsubArtisans = subscribeLiveArtisans((liveArtisans) => {
      setRegisteredArtisans(liveArtisans);
    });

    // 4. Subscribe to Live Proposals
    const unsubProposals = subscribeLiveProposals((liveProps) => {
      setProposals(liveProps);
    });

    // 5. Subscribe to Live Proposal Chats
    const unsubChats = subscribeLiveProposalChats((liveChats) => {
      setProposalChats(liveChats);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubArtisans();
      unsubProposals();
      unsubChats();
    };
  }, []);

  // Lock body scroll whenever any drawer or modal is open to prevent background scrolling on mobile
  const isAnyModalActive =
    isCartOpen ||
    isCheckoutOpen ||
    isWishlistOpen ||
    isAuthOpen ||
    isProfileOpen ||
    isOrdersModalOpen ||
    pendingPaymentOrder !== null ||
    selectedProduct !== null;

  useEffect(() => {
    if (isAnyModalActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isAnyModalActive]);

  // Handle mobile browser and Android back button to close active modal instead of leaving website
  const isHandlingPopState = useRef(false);

  useEffect(() => {
    if (!isAnyModalActive) return;

    // Push dummy history entry so back button emits popstate instead of exiting site
    window.history.pushState({ modalActive: true }, '');

    const handlePopState = () => {
      isHandlingPopState.current = true;
      setIsCheckoutOpen(false);
      setPendingPaymentOrders(null);
      setIsCartOpen(false);
      setIsWishlistOpen(false);
      setIsAuthOpen(false);
      setIsProfileOpen(false);
      setIsOrdersModalOpen(false);
      setSelectedProduct(null);
      setTimeout(() => {
        isHandlingPopState.current = false;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If modal was closed by UI button (not popstate), pop the history entry to keep history clean
      if (!isHandlingPopState.current && window.history.state?.modalActive) {
        window.history.back();
      }
    };
  }, [isAnyModalActive]);

  // Sync Customer with LocalStorage
  useEffect(() => {
    try {
      if (customer) {
        localStorage.setItem('kala_kriya_active_customer', JSON.stringify(customer));
      } else {
        localStorage.removeItem('kala_kriya_active_customer');
      }
    } catch (e) {
      console.error(e);
    }
  }, [customer]);

  // Sync Orders with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kala_kriya_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Sync Chat Messages with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kala_kriya_chats', JSON.stringify(chatMessages));
    } catch (e) {
      console.error(e);
    }
  }, [chatMessages]);

  // Sync Cart with LocalStorage (only when customer is logged in)
  useEffect(() => {
    try {
      if (customer) {
        localStorage.setItem('kala_kriya_cart', JSON.stringify(cartItems));
        localStorage.setItem(`kala_kriya_cart_${customer.id}`, JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('kala_kriya_cart');
      }
    } catch (e) {
      console.error(e);
    }
  }, [cartItems, customer]);

  // Sync Wishlist with LocalStorage (only when customer is logged in)
  useEffect(() => {
    try {
      if (customer) {
        localStorage.setItem('kala_kriya_wishlist', JSON.stringify(wishlistIds));
        localStorage.setItem(`kala_kriya_wishlist_${customer.id}`, JSON.stringify(wishlistIds));
      } else {
        localStorage.removeItem('kala_kriya_wishlist');
      }
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds, customer]);

  // Enforce empty cart & wishlist when customer is not logged in
  useEffect(() => {
    if (!customer) {
      if (cartItems.length > 0) setCartItems([]);
      if (wishlistIds.length > 0) setWishlistIds([]);
      try {
        localStorage.removeItem('kala_kriya_cart');
        localStorage.removeItem('kala_kriya_wishlist');
      } catch (e) {
        console.error(e);
      }
    }
  }, [customer]);

  // Sync Registered Artisans with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kala_kriya_registered_artisans', JSON.stringify(registeredArtisans));
    } catch (e) {
      console.error(e);
    }
  }, [registeredArtisans]);

  // Sync Artisan with LocalStorage
  useEffect(() => {
    try {
      if (artisan) {
        localStorage.setItem('kala_kriya_active_artisan_v5', JSON.stringify(artisan));
      } else {
        localStorage.removeItem('kala_kriya_active_artisan_v5');
        localStorage.removeItem('kala_kriya_active_artisan_v2');
        localStorage.removeItem('kala_kriya_active_artisan');
      }
    } catch (e) {
      console.error(e);
    }
  }, [artisan]);

  // Sync Proposals with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kala_kriya_proposals', JSON.stringify(proposals));
    } catch (e) {
      console.error(e);
    }
  }, [proposals]);

  // Sync Proposal Chats with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kala_kriya_proposal_chats', JSON.stringify(proposalChats));
    } catch (e) {
      console.error(e);
    }
  }, [proposalChats]);

  // Sync Payouts with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kala_kriya_payouts', JSON.stringify(payouts));
    } catch (e) {
      console.error(e);
    }
  }, [payouts]);

  // Google Maps Quota Exceeded Event Listener
  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  const showToast = (text: string, icon: 'check' | 'heart' = 'check') => {
    setToastMessage({ text, icon });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (!customer) {
      showToast('Silakan masuk atau daftar akun terlebih dahulu untuk belanja', 'check');
      setIsAuthOpen(true);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });

    showToast(`${product.name} dimasukkan ke keranjang`, 'check');
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    if (!customer) {
      showToast('Silakan masuk atau daftar akun terlebih dahulu untuk belanja', 'check');
      setIsAuthOpen(true);
      return;
    }

    handleAddToCart(product, quantity);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Barang dihapus dari keranjang');
  };

  const handleToggleWishlist = (productId: string) => {
    if (!customer) {
      showToast('Silakan masuk atau daftar akun untuk menyimpan karya favorit', 'heart');
      setIsAuthOpen(true);
      return;
    }

    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Dihapus dari daftar favorit', 'heart');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Disimpan ke daftar favorit', 'heart');
        return [...prev, productId];
      }
    });
  };

  const handleApplyPromo = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'KRIYAHANGAT') {
      setAppliedPromo('KRIYAHANGAT');
      return { success: true, message: 'Kode promo berhasil digunakan! Diskon 10% aktif.' };
    }
    return { success: false, message: 'Kode promo tidak valid. Gunakan: KRIYAHANGAT' };
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Called when customer confirms checkout: directly opens payment instructions
  const handleProceedToPayment = (orders: OrderDetails[] | OrderDetails) => {
    const list = Array.isArray(orders) ? orders : [orders];
    setIsCheckoutOpen(false);
    setPendingPaymentOrders(list);
  };

  const handleLoginSuccess = (loggedInCustomer: Customer) => {
    setCustomer(loggedInCustomer);

    const isHadian = loggedInCustomer.email.toLowerCase() === 'hadian02@gmail.com';

    // Restore customer's saved personal cart & wishlist if they had any
    try {
      const userCartKey = `kala_kriya_cart_${loggedInCustomer.id}`;
      const savedCart = localStorage.getItem(userCartKey);
      if (savedCart && JSON.parse(savedCart).length > 0) {
        const sanitized = savedCart.replaceAll('/src/assets/images/', '/assets/images/');
        setCartItems(JSON.parse(sanitized));
      } else if (isHadian) {
        const defaultCart = [{ product: PRODUCTS[0], quantity: 1 }];
        setCartItems(defaultCart);
        localStorage.setItem(userCartKey, JSON.stringify(defaultCart));
      }

      const userWishlistKey = `kala_kriya_wishlist_${loggedInCustomer.id}`;
      const savedWishlist = localStorage.getItem(userWishlistKey);
      if (savedWishlist && JSON.parse(savedWishlist).length > 0) {
        setWishlistIds(JSON.parse(savedWishlist));
      } else if (isHadian) {
        const defaultWishlist = ['kriya-01', 'kriya-06'];
        setWishlistIds(defaultWishlist);
        localStorage.setItem(userWishlistKey, JSON.stringify(defaultWishlist));
      }

      // Ensure orders has order KK-1110 for hadian02 on PC/Mobile
      if (isHadian) {
        setOrders((prev) => {
          const hasKK1110 = prev.some((o) => o.orderId === 'KK-1110');
          if (hasKK1110) return prev;
          const merged = [...INITIAL_ORDERS, ...prev];
          try {
            localStorage.setItem('kala_kriya_orders', JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
      }
    } catch (e) {
      console.error(e);
    }

    showToast(`Selamat datang, ${loggedInCustomer.name}!`, 'check');
  };

  const handleLogout = () => {
    // Save current items to customer's personal profile storage before clearing
    if (customer) {
      try {
        localStorage.setItem(`kala_kriya_cart_${customer.id}`, JSON.stringify(cartItems));
        localStorage.setItem(`kala_kriya_wishlist_${customer.id}`, JSON.stringify(wishlistIds));
      } catch (e) {
        console.error(e);
      }
    }

    setCustomer(null);
    setCartItems([]);
    setWishlistIds([]);
    setGiftWrapping(false);
    setAppliedPromo('');

    // Close any open customer drawers and modals
    setIsProfileOpen(false);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsCheckoutOpen(false);
    setIsOrdersModalOpen(false);

    try {
      localStorage.removeItem('kala_kriya_active_customer');
      localStorage.removeItem('kala_kriya_cart');
      localStorage.removeItem('kala_kriya_wishlist');
    } catch (e) {
      console.error(e);
    }

    showToast('Berhasil keluar dari akun. Keranjang dan favorit telah dikosongkan.', 'check');
  };

  const handleLogoutArtisan = () => {
    try {
      localStorage.removeItem('kala_kriya_active_artisan');
      localStorage.removeItem('kala_kriya_active_artisan_v2');
      localStorage.removeItem('kala_kriya_active_artisan_v3');
      localStorage.removeItem('kala_kriya_active_artisan_v4');
      localStorage.removeItem('kala_kriya_active_artisan_v5');
      sessionStorage.removeItem('kala_kriya_active_artisan');
      sessionStorage.removeItem('kala_kriya_active_artisan_v2');
      sessionStorage.removeItem('kala_kriya_active_artisan_v5');
    } catch (e) {
      console.error(e);
    }
    setArtisan(null);
    showToast('Berhasil keluar dari akun pengrajin.', 'check');
  };

  // Chat message handlers
  const handleCustomerSendMessage = (text: string, orderId?: string) => {
    if (!customer) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      senderName: customer.name,
      customerId: customer.id,
      customerEmail: customer.email,
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      orderId,
      read: false,
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Simulated responsive studio answer
    setTimeout(() => {
      let reply = 'Terima kasih atas pesan Anda! Tim studio dekorasiku sedang meninjau dan akan segera membantu.';
      if (text.toLowerCase().includes('microwave')) {
        reply = 'Seluruh keramik kami aman digunakan dalam microwave dan dishwasher karena melalui proses pembakaran tungku suhu tinggi 1250°C.';
      } else if (text.toLowerCase().includes('kirim') || text.toLowerCase().includes('resi')) {
        reply = 'Pesanan Anda disiapkan dengan kemasan pelindung ekstra dan biasanya diserahkan ke ekspedisi dalam 1-2 hari kerja.';
      } else if (text.toLowerCase().includes('kartu') || text.toLowerCase().includes('kado')) {
        reply = 'Tentu! Kami menyediakan opsi kemasan kado alami berbahan kertas samson dan kartu ucapan bertulis tangan rapi.';
      }

      const autoReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'admin',
        senderName: 'Atelier dekorasiku',
        customerId: customer.id,
        customerEmail: customer.email,
        text: reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        orderId,
        read: false,
      };
      setChatMessages((prev) => [...prev, autoReply]);
    }, 1400);
  };

  const handleAdminSendMessage = (customerId: string, customerEmail: string, text: string) => {
    const adminMsg: ChatMessage = {
      id: `msg-admin-${Date.now()}`,
      sender: 'admin',
      senderName: 'Atelier dekorasiku',
      customerId,
      customerEmail,
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    // Mark previous customer messages as read
    setChatMessages((prev) =>
      prev
        .map((m) => (m.customerId === customerId ? { ...m, read: true } : m))
        .concat(adminMsg)
    );
    showToast('Balasan admin berhasil dikirim!', 'check');
  };

  // Admin order & payment management
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderDetails['orderStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    updateLiveOrder(orderId, { orderStatus: newStatus }).catch(console.error);
    showToast(`Status pesanan #${orderId} diubah menjadi: ${newStatus}`, 'check');
  };

  const handleVerifyPayment = (orderIdOrIds: string | string[], mode: 'otomatis' | 'manual') => {
    const time = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const targetIds = Array.isArray(orderIdOrIds) ? orderIdOrIds : [orderIdOrIds];

    // Check if this payment is for newly placed pending orders from checkout
    if (pendingPaymentOrders && pendingPaymentOrders.length > 0) {
      const matchFound = pendingPaymentOrders.some((o) => targetIds.includes(o.orderId));
      if (matchFound) {
        const verifiedText = `${time} (${mode === 'otomatis' ? 'QRIS Webhook Gateway' : 'Verifikasi Bank / COD'})`;

        const paidOrders: OrderDetails[] = pendingPaymentOrders.map((pOrder) => ({
          ...pOrder,
          paymentStatus: mode === 'otomatis' ? 'terverifikasi_otomatis' : 'terverifikasi_manual',
          orderStatus: 'menunggu_konfirmasi',
          verifiedAt: verifiedText,
        }));

        // Add all split orders to list of orders
        setOrders((prev) => [...paidOrders, ...prev]);

        // Push each to Live Firestore immediately
        paidOrders.forEach((paidOrder) => {
          createLiveOrder(paidOrder).catch((err) => console.error('Failed to create live order in Firestore:', err));

          // Synchronize stock deduction in live database
          paidOrder.items.forEach((item) => {
            const matched = catalogProducts.find((p) => p.id === item.product.id);
            if (matched) {
              const newStock = Math.max(0, matched.stock - item.quantity);
              updateLiveProductStock(item.product.id, newStock).catch(console.error);
            }
          });
        });

        setCartItems([]);
        setGiftWrapping(false);
        setAppliedPromo('');

        if (customer) {
          try {
            localStorage.removeItem(`kala_kriya_cart_${customer.id}`);
          } catch (e) {
            console.error(e);
          }
        }

        const totalOrdersCount = paidOrders.length;
        setPendingPaymentOrders(null);
        showToast(
          totalOrdersCount > 1
            ? `Pembayaran terpadu lunas! Dibuat ${totalOrdersCount} pesanan terpisah untuk masing-masing pengrajin.`
            : mode === 'otomatis'
            ? `Pembayaran QRIS #${paidOrders[0].orderId} lunas! Pesanan masuk menunggu konfirmasi pengrajin.`
            : `Pesanan #${paidOrders[0].orderId} lunas & menunggu konfirmasi pengrajin!`,
          'check'
        );
        setIsOrdersModalOpen(true);
        return;
      }
    }

    // Otherwise update existing orders in orders list
    const updatedStatus = 'menunggu_konfirmasi';
    const updatedPaymentStatus = mode === 'otomatis' ? 'terverifikasi_otomatis' : 'terverifikasi_manual';
    const verifiedText = `${time} (${mode === 'otomatis' ? 'QRIS Webhook Gateway' : 'Verifikasi Manual Admin'})`;

    setOrders((prev) =>
      prev.map((o) =>
        targetIds.includes(o.orderId)
          ? {
              ...o,
              paymentStatus: updatedPaymentStatus,
              orderStatus: o.orderStatus === 'menunggu_pembayaran' ? updatedStatus : o.orderStatus,
              verifiedAt: verifiedText,
            }
          : o
      )
    );

    targetIds.forEach((orderId) => {
      updateLiveOrder(orderId, {
        paymentStatus: updatedPaymentStatus,
        orderStatus: updatedStatus,
        verifiedAt: verifiedText,
      }).catch(console.error);
    });

    showToast(
      mode === 'otomatis'
        ? `Pembayaran QRIS lunas & menunggu konfirmasi pengrajin!`
        : `Pembayaran terverifikasi & menunggu konfirmasi pengrajin.`,
      'check'
    );
  };

  // Pengrajin / Admin mengonfirmasi pesanan kriya -> status berubah menjadi 'diproses' dan tenggat 1x24 jam dimulai
  const handleArtisanConfirmOrder = (orderId: string) => {
    const now = new Date();
    const confirmedTime = now.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const deadlineDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const deadlineTime = deadlineDate.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              orderStatus: 'diproses',
              confirmedByArtisanAt: confirmedTime,
              confirmedByArtisanIso: now.toISOString(),
              shipmentDeadline: deadlineTime,
              shipmentDeadlineIso: deadlineDate.toISOString(),
            }
          : o
      )
    );

    updateLiveOrder(orderId, {
      orderStatus: 'diproses',
      confirmedByArtisanAt: confirmedTime,
      confirmedByArtisanIso: now.toISOString(),
      shipmentDeadline: deadlineTime,
      shipmentDeadlineIso: deadlineDate.toISOString(),
    }).catch(console.error);

    showToast(`Pesanan #${orderId} telah dikonfirmasi pengrajin. Batas pengiriman 1x24 jam dimulai!`, 'check');
  };

  // Pengrajin / Admin melakukan pengiriman dan menginput nomor resi
  const handleShipOrder = (orderId: string, trackingNumber: string, courierName: string) => {
    const shippedTime = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              orderStatus: 'dikirim',
              shippingTrackingNumber: trackingNumber,
              shippingCourier: courierName,
              shippedAt: shippedTime,
            }
          : o
      )
    );

    updateLiveOrder(orderId, {
      orderStatus: 'dikirim',
      shippingTrackingNumber: trackingNumber,
      shippingCourier: courierName,
      shippedAt: shippedTime,
    }).catch(console.error);

    showToast(`Pesanan #${orderId} telah dikirim via ${courierName} (No. Resi: ${trackingNumber})`, 'check');
  };

  // Customer can cancel order before it is processed by artisan ("Sebelum diproses user masih dapat membatalkan pesanan")
  const handleCancelOrder = (orderIdOrIds: string | string[]) => {
    const targetIds = Array.isArray(orderIdOrIds) ? orderIdOrIds : [orderIdOrIds];
    const cancelTime = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (pendingPaymentOrders && pendingPaymentOrders.some((o) => targetIds.includes(o.orderId))) {
      setPendingPaymentOrders(null);
      showToast('Pesanan yang belum dibayar berhasil dibatalkan.', 'check');
      return;
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (!targetIds.includes(o.orderId)) return o;
        const wasAlreadyPaid =
          o.paymentStatus === 'terverifikasi_otomatis' ||
          o.paymentStatus === 'terverifikasi_manual' ||
          o.orderStatus === 'menunggu_konfirmasi';
        return {
          ...o,
          orderStatus: 'dibatalkan',
          paymentStatus: 'batal',
          refundStatus: wasAlreadyPaid ? 'proses_refund' : 'none',
          cancelledAt: cancelTime,
          cancellationReason: 'Dibatalkan oleh pelanggan sebelum diproses pengrajin',
        };
      })
    );

    targetIds.forEach((orderId) => {
      updateLiveOrder(orderId, {
        orderStatus: 'dibatalkan',
        paymentStatus: 'batal',
        cancelledAt: cancelTime,
      }).catch(console.error);
    });

    showToast('Pesanan berhasil dibatalkan.', 'check');
  };


  // Customer confirms order receipt -> triggers Escrow payout release to Artisan
  const handleConfirmOrderReceipt = (orderId: string) => {
    const formattedDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              customerConfirmedReceipt: true,
              customerConfirmedAt: formattedDate,
              orderStatus: 'selesai',
            }
          : o
      )
    );

    updateLiveOrder(orderId, {
      customerConfirmedReceipt: true,
      customerConfirmedAt: formattedDate,
      orderStatus: 'selesai',
    }).catch(console.error);

    // Release escrow payout to artisan
    setPayouts((prev) =>
      prev.map((pay) =>
        pay.orderId === orderId && pay.status === 'tertahan_menunggu_terima'
          ? {
              ...pay,
              status: 'siap_dicairkan',
              customerReceivedAt: formattedDate,
            }
          : pay
      )
    );

    showToast(
      'Kriya dikonfirmasi diterima! Dana penjualan diteruskan ke saldo siap cair pengrajin mitra.',
      'check'
    );
  };

  // Artisan Registration & Approval Handlers
  const handleRegisterArtisan = (newArtisanData: Artisan) => {
    setRegisteredArtisans((prev) => [newArtisanData, ...prev]);
    setArtisan(newArtisanData);
    saveLiveArtisan(newArtisanData).catch(console.error);
    showToast('Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi kunjungan dan approval admin.', 'check');
  };

  const handleApproveArtisan = (artisanId: string) => {
    const formattedDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    setRegisteredArtisans((prev) =>
      prev.map((a) =>
        a.id === artisanId
          ? {
              ...a,
              approvalStatus: 'disetujui',
              approvedAt: formattedDate,
              verificationNotes: 'Kunjungan workshop selesai dan disetujui oleh admin studio.',
            }
          : a
      )
    );

    const target = registeredArtisans.find((a) => a.id === artisanId);
    if (target) {
      saveLiveArtisan({
        ...target,
        approvalStatus: 'disetujui',
        approvedAt: formattedDate,
        verificationNotes: 'Kunjungan workshop selesai dan disetujui oleh admin studio.',
      }).catch(console.error);
    }

    // If currently active artisan is the one being approved, update their session too
    setArtisan((current) => {
      if (current && current.id === artisanId) {
        return {
          ...current,
          approvalStatus: 'disetujui',
          approvedAt: formattedDate,
          verificationNotes: 'Kunjungan workshop selesai dan disetujui oleh admin studio.',
        };
      }
      return current;
    });

    showToast(
      `Akun mitra "${target?.name || 'Pengrajin'}" berhasil DISETUJUI! Pengrajin kini dapat menawarkan kriya.`,
      'check'
    );
  };

  const handleRejectArtisan = (artisanId: string) => {
    setRegisteredArtisans((prev) =>
      prev.map((a) =>
        a.id === artisanId
          ? {
              ...a,
              approvalStatus: 'ditolak',
              verificationNotes: 'Pendaftaran belum memenuhi kriteria mutu kurasi studio.',
            }
          : a
      )
    );

    const target = registeredArtisans.find((a) => a.id === artisanId);
    if (target) {
      saveLiveArtisan({
        ...target,
        approvalStatus: 'ditolak',
        verificationNotes: 'Pendaftaran belum memenuhi kriteria mutu kurasi studio.',
      }).catch(console.error);
    }

    setArtisan((current) => {
      if (current && current.id === artisanId) {
        return {
          ...current,
          approvalStatus: 'ditolak',
          verificationNotes: 'Pendaftaran belum memenuhi kriteria mutu kurasi studio.',
        };
      }
      return current;
    });
    showToast('Status pendaftaran pengrajin telah diperbarui menjadi ditolak.', 'check');
  };

  // Artisan Proposals & Chat Handlers
  const handleCreateProposal = (data: {
    title: string;
    category: ArtisanProposal['category'];
    categoryLabel: string;
    initialDescription: string;
    proposedPrice: number;
    sampleImage: string;
    sampleImages?: string[];
  }) => {
    const newProposalId = `prop-${Date.now()}`;
    const imagesList = data.sampleImages && data.sampleImages.length > 0 ? data.sampleImages : [data.sampleImage];
    const newProposal: ArtisanProposal = {
      id: newProposalId,
      artisanId: artisan?.id || 'artisan-wayan',
      artisanName: artisan?.name || 'Wayan Sujana',
      workshopName: artisan?.workshopName || 'Studio Tembikar Kasongan',
      title: data.title,
      category: data.category,
      categoryLabel: data.categoryLabel,
      initialDescription: data.initialDescription,
      proposedPrice: data.proposedPrice,
      sampleImage: imagesList[0],
      sampleImages: imagesList,
      status: 'dalam_negosiasi',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProposals((prev) => [newProposal, ...prev]);
    saveLiveProposal(newProposal).catch(console.error);

    // Add opening welcome chat from curator
    const introMsg: ArtisanProposalChat = {
      id: `chat-${Date.now()}`,
      proposalId: newProposalId,
      sender: 'admin',
      senderName: 'Kurator dekorasiku',
      text: `Halo ${artisan?.name || 'Bapak/Ibu Pengrajin'}! Terima kasih telah mengajukan usulan karya "${data.title}". Tim kurasi studio kami sangat tertarik dan sedang memeriksa usulan harga ${formatIDR(data.proposedPrice)}. Mari diskusikan detailnya di sini sebelum disetujui.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setProposalChats((prev) => [...prev, introMsg]);
    saveLiveProposalChat(introMsg).catch(console.error);
    showToast('Penawaran kriya berhasil diajukan ke kurator studio!', 'check');
  };

  const handleApproveProposal = (proposalId: string) => {
    const updatedApprovedAt = new Date().toISOString().split('T')[0];
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: 'disetujui',
              approvedAt: updatedApprovedAt,
            }
          : p
      )
    );

    const target = proposals.find((p) => p.id === proposalId);
    if (target) {
      saveLiveProposal({
        ...target,
        status: 'disetujui',
        approvedAt: updatedApprovedAt,
      }).catch(console.error);
    }

    // Post approval confirmation message in chat
    const approvalChat: ArtisanProposalChat = {
      id: `chat-approve-${Date.now()}`,
      proposalId,
      sender: 'admin',
      senderName: 'Atelier dekorasiku (Admin)',
      text: 'Selamat! Penawaran kriya ini telah DISETUJUI (APPROVED) oleh tim kurator. Kesepakatan harga dan spesifikasi telah tercapai. Silakan klik tombol "Input Rincian & Terbitkan" di dashboard pengrajin Anda untuk menginput foto resmi, stok, dan opsi pengiriman agar langsung tayang di katalog toko!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setProposalChats((prev) => [...prev, approvalChat]);
    saveLiveProposalChat(approvalChat).catch(console.error);
    showToast('Usulan kriya disetujui! Pengrajin kini dapat menginput rincian kriya.', 'check');
  };

  const handleAdminSendProposalChat = (proposalId: string, text: string) => {
    const newChat: ArtisanProposalChat = {
      id: `chat-admin-${Date.now()}`,
      proposalId,
      sender: 'admin',
      senderName: 'Atelier dekorasiku (Admin)',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setProposalChats((prev) => [...prev, newChat]);
    saveLiveProposalChat(newChat).catch(console.error);
    showToast('Pesan terkirim ke pengrajin mitra.', 'check');
  };

  const handleArtisanSendProposalChat = (proposalId: string, text: string) => {
    const newChat: ArtisanProposalChat = {
      id: `chat-artisan-${Date.now()}`,
      proposalId,
      sender: 'artisan',
      senderName: artisan?.name || 'Pengrajin',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setProposalChats((prev) => [...prev, newChat]);
    saveLiveProposalChat(newChat).catch(console.error);

    // Simulated curator response
    setTimeout(() => {
      let curatorResponse = 'Catatan diterima, kami sesuaikan kurasi dan spesifikasi kriya Anda.';
      if (text.toLowerCase().includes('harga') || text.toLowerCase().includes('ongkos')) {
        curatorResponse = 'Terkait penyesuaian harga, kami sepakat dengan usulan Anda karena memperhatikan tingkat kerumitan pengerjaan kriya.';
      } else if (text.toLowerCase().includes('stok') || text.toLowerCase().includes('bikin')) {
        curatorResponse = 'Baik, kapasitas batch produksi tersebut sangat ideal untuk kriya buatan tangan agar mutu tetap terjaga.';
      } else if (text.toLowerCase().includes('foto') || text.toLowerCase().includes('gambar')) {
        curatorResponse = 'Foto yang ditampilkan sudah sangat estetik dan menampilkan tekstur alami kriya dengan jelas.';
      }

      const curatorChat: ArtisanProposalChat = {
        id: `chat-reply-${Date.now()}`,
        proposalId,
        sender: 'admin',
        senderName: 'Kurator dekorasiku',
        text: curatorResponse,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setProposalChats((prev) => [...prev, curatorChat]);
      saveLiveProposalChat(curatorChat).catch(console.error);
    }, 1200);
  };

  const handlePublishCraftDetails = (
    proposalId: string,
    details: {
      officialName: string;
      finalPrice: number;
      stock: number;
      images: string[];
      materials: string[];
      dimensions: string;
      careGuide: string;
      shippingOptions: string[];
    }
  ) => {
    const targetProp = proposals.find((p) => p.id === proposalId);
    if (!targetProp) return;

    const newProductId = `kriya-pub-${Date.now()}`;

    // Update proposal status to published
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: 'tayang_di_toko',
              finalDetails: details,
              publishedProductId: newProductId,
            }
          : p
      )
    );

    saveLiveProposal({
      ...targetProp,
      status: 'tayang_di_toko',
      finalDetails: details,
      publishedProductId: newProductId,
    }).catch(console.error);

    // Generate 10-digit hexadecimal product code
    const artisanSeq = artisan?.seqNumber || 1;
    const materialHex = getMaterialHex(targetProp.category, details.materials);
    const existingArtisanCount = catalogProducts.filter(
      (p) => p.artisan.name === (artisan?.name || targetProp.artisanName)
    ).length;
    const itemSeq = existingArtisanCount + 1;
    const generatedCode = generateProductCode(artisanSeq, materialHex, itemSeq);

    // Build new Product to append to catalog
    const newProduct: Product = {
      id: newProductId,
      productCode: generatedCode,
      name: details.officialName,
      category: targetProp.category,
      categoryLabel: targetProp.categoryLabel,
      price: details.finalPrice,
      image: details.images[0] || targetProp.sampleImage,
      secondaryImages: details.images,
      artisan: {
        id: artisan?.id || 'artisan-wayan',
        seqNumber: artisanSeq,
        name: artisan?.name || targetProp.artisanName,
        workshopName: artisan?.workshopName || targetProp.workshopName || 'Studio Kriya Indonesia',
        location: artisan?.location || 'Kasongan, Bantul',
        bio: artisan?.bio || 'Pengrajin mitra resmi dekorasiku.',
      },
      description: targetProp.initialDescription,
      materials: details.materials,
      dimensions: details.dimensions,
      careGuide: details.careGuide,
      stock: details.stock,
      rating: 5.0,
      reviewCount: 1,
      tag: 'Karya Baru Pengrajin',
      shippingOptions: details.shippingOptions,
    };

    // Save to Firestore Live Collection
    saveLiveProduct(newProduct).catch((err) =>
      console.error('Failed to save newly published product to Firestore:', err)
    );

    // Save to LocalStorage for instant resilience on offline/refresh
    setCatalogProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== newProductId);
      const updated = [newProduct, ...filtered];
      try {
        const onlyCustom = updated.filter((p) => p.id.startsWith('kriya-pub-'));
        localStorage.setItem('kala_kriya_published_products', JSON.stringify(onlyCustom));
      } catch (e) {
        console.error('LocalStorage error saving published products:', e);
      }
      return updated;
    });

    showToast(
      `"${details.officialName}" berhasil diterbitkan (Kode: #${generatedCode}) & langsung aktif di toko!`,
      'check'
    );
  };

  // Jumlah stok dimaintain langsung oleh pengrajin. Jika stok 0, foto barang otomatis buram di etalase toko.
  const handleUpdateProductStock = (productId: string, newStock: number) => {
    const safeStock = Math.max(0, Math.floor(newStock));
    setCatalogProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: safeStock } : p))
    );

    try {
      const stockOverridesStr = localStorage.getItem('kala_kriya_stock_overrides');
      const stockOverrides: Record<string, number> = stockOverridesStr ? JSON.parse(stockOverridesStr) : {};
      stockOverrides[productId] = safeStock;
      localStorage.setItem('kala_kriya_stock_overrides', JSON.stringify(stockOverrides));
    } catch (e) {
      console.error(e);
    }

    // Persist live stock in Firestore so buyers on other devices see updated stock immediately
    updateLiveProductStock(productId, safeStock).catch(console.error);

    const target = catalogProducts.find((p) => p.id === productId);
    if (safeStock === 0) {
      showToast(`Stok "${target?.name || 'Kriya'}" diatur menjadi 0. Foto di etalase otomatis diburamkan.`, 'check');
    } else {
      showToast(`Stok "${target?.name || 'Kriya'}" diperbarui menjadi ${safeStock} unit.`, 'check');
    }
  };

  const handleProcessPayout = (payoutId: string) => {
    const formattedTime = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'dicairkan_ke_rekening',
              paidOutAt: formattedTime,
            }
          : p
      )
    );

    showToast('Dana berhasil ditransfer ke rekening bank pengrajin mitra!', 'check');
  };

  const wishlistProducts = catalogProducts.filter((p) => wishlistIds.includes(p.id));
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // If in Artisan Portal mode, render Artisan Portal
  if (viewMode === 'artisan') {
    return (
      <ArtisanPortal
        artisan={artisan}
        registeredArtisans={registeredArtisans}
        proposals={proposals}
        proposalChats={proposalChats}
        payouts={payouts}
        onBackToStore={
          isSubdomainArtisan
            ? () => {
                if (typeof window !== 'undefined' && (window.location.hostname.startsWith('mitra.') || window.location.hostname.startsWith('pengrajin.'))) {
                  window.location.href = window.location.origin.replace(/\/\/(mitra|pengrajin)\./, '//');
                } else {
                  setViewMode('store');
                }
              }
            : () => setViewMode('store')
        }
        isSubdomain={isSubdomainArtisan}
        onLoginArtisan={(loggedArtisan) => {
          setArtisan(loggedArtisan);
          if (loggedArtisan.approvalStatus === 'disetujui') {
            showToast(`Selamat datang di ruang kerja kriya, ${loggedArtisan.name}!`, 'check');
          } else {
            showToast(`Masuk sebagai ${loggedArtisan.name} (Status: Menunggu Verifikasi & Kunjungan Tim Admin).`, 'check');
          }
        }}
        onLogoutArtisan={handleLogoutArtisan}
        onRegisterArtisan={handleRegisterArtisan}
        onCreateProposal={handleCreateProposal}
        orders={orders}
        onConfirmOrderArtisan={handleArtisanConfirmOrder}
        onShipOrder={handleShipOrder}
        onSendProposalChat={handleArtisanSendProposalChat}
        onPublishCraftDetails={handlePublishCraftDetails}
        onRequestPayout={handleProcessPayout}
        catalogProducts={catalogProducts}
        onUpdateProductStock={handleUpdateProductStock}
        onGoToAdmin={() => setViewMode('admin')}
      />
    );
  }

  // If in Admin mode, render AdminAuthGate (if not authenticated) or AdminDashboard
  if (viewMode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminAuthGate
          onAuthenticated={() => {
            setIsAdminAuthenticated(true);
            showToast('Berhasil masuk ke Panel Admin.', 'check');
          }}
          onBackToStore={
            isSubdomainAdmin
              ? () => {
                  if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) {
                    window.location.href = window.location.origin.replace('//admin.', '//');
                  } else {
                    setViewMode('store');
                  }
                }
              : () => setViewMode('store')
          }
          isSubdomain={isSubdomainAdmin}
        />
      );
    }

    return (
      <AdminDashboard
        orders={orders}
        chatMessages={chatMessages}
        proposals={proposals}
        proposalChats={proposalChats}
        payouts={payouts}
        artisans={registeredArtisans}
        products={catalogProducts}
        onBackToStore={
          isSubdomainAdmin
            ? () => {
                if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) {
                  window.location.href = window.location.origin.replace('//admin.', '//');
                } else {
                  setViewMode('store');
                }
              }
            : () => setViewMode('store')
        }
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onConfirmOrderArtisan={handleArtisanConfirmOrder}
        onShipOrder={handleShipOrder}
        onVerifyPayment={handleVerifyPayment}
        onAdminSendMessage={handleAdminSendMessage}
        onApproveProposal={handleApproveProposal}
        onAdminSendProposalChat={handleAdminSendProposalChat}
        onProcessPayout={handleProcessPayout}
        onApproveArtisan={handleApproveArtisan}
        onRejectArtisan={handleRejectArtisan}
        onAdminLogout={() => {
          sessionStorage.removeItem('kala_kriya_admin_auth');
          setIsAdminAuthenticated(false);
          showToast('Sesi administrator telah dikunci.', 'check');
        }}
      />
    );
  }

  // Otherwise, render the Storefront
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] font-sans flex flex-col selection:bg-[#DECBB7] selection:text-[#2C221E] w-full max-w-full overflow-x-clip">
      {/* Google Maps Quota Warning Banner (if triggered) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Banner Promotion & Live Cloud Sync Status */}
      <div className="bg-[#2C221E] text-[#FAF7F2] text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-full overflow-hidden leading-tight">
        <div className="flex items-center gap-1.5 bg-[#1F1714] px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-300 font-semibold tracking-wide">{t('live.cloud')}</span>
        </div>
        <span>{language === 'en' ? 'Use promo code' : 'Gunakan kode promo'}</span>
        <span className="font-mono bg-[#43352F] text-[#FAF7F2] px-1.5 py-0.5 rounded font-bold tracking-wide">
          KRIYAHANGAT
        </span>
        <span>
          {language === 'en'
            ? 'for 10% off · Free Shipping min. Rp 350k'
            : 'diskon 10% · Gratis Ongkir min. Rp 350rb'}
        </span>
      </div>

      {/* 3-Zone Navbar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        customerOrderCount={
          orders.filter(
            (o) =>
              customer &&
              ((o.customerEmail && o.customerEmail.toLowerCase() === customer.email.toLowerCase()) ||
                o.customerName.toLowerCase() === customer.name.toLowerCase())
          ).length
        }
        customer={customer}
        onOpenCart={() => {
          if (!customer) {
            showToast('Silakan masuk atau daftar akun terlebih dahulu untuk melihat keranjang', 'check');
            setIsAuthOpen(true);
          } else {
            setIsCartOpen(true);
          }
        }}
        onOpenWishlist={() => {
          if (!customer) {
            showToast('Silakan masuk atau daftar akun terlebih dahulu untuk melihat favorit', 'heart');
            setIsAuthOpen(true);
          } else {
            setIsWishlistOpen(true);
          }
        }}
        onOpenOrders={() => {
          if (!customer) {
            showToast('Silakan masuk untuk melihat riwayat pesanan Anda', 'check');
            setIsAuthOpen(true);
          } else {
            setIsOrdersModalOpen(true);
          }
        }}
        onOpenChat={() => {
          setChatTargetOrderId(undefined);
          setIsChatOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdmin={() => {
          if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && !window.location.hostname.startsWith('admin.')) {
            window.location.href = `https://admin.${window.location.host}`;
          } else {
            setViewMode('admin');
          }
        }}
        onOpenArtisanPortal={() => setViewMode('artisan')}
        artisan={artisan}
        onLogoutArtisan={handleLogoutArtisan}
        onLogoutCustomer={handleLogout}
        activeSection="koleksi"
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('koleksi');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onGalleryClick={() => {
            const el = document.getElementById('galeri');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Product Catalog with Categories, Filters, Search, and Quick Add */}
        <ProductCatalog
          products={catalogProducts}
          wishlistIds={wishlistIds}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onToggleWishlist={handleToggleWishlist}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* Aesthetic Lookbook & Photo Gallery Section */}
        <AestheticGallery
          products={catalogProducts}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
        />

        {/* Artisan Story, Slow Craft Philosophy & Ethical Production */}
        <StorySection onOpenArtisanPortal={() => setViewMode('artisan')} />
      </main>

      {/* Customer Chat Room Widget (Floats at bottom right) */}
      <CustomerChatWidget
        customer={customer}
        messages={chatMessages}
        orders={orders.filter(
          (o) =>
            customer &&
            ((o.customerEmail && o.customerEmail.toLowerCase() === customer.email.toLowerCase()) ||
              o.customerName.toLowerCase() === customer.name.toLowerCase())
        )}
        isOpenControlled={isChatOpen}
        initialOrderId={chatTargetOrderId}
        onToggleOpen={setIsChatOpen}
        onSendMessage={handleCustomerSendMessage}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Footer */}
      <Footer
        onOpenArtisanPortal={() => setViewMode('artisan')}
        onOpenAdmin={() => {
          if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') && !window.location.hostname.startsWith('admin.')) {
            window.location.href = `https://admin.${window.location.host}`;
          } else {
            setViewMode('admin');
          }
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        giftWrapping={giftWrapping}
        appliedPromo={appliedPromo}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onToggleGiftWrapping={() => setGiftWrapping(!giftWrapping)}
        onApplyPromo={handleApplyPromo}
        onProceedCheckout={handleProceedCheckout}
      />

      {/* Checkout & Order Confirmation Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cartItems}
        giftWrapping={giftWrapping}
        appliedPromo={appliedPromo}
        customer={customer}
        onClose={() => setIsCheckoutOpen(false)}
        onProceedToPayment={handleProceedToPayment}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Standalone Payment Instruction & Gateway Modal for new checkout */}
      {pendingPaymentOrders && pendingPaymentOrders.length > 0 && (
        <PaymentInstructionModal
          isOpen={pendingPaymentOrders.length > 0}
          order={pendingPaymentOrders[0]}
          ordersGroup={pendingPaymentOrders}
          onClose={() => {
            setPendingPaymentOrders(null);
            showToast('Pembayaran ditunda. Keranjang belanja Anda tetap aman tersimpan.', 'check');
          }}
          onVerifyPayment={handleVerifyPayment}
          onCancelOrder={handleCancelOrder}
          onOpenChatWithOrder={(orderId) => {
            setPendingPaymentOrders(null);
            setChatTargetOrderId(orderId);
            setIsChatOpen(true);
          }}
        />
      )}

      {/* Saved Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        wishlistProducts={wishlistProducts}
        onClose={() => setIsWishlistOpen(false)}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onRemoveFromWishlist={handleToggleWishlist}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Sign In & Log In Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        existingCustomer={customer}
        onOpenArtisanPortal={() => setViewMode('artisan')}
      />

      {/* Customer Profile & Address Management Modal */}
      <CustomerProfileModal
        isOpen={isProfileOpen}
        customer={customer}
        onClose={() => setIsProfileOpen(false)}
        onUpdateCustomer={(updated) => {
          setCustomer(updated);
          showToast('Alamat berhasil diperbarui!', 'check');
        }}
        onLogout={handleLogout}
      />

      {/* Customer Orders & Tracking Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersModalOpen}
        customer={customer}
        orders={orders}
        onClose={() => setIsOrdersModalOpen(false)}
        onOpenChatWithOrder={(orderId) => {
          setChatTargetOrderId(orderId);
          setIsChatOpen(true);
        }}
        onExploreProducts={() => {
          const el = document.getElementById('koleksi');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onConfirmReceipt={handleConfirmOrderReceipt}
        onVerifyPayment={handleVerifyPayment}
        onCancelOrder={handleCancelOrder}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsOrdersModalOpen(false);
        }}
      />

      {/* Warm Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#2C221E] text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-[#43352F] animate-fade-in">
          {toastMessage.icon === 'heart' ? (
            <Heart className="w-4 h-4 text-[#D99B26] fill-[#D99B26]" />
          ) : (
            <Check className="w-4 h-4 text-[#A5C9A1]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
