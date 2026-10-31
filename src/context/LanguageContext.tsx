import React, { createContext, useContext, useState } from 'react';
import { Product, Artisan } from '../types';

export type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateProduct: (product: Product) => Product;
  getMaterialHexLabel: (hex: string) => string;
}

// English artisan profile translations
export const ARTISAN_TRANSLATIONS: Record<
  string,
  {
    name?: string;
    workshopName?: string;
    location?: string;
    bio: string;
  }
> = {
  'artisan-01': {
    workshopName: 'Studio Tembikar Sekar Bumi',
    name: 'Wayan Sujana',
    location: 'Kasongan, Bantul, D.I. Yogyakarta, Indonesia',
    bio: 'Third-generation pottery artisan blending local volcanic clay with traditional wood-fired kiln firing techniques.',
  },
  'Wayan Sujana': {
    workshopName: 'Studio Tembikar Sekar Bumi',
    name: 'Wayan Sujana',
    location: 'Kasongan, Bantul, D.I. Yogyakarta, Indonesia',
    bio: 'Third-generation pottery artisan blending local volcanic clay with traditional wood-fired kiln firing techniques.',
  },
  'artisan-02': {
    workshopName: 'Sentra Anyam Ratna Kreasi',
    name: 'Mrs. Ratna & Weaver Collective',
    location: 'Tasikmalaya, West Java, Indonesia',
    bio: 'Weaving hand-selected pandan and marine seagrass fibers from the southern coast with ancestral heritage precision.',
  },
  'Ibu Ratna & Kelompok Penganyam': {
    workshopName: 'Sentra Anyam Ratna Kreasi',
    name: 'Mrs. Ratna & Weaver Collective',
    location: 'Tasikmalaya, West Java, Indonesia',
    bio: 'Weaving hand-selected pandan and marine seagrass fibers from the southern coast with ancestral heritage precision.',
  },
  'artisan-03': {
    workshopName: 'Sanggar Ukir Jati Abadi',
    name: 'Mr. Joko Santoso',
    location: 'Jepara, Central Java, Indonesia',
    bio: 'Master woodcarver specializing in reclaimed mature teakwood with golden grain lines built to endure for decades.',
  },
  'Pak Joko Santoso': {
    workshopName: 'Sanggar Ukir Jati Abadi',
    name: 'Mr. Joko Santoso',
    location: 'Jepara, Central Java, Indonesia',
    bio: 'Master woodcarver specializing in reclaimed mature teakwood with golden grain lines built to endure for decades.',
  },
  'artisan-04': {
    workshopName: 'Citra Aroma Botanical Studio',
    name: 'Citra Kirana',
    location: 'Ubud, Bali, Indonesia',
    bio: 'Botanical perfumer blending pure tropical essential oils into handcrafted earthenware vessels.',
  },
  'Citra Kirana': {
    workshopName: 'Citra Aroma Botanical Studio',
    name: 'Citra Kirana',
    location: 'Ubud, Bali, Indonesia',
    bio: 'Botanical perfumer blending pure tropical essential oils into handcrafted earthenware vessels.',
  },
  'artisan-05': {
    workshopName: 'Tenun Canting Maryam',
    name: 'Mrs. Maryam',
    location: 'Pekalongan, Central Java, Indonesia',
    bio: 'Pioneer of double-cross weaving techniques using traditional non-machine looms (ATBM) with natural mahogany bark dyes.',
  },
  'Ibu Maryam': {
    workshopName: 'Tenun Canting Maryam',
    name: 'Mrs. Maryam',
    location: 'Pekalongan, Central Java, Indonesia',
    bio: 'Pioneer of double-cross weaving techniques using traditional non-machine looms (ATBM) with natural mahogany bark dyes.',
  },
};

// English product metadata translations
const PRODUCT_TRANSLATIONS: Record<
  string,
  {
    name: string;
    description: string;
    categoryLabel: string;
    materials: string[];
    dimensions: string;
    careGuide: string;
    tag?: string;
  }
