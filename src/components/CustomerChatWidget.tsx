import React, { useState, useEffect, useRef } from 'react';
import { Customer, ChatMessage, OrderDetails } from '../types';
import { MessageCircle, X, Send, Sparkles, CheckCheck, Clock, User, ShieldCheck } from 'lucide-react';

interface CustomerChatWidgetProps {
  customer: Customer | null;
  messages: ChatMessage[];
  orders: OrderDetails[];
  isOpenControlled?: boolean;
  initialOrderId?: string;
  onToggleOpen?: (open: boolean) => void;
  onSendMessage: (text: string, orderId?: string) => void;
  onOpenAuth: () => void;
}

const QUICK_PROMPTS = [
  'Kapan kriya saya mulai dikirim?',
  'Apakah glasir keramik aman untuk microwave?',
  'Bisa request tulisan tangan di kartu ucapan?',
  'Bagaimana panduan merawat baki kayu jati?',
];

export const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({
  customer,
  messages,
  orders,
  isOpenControlled,
  initialOrderId,
  onToggleOpen,
  onSendMessage,
  onOpenAuth,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;
  const setIsOpen = (open: boolean) => {
    setInternalOpen(open);
    if (onToggleOpen) onToggleOpen(open);
  };

  const [inputText, setInputText] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
      setIsOpen(true);
    }
  }, [initialOrderId]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current logged-in customer
  const customerMessages = customer
    ? messages.filter(
        (m) =>
          m.customerId === customer.id ||
          m.customerEmail.toLowerCase() === customer.email.toLowerCase()
      )
    : [];

  const unreadCount = customerMessages.filter(
    (m) => m.sender === 'admin' && !m.read
  ).length;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [customerMessages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), selectedOrderId || undefined);
    setInputText('');
  };

  const handleQuickPromptClick = (prompt: string) => {
    onSendMessage(prompt, selectedOrderId || undefined);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#2C221E] hover:bg-[#8C533C] text-white rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C533C]"
        aria-label="Buka Chat Room Customer"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 transition-transform group-hover:rotate-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#8C533C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold hidden sm:inline">
          {isOpen ? 'Tutup Chat' : 'Tanya Studio'}
        </span>
      </button>

      {/* Chat Room Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[520px] bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8DFD5] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#2C221E] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#8C533C] flex items-center justify-center font-serif font-bold text-sm text-[#FAF7F2]">
                  KK
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#2C221E]" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold leading-tight">
                  Studio Kala Kriya
                </h3>
                <p className="text-[11px] text-[#D9C3B0] flex items-center gap-1">
                  <span>Tim Kriya Sedang Online</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#D9C3B0] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup Obrolan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conditional Body: Not Signed In vs Signed In */}
          {!customer ? (
            /* Sign In Prompt */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-[#FAF7F2]">
              <div className="w-14 h-14 rounded-full bg-[#F2EAE1] text-[#8C533C] flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#2C221E]">
                  Silakan Masuk (Sign In)
                </h4>
                <p className="text-xs text-[#7A7067] mt-1 max-w-xs leading-relaxed">
                  Ruang chat studio eksklusif terhubung dengan akun customer Anda untuk menanyakan pesanan, kriya kustom, dan panduan perawatan.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuth();
                }}
                className="px-5 py-2.5 bg-[#8C533C] hover:bg-[#73432F] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Masuk / Daftar Akun
              </button>
            </div>
          ) : (
            /* Active Chat Room for Signed-in Customer */
            <div className="flex-1 flex flex-col min-h-0 bg-[#FAF7F2]">
              {/* Order Reference Attachment Bar */}
              {orders.length > 0 && (
                <div className="px-3 py-1.5 bg-[#F2EAE1] border-b border-[#E8DFD5] flex items-center justify-between text-[11px] text-[#61574F]">
                  <span className="font-semibold text-[#8C533C]">Tautkan Pesanan:</span>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="text-[11px] bg-white border border-[#E8DFD5] rounded px-2 py-0.5 text-[#2C221E] focus:outline-none"
                  >
                    <option value="">(Tanpa referensi pesanan)</option>
                    {orders.map((o) => (
                      <option key={o.orderId} value={o.orderId}>
                        {o.orderId} - {o.customerName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {/* Intro notice */}
                <div className="text-center py-2">
                  <span className="text-[10px] text-[#7A7067] bg-white px-2.5 py-1 rounded-full border border-[#E8DFD5]">
                    Percakapan langsung dengan Atelier Kala Kriya
                  </span>
                </div>

                {customerMessages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#7A7067]">
                    Belum ada pesan. Ketik pertanyaan Anda atau pilih pertanyaan cepat di bawah.
                  </div>
                ) : (
                  customerMessages.map((msg) => {
                    const isMe = msg.sender === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-[#8C533C] text-white rounded-br-xs'
                              : 'bg-white text-[#2C221E] border border-[#E8DFD5] rounded-bl-xs'
                          }`}
                        >
                          {!isMe && (
                            <div className="font-serif font-bold text-[11px] text-[#8C533C] mb-1">
                              {msg.senderName}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          {msg.orderId && (
                            <div
                              className={`mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded inline-block ${
                                isMe ? 'bg-black/20 text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#8C533C] border border-[#E8DFD5]'
                              }`}
                            >
                              Ref: Pesanan #{msg.orderId}
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-[#A89F95] mt-0.5 px-1 flex items-center gap-1">
                          <span>{msg.timestamp}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-[#8C533C]" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-white/70 border-t border-[#E8DFD5] overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPromptClick(p)}
                    className="text-[11px] text-[#61574F] bg-white hover:bg-[#F2EAE1] hover:text-[#2C221E] px-2.5 py-1 rounded-full border border-[#E8DFD5] transition-colors shrink-0"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-white border-t border-[#E8DFD5] flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ketik pesan untuk tim kriya..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl focus:outline-none focus:border-[#8C533C] placeholder:text-[#A89F95]"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-[#8C533C] hover:bg-[#73432F] disabled:opacity-40 text-white rounded-xl transition-all shrink-0 active:scale-95"
                  aria-label="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};
