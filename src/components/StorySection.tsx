import React from 'react';
import { Sparkles, HeartHandshake, Compass, Trees, Hammer, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StorySectionProps {
  onOpenArtisanPortal?: () => void;
}

export const StorySection: React.FC<StorySectionProps> = ({ onOpenArtisanPortal }) => {
  const { language } = useLanguage();

  return (
    <section id="filosofi" className="py-16 lg:py-24 bg-[#FAF7F2] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs font-semibold text-[#8C533C] tracking-widest uppercase mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Studio Stories & Ethics' : 'Kisah & Etika Studio'}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#2C221E] tracking-tight">
            {language === 'en'
              ? 'Reviving the Soul of Indonesian Heritage Handcrafts'
              : 'Menghidupkan Kembali Ruh Kerajinan Tangan Nusantara'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#61574F] leading-relaxed">
            {language === 'en'
              ? 'In an era of mass plastic production, we choose to walk slowly. Each ceramic mug, teak tray, and natural fiber basket is born from the patient hands of rural artisans who respect the rhythms of nature.'
              : 'Di zaman serba instan dan produksi massal plastik, kami memilih berjalan perlahan. Setiap cangkir keramik, baki jati, dan anyaman serat alam lahir dari tangan-tangan sabar di pelosok desa yang menghormati ritme alam.'}
          </p>
        </div>

        {/* 3 Philosophy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-white rounded-2xl border border-[#E8DFD5] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#F2EAE1] flex items-center justify-center text-[#8C533C] mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C221E] mb-2">
              {language === 'en' ? '01. Mindful Slow Crafting' : '01. Ritme Lambat & Penuh Kesadaran'}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              {language === 'en'
                ? 'Clay requires days to settle, teak wood is naturally air-cured, and fibers are twined strand by strand. This serene process infuses deep tranquility into each piece.'
                : 'Tanah liat butuh diendapkan berhari-hari, kayu jati harus diangin-anginkan agar kering sempurna, dan anyaman dipilin helai demi helai. Ketenangan proses ini meresap ke dalam wujud fisik barang.'}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#E8DFD5] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#F2EAE1] flex items-center justify-center text-[#8C533C] mb-4">
              <Trees className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C221E] mb-2">
              {language === 'en' ? '02. Sustainable Natural Materials' : '02. Keberlanjutan Bahan Alam'}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              {language === 'en'
                ? 'Using legally certified teak, coastal wild seagrass harvested with care, and lead-free natural mineral glazes safe for every family member.'
                : 'Menggunakan kayu jati legal perhutani, serat lamun liar pesisir selatan yang dipanen ramah lingkungan, serta glasir mineral bebas timbal yang aman untuk seluruh anggota keluarga.'}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#E8DFD5] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#F2EAE1] flex items-center justify-center text-[#8C533C] mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C221E] mb-2">
              {language === 'en' ? '03. Fair Trade & Lasting Partnership' : '03. Kemitraan Adil & Lestari'}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              {language === 'en'
                ? 'We partner side-by-side with independent artisan collectives in Bantul, Tasikmalaya, and Jepara with upfront fair living compensation.'
                : 'Kami bekerja berdampingan dengan komunitas pengrajin independen di Bantul, Tasikmalaya, dan Jepara dengan pembayaran harga adil di muka untuk menjamin kesejahteraan keluarga pengrajin.'}
            </p>
          </div>
        </div>

        {/* Highlight Quote Box with Artisan Portal CTA */}
        <div className="bg-[#2C221E] text-[#FAF7F2] rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto relative overflow-hidden space-y-6">
          <p className="font-serif text-lg sm:text-2xl font-light italic leading-relaxed text-balance">
            {language === 'en'
              ? '"Goods crafted with human patience carry a serene warmth and life that no automated factory mold can ever reproduce."'
              : '"Barang yang dibuat dengan kesabaran tangan manusia membawa kehangatan dan ketenteraman yang tak akan pernah bisa ditiru oleh cetakan mesin pabrik."'}
          </p>
          <div className="text-xs tracking-widest uppercase text-[#D9C3B0] font-semibold">
            {language === 'en'
              ? '— Wayan Sujana, Kasongan Heritage Ceramist'
              : '— Wayan Sujana, Pengrajin Tembikar Kasongan'}
          </div>

          {onOpenArtisanPortal && (
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs text-[#D9C3B0]">
                {language === 'en' ? 'Are you a local heritage craft artisan?' : 'Apakah Anda seorang pengrajin kriya lokal?'}
              </span>
              <button
                onClick={onOpenArtisanPortal}
                className="px-4 py-2 bg-[#8C533C] hover:bg-[#A36248] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>
                  {language === 'en'
                    ? 'Enter Artisan Portal (Log In & Submit Crafts)'
                    : 'Masuk ke Portal Pengrajin (Log In & Tawarkan Kriya)'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
