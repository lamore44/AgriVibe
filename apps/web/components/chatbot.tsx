"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Leaf, Sparkles, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_QUESTIONS = [
  "Penyakit daun bawang layu disebabkan apa?",
  "Berapa kali pemupukan kentang Sembalun?",
  "Cara membuat kompos tanah vulkanik?",
  "Tips menanam stroberi agar manis?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya AgriVibe AI, asisten penyuluh pertanian digital Anda. Ada yang bisa saya bantu terkait budidaya tanaman, hama, atau perawatan lahan Anda di Sembalun?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Siapkan history untuk dikirim ke API
      const historyPayload = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: historyPayload }),
      });

      if (!res.ok) {
        throw new Error("Gagal mendapatkan respon");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi gangguan koneksi ke asisten AI. Silakan coba sesaat lagi.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-950/95 shadow-glass-lg backdrop-blur-xl animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-agri-700 to-agri-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/10 p-1.5">
                <Leaf className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold flex items-center gap-1">
                  AgriVibe Asisten AI <Sparkles className="h-3 w-3 text-amber-300" />
                </h4>
                <p className="text-[10px] text-white/80">Penyuluh Pertanian Sembalun</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-agri-600 text-white rounded-br-none"
                      : "bg-white/5 border border-white/10 text-slate-200 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-slate-400 rounded-bl-none">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-agri-400" />
                  <span>AgriVibe sedang mengetik...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 border-t border-white/5 bg-slate-900/40">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                Pertanyaan Populer:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-300 hover:border-agri-400/30 hover:bg-agri-500/10 hover:text-agri-300 transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3 bg-slate-900/60"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan masalah pertanian..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-agri-400/40 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-agri-400/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-xl bg-gradient-to-r from-agri-600 to-agri-500 p-2 text-white shadow shadow-agri-600/25 transition-all hover:from-agri-500 hover:to-agri-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-agri-600 to-agri-500 text-white shadow-lg shadow-agri-600/30 transition-all duration-300 hover:scale-105 hover:from-agri-500 hover:to-agri-400 active:scale-95 relative group"
      >
        <span className="absolute -inset-1 rounded-full bg-agri-500/20 opacity-70 group-hover:animate-ping duration-1000" />
        {isOpen ? <X className="h-6 w-6 relative z-10" /> : <MessageSquare className="h-6 w-6 relative z-10" />}
      </button>
    </div>
  );
}
