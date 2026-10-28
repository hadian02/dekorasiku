import { OrderDetails, ChatMessage, Artisan, ArtisanProposal, ArtisanProposalChat, ArtisanPayout, Customer } from '../types';
import { PRODUCTS } from './products';

// Default Akun Pelanggan hadian02@gmail.com (Identitas Konsisten Antara HP & PC)
export const DEFAULT_HADIAN_CUSTOMER: Customer = {
  id: 'cust-hadian02',
  name: 'HADIAN02',
  email: 'hadian02@gmail.com',
  phone: '0812-9876-5432',
  createdAt: '2026-10-27T05:00:00.000Z',
  addresses: [
    {
      id: 'addr-hadian-1',
      label: 'Rumah',
      recipientName: 'hadian02',
      phone: '0812-9876-5432',
      address: 'Jl. Kaliurang Km 5.2 No. 18, Sleman',
      city: 'Yogyakarta',
      postalCode: '55281',
      lat: -7.7588,
      lng: 110.3804,
      isDefault: true,
    }
  ],
};

// Pesanan Awal Sesuai Screenshot Pengguna (#KK-1110 Mangkok Keramik Saji)
export const INITIAL_ORDERS: OrderDetails[] = [
  {
    orderId: 'KK-1110',
    date: '27 Oktober 2026 pukul 05.11',
    customerName: 'hadian02',
    customerEmail: 'hadian02@gmail.com',
    phone: '0812-9876-5432',
    address: 'Jl. Kaliurang Km 5.2 No. 18, Sleman',
    city: 'Yogyakarta',
    shippingMethod: 'J&T Express (Reguler Aman)',
    paymentMethod: 'Transfer Virtual / Bank',
    paymentStatus: 'terverifikasi_otomatis',
    orderStatus: 'menunggu_konfirmasi', // Menunggu Konfirmasi Pengrajin Wayan Sujana
    paymentReference: 'TF-BCA-20261027-1110',
    verifiedAt: '27 Okt 2026 05.12 (QRIS Webhook Gateway)',
    items: [
      {
        product: PRODUCTS[5], // Mangkok Keramik Saji Lapis Glasir Telur Asin (Wayan Sujana)
        quantity: 1,
      }
    ],
    subtotal: 215000,
    shippingCost: 45000,
    discount: 0,
    giftWrapping: false,
    total: 260000,
    coordinates: {
      lat: -7.7588,
      lng: 110.3804,
    },
  }
];

// Pesan Chat Awal
export const INITIAL_CHATS: ChatMessage[] = [];

// Pengrajin Aktif Awal: Wayan Sujana (Pembuat Mangkok Keramik Pesanan #KK-1110)
export const INITIAL_ARTISAN: Artisan = {
  id: 'artisan-01',
  seqNumber: 1,
  name: 'Wayan Sujana',
  workshopName: 'Studio Tembikar Sekar Bumi',
  workshopAddress: 'Kawasan Sentra Keramik Kasongan No. 14, Bantul',
  productTypes: 'Keramik & Gerabah Bakaran Tungku Kayu',
  preferredVisitSchedule: 'Setiap Hari Kerja 09.00 - 16.00 WIB',
  specialty: 'Keramik & Gerabah Alami',
  location: 'Kasongan, Bantul, D.I. Yogyakarta',
  email: 'wayan.sujana@kriya.id',
  phone: '0813-2890-1122',
  bankName: 'BCA',
  bankAccount: '037-8899-210',
  bankAccountName: 'Wayan Sujana',
  bio: 'Pengrajin tembikar generasi ketiga yang memadukan tanah liat lokal vulkanik dengan teknik pembakaran tungku kayu tradisional.',
  createdAt: '2026-01-15',
  approvalStatus: 'disetujui',
  approvedAt: '2026-01-16',
  verificationNotes: 'Terverifikasi langsung oleh tim kurator dekorasiku.',
};

