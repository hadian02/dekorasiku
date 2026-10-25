import { GalleryItem } from '../types';

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'galeri-01',
    title: 'Kehangatan Secangkir Kopi di Fajar Tenang',
    category: 'meja-teh',
    categoryLabel: 'Meja Teh & Sarapan',
    image: '/assets/images/product_ceramic_mug_1792844459730.jpg',
    aspectRatio: 'aspect-4/3',
    caption: 'Cahaya pagi menembus kisi-kisi jendela kayu, menyinari uap kopi seduh manual dalam cangkir keramik berbintik. Kombinasi tekstur serbet linen dan kayu tua menghadirkan ketenangan sebelum keriuhan hari dimulai.',
    stylingTip: 'Padukan keramik berbintik matte dengan serbet linen cokelat gandum (oatmeal) dan setangkai daun eukaliptus kering untuk sudut meja yang bersahaja.',
    likes: 128,
    relatedProductIds: ['kriya-01', 'kriya-03']
  },
  {
    id: 'galeri-02',
    title: 'Harmoni Sudut Santai dengan Anyaman Lamun',
    category: 'sudut-baca',
    categoryLabel: 'Sudut Baca Santai',
    image: '/assets/images/product_woven_basket_1792844459724.jpg',
    aspectRatio: 'aspect-4/3',
    caption: 'Keranjang anyaman serat laut diletakkan di samping bangku kayu tua, menyimpan selimut rajut hangat dan buket rumput pampas liar. Ruangan terasa hidup berkat aroma alami serat pandan.',
    stylingTip: 'Gunakan keranjang anyaman sebagai tempat selimut atau buku favorit di sebelah kursi malas untuk menciptakan sudut membaca yang mengundang.',
    likes: 195,
    relatedProductIds: ['kriya-02', 'kriya-05']
  },
  {
    id: 'galeri-03',
    title: 'Pendar Lilin Kedelai & Keheningan Malam',
    category: 'sudut-baca',
    categoryLabel: 'Sudut Baca Santai',
    image: '/assets/images/product_soy_candle_1792844460159.jpg',
    aspectRatio: 'aspect-4/3',
    caption: 'Ketika senja berganti malam, pendar api lilin kedelai bejana tembikar menyebarkan aroma cendana dan kayu manis. Udara terasa lebih lembut, mengajak tubuh dan pikiran untuk beristirahat.',
    stylingTip: 'Tempatkan lilin di atas potongan batu travertin atau baki kayu untuk melindungi permukaan meja dan memperkaya dimensi visual.',
    likes: 240,
    relatedProductIds: ['kriya-04', 'kriya-03']
  },
  {
    id: 'galeri-04',
    title: 'Ritual Jamuan Sore dengan Papan Kayu Jati',
    category: 'ruang-makan',
    categoryLabel: 'Dapur & Perjamuan',
    image: '/assets/images/product_teak_tray_1792844460545.jpg',
    aspectRatio: 'aspect-4/3',
    caption: 'Baki kayu jati dengan lekuk lembut menjadi panggung saji bagi kue-kue tradisional dan rempah segar. Sentuhan minyak kelapa murni menonjolkan urat kayu keemasan yang menawan.',
    stylingTip: 'Biarkan serat kayu alami menjadi pusat perhatian tanpa taplak meja yang berlebihan. Cukup tambahkan wadah keramik kecil untuk garam kristal atau madu.',
    likes: 162,
    relatedProductIds: ['kriya-03', 'kriya-01']
  },
  {
    id: 'galeri-05',
    title: 'Di Balik Meja Putar: Bengkel Kriya Kasongan',
    category: 'studio',
    categoryLabel: 'Studio & Pengrajin',
    image: '/assets/images/hero_artisanal_studio_1792844458806.jpg',
    aspectRatio: 'aspect-16/9',
    caption: 'Keringat, lempung basah, dan ketelitian hati. Di bengkel kerja berdinding batu ini, setiap lekuk keramik dibentuk pelan-pelan tanpa tergesa. Sebuah penghormatan pada proses pembuatan manual yang kian langka.',
    stylingTip: 'Menghadirkan barang kerajinan ke rumah bukan sekadar dekorasi, melainkan merangkul jiwa pengrajin dan cerita panjang di baliknya.',
    likes: 310,
    relatedProductIds: ['kriya-01', 'kriya-02', 'kriya-06']
  }
];

export const GALLERY_CATEGORIES = [
  { id: 'semua', label: 'Semua Sudut Ruang' },
  { id: 'meja-teh', label: 'Meja Teh & Sarapan' },
  { id: 'sudut-baca', label: 'Sudut Baca Santai' },
  { id: 'ruang-makan', label: 'Dapur & Perjamuan' },
  { id: 'studio', label: 'Studio & Pengrajin' }
];
