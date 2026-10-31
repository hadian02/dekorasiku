import React, { useState } from 'react';
import { ArrowRight, Check, Hammer, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onOpenArtisanPortal?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenArtisanPortal, onOpenAdmin }) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="bg-[#241C18] text-[#FAF7F2] border-t border-[#3B2F29]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/assets/aistudio/1000297830_4688d260.png"
                alt="dekorasiku"
                className="h-8 w-auto object-contain brightness-125"
              />
            </div>
            <p className="text-xs sm:text-sm text-[#B3A89F] leading-relaxed max-w-sm">
              {language === 'en'
                ? 'Curated Indonesian home decor and craft atelier. Connecting the warmth of local artisan hands with modern living spaces.'
                : 'Studio kurasi dekorasi ruang dan kriya lokal nusantara. Menghadirkan kehangatan sentuhan tangan pengrajin dengan estetika hunian modern Anda.'}
            </p>
            <div className="text-xs text-[#8C7D73] pt-2">
              Studio & Galeri: Jl. Kasongan No. 42, Bantul, D.I. Yogyakarta 55184
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <div className="font-bold uppercase tracking-wider text-[#D9C3B0] mb-2">
              {language === 'en' ? 'Collection Navigation' : 'Navigasi Koleksi'}
            </div>
            <ul className="space-y-2 text-[#B3A89F]">
              <li>
                <a href="#koleksi" className="hover:text-white transition-colors">
                  {language === 'en' ? 'Kasongan Ceramics & Pottery' : 'Keramik & Tembikar Kasongan'}
                </a>
              </li>
              <li>
                <a href="#koleksi" className="hover:text-white transition-colors">
                  {language === 'en' ? 'Seagrass & Rattan Weaving' : 'Anyaman Serat Lamun & Rotan'}
                </a>
              </li>
              <li>
                <a href="#koleksi" className="hover:text-white transition-colors">
                  {language === 'en' ? 'Solid Teak Wood Furniture' : 'Perabot Kayu Jati Utuh'}
                </a>
              </li>
              <li>
                <a href="#galeri" className="hover:text-white transition-colors">
                  {language === 'en' ? 'Aesthetic Lookbook Gallery' : 'Galeri Foto Lookbook Estetik'}
                </a>
              </li>
              <li>
                <a href="#filosofi" className="hover:text-white transition-colors">
                  {language === 'en' ? 'Artisan Stories & Fair Trade' : 'Kisah Pengrajin & Kemitraan'}
                </a>
              </li>
              {onOpenArtisanPortal && (
                <li className="pt-2 border-t border-white/10">
                  <button
                    onClick={onOpenArtisanPortal}
                    className="text-[#D9C3B0] hover:text-white flex items-center gap-1.5 font-semibold transition-colors cursor-pointer text-xs"
                  >
                    <Hammer className="w-3.5 h-3.5 text-[#8C533C]" />
                    <span>{language === 'en' ? 'Artisan Portal (mitra.* / pengrajin.*)' : 'Portal Pengrajin (Subdomain mitra.* / pengrajin.*)'}</span>
                  </button>
                </li>
              )}
              {onOpenAdmin && (
                <li className="pt-1.5">
                  <button
                    onClick={onOpenAdmin}
                    className="text-[#D9C3B0] hover:text-white flex items-center gap-1.5 font-semibold transition-colors cursor-pointer text-xs"
                    title="Subdomain khusus: admin.dekorasiku.vercel.app"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'en' ? 'Administrator Portal (admin.*)' : 'Portal Administrator (admin.* Terproteksi)'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter / Surat Kabar Kriya */}
          <div className="md:col-span-4 space-y-3">
            <div className="font-bold uppercase tracking-wider text-[#D9C3B0] mb-1">
              {language === 'en' ? 'Studio Stories & News' : 'Warta & Cerita Studio'}
            </div>
            <p className="text-xs text-[#B3A89F] leading-relaxed">
              {language === 'en'
                ? 'Get notified on limited collection releases, behind-the-scenes artisan workshop stories, and craft exhibition invitations.'
                : 'Dapatkan kabar peluncuran koleksi terbatas, cerita di balik bengkel pengrajin, dan undangan workshop kerajinan tangan.'}
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex gap-2">
              <input
                type="email"
                required
                placeholder={language === 'en' ? 'Your email address...' : 'Alamat email Anda...'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-[#2E2420] text-[#FAF7F2] border border-[#483A32] rounded-lg focus:outline-none focus:border-[#8C533C] placeholder:text-[#7A7067]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Subscribed' : 'Terdaftar'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'en' ? 'Subscribe' : 'Langganan'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] text-[#A5C9A1]">
                {language === 'en'
                  ? 'Thank you! We have added you to our studio dispatch.'
                  : 'Terima kasih! Kami telah mencatat email Anda untuk warta hangat berikutnya.'}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#3B2F29] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A7067] gap-3">
          <div>
            © {new Date().getFullYear()} dekorasiku. {language === 'en' ? 'All rights reserved.' : 'Seluruh hak cipta dilindungi.'}
          </div>
          <div className="flex items-center gap-4 text-[#8C7D73]">
            <span>{language === 'en' ? '100% Indonesian Handcrafted Heritage' : '100% Buatan Tangan Lokal Nusantara'}</span>
            <span aria-hidden="true">·</span>
            <span>{language === 'en' ? 'Eco-Friendly Packaging' : 'Kemasan Ramah Lingkungan'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