> = {
  'kriya-01': {
    name: 'Dewdrop Speckled Ceramic Mug',
    description:
      'Handmade ceramic coffee mug with a warm, tactile natural speckled glaze. Individually thrown and shaped on a traditional pottery wheel, embodying unique wabi-sabi charm.',
    categoryLabel: 'Ceramics & Pottery',
    materials: ['Kasongan Earthenware Clay', 'Non-Toxic Food Grade Mineral Glaze'],
    dimensions: 'Diameter 8.5 cm × Height 7.8 cm (Capacity ±260 ml)',
    careGuide:
      'Microwave and dishwasher safe. Hand wash with a soft sponge recommended to preserve the satin glaze luster over time.',
    tag: "Curator's Choice",
  },
  'kriya-02': {
    name: 'Natural Seagrass & Rattan Woven Basket',
    description:
      'Sturdy handcrafted storage basket featuring geometric air-vent accents and ergonomic curved handles. Perfect for storing throw blankets, magazines, or potted plants in your cozy corner.',
    categoryLabel: 'Weaving & Natural Fibers',
    materials: ['Natural Sun-Dried Seagrass Fiber', 'Natural Rattan', 'Jute Cord'],
    dimensions: 'Length 36 cm × Width 26 cm × Height 22 cm',
    careGuide:
      'Dust with a soft brush or damp cloth. Avoid submerging in water and keep in a well-ventilated dry space.',
    tag: 'Limited Edition',
  },
  'kriya-03': {
    name: 'Solid Teak Serving Tray & Carved Spoon',
    description:
      'Serving tray carved from a single piece of reclaimed aged teak wood with warm golden grain patterns, paired with a hand-carved coffee scoop.',
    categoryLabel: 'Woodcraft & Mini Furniture',
    materials: ['Solid Aged Teak Wood', 'Organic Coconut Oil & Beeswax Food-Safe Finish'],
    dimensions: 'Length 38 cm × Width 18 cm × Thickness 2.2 cm',
    careGuide:
      'Wipe with a damp cloth after use. Re-oil periodically with olive or mineral oil to maintain its deep luster.',
    tag: 'Signature Piece',
  },
  'kriya-04': {
    name: 'Javanese Jasmine Natural Soy Wax Candle',
    description:
      'Aromatherapy candle poured into a reusable handcrafted earthenware jar. Infused with pure essential oils of Gambir jasmine and vetiver for calming ambiance.',
    categoryLabel: 'Aromatherapy & Candles',
    materials: ['100% Pure Soy Wax', 'Natural Essential Oils', 'Organic Cotton Wick'],
    dimensions: 'Diameter 7.5 cm × Height 8 cm (Burn time ±45 hours)',
    careGuide:
      'Trim wick to 5mm before each lighting. Allow the top layer to melt completely to prevent tunneling.',
    tag: 'Best Seller',
  },
  'kriya-05': {
    name: 'Plant-Dyed Ramie & Cool Cotton Throw Blanket',
    description:
      'Breathable blanket and throw woven on traditional handlooms from natural ramie and combed cotton, naturally dyed with plant extracts.',
    categoryLabel: 'Textiles & Handloom',
    materials: ['60% Combed Natural Cotton', '40% Natural Ramie Fiber'],
    dimensions: '140 cm × 200 cm (with neat fringed edges)',
    careGuide:
      'Gentle hand wash with cold water. Avoid harsh bleach and dry in the shade.',
    tag: 'Traditional Handloom',
  },
  'kriya-06': {
    name: 'Salted-Egg Glazed Asymmetric Ceramic Serving Bowl',
    description:
      'Wide-lipped ceramic serving bowl with subtle organic asymmetry. Perfect for warm hearty soups, garden salads, or seasonal fruit displays.',
    categoryLabel: 'Ceramics & Pottery',
    materials: ['Volcanic Red Earthenware Clay (1250°C)', 'Natural Coconut Shell Ash Glaze'],
    dimensions: 'Diameter 19 cm × Depth 6.5 cm',
    careGuide:
      'Food-safe for hot and saucy dishes. Hand wash with a mild eco-friendly dish soap.',
    tag: 'Dining Table Craft',
  },
  'kriya-07': {
    name: 'Miniature Sungkai Wood Sculptural Stool',
    description:
      'Compact multi-purpose wooden stool and pedestal crafted from kiln-dried Sungkai wood with smooth curved finger joints.',
    categoryLabel: 'Woodcraft & Mini Furniture',
    materials: ['FSC Certified Sungkai Hardwood', 'Natural Water-Based Matte Topcoat'],
    dimensions: 'Diameter 28 cm × Height 36 cm (Weight capacity 100 kg)',
    careGuide:
      'Clean with a dry microfibre cloth. Avoid direct prolonged sunlight exposure.',
    tag: 'Signature Piece',
  },
  'kriya-08': {
    name: 'Double-Woven Bamboo Fruit & Bread Bowl',
    description:
      'Traditional lightweight double-woven bamboo basket with woven rim reinforcement, perfect for serving fresh fruits or artisanal bread.',
    categoryLabel: 'Weaving & Natural Fibers',
    materials: ['Natural Tali Bamboo Strands', 'Smoked Bamboo Accent Ring'],
    dimensions: 'Diameter 30 cm × Height 10 cm',
    careGuide:
      'Wipe clean with a damp cloth and allow to air dry completely before storing.',
    tag: 'Eco Friendly',
  },
};

