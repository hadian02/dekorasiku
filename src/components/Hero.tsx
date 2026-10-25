import React from 'react';
import { ArrowDown, Sparkles, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onGalleryClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onGalleryClick }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Grid Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Column 1: Editorial Brand Message */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="text-xs font-semibold text-[#8C533C] tracking-widest uppercase mb-4">
              Kurasi Kriya Nusantara · Sejak 2021
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#2C221E] leading-[1.18] mb-6 text-balance">
              Kerajinan tangan berjiwa, menghangatkan sudut rumah Anda.
            </h1>

            <p className="text-base sm:text-lg text-[#61574F] leading-relaxed mb-8 max-w-xl">
              Setiap cangkir tembikar, anyaman serat laut, dan baki kayu jati dibentuk dengan ketelatenan tangan pengrajin lokal nusantara. Menghadirkan ketenangan alami dalam setiap momen santai di rumah.
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#8C533C] hover:bg-[#73432F] text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Jelajahi Koleksi</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
              
              <button
                onClick={onGalleryClick}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#F2EAE1] hover:bg-[#E8DFD5] text-[#2C221E] font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 border border-[#E0D5C9]"
              >
                <span>Lihat Galeri Estetik</span>
                <Sparkles className="w-4 h-4 text-[#8C533C]" />
              </button>
            </div>

            {/* Quiet Curator Note */}
            <div className="mt-8 pt-6 border-t border-[#E8DFD5] flex items-center gap-4 text-xs text-[#7A7067]">
              <span className="font-semibold text-[#2C221E]">420+ Karya Terkurasi</span>
              <span aria-hidden="true">·</span>
              <span>18 Komunitas Pengrajin</span>
              <span aria-hidden="true">·</span>
              <span>100% Kemasan Ramah Lingkungan</span>
            </div>
          </div>

          {/* Column 2: Atmospheric Studio Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5DACD] bg-[#F2ECE3] shadow-lg group">
              <img
                src="/src/assets/images/hero_artisanal_studio_1792844458806.jpg"
                alt="Suasana studio pembuatan tembikar dan kerajinan tangan hangat"
                className="w-full h-[360px] sm:h-[460px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E]/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Image caption card inside frame */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-[#E8DFD5]/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#8C533C] font-semibold tracking-wide">
                    BENGKEL BANTUL & TASIKMALAYA
                  </div>
                  <div className="text-sm font-serif font-bold text-[#2C221E]">
                    Sentuhan Tangan, Bukan Mesin Pabrik
                  </div>
                </div>
                <span className="text-xs text-[#61574F] bg-[#FAF7F2] px-2.5 py-1 rounded border border-[#E8DFD5]">
                  Edisi Musim Gugur
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Trust Markers Full-Width Row below Hero */}
        <div id="garansi" className="mt-14 pt-8 border-t border-[#E8DFD5] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#F2EAE1] rounded-lg text-[#8C533C] shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2C221E]">Karya Asli Pengrajin</div>
              <div className="text-xs text-[#7A7067] mt-0.5 leading-relaxed">
                Langsung dari tangan seniman kriya lokal nusantara.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#F2EAE1] rounded-lg text-[#8C533C] shrink-0 mt-0.5">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2C221E]">Bahan Alami & Lestari</div>
              <div className="text-xs text-[#7A7067] mt-0.5 leading-relaxed">
                Tanah liat, serat lamun, dan jati tanpa zat kimia beracun.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#F2EAE1] rounded-lg text-[#8C533C] shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2C221E]">Garansi Ganti Pecah</div>
              <div className="text-xs text-[#7A7067] mt-0.5 leading-relaxed">
                Kemasan pelindung ekstra, gratis ganti baru bila retak saat kirim.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#F2EAE1] rounded-lg text-[#8C533C] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2C221E]">Kurasi Estetik Cozy</div>
              <div className="text-xs text-[#7A7067] mt-0.5 leading-relaxed">
                Setiap item dirancang untuk menciptakan kehangatan ruang.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
