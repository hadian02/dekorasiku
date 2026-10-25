import { OrderDetails, ChatMessage, Artisan, ArtisanProposal, ArtisanProposalChat, ArtisanPayout } from '../types';

// Bersih untuk pengetesan: Tidak ada pesanan awal
export const INITIAL_ORDERS: OrderDetails[] = [];

// Bersih untuk pengetesan: Tidak ada pesan chat awal
export const INITIAL_CHATS: ChatMessage[] = [];

// Bersih untuk pengetesan: Belum ada pengrajin aktif
export const INITIAL_ARTISAN: Artisan | null = null;

// Bersih untuk pengetesan: Belum ada pengrajin terdaftar
export const INITIAL_REGISTERED_ARTISANS: Artisan[] = [];

// Bersih untuk pengetesan: Belum ada proposal produk awal
export const INITIAL_PROPOSALS: ArtisanProposal[] = [];

// Bersih untuk pengetesan: Belum ada percakapan kurasi awal
export const INITIAL_PROPOSAL_CHATS: ArtisanProposalChat[] = [];

// Bersih untuk pengetesan: Belum ada pencairan dana awal
export const INITIAL_PAYOUTS: ArtisanPayout[] = [];
