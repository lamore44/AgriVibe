"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Cpu, Info, Leaf, Users, Github, BarChart3 } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-aurora opacity-80" />
      <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-agri-500/15 blur-[120px]" />
      <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-earth-500/15 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-8 pb-8 sm:px-6 md:pb-14 lg:pb-18 space-y-8">
        {/* Navigation back */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>
        </div>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center gap-6">
          <img
            src="/logo.jpg"
            alt="Logo AgriVibe"
            className="h-24 w-24 rounded-[2rem] object-cover border border-white/10 shadow-glass-lg animate-fade-in-up"
          />
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 pl-2 pr-3 py-1 text-xs uppercase tracking-[0.2em] text-agri-300/90">
              <img src="/logo.jpg" alt="Logo AgriVibe" className="h-4 w-4 rounded-full object-cover" />
              Tentang Proyek
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Mengenal <span className="text-agri-400">AgriVibe</span>
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              AgriVibe adalah platform asisten pertanian cerdas digital yang dirancang khusus untuk mendukung petani di kawasan dataran tinggi Kecamatan Sembalun, Lombok Timur dalam mengoptimalkan budidaya tanaman pangan dan hortikultura.
            </p>
          </div>
        </header>

        {/* Content sections in Bento style */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Latar Belakang Sembalun */}
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Leaf className="h-5 w-5 text-agri-400" />
              Latar Belakang Sembalun
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              Kecamatan Sembalun terletak di ketinggian sekitar 1.200 meter di atas permukaan laut (mdpl), tepat di bawah kaki Gunung Rinjani. Dengan tanah vulkanik yang sangat subur dan iklim pegunungan yang sejuk, Sembalun adalah salah satu sentra produksi hortikultura terbesar di Nusa Tenggara Barat (NTB). 
            </p>
            <p className="text-xs leading-relaxed text-slate-300">
              Meskipun demikian, perubahan iklim, fluktuasi cuaca, keterbatasan air di musim kemarau, dan risiko serangan hama memerlukan pendekatan berbasis data agar petani dapat bertani secara efektif dan menguntungkan.
            </p>
          </div>

          {/* Teknologi AI & Logika Fuzzy */}
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Cpu className="h-5 w-5 text-agri-400" />
              Teknologi Cerdas
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              Aplikasi AgriVibe memadukan dua pendekatan cerdas untuk memberikan solusi terbaik:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4">
              <li>
                <strong className="text-white">Fuzzy Logic (Mamdani)</strong>: Digunakan untuk memproses variabel tanah, ketersediaan air, dan faktor musim secara transparan demi menentukan skor kesesuaian lahan secara objektif.
              </li>
              <li>
                <strong className="text-white">Kecerdasan Buatan (Gemini AI)</strong>: Menerjemahkan data lahan, cuaca real-time, dan batasan budget menjadi rekomendasi tanaman yang presisi beserta panduan perawatannya.
              </li>
            </ul>
          </div>
        </div>

        {/* Fitur Utama List */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-agri-400" />
            Fitur Unggulan Proyek
          </h3>
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-100">Kalkulator ROI & Modal</h4>
              <p className="text-slate-400">Petani dapat menghitung perkiraan biaya benih, pupuk, tenaga kerja, serta memproyeksikan keuntungan bersih.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-100">Jadwal Tanam Mingguan</h4>
              <p className="text-slate-400">Kalender tugas interaktif dari masa pembibitan hingga panen yang progresnya tersimpan otomatis.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-100">Chatbot Penyuluh AI</h4>
              <p className="text-slate-400">Konsultasi interaktif kapan saja untuk menanyakan solusi hama penyakit tanaman di Sembalun.</p>
            </div>
          </div>
        </div>

        {/* Statistik Sektor Pertanian BPS */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
            <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-agri-400" />
              Statistik Pertanian Sembalun
            </h3>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Sumber: BPS (Kecamatan Sembalun Dalam Angka 2025)
            </span>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {/* Kentang */}
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-center transition-all hover:bg-white/[0.03] hover:border-white/10">
              <div className="text-xs font-bold text-slate-200">Kentang</div>
              <div className="text-lg font-black text-agri-400 mt-2">1.472 Ton</div>
              <div className="text-[10px] text-slate-500 mt-1">Produksi / Th</div>
              <div className="text-[10px] text-slate-400 border-t border-white/5 mt-2.5 pt-1.5 flex justify-between">
                <span>Luas:</span>
                <span className="font-semibold text-white">118 Ha</span>
              </div>
            </div>

            {/* Bawang Merah */}
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-center transition-all hover:bg-white/[0.03] hover:border-white/10">
              <div className="text-xs font-bold text-slate-200">Bawang Merah</div>
              <div className="text-lg font-black text-sky-400 mt-2">2.979,9 Ton</div>
              <div className="text-[10px] text-slate-500 mt-1">Produksi / Th</div>
              <div className="text-[10px] text-slate-400 border-t border-white/5 mt-2.5 pt-1.5 flex justify-between">
                <span>Luas:</span>
                <span className="font-semibold text-white">390 Ha</span>
              </div>
            </div>

            {/* Bawang Putih */}
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-center transition-all hover:bg-white/[0.03] hover:border-white/10">
              <div className="text-xs font-bold text-slate-200">Bawang Putih</div>
              <div className="text-lg font-black text-teal-400 mt-2">5.822,8 Ton</div>
              <div className="text-[10px] text-slate-500 mt-1">Produksi / Th</div>
              <div className="text-[10px] text-slate-400 border-t border-white/5 mt-2.5 pt-1.5 flex justify-between">
                <span>Luas:</span>
                <span className="font-semibold text-white">416 Ha</span>
              </div>
            </div>

            {/* Stroberi Sembalun */}
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-center transition-all hover:bg-white/[0.03] hover:border-white/10">
              <div className="text-xs font-bold text-slate-200">Stroberi</div>
              <div className="text-lg font-black text-rose-450 mt-2">325 Ton</div>
              <div className="text-[10px] text-slate-500 mt-1">Produksi / Th</div>
              <div className="text-[10px] text-slate-400 border-t border-white/5 mt-2.5 pt-1.5 flex justify-between">
                <span>Luas:</span>
                <span className="font-semibold text-white">39 Ha</span>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 text-right leading-none">
            * Data produksi dan luas panen tahun 2024 berdasarkan publikasi Kecamatan Sembalun Dalam Angka 2025, BPS Kabupaten Lombok Timur.
          </p>
        </div>

        {/* Tim Pengembang */}
        <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-agri-400" />
              Pengembang & Visi Proyek
            </h3>
            <p className="text-xs leading-relaxed text-slate-300 max-w-xl">
              AgriVibe diinisiasi dan dikembangkan secara mandiri sebagai proyek rekayasa perangkat lunak untuk memberdayakan komunitas petani lokal. Melalui platform ini, kami berupaya mendemokrasikan akses ke teknologi pintar guna membantu proses pengambilan keputusan yang lebih baik dalam pertanian hortikultura Sembalun.
            </p>
          </div>
          <div className="flex flex-col gap-3 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-5 text-xs self-stretch md:self-auto md:w-64">
            <div className="text-center space-y-1">
              <p className="text-slate-400">Developer:</p>
              <p className="font-semibold text-white text-sm">Lalu Adittya Pratama Jelindra</p>
              <p className="text-slate-500 text-[10px]">Software Engineer</p>
            </div>
            <a
              href="https://github.com/lamore44"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow hover:shadow-agri-500/10"
            >
              <Github className="h-4 w-4 text-agri-400" />
              @lamore44 di GitHub
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600 border-t border-white/10 pt-6">
          <p>AgriVibe — Asisten Pertanian Cerdas Sembalun, Lombok Timur</p>
        </footer>
      </div>
    </main>
  );
}
