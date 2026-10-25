import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'kriya-01',
    name: 'Cangkir Keramik Bintik Embun',
    category: 'keramik',
    categoryLabel: 'Keramik & Tembikar',
    price: 185000,
    originalPrice: 210000,
    image: '/assets/images/product_ceramic_mug_1792844459730.jpg',
    secondaryImages: [
      '/assets/images/product_ceramic_mug_1792844459730.jpg',
      '/assets/images/hero_artisanal_studio_1792844458806.jpg'
    ],
    artisan: {
      name: 'Wayan Sujana',
      location: 'Kasongan, Bantul',
      bio: 'Pengrajin tembikar generasi ketiga yang memadukan tanah liat lokal vulkanik dengan teknik pembakaran tungku kayu tradisional.'
    },
    description: 'Cangkir kopi keramik buatan tangan dengan tekstur bintik alami (speckled glaze) yang hangat di genggaman. Setiap cangkir dipilin dan dibentuk secara individual di atas roda putar tradisional, menghasilkan ketidaksempurnaan wabi-sabi yang unik dan memikat.',
    materials: ['Tanah Liat Kasongan', 'Glaze Mineral Non-Toksik (Food Grade)'],
    dimensions: 'Diameter 8.5 cm × Tinggi 7.8 cm (Kapasitas ±260 ml)',
    careGuide: 'Aman untuk microwave dan mesin pencuci piring. Disarankan mencuci dengan spons lembut agar kilau satin keramik tetap terjaga sepanjang masa.',
    stock: 14,
    rating: 4.9,
    reviewCount: 38,
    tag: 'Pilihan Kurator'
  },
  {
    id: 'kriya-02',
    name: 'Keranjang Anyam Lamun & Rotan Alami',
    category: 'anyaman',
    categoryLabel: 'Anyaman & Serat Alami',
    price: 245000,
    originalPrice: 275000,
    image: '/assets/images/product_woven_basket_1792844459724.jpg',
    secondaryImages: [
      '/assets/images/product_woven_basket_1792844459724.jpg',
      '/assets/images/hero_artisanal_studio_1792844458806.jpg'
    ],
    artisan: {
      name: 'Ibu Ratna & Kelompok Penganyam',
      location: 'Tasikmalaya, Jawa Barat',
      bio: 'Menganyam serat pandan dan lamun laut (seagrass) pilihan dari pesisir selatan dengan ketelitian warisan nenek moyang.'
    },
    description: 'Keranjang serbaguna anyaman tangan berdinding kokoh dengan aksen rongga udara geometris dan pegangan lengkung ergonomis. Sempurna untuk wadah selimut rajut, majalah, atau tanaman hias di sudut santai rumah Anda.',
    materials: ['Serat Seagrass Kering Alami', 'Rotan Alam', 'Serat Rami'],
    dimensions: 'Panjang 36 cm × Lebar 26 cm × Tinggi 22 cm',
    careGuide: 'Bersihkan debu dengan kuas kering atau lap kain lembap. Hindari merendam dalam air dan simpan di ruangan berventilasi baik.',
    stock: 9,
    rating: 5.0,
    reviewCount: 42,
    tag: 'Karya Terbatas'
  },
  {
    id: 'kriya-03',
    name: 'Baki Saji Kayu Jati Utuh & Sendok Ukir',
    category: 'kayu',
    categoryLabel: 'Kayu & Perabot Mini',
    price: 320000,
    image: '/assets/images/product_teak_tray_1792844460545.jpg',
    secondaryImages: [
      '/assets/images/product_teak_tray_1792844460545.jpg',
      '/assets/images/hero_artisanal_studio_1792844458806.jpg'
    ],
    artisan: {
      name: 'Pak Joko Santoso',
      location: 'Jepara, Jawa Tengah',
      bio: 'Ahli pahat kayu yang mengkhususkan diri pada pemanfaatan kayu jati perhutani tua dengan alur serat emas yang tahan puluhan tahun.'
    },
    description: 'Baki saji berlekuk organik yang dipahat dari sepotong kayu jati utuh (tanpa sambungan lem), dilengkapi set sendok teh bertekstur pahatan lembut. Dilapisi minyak kelapa murni dan lilin lebah alami sehingga aman bersentuhan langsung dengan kue atau buah.',
    materials: ['Kayu Jati Solid TPK Perhutani', 'Food-grade Beeswax Finish'],
    dimensions: 'Panjang 38 cm × Lebar 22 cm × Tebal 2.4 cm',
    careGuide: 'Cuci kilat dengan sabun lembut dan segera keringkan dengan lap. Oleskan minyak zaitun atau minyak kelapa sebulan sekali untuk menyegarkan kilau kayu.',
    stock: 7,
    rating: 4.8,
    reviewCount: 29,
    tag: 'Kayu Jati Pilihan'
  },
  {
    id: 'kriya-04',
    name: 'Lilin Kedelai Bejana Tembikar Cendana & Rempah',
    category: 'aromaterapi',
    categoryLabel: 'Aromaterapi & Lilin Kedelai',
    price: 195000,
    image: '/assets/images/product_soy_candle_1792844460159.jpg',
    secondaryImages: [
      '/assets/images/product_soy_candle_1792844460159.jpg',
      '/assets/images/product_ceramic_mug_1792844459730.jpg'
    ],
    artisan: {
      name: 'Citra Kirana',
      location: 'Ubud, Bali',
      bio: 'Peracik wewangian botani yang meracik minyak esensial murni dari rempah rempah tropis nusantara ke dalam bejana gerabah ramah lingkungan.'
    },
    description: 'Lilin aromaterapi ramah lingkungan dari 100% lilin kedelai murni (soy wax) dalam wadah keramik bertekstur pasir. Menghadirkan keharuman kayu cendana hangat, kapulaga, dan kulit kayu manis yang menenangkan pikiran setelah hari yang padat.',
    materials: ['100% Lilin Kedelai Organik', 'Minyak Esensial Cendana & Kayu Manis', 'Sumbu Katun Tanpa Timbal'],
    dimensions: 'Diameter 8 cm × Tinggi 8.5 cm (Waktu bakar ±45 jam)',
    careGuide: 'Potong sumbu hingga 0.5 cm sebelum menyalakan. Saat lilin habis, wadah keramik dapat dicuci bersih dengan air hangat dan difungsikan sebagai pot sukulen atau cangkir kuas.',
    stock: 18,
    rating: 4.9,
    reviewCount: 51,
    tag: 'Aromaterapi Cozy'
  },
  {
    id: 'kriya-05',
    name: 'Kain Selimut Tenun Serat Rami & Katun Dingin',
    category: 'tekstil',
    categoryLabel: 'Tekstil & Tenun',
    price: 365000,
    originalPrice: 410000,
    image: '/assets/images/hero_artisanal_studio_1792844458806.jpg',
    secondaryImages: [
      '/assets/images/hero_artisanal_studio_1792844458806.jpg',
      '/assets/images/product_woven_basket_1792844459724.jpg'
    ],
    artisan: {
      name: 'Ibu Maryam',
      location: 'Pekalongan, Jawa Tengah',
      bio: 'Penemu teknik tenun silang ganda menggunakan alat tenun bukan mesin (ATBM) dengan pewarna alami ekstrak kulit pohon mahoni.'
    },
    description: 'Kain selimut dan throw bertekstur lembut berbahan serat rami dan katun alami bernapas. Nyaman digunakan di sofa saat membaca buku, piknik sore, atau sebagai pelapis ranjang bernuansa earthy.',
    materials: ['60% Katun Sisir Lembut', '40% Serat Rami Alami'],
    dimensions: '140 cm × 200 cm (dengan rumbai tepi rapi)',
    careGuide: 'Cuci tangan atau putaran lembut di mesin cuci dengan air dingin. Jangan menggunakan pemutih klorin, jemur di tempat teduh berangin.',
    stock: 11,
    rating: 4.9,
    reviewCount: 31,
    tag: 'Tenun Tradisional'
  },
  {
    id: 'kriya-06',
    name: 'Mangkok Keramik Saji Lapis Glasir Telur Asin',
    category: 'keramik',
    categoryLabel: 'Keramik & Tembikar',
    price: 215000,
    image: '/assets/images/product_ceramic_mug_1792844459730.jpg',
    secondaryImages: [
      '/assets/images/product_ceramic_mug_1792844459730.jpg',
      '/assets/images/product_teak_tray_1792844460545.jpg'
    ],
    artisan: {
      name: 'Wayan Sujana',
      location: 'Kasongan, Bantul',
      bio: 'Memadukan material lempung merah Jawa dengan glasir abu vulkanik bergradasi matte kehijauan.'
    },
    description: 'Mangkok saji berbibir lebar dengan tepian asimetris khas kerajinan tangan sejati. Sangat cocok untuk hidangan sup hangat, salad buah segar, atau pasta keluarga di meja makan akhir pekan.',
    materials: ['Tanah Liat Merah Terbakar Suhu 1250°C', 'Glasir Abu Batok Kelapa Alami'],
    dimensions: 'Diameter 19 cm × Kedalaman 6.5 cm',
    careGuide: 'Aman untuk makanan panas dan berkuah santan. Cuci bersih menggunakan sabun cuci piring lembut.',
    stock: 8,
    rating: 4.7,
    reviewCount: 19,
    tag: 'Karya Meja Makan'
  }
];

export const CATEGORIES = [
  { id: 'semua', label: 'Semua Kriya' },
  { id: 'keramik', label: 'Keramik & Tembikar' },
  { id: 'anyaman', label: 'Anyaman & Serat Alami' },
  { id: 'kayu', label: 'Kayu & Perabot Mini' },
  { id: 'aromaterapi', label: 'Aromaterapi & Lilin' },
  { id: 'tekstil', label: 'Tekstil & Tenun' }
];

export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
