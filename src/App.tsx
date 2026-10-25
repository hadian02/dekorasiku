import React, { useState, useEffect } from 'react';
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
import {
  INITIAL_ORDERS,
  INITIAL_CHATS,
  INITIAL_ARTISAN,
  INITIAL_REGISTERED_ARTISANS,
  INITIAL_PROPOSALS,
  INITIAL_PROPOSAL_CHATS,
  INITIAL_PAYOUTS
} from './data/initialData';
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
import { CustomerChatWidget } from './components/CustomerChatWidget';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthGate } from './components/AdminAuthGate';
import { ArtisanPortal } from './components/ArtisanPortal';
import { Footer } from './components/Footer';
import { Check, Heart } from 'lucide-react';

// One-time cleanup of mock demo data for user testing (reset customers, artisans, orders, chats)
const FRESH_TEST_KEY = 'kala_kriya_test_reset_v3_clean';
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
  } catch {
    // ignore
  }
}

export default function App() {
  // Subdomain & Path Detection for Admin:
  // Detects admin.dekorasiku.vercel.app, admin.localhost, /admin path, or ?admin=true
  const isSubdomainAdmin = typeof window !== 'undefined' && (
    window.location.hostname.toLowerCase().startsWith('admin.') ||
    window.location.pathname.toLowerCase().startsWith('/admin') ||
    window.location.search.includes('admin=true')
  );

  // View mode: Storefront vs Admin Dashboard vs Artisan Portal
  const [viewMode, setViewMode] = useState<'store' | 'admin' | 'artisan'>(() => {
    return isSubdomainAdmin ? 'admin' : 'store';
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
      return saved ? JSON.parse(saved.replaceAll('/src/assets/images/', '/assets/images/')) : INITIAL_ORDERS;
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

  // Registered Artisans State (with LocalStorage persistence)
  const [registeredArtisans, setRegisteredArtisans] = useState<Artisan[]>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_registered_artisans');
      return saved ? JSON.parse(saved) : INITIAL_REGISTERED_ARTISANS;
    } catch {
      return INITIAL_REGISTERED_ARTISANS;
    }
  });

  // Artisan State with LocalStorage persistence
  const [artisan, setArtisan] = useState<Artisan | null>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_active_artisan');
      return saved ? JSON.parse(saved) : INITIAL_ARTISAN;
    } catch {
      return INITIAL_ARTISAN;
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

  // Dynamic Catalog Products (Base PRODUCTS + any published by artisan)
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_published_products');
      if (saved) {
        const sanitized = saved.replaceAll('/src/assets/images/', '/assets/images/');
        const extra: Product[] = JSON.parse(sanitized);
        return [...extra, ...PRODUCTS];
      }
      return PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  // LocalStorage cart & wishlist persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
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

  // Lock body scroll whenever any drawer or modal is open to prevent background scrolling on mobile
  const isAnyModalActive =
    isCartOpen ||
    isCheckoutOpen ||
    isWishlistOpen ||
    isAuthOpen ||
    isProfileOpen ||
    isOrdersModalOpen ||
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

  // Sync Cart with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kala_kriya_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Sync Wishlist with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kala_kriya_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

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
        localStorage.setItem('kala_kriya_active_artisan_v2', JSON.stringify(artisan));
      } else {
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

  // Called when customer creates an order
  const handleOrderSuccess = (newOrder: OrderDetails) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setGiftWrapping(false);
    setAppliedPromo('');
    showToast('Pesanan berhasil dibuat & masuk ke antrean studio!', 'check');
  };

  const handleLoginSuccess = (loggedInCustomer: Customer) => {
    setCustomer(loggedInCustomer);
    showToast(`Selamat datang, ${loggedInCustomer.name}!`, 'check');
  };

  const handleLogout = () => {
    setCustomer(null);
    setIsProfileOpen(false);
    showToast('Berhasil keluar dari akun.', 'check');
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
      let reply = 'Terima kasih atas pesan Anda! Tim pengrajin studio Kala Kriya sedang meninjau dan akan segera membantu.';
      if (text.toLowerCase().includes('microwave')) {
        reply = 'Seluruh keramik kami aman digunakan dalam microwave dan dishwasher karena melalui proses pembakaran tungku suhu tinggi 1250°C.';
      } else if (text.toLowerCase().includes('kirim') || text.toLowerCase().includes('resi')) {
        reply = 'Pesanan kriya Anda disiapkan dengan kemasan pelindung ekstra dan biasanya diserahkan ke ekspedisi dalam 1-2 hari kerja.';
      } else if (text.toLowerCase().includes('kartu') || text.toLowerCase().includes('kado')) {
        reply = 'Tentu! Kami menyediakan opsi kemasan kado alami berbahan kertas samson dan kartu ucapan bertulis tangan rapi.';
      }

      const autoReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'admin',
        senderName: 'Atelier Kala Kriya',
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
      senderName: 'Atelier Kala Kriya',
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
    showToast(`Status pesanan #${orderId} diubah menjadi: ${newStatus}`, 'check');
  };

  const handleVerifyPayment = (orderId: string, mode: 'otomatis' | 'manual') => {
    const time = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              paymentStatus: mode === 'otomatis' ? 'terverifikasi_otomatis' : 'terverifikasi_manual',
              orderStatus: o.orderStatus === 'menunggu_pembayaran' ? 'diproses' : o.orderStatus,
              verifiedAt: `${time} (${mode === 'otomatis' ? 'QRIS Webhook Gateway' : 'Verifikasi Manual Admin'})`,
            }
          : o
      )
    );

    showToast(
      mode === 'otomatis'
        ? `Pembayaran QRIS #${orderId} berhasil diverifikasi otomatis!`
        : `Pembayaran #${orderId} berhasil diverifikasi secara manual.`,
      'check'
    );
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

    const target = registeredArtisans.find((a) => a.id === artisanId);
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
  }) => {
    const newProposalId = `prop-${Date.now()}`;
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
      sampleImage: data.sampleImage,
      status: 'dalam_negosiasi',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProposals((prev) => [newProposal, ...prev]);

    // Add opening welcome chat from curator
    const introMsg: ArtisanProposalChat = {
      id: `chat-${Date.now()}`,
      proposalId: newProposalId,
      sender: 'admin',
      senderName: 'Kurator Kala Kriya',
      text: `Halo ${artisan?.name || 'Bapak/Ibu Pengrajin'}! Terima kasih telah mengajukan usulan karya "${data.title}". Tim kurasi studio kami sangat tertarik dan sedang memeriksa usulan harga ${formatIDR(data.proposedPrice)}. Mari diskusikan detailnya di sini sebelum disetujui.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setProposalChats((prev) => [...prev, introMsg]);
    showToast('Penawaran kriya berhasil diajukan ke kurator studio!', 'check');
  };

  const handleApproveProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: 'disetujui',
              approvedAt: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );

    // Post approval confirmation message in chat
    const approvalChat: ArtisanProposalChat = {
      id: `chat-approve-${Date.now()}`,
      proposalId,
      sender: 'admin',
      senderName: 'Atelier Kala Kriya (Admin)',
      text: 'Selamat! Penawaran kriya ini telah DISETUJUI (APPROVED) oleh tim kurator. Kesepakatan harga dan spesifikasi telah tercapai. Silakan klik tombol "Input Rincian & Terbitkan" di dashboard pengrajin Anda untuk menginput foto resmi, stok, dan opsi pengiriman agar langsung tayang di katalog toko!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setProposalChats((prev) => [...prev, approvalChat]);
    showToast('Usulan kriya disetujui! Pengrajin kini dapat menginput rincian kriya.', 'check');
  };

  const handleAdminSendProposalChat = (proposalId: string, text: string) => {
    const newChat: ArtisanProposalChat = {
      id: `chat-admin-${Date.now()}`,
      proposalId,
      sender: 'admin',
      senderName: 'Atelier Kala Kriya (Admin)',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setProposalChats((prev) => [...prev, newChat]);
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
        senderName: 'Kurator Kala Kriya',
        text: curatorResponse,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setProposalChats((prev) => [...prev, curatorChat]);
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

    // Build new Product to append to catalog
    const newProduct: Product = {
      id: newProductId,
      name: details.officialName,
      category: targetProp.category,
      categoryLabel: targetProp.categoryLabel,
      price: details.finalPrice,
      image: details.images[0] || targetProp.sampleImage,
      secondaryImages: details.images,
      artisan: {
        id: artisan?.id || 'artisan-wayan',
        name: artisan?.name || 'Wayan Sujana',
        location: artisan?.location || 'Kasongan, Bantul',
        bio: artisan?.bio || 'Pengrajin tembikar mitra resmi Studio Kala Kriya.',
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

    setCatalogProducts((prev) => {
      const updated = [newProduct, ...prev];
      try {
        const onlyCustom = updated.filter((p) => p.id.startsWith('kriya-pub-'));
        localStorage.setItem('kala_kriya_published_products', JSON.stringify(onlyCustom));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    showToast(
      `"${details.officialName}" berhasil diterbitkan & langsung aktif tayang di katalog kriya!`,
      'check'
    );
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
        onBackToStore={() => setViewMode('store')}
        onLoginArtisan={(loggedArtisan) => {
          setArtisan(loggedArtisan);
          if (loggedArtisan.approvalStatus === 'disetujui') {
            showToast(`Selamat datang di ruang kerja kriya, ${loggedArtisan.name}!`, 'check');
          } else {
            showToast(`Masuk sebagai ${loggedArtisan.name} (Status: Menunggu Verifikasi & Kunjungan Tim Admin).`, 'check');
          }
        }}
        onLogoutArtisan={() => {
          setArtisan(null);
          showToast('Berhasil keluar dari akun pengrajin.', 'check');
        }}
        onRegisterArtisan={handleRegisterArtisan}
        onCreateProposal={handleCreateProposal}
        onSendProposalChat={handleArtisanSendProposalChat}
        onPublishCraftDetails={handlePublishCraftDetails}
        onRequestPayout={handleProcessPayout}
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

      {/* Top Banner Promotion */}
      <div className="bg-[#2C221E] text-[#FAF7F2] text-[11px] sm:text-xs py-2 px-3 sm:px-4 text-center font-medium flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-full overflow-hidden leading-tight">
        <span>Gunakan kode promo</span>
        <span className="font-mono bg-[#43352F] text-[#FAF7F2] px-1.5 py-0.5 rounded font-bold tracking-wide">
          KRIYAHANGAT
        </span>
        <span>diskon 10% · Gratis Ongkir min. Rp 350rb</span>
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
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
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
        onLogoutArtisan={() => {
          setArtisan(null);
          showToast('Keluar dari sesi pengrajin. Silakan login atau daftar akun baru.', 'check');
        }}
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
        onOrderSuccess={handleOrderSuccess}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

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
