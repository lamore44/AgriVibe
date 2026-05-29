"use client";

import { Sparkles, Leaf, Mountain } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import LandForm, { type LandFormData } from "@/components/land-form";
import CropCard, { type CropItemData } from "@/components/crop-card";
import WeatherWidget from "@/components/weather-widget";
import SuitabilityGauge from "@/components/suitability-gauge";
import FuzzyDetails from "@/components/fuzzy-details";
import PlantingCalendar from "@/components/planting-calendar";
import Chatbot from "@/components/chatbot";
import HistoryPanel, {
  type HistoryEntry,
  loadHistory,
  saveHistoryEntry,
  clearHistory,
} from "@/components/history-panel";

type RecommendResponse = {
  recommendations: CropItemData[];
  tips_umum: string;
  source: string;
  suitability_score: number;
  suitability_label: string;
  soil_score: number;
  water_score: number;
  season_factor: number;
  soil_membership: { poor: number; fair: number; rich: number };
  water_membership: { scarce: number; decent: number; ample: number };
  rules_fired: Array<{ name: string; rule_text: string; value: number }>;
};

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [submittedData, setSubmittedData] = useState<LandFormData | null>(null);
  const [activeCalendarCrop, setActiveCalendarCrop] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleSubmit = useCallback(async (data: LandFormData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSubmittedData(data);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || "Gagal mendapatkan rekomendasi");
      }

      const json: RecommendResponse = JSON.parse(text);
      setResult(json);

      // Save to history
      const entry: HistoryEntry = {
        id: Date.now().toString(36),
        timestamp: new Date().toISOString(),
        input: {
          jenis_tanah: data.jenis_tanah,
          luas_lahan_are: data.luas_lahan_are,
          sumber_air: data.sumber_air,
          musim: data.musim,
          budget: data.budget,
        },
        suitability_score: json.suitability_score,
        crops: json.recommendations.map((r) => r.nama_tanaman),
      };
      saveHistoryEntry(entry);
      setHistory(loadHistory());

      // Scroll ke hasil hanya jika bagian atas hasil belum terlihat di viewport
      setTimeout(() => {
        if (resultRef.current) {
          const rect = resultRef.current.getBoundingClientRect();
          const navbarHeight = 80; // tinggi navbar + spacing aman
          const isVisible = rect.top >= navbarHeight && rect.top < window.innerHeight;
          if (!isVisible) {
            resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-aurora opacity-80" />
      <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-agri-500/15 blur-[120px]" />
      <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-earth-500/15 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-agri-400/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 pb-8 sm:px-6 md:pb-14 lg:pb-18">
        {/* ── Hero ── */}
        <header className="max-w-3xl space-y-4 text-slate-100">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Asisten Pertanian Cerdas{" "}
            <span className="text-agri-400">Sembalun</span>
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Masukkan data lahan Anda, dan AI kami akan merekomendasikan tanaman
            terbaik beserta panduan perawatan yang sesuai dengan kondisi di{" "}
            <span className="text-agri-300">Kecamatan Sembalun</span>,
            Lombok Timur.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Mountain className="h-3.5 w-3.5" /> 1.200 mdpl
            </span>
            <span className="flex items-center gap-1">
              <Leaf className="h-3.5 w-3.5" /> Iklim Pegunungan Tropis
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini AI
            </span>
          </div>
        </header>

        {/* ── Weather ── */}
        <section className="mt-8">
          <WeatherWidget />
        </section>

        {/* ── Form ── */}
        <section className="mt-8" id="form-section">
          <div className="glass-card px-5 py-6 sm:px-8 sm:py-8">
            <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-white sm:text-xl">
              <Leaf className="h-5 w-5 text-agri-400" />
              Data Lahan Pertanian
            </h2>
            <LandForm onSubmit={handleSubmit} isLoading={loading} />
          </div>
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div ref={resultRef} className="mt-10 space-y-6 animate-fade-in-up scroll-mt-20">
            {/* Score gauge */}
            <SuitabilityGauge
              score={result.suitability_score}
              label={result.suitability_label}
            />

            {/* Fuzzy Details Visualizer */}
            <FuzzyDetails
              soilScore={result.soil_score}
              waterScore={result.water_score}
              seasonFactor={result.season_factor}
              soilMembership={result.soil_membership}
              waterMembership={result.water_membership}
              rulesFired={result.rules_fired}
            />

            {/* Source badge */}
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-white sm:text-xl">
                Rekomendasi Tanaman
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                  result.source === "gemini"
                    ? "border-agri-400/30 bg-agri-500/15 text-agri-300"
                    : "border-amber-400/30 bg-amber-500/15 text-amber-300"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                {result.source === "gemini" ? "Gemini AI" : "Fallback"}
              </span>
            </div>

            {/* Crop cards */}
            <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-1">
              {result.recommendations.map((crop, i) => (
                <CropCard
                  key={crop.nama_tanaman}
                  crop={crop}
                  rank={i + 1}
                  style={{ animationDelay: `${i * 150}ms` }}
                  defaultLuasLahan={submittedData?.luas_lahan_are || 10}
                  onStartCalendar={(name) => setActiveCalendarCrop(name)}
                />
              ))}
            </div>

            {/* General tips */}
            <div className="glass-card px-5 py-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-agri-400">
                Tips Umum
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                {result.tips_umum}
              </p>
            </div>
          </div>
        )}

        {/* Floating Chatbot */}
        <Chatbot />

        {/* Modal Planting Calendar */}
        {activeCalendarCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <PlantingCalendar
              cropName={activeCalendarCrop}
              onClose={() => setActiveCalendarCrop(null)}
            />
          </div>
        )}

        {/* ── History ── */}
        <section className="mt-8">
          <HistoryPanel entries={history} onClear={handleClearHistory} />
        </section>

        {/* ── Footer ── */}
        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          <p>
            AgriVibe — Platform Asisten Pertanian Cerdas Sembalun, Lombok Timur
          </p>
          <p className="mt-1.5">
            Dibuat oleh{" "}
            <a
              href="https://github.com/lamore44"
              target="_blank"
              rel="noopener noreferrer"
              className="text-agri-400 hover:text-agri-300 hover:underline font-semibold transition-colors"
            >
              Lalu Adittya Pratama Jelindra
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
