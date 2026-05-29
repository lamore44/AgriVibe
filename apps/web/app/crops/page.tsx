"use client";

import { useState } from "react";
import { Search, Sprout, Leaf, Bug, TrendingUp, ShieldAlert, Thermometer, MapPin, Calendar, Compass, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CROPS_DATABASE, type CropDetail } from "@/lib/crops-db";

type ActiveTab = "profil" | "hama" | "harga";

export default function CropsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"semua" | "buah" | "sayuran" | "perkebunan">("semua");
  const [selectedCrop, setSelectedCrop] = useState<CropDetail>(CROPS_DATABASE[0]);
  const [activeDetailTab, setActiveDetailTab] = useState<ActiveTab>("profil");

  // Filter tanaman berdasarkan pencarian & kategori
  const filteredCrops = CROPS_DATABASE.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.hama.some(h => h.nama.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "semua" || crop.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Ganti tanaman terpilih & reset tab detail ke 'profil'
  const handleSelectCrop = (crop: CropDetail) => {
    setSelectedCrop(crop);
    setActiveDetailTab("profil");
  };

  // Mencari harga maksimum untuk skala grafik batang
  const maxPrice = Math.max(...selectedCrop.priceTrends.map(t => t.harga));

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-aurora opacity-80" />
      <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-agri-500/15 blur-[120px]" />
      <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-earth-500/15 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 pb-8 sm:px-6 md:pb-14 lg:pb-18 space-y-8">
        
        {/* Navigation & Title */}
        <div className="space-y-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
            </Link>
          </div>

          <header className="space-y-2 text-slate-150">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 pl-2 pr-3 py-1 text-[10px] uppercase tracking-[0.2em] text-agri-450 font-semibold">
              <Sprout className="h-3.5 w-3.5" />
              Wikipedia Mini
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Direktori Tanaman <span className="text-agri-400">Sembalun</span>
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-350 leading-relaxed">
              Temukan informasi mendalam, panduan tanam lokal, pestisida organik ramah lingkungan, serta grafik tren harga pasar untuk komoditas hortikultura unggulan di Sembalun.
            </p>
          </header>
        </div>

        {/* Pencarian dan Filter Kategori */}
        <div className="glass-card p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Input Cari */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari tanaman, nama ilmiah, jenis hama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 py-2.5 w-full text-xs sm:text-sm"
            />
          </div>

          {/* Kategori Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(["semua", "buah", "sayuran", "perkebunan"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-agri-500/20 text-agri-400 border border-agri-500/30"
                    : "text-slate-400 hover:text-white border border-transparent bg-white/[0.02] hover:bg-white/5"
                }`}
              >
                {cat === "semua" ? "Semua" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Daftar Kartu Tanaman (Master) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Daftar Tanaman ({filteredCrops.length})
            </h2>

            {filteredCrops.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                {filteredCrops.map((crop) => {
                  const isSelected = selectedCrop.id === crop.id;
                  return (
                    <button
                      key={crop.id}
                      onClick={() => handleSelectCrop(crop)}
                      className={`glass-card p-3.5 flex items-center gap-4 text-left transition-all w-full group cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                        isSelected
                          ? "border-agri-500/40 bg-agri-500/[0.05] shadow-[0_0_12px_rgba(34,197,94,0.08)]"
                          : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* Gambar Preview */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-slate-900">
                        <div className="w-full h-full overflow-hidden" style={{ transform: "scale(1.16)" }}>
                          <img
                            src={crop.image}
                            alt={crop.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                      </div>

                      {/* Detail Singkat */}
                      <div className="space-y-1 overflow-hidden">
                        <h3 className="font-semibold text-sm text-white group-hover:text-agri-450 transition-colors truncate">
                          {crop.name}
                        </h3>
                        <p className="text-[10px] italic text-slate-500 truncate">
                          {crop.scientificName}
                        </p>
                        <div className="flex items-center gap-3 text-[9px] text-slate-400">
                          <span className="flex items-center gap-0.5 shrink-0">
                            <MapPin className="h-2.5 w-2.5 text-agri-500" />
                            {crop.dusunSentra.split(",")[0]}
                          </span>
                          <span className="flex items-center gap-0.5 shrink-0">
                            <Compass className="h-2.5 w-2.5 text-sky-500" />
                            {crop.ketinggian.split(" ")[0]} mdpl
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-slate-500 text-xs flex flex-col items-center">
                <HelpCircle className="h-8 w-8 mb-2 text-slate-600 animate-pulse" />
                Tanaman tidak ditemukan. Coba gunakan kata kunci pencarian yang lain.
              </div>
            )}
          </div>

          {/* Kolom Kanan: Detail Panel Tanaman (Detail) */}
          <div className="lg:col-span-7">
            {selectedCrop && (
              <div className="glass-card overflow-hidden animate-fade-in-up">
                {/* Header Detail */}
                <div className="relative h-44 w-full overflow-hidden border-b border-white/10 bg-slate-950 flex items-end p-5">
                  {/* Backdrop Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-80" 
                    style={{ 
                      backgroundImage: `url(${selectedCrop.image})`,
                      transform: "scale(1.16)"
                    }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Judul Detail */}
                  <div className="relative z-10 space-y-1">
                    <span className="rounded-full bg-agri-500/20 border border-agri-500/30 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-agri-300">
                      {selectedCrop.category}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-white leading-tight">
                      {selectedCrop.name}
                    </h2>
                    <p className="text-[11px] italic text-slate-350">
                      {selectedCrop.scientificName}
                    </p>
                  </div>
                </div>

                {/* Tab Kontrol Detail */}
                <div className="flex border-b border-white/10 bg-slate-950/45 px-3">
                  {([
                    { id: "profil", label: "Profil & Tanam", icon: <Leaf className="h-3.5 w-3.5" /> },
                    { id: "hama", label: "Hama & Solusi", icon: <Bug className="h-3.5 w-3.5" /> },
                    { id: "harga", label: "Tren Harga", icon: <TrendingUp className="h-3.5 w-3.5" /> },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveDetailTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                        activeDetailTab === t.id
                          ? "border-agri-450 text-agri-400 bg-white/[0.01]"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Konten Tab Detail */}
                <div className="p-5 sm:p-6 min-h-[300px]">
                  
                  {/* 1. Tab Profil */}
                  {activeDetailTab === "profil" && (
                    <div className="space-y-6 animate-fade-in-up">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Tentang Tanaman
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
                          {selectedCrop.deskripsi}
                        </p>
                      </div>

                      <div className="grid gap-4 grid-cols-2">
                        <InfoItem
                          icon={<MapPin className="h-4 w-4 text-agri-400" />}
                          label="Dusun Sentra"
                          value={selectedCrop.dusunSentra}
                        />
                        <InfoItem
                          icon={<Compass className="h-4 w-4 text-sky-400" />}
                          label="Ketinggian Ideal"
                          value={selectedCrop.ketinggian}
                        />
                        <InfoItem
                          icon={<Thermometer className="h-4 w-4 text-rose-450" />}
                          label="Suhu Optimal"
                          value={selectedCrop.suhu}
                        />
                        <InfoItem
                          icon={<Calendar className="h-4 w-4 text-indigo-400" />}
                          label="Jarak & Masa Panen"
                          value={`${selectedCrop.jarakTanam} • ${selectedCrop.masaTanam}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. Tab Hama & Solusi */}
                  {activeDetailTab === "hama" && (
                    <div className="space-y-5 animate-fade-in-up">
                      <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-3 text-xs text-teal-300 leading-relaxed">
                        💡 <strong>Saran Ramah Lingkungan:</strong> Utamakan pengendalian biologi dan pestisida hayati/nabati lokal untuk menjaga kelestarian tanah subur vulkanik Sembalun.
                      </div>

                      <div className="space-y-4">
                        {selectedCrop.hama.map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-white/5 bg-white/[0.01] p-4 space-y-2.5 transition-all hover:bg-white/[0.02]"
                          >
                            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                              <ShieldAlert className="h-4 w-4 text-rose-400" />
                              {item.nama}
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2 text-xs">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  Gejala Serangan:
                                </span>
                                <p className="text-slate-350 leading-relaxed text-[11px]">{item.gejala}</p>
                              </div>
                              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0 sm:pl-3">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-teal-500">
                                  Solusi Organik Sembalun:
                                </span>
                                <p className="text-teal-200/90 leading-relaxed text-[11px]">{item.solusiOrganik}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Tab Tren Harga */}
                  {activeDetailTab === "harga" && (
                    <div className="space-y-6 animate-fade-in-up">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Tren Fluktuasi Pasar
                          </h4>
                          <p className="text-xs text-slate-350">
                            {selectedCrop.id === "bawang_merah" || selectedCrop.id === "kopi"
                              ? "Harga rata-rata produsen (tingkat petani) di Lombok Timur"
                              : selectedCrop.id === "kentang" || selectedCrop.id === "wortel"
                              ? "Harga rata-rata konsumen perdesaan di Lombok Timur"
                              : "Harga rata-rata eceran agrowisata di Sembalun"}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                          {selectedCrop.id === "stroberi"
                            ? "Sumber: Estimasi Lapangan 2024"
                            : "Sumber: BPS Lombok Timur 2024"}
                        </span>
                      </div>

                      {/* Bar Chart Historis Murni CSS */}
                      <div className="space-y-3.5">
                        {selectedCrop.priceTrends.map((trend) => {
                          const percentage = (trend.harga / maxPrice) * 100;
                          return (
                            <div key={trend.bulan} className="flex items-center gap-3 text-xs">
                              {/* Nama Bulan */}
                              <span className="w-8 text-slate-400 font-semibold text-right shrink-0">
                                {trend.bulan}
                              </span>
                              {/* Batang Grafik */}
                              <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden relative">
                                <div
                                  className="h-full rounded bg-gradient-to-r from-agri-600/80 to-agri-450/80 transition-all duration-500 flex items-center justify-end pr-2"
                                  style={{ width: `${percentage}%` }}
                                >
                                  {/* Tampilkan label harga jika persentase cukup lebar */}
                                  {percentage > 25 && (
                                    <span className="text-[9px] font-bold text-white leading-none">
                                      Rp {trend.harga.toLocaleString("id-ID")}
                                    </span>
                                  )}
                                </div>
                                {/* Fallback label harga jika persentase terlalu sempit */}
                                {percentage <= 25 && (
                                  <span className="absolute left-[calc(percentage+8px)] top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-350 ml-2">
                                    Rp {trend.harga.toLocaleString("id-ID")}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-slate-500 leading-normal">
                        * Catatan: Harga sangat dipengaruhi oleh cuaca, kegagalan panen nasional, serta volume kunjungan wisatawan agro (terutama untuk Stroberi).
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 flex items-start gap-3 transition-all hover:bg-white/[0.02]">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="space-y-0.5 overflow-hidden">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
          {label}
        </span>
        <span className="text-xs text-slate-200 font-semibold leading-relaxed block break-words">
          {value}
        </span>
      </div>
    </div>
  );
}