const UI_DICTIONARY: Record<string, { id: string; en: string }> = {
  // Top Banner
  'promo.banner': {
    id: 'Gunakan kode promo KRIYAHANGAT diskon 10% · Gratis Ongkir min. Rp 350rb',
    en: 'Use promo code KRIYAHANGAT for 10% off · Free Shipping min. Rp 350k',
  },
  'live.cloud': {
    id: 'Live Cloud Sync',
    en: 'Live Cloud Sync',
  },

  // Navbar Links
  'nav.catalog': { id: 'Katalog Kriya', en: 'Craft Catalog' },
  'nav.gallery': { id: 'Galeri Estetik', en: 'Aesthetic Gallery' },
  'nav.stories': { id: 'Kisah Pengrajin', en: 'Artisan Stories' },
  'nav.ethics': { id: 'Garansi & Etika', en: 'Guarantee & Ethics' },
  'nav.cart': { id: 'Keranjang', en: 'Cart' },

  // User Dropdown Sub-menu
  'user.welcome': { id: 'Selamat Datang!', en: 'Welcome!' },
  'user.welcome_sub': { id: 'Silakan masuk untuk akses akun penuh', en: 'Sign in to access your full account' },
  'user.profile': { id: 'Edit Profile', en: 'Edit Profile' },
  'user.profile_desc': { id: 'Kelola data diri & alamat kirim', en: 'Manage personal info & shipping address' },
  'user.favorites': { id: 'My Favorite', en: 'My Favorites' },
  'user.favorites_desc': { id: 'Kriya tersimpan', en: 'Saved handcrafted items' },
  'user.orders': { id: 'My Orders', en: 'My Orders' },
  'user.orders_desc': { id: 'Pantau status & lacak pesanan', en: 'Track order progress & delivery' },
  'user.logout': { id: 'Logout', en: 'Logout' },
  'user.logout_desc': { id: 'Keluar dari akun Anda', en: 'Sign out of your account' },
  'user.login': { id: 'Login / Masuk', en: 'Login / Sign In' },
  'user.login_desc': { id: 'Masuk atau daftar akun kriya', en: 'Sign in or register customer account' },

  // Kotak Merah Sub-menu (Studio, Mitra & Admin)
  'red.title': { id: 'Studio & Mitra', en: 'Studio & Partners' },
  'red.artisan_portal': { id: 'Portal Pengrajin', en: 'Artisan Portal' },
  'red.artisan_desc': { id: 'Masuk (Log In) atau Daftar (Sign In)', en: 'Sign In or Register (Artisans)' },
  'red.admin_panel': { id: 'Panel Admin', en: 'Admin Panel' },
  'red.admin_desc': { id: 'Kelola Toko & Mitra', en: 'Manage Store & Artisans' },
  'red.chat_studio': { id: 'Chat Studio', en: 'Studio Chat' },
  'red.chat_desc': { id: 'Tanya Tim Admin', en: 'Ask Admin Team' },

  // Kotak Biru Sub-menu (3-Lines Hamburger Menu)
  'blue.title': { id: 'Navigasi Menu', en: 'Navigation Menu' },
  'blue.catalog_full': { id: 'Katalog Kriya Lengkap', en: 'Full Craft Catalog' },
  'blue.gallery_full': { id: 'Galeri Estetik & Lookbook Ruang', en: 'Aesthetic Gallery & Room Lookbook' },
  'blue.stories_full': { id: 'Kisah & Etika Pengrajin', en: 'Artisan Stories & Ethics' },
  'blue.shipping_full': { id: 'Garansi Aman & Ekspedisi Nusantara', en: 'Safe Shipping & Archipelago Delivery' },

  // Language Menu
  'lang.title': { id: 'Pilih Bahasa', en: 'Select Language' },
  'lang.id': { id: 'Bahasa Indonesia', en: 'Indonesian' },
  'lang.en': { id: 'English (US/UK)', en: 'English' },

  // Hero Section
  'hero.tag': { id: 'Kurasi Kriya Nusantara · Sejak 2021', en: 'Curated Indonesian Handcrafts · Since 2021' },
  'hero.title': {
    id: 'Kerajinan tangan berjiwa, menghangatkan sudut rumah Anda.',
    en: 'Soulful handcrafted goods that warm every corner of your home.',
  },
  'hero.subtitle': {
    id: 'Setiap cangkir tembikar, anyaman serat laut, dan baki kayu jati dibentuk dengan ketelatenan tangan pengrajin lokal nusantara. Menghadirkan ketenangan alami dalam setiap momen santai di rumah.',
    en: 'Every ceramic cup, seagrass weave, and solid teak tray is lovingly shaped by Indonesian master artisans, bringing organic serenity into your everyday living space.',
  },
  'hero.cta_explore': { id: 'Jelajahi Koleksi', en: 'Explore Collection' },
  'hero.cta_gallery': { id: 'Lihat Galeri Estetik', en: 'View Aesthetic Gallery' },
  'hero.stat_curated': { id: '420+ Karya Terkurasi', en: '420+ Curated Crafts' },
  'hero.stat_artisans': { id: '18 Komunitas Pengrajin', en: '18 Artisan Collectives' },
  'hero.stat_eco': { id: '100% Kemasan Ramah Lingkungan', en: '100% Eco-Friendly Packaging' },
  'hero.workshop_tag': { id: 'BENGKEL BANTUL & TASIKMALAYA', en: 'STUDIOS IN BANTUL & TASIKMALAYA' },
  'hero.workshop_title': { id: 'Sentuhan Tangan, Bukan Mesin Pabrik', en: 'Shaped by Human Hands, Not Machines' },
  'hero.autumn_edition': { id: 'Edisi Musim Gugur', en: 'Autumn Edition' },

  // Trust Markers
  'trust.authentic': { id: 'Karya Asli Pengrajin', en: 'Authentic Artisan Work' },
  'trust.authentic_desc': { id: 'Langsung dari tangan seniman kriya lokal nusantara.', en: 'Directly from the hands of local heritage craft masters.' },
  'trust.natural': { id: 'Material Alami Pilihan', en: 'Natural Organic Materials' },
  'trust.natural_desc': { id: 'Tanah liat, kayu jati legal, bambu, dan serat lestari.', en: 'Ethical teak, clay, bamboo, and sustainable plant fibers.' },
  'trust.fair': { id: 'Bagi Hasil Adil (Fair Trade)', en: 'Fair Trade & Living Wage' },
  'trust.fair_desc': { id: 'Setiap pembelian langsung memberdayakan studio pengrajin.', en: 'Every purchase directly supports artisan studio families.' },
  'trust.guarantee': { id: 'Garansi Aman Pecah Belah', en: 'Safe Delivery Guarantee' },
  'trust.guarantee_desc': { id: 'Kemasan berlapis sarang lebah & peti kayu proteksi 100%.', en: 'Honeycomb paper & wooden crates for 100% fragile safety.' },

  // Catalog Section
  'catalog.title': { id: 'Koleksi Kriya Terpilih', en: 'Curated Craft Collection' },
  'catalog.subtitle': {
    id: 'Dibuat dalam jumlah terbatas oleh pengrajin mitra dari berbagai penjuru nusantara.',
    en: 'Crafted in limited small batches by partner artisans across the archipelago.',
  },
  'catalog.search_placeholder': {
    id: 'Cari karya kriya, nama pengrajin, atau material alami...',
    en: 'Search crafts, artisan names, or natural materials...',
  },
  'catalog.filter_all': { id: 'Semua Kriya', en: 'All Crafts' },
  'catalog.filter_keramik': { id: 'Keramik & Tembikar', en: 'Ceramics & Pottery' },
  'catalog.filter_anyaman': { id: 'Anyaman & Serat Alami', en: 'Weaving & Fibers' },
  'catalog.filter_kayu': { id: 'Kayu & Perabot Mini', en: 'Woodcraft & Mini Furniture' },
  'catalog.filter_tekstil': { id: 'Tekstil & Tenun', en: 'Textiles & Handloom' },
  'catalog.filter_aromaterapi': { id: 'Aromaterapi & Lilin', en: 'Aromatherapy & Candles' },
  'catalog.sort_label': { id: 'Urutkan:', en: 'Sort by:' },
  'catalog.sort_newest': { id: 'Terbaru', en: 'Newest' },
  'catalog.sort_price_low': { id: 'Harga Terendah', en: 'Lowest Price' },
  'catalog.sort_price_high': { id: 'Harga Tertinggi', en: 'Highest Price' },
  'catalog.sort_popular': { id: 'Terpopuler', en: 'Most Popular' },

  // Product Card & Actions
  'product.sold_out': { id: 'Habis Terjual', en: 'Sold Out' },
  'product.units_left': { id: 'unit tersisa', en: 'units left' },
  'product.buy_now': { id: 'Beli Sekarang', en: 'Buy Now' },
  'product.add_cart': { id: 'Keranjang', en: 'Add to Cart' },
  'product.details': { id: 'Lihat Rincian', en: 'View Details' },
  'product.code': { id: 'Kode Barang', en: 'Product Code' },

  // Orders Modal
  'orders.title': { id: 'Pesanan Saya & Lacak', en: 'My Orders & Tracking' },
  'orders.tab_active': { id: 'Belum Selesai', en: 'Active Orders' },
  'orders.tab_completed': { id: 'Selesai', en: 'Completed' },
  'orders.tab_cancelled': { id: 'Dibatalkan', en: 'Cancelled' },
  'orders.empty_active': { id: 'Tidak ada pesanan yang sedang berjalan', en: 'No active orders in progress' },
  'orders.empty_completed': { id: 'Belum ada pesanan yang selesai', en: 'No completed orders yet' },
  'orders.empty_cancelled': { id: 'Tidak ada pesanan yang dibatalkan', en: 'No cancelled orders' },

  // Footer
  'footer.description': {
    id: 'Atelier kurasi kriya & seni dekorasi bernapas nusantara. Menghubungkan ketelatenan tangan pengrajin lokal dengan rumah-rumah yang mendambakan kehangatan alami.',
    en: 'An artisanal atelier of Indonesian handcrafted home decor. Connecting local heritage craftsmanship with homes that cherish natural warmth.',
  },
  'footer.rights': {
    id: 'Hak Cipta Terpelihara. Diberdayakan oleh para Pengrajin Tradisi Nusantara.',
    en: 'All Rights Reserved. Empowered by Indonesian Traditional Artisans.',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'id',
  setLanguage: () => {},
  t: (key) => key,
  translateProduct: (p) => p,
  getMaterialHexLabel: () => '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('kala_kriya_lang');
      return saved === 'en' ? 'en' : 'id';
    } catch {
      return 'id';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('kala_kriya_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    const entry = UI_DICTIONARY[key];
    if (!entry) return key;
    return language === 'en' ? entry.en : entry.id;
  };

  const getMaterialHexLabel = (hex: string): string => {
    const clean = (hex || '').trim().toUpperCase();
    if (language === 'en') {
      switch (clean) {
        case '01': return 'Kasongan Earthenware & Ceramics';
        case '02': return 'Natural Fibers & Seagrass Weaving';
        case '03': return 'Solid Teak Wood & Carving';
        case '04': return 'Organic Soy Wax & Spiced Oils';
        case '05': return 'Natural Ramie & Handloom Cotton';
        case '06': return 'Forged Brass & Metalwork';
        case '07': return 'Natural Stone & River Andesite';
        case '08': return 'Vegetable-Tanned Leather';
        case '0A': return 'Composite & Mixed Eco-Materials';
        default: return `Material Code #${clean}`;
      }
    } else {
      switch (clean) {
        case '01': return 'Tanah Liat & Keramik Kasongan';
        case '02': return 'Serat Alami & Anyaman Lamun';
        case '03': return 'Kayu Jati Solid & Pahat Jepara';
        case '04': return 'Lilin Kedelai & Rempah Herbal';
        case '05': return 'Serat Rami & Tenun Canting';
        case '06': return 'Kuningan & Logam Tempa';
        case '07': return 'Batu Alam & Andesit';
        case '08': return 'Kulit Nabati Alami';
        case '0A': return 'Material Campuran / Komposit';
        default: return `Bahan Hex #${clean}`;
      }
    }
  };

  const translateProduct = (product: Product): Product => {
    if (language !== 'en') return product;

    let translatedArtisan = product.artisan;
    if (product.artisan) {
      const artId = product.artisan.id;
      const artName = product.artisan.name;
      const artTr =
        (artId ? ARTISAN_TRANSLATIONS[artId] : undefined) ||
        (artName ? ARTISAN_TRANSLATIONS[artName] : undefined);
      if (artTr) {
        translatedArtisan = {
          ...product.artisan,
          name: artTr.name || product.artisan.name,
          workshopName: artTr.workshopName || product.artisan.workshopName,
          location: artTr.location || product.artisan.location,
          bio: artTr.bio || product.artisan.bio,
        };
      } else {
        // Fallback for custom artisan bios
        let engBio = product.artisan.bio;
        if (engBio.includes('Pengrajin tembikar generasi ketiga') || engBio.includes('tanah liat')) {
          engBio = 'Third-generation pottery artisan blending local volcanic clay with traditional wood-fired kiln firing techniques.';
        } else if (engBio.includes('Menganyam') || engBio.includes('seagrass')) {
          engBio = 'Weaving hand-selected natural plant and seagrass fibers with ancestral heritage precision.';
        } else if (engBio.includes('pahat') || engBio.includes('kayu')) {
          engBio = 'Master woodcarver specializing in reclaimed mature teakwood with golden grain lines built to endure for decades.';
        } else if (engBio.includes('wewangian') || engBio.includes('lilin')) {
          engBio = 'Botanical perfumer blending pure tropical essential oils into handcrafted earthenware vessels.';
        } else if (engBio.includes('tenun')) {
          engBio = 'Pioneer of traditional handloom weaving techniques with natural botanical dyes.';
        }
        translatedArtisan = {
          ...product.artisan,
          bio: engBio,
        };
      }
    }

    const tr = PRODUCT_TRANSLATIONS[product.id];
    if (tr) {
      return {
        ...product,
        name: tr.name,
        description: tr.description,
        categoryLabel: tr.categoryLabel,
        materials: tr.materials,
        dimensions: tr.dimensions,
        careGuide: tr.careGuide,
        tag: tr.tag || product.tag,
        artisan: translatedArtisan,
      };
    }

    // Dynamic translated fallback for user-submitted proposals (like "Pigura", "Bingkai", etc.)
    const categoryEn =
      product.category === 'keramik'
        ? 'Ceramics & Pottery'
        : product.category === 'anyaman'
        ? 'Weaving & Natural Fibers'
        : product.category === 'kayu'
        ? 'Woodcraft & Mini Furniture'
        : product.category === 'tekstil'
        ? 'Textiles & Handloom'
        : product.category === 'aromaterapi'
        ? 'Aromatherapy & Candles'
        : product.categoryLabel;

    // Name translation fallback
    let nameEn = product.name;
    const lowerName = product.name.toLowerCase();
    if (lowerName === 'pigura' || lowerName === 'bingkai') {
      nameEn = 'Handcrafted Wooden Picture Frame';
    } else if (lowerName.includes('pigura') || lowerName.includes('bingkai')) {
      nameEn = product.name.replace(/pigura/gi, 'Picture Frame').replace(/bingkai/gi, 'Frame');
    } else if (lowerName.includes('cangkir') || lowerName.includes('mug')) {
      nameEn = 'Handcrafted Ceramic Cup';
    } else if (lowerName.includes('keranjang')) {
      nameEn = 'Natural Woven Storage Basket';
    } else if (lowerName.includes('baki')) {
      nameEn = 'Solid Teak Serving Tray';
    } else if (lowerName.includes('lilin')) {
      nameEn = 'Aromatic Soy Wax Candle';
    }

    // Description translation fallback
    let descEn = product.description;
    const lowerDesc = product.description.toLowerCase();
    if (lowerDesc.includes('susah banget') || lowerDesc.includes('rumit')) {
      descEn = 'Exquisitely detailed piece crafted with immense dedication, patient technique, and delicate handmade precision.';
    } else if (lowerDesc.includes('sangat cantik') || lowerDesc.includes('cantik')) {
      descEn = 'Beautifully crafted artisanal piece made with care to bring organic warmth to your home interior.';
    } else if (lowerDesc.length < 30) {
      descEn = `${product.description} · Lovingly hand-shaped in limited small batches by Indonesian craft masters.`;
    }

    // Materials translation fallback
    const materialsEn = (product.materials && product.materials.length > 0)
      ? product.materials.map((m) => {
          const lm = m.toLowerCase();
          if (lm.includes('kayu') || lm.includes('jati')) return 'Solid Aged Teak Wood';
          if (lm.includes('tanah liat') || lm.includes('keramik')) return 'Kasongan Earthenware Clay';
          if (lm.includes('anyam') || lm.includes('rotan') || lm.includes('seagrass')) return 'Natural Seagrass & Rattan';
          if (lm.includes('lilin') || lm.includes('kedelai')) return '100% Organic Soy Wax';
          if (lm.includes('katun') || lm.includes('rami')) return 'Natural Cotton & Ramie Fiber';
          return m;
        })
      : ['Selected Natural Eco-Friendly Materials'];

    // Care guide translation fallback
    let careGuideEn = product.careGuide || '';
    if (!careGuideEn || careGuideEn.toLowerCase().includes('bersihkan') || careGuideEn.toLowerCase().includes('cuci')) {
      careGuideEn = 'Wipe gently with a soft microfibre cloth. Avoid soaking in water and store in a dry, well-ventilated space.';
    }

    return {
      ...product,
      name: nameEn,
      description: descEn,
      categoryLabel: categoryEn,
      materials: materialsEn,
      careGuide: careGuideEn,
      artisan: translatedArtisan,
    };
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateProduct, getMaterialHexLabel }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
