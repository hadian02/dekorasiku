import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminAuthGateProps {
  onAuthenticated: () => void;
  onBackToStore?: () => void;
  isSubdomain?: boolean;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onAuthenticated,
  onBackToStore,
  isSubdomain = false,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  // Get current admin password from localStorage or default to 'admin123'
  const getStoredPassword = (): string => {
    return localStorage.getItem('kala_kriya_admin_pwd') || 'admin123';
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetPassword = getStoredPassword();

    if (passwordInput === targetPassword) {
      sessionStorage.setItem('kala_kriya_admin_auth', 'true');
      onAuthenticated();
    } else {
      setErrorMsg('Kata sandi administrator salah. Silakan periksa kembali.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    localStorage.setItem('kala_kriya_admin_pwd', newPassword);
    setChangeSuccess('Kata sandi admin berhasil diperbarui!');
    setShowChangePassword(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setChangeSuccess(null), 4000);
  };

  const currentHost = typeof window !== 'undefined' ? window.location.host : '';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col justify-between selection:bg-[#DECBB7] selection:text-[#2C221E] px-4 py-8">
      {/* Top Bar Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        {onBackToStore ? (
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#7A7067] hover:text-[#2C221E] transition-colors bg-white px-3.5 py-2 rounded-xl border border-[#E8DFD5] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Toko Utama</span>
          </button>
        ) : (
          <a
            href={
              typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')
                ? window.location.origin.replace('//admin.', '//')
                : '/'
            }
            className="inline-flex items-center gap-2 text-xs font-medium text-[#7A7067] hover:text-[#2C221E] transition-colors bg-white px-3.5 py-2 rounded-xl border border-[#E8DFD5] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Toko Utama ({currentHost.replace('admin.', '') || 'dekorasiku.vercel.app'})</span>
          </a>
        )}

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8C533C] bg-[#F2EAE1] px-2.5 py-1 rounded-lg border border-[#E0D3C5]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Akses Terproteksi</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xl relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8C533C] via-[#DECBB7] to-[#8C533C]" />

          {/* Header */}
          <div className="text-center space-y-2 mb-7">
            <div className="w-14 h-14 bg-[#F2EAE1] text-[#8C533C] rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-[#E0D3C5]/60">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C533C]">
                Portal Kurator & Administrator
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#2C221E]">
                Kala Kriya Atelier
              </h1>
            </div>
            <p className="text-xs text-[#7A7067] max-w-xs mx-auto leading-relaxed">
              Halaman ini dikhususkan untuk tim pengelola guna memverifikasi pesanan, kurasi pengrajin, dan pemantauan transaksi.
            </p>
          </div>

          {/* Subdomain Notice */}
          <div className="bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl p-3 mb-5 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-[#8C533C] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#61574F] leading-snug">
              <span className="font-semibold text-[#2C221E] block">Subdomain Khusus Admin:</span>
              <code className="text-[#8C533C] font-mono font-medium">
                {isSubdomain ? currentHost : 'admin.dekorasiku.vercel.app'}
              </code>
            </div>
          </div>

          {/* Success Notification */}
          {changeSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{changeSuccess}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Password Form */}
          {!showChangePassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1.5">
                  Kata Sandi Admin
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Masukkan sandi..."
                    autoFocus
                    required
                    className="w-full pl-3.5 pr-10 py-3 text-sm bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C] focus:bg-white transition-all text-[#2C221E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7067] hover:text-[#2C221E] transition-colors p-1"
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Default Password Hint for Testing */}
              <div className="bg-[#F9F6F0] p-3 rounded-xl border border-[#EAE3DA] flex items-center justify-between text-[11px]">
                <span className="text-[#7A7067]">Kata Sandi Default Pengujian:</span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('admin123')}
                  className="font-mono font-bold text-[#8C533C] hover:underline bg-white px-2 py-0.5 rounded border border-[#E0D3C5]"
                >
                  admin123
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#8C533C] hover:bg-[#73432F] active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Masuk ke Dashboard Kurator</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(true);
                    setErrorMsg(null);
                  }}
                  className="text-xs text-[#7A7067] hover:text-[#8C533C] underline transition-colors"
                >
                  Ubah Kata Sandi Admin?
                </button>
              </div>
            </form>
          ) : (
            /* Change Password Sub-form */
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="text-xs font-semibold text-[#2C221E] border-b border-[#E8DFD5] pb-2">
                Perbarui Kata Sandi Administrator
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">
                  Kata Sandi Baru (min. 6 karakter)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik kata sandi baru..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C] focus:bg-white transition-all text-[#2C221E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C] focus:bg-white transition-all text-[#2C221E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setErrorMsg(null);
                  }}
                  className="flex-1 py-2.5 border border-[#E8DFD5] text-xs font-semibold text-[#7A7067] hover:bg-[#FAF7F2] rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#8C533C] text-xs font-semibold text-white rounded-xl hover:bg-[#73432F] transition-all"
                >
                  Simpan Sandi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-[#A89F91] pt-6">
        &copy; {new Date().getFullYear()} Kala Kriya Atelier. Hak Akses Terbatas.
      </div>
    </div>
  );
};