// Daftar Pengrajin Mitra Terdaftar
export const INITIAL_REGISTERED_ARTISANS: Artisan[] = [
  INITIAL_ARTISAN,
  {
    id: 'artisan-02',
    seqNumber: 2,
    name: 'Ibu Ratna & Kelompok Penganyam',
    workshopName: 'Sentra Anyam Ratna Kreasi',
    workshopAddress: 'Jl. Pesisir Selatan No. 42, Tasikmalaya',
    productTypes: 'Anyaman Pandan, Lamun Laut & Rotan Alami',
    preferredVisitSchedule: 'Senin - Kamis pukul 10.00 WIB',
    specialty: 'Anyaman & Serat Alami',
    location: 'Tasikmalaya, Jawa Barat',
    email: 'ratna.anyam@kriya.id',
    phone: '0812-4455-6677',
    bankName: 'Mandiri',
    bankAccount: '137-00-9988-112',
    bankAccountName: 'Ratna Ningsih',
    bio: 'Menganyam serat pandan dan lamun laut (seagrass) pilihan dari pesisir selatan dengan ketelitian warisan nenek moyang.',
    createdAt: '2026-02-10',
    approvalStatus: 'disetujui',
    approvedAt: '2026-02-11',
    verificationNotes: 'Terverifikasi mutu anyaman serat alami.',
  },
  {
    id: 'artisan-03',
    seqNumber: 3,
    name: 'Pak Joko Santoso',
    workshopName: 'Sanggar Ukir Jati Abadi',
    workshopAddress: 'Jl. Pemuda No. 18, Jepara, Jawa Tengah',
    productTypes: 'Baki Saji Kayu Jati Utuh & Sendok Ukir, Kerajinan Kayu',
    preferredVisitSchedule: 'Senin - Sabtu pukul 08.00 - 15.00 WIB',
    specialty: 'Kayu & Perabot Mini',
    location: 'Jepara, Jawa Tengah',
    email: 'joko.santoso@kriya.id',
    phone: '0813-5566-7788',
    bankName: 'BNI',
    bankAccount: '023-4567-890',
    bankAccountName: 'Joko Santoso',
    bio: 'Ahli pahat kayu yang mengkhususkan diri pada pemanfaatan kayu jati perhutani tua dengan alur serat emas yang tahan puluhan tahun.',
    createdAt: '2026-02-15',
    approvalStatus: 'disetujui',
    approvedAt: '2026-02-16',
    verificationNotes: 'Terverifikasi mutu kayu jati TPK Perhutani bersertifikasi SVLK.',
  },
  {
    id: 'artisan-04',
    seqNumber: 4,
    name: 'Citra Kirana',
    workshopName: 'Citra Aroma Botanical Studio',
    workshopAddress: 'Jl. Raya Pengosekan No. 27, Ubud, Gianyar, Bali',
    productTypes: 'Lilin Kedelai Alami, Bejana Tembikar, Minyak Esensial',
    preferredVisitSchedule: 'Rabu & Jumat pukul 10.00 - 16.00 WITA',
    specialty: 'Aromaterapi & Lilin Kedelai',
    location: 'Ubud, Bali',
    email: 'citra.kirana@kriya.id',
    phone: '0811-3322-1100',
    bankName: 'BCA',
    bankAccount: '772-019-334',
    bankAccountName: 'Citra Kirana',
    bio: 'Peracik wewangian botani yang meracik minyak esensial murni dari rempah rempah tropis nusantara ke dalam bejana gerabah ramah lingkungan.',
    createdAt: '2026-02-20',
    approvalStatus: 'disetujui',
    approvedAt: '2026-02-21',
    verificationNotes: 'Terverifikasi bahan lilin kedelai organik non-paraffin.',
  },
  {
    id: 'artisan-05',
    seqNumber: 5,
    name: 'Ibu Maryam',
    workshopName: 'Tenun Canting Maryam',
    workshopAddress: 'Kawasan Sentra Tenun Krapyak No. 12, Pekalongan',
    productTypes: 'Kain Selimut Tenun, Serat Rami & Katun Dingin ATBM',
    preferredVisitSchedule: 'Senin - Kamis pukul 09.00 - 14.00 WIB',
    specialty: 'Tekstil & Tenun',
    location: 'Pekalongan, Jawa Tengah',
    email: 'maryam.tenun@kriya.id',
    phone: '0815-7788-9900',
    bankName: 'BRI',
    bankAccount: '0012-01-098765-50-1',
    bankAccountName: 'Maryam',
    bio: 'Penemu teknik tenun silang ganda menggunakan alat tenun bukan mesin (ATBM) dengan pewarna alami ekstrak kulit pohon mahoni.',
    createdAt: '2026-03-01',
    approvalStatus: 'disetujui',
    approvedAt: '2026-03-02',
    verificationNotes: 'Terverifikasi mutu serat rami alami dan proses tenun manual ATBM.',
  }
];

// Proposal Kriya Awal
export const INITIAL_PROPOSALS: ArtisanProposal[] = [];

// Percakapan Kurasi Awal
export const INITIAL_PROPOSAL_CHATS: ArtisanProposalChat[] = [];

// Pencairan Dana Escrow Awal
export const INITIAL_PAYOUTS: ArtisanPayout[] = [];
