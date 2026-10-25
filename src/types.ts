export interface Product {
  id: string;
  name: string;
  category: 'keramik' | 'anyaman' | 'kayu' | 'tekstil' | 'aromaterapi';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImages?: string[];
  artisan: {
    id?: string;
    name: string;
    location: string;
    bio: string;
  };
  description: string;
  materials: string[];
  dimensions: string;
  careGuide: string;
  stock: number;
  rating: number;
  reviewCount: number;
  tag?: string;
  shippingOptions?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'semua' | 'meja-teh' | 'sudut-baca' | 'ruang-makan' | 'studio';
  categoryLabel: string;
  image: string;
  aspectRatio: string;
  caption: string;
  stylingTip: string;
  likes: number;
  relatedProductIds: string[];
}

export interface ShippingAddress {
  id: string;
  label: string;
  recipientName: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: ShippingAddress[];
  createdAt: string;
}

export interface OrderDetails {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  city: string;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: 'menunggu_pembayaran' | 'terverifikasi_otomatis' | 'terverifikasi_manual' | 'batal';
  orderStatus: 'menunggu_pembayaran' | 'diproses' | 'dikirim' | 'selesai';
  paymentReference?: string;
  verifiedAt?: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  giftWrapping: boolean;
  total: number;
  coordinates?: { lat: number; lng: number };
  customerConfirmedReceipt?: boolean;
  customerConfirmedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  customerId: string;
  customerEmail: string;
  text: string;
  timestamp: string;
  orderId?: string;
  read: boolean;
}

// Artisan Types
export interface Artisan {
  id: string;
  name: string;
  workshopName?: string;
  workshopAddress: string;
  productTypes: string;
  preferredVisitSchedule: string;
  specialty: string;
  location: string;
  email: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  approvalStatus: 'menunggu_verifikasi' | 'disetujui' | 'ditolak';
  approvedAt?: string;
  verificationNotes?: string;
}

export interface ArtisanProposal {
  id: string;
  artisanId: string;
  artisanName: string;
  workshopName: string;
  title: string;
  category: 'keramik' | 'anyaman' | 'kayu' | 'tekstil' | 'aromaterapi';
  categoryLabel: string;
  initialDescription: string;
  proposedPrice: number;
  sampleImage: string;
  status: 'menunggu_review' | 'dalam_negosiasi' | 'disetujui' | 'ditolak' | 'tayang_di_toko';
  createdAt: string;
  approvedAt?: string;
  adminNote?: string;
  finalDetails?: {
    officialName: string;
    finalPrice: number;
    stock: number;
    images: string[];
    materials: string[];
    dimensions: string;
    careGuide: string;
    shippingOptions: string[];
  };
  publishedProductId?: string;
}

export interface ArtisanProposalChat {
  id: string;
  proposalId: string;
  sender: 'artisan' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ArtisanPayout {
  id: string;
  orderId: string;
  artisanId: string;
  artisanName: string;
  productId: string;
  productName: string;
  amount: number;
  orderDate: string;
  status: 'tertahan_menunggu_terima' | 'siap_dicairkan' | 'dicairkan_ke_rekening';
  customerReceivedAt?: string;
  paidOutAt?: string;
  bankInfo: string;
}

export type AdminTab = 'orders' | 'payments' | 'chats' | 'proposals' | 'payouts' | 'artisans';
