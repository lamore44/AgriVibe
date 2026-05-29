"use client";

import { useState } from "react";
import { Sliders, Cpu, ChevronDown, ChevronUp, CheckCircle, Info } from "lucide-react";

export type FuzzyRuleFired = {
  name: string;
  rule_text: string;
  value: number;
};

export type SoilMembership = {
  poor: number;
  fair: number;
  rich: number;
};

export type WaterMembership = {
  scarce: number;
  decent: number;
  ample: number;
};

type Props = {
  soilScore: number;
  waterScore: number;
  seasonFactor: number;
  soilMembership: SoilMembership;
  waterMembership: WaterMembership;
  rulesFired: FuzzyRuleFired[];
};

export default function FuzzyDetails({
  soilScore,
  waterScore,
  seasonFactor,
  soilMembership,
  waterMembership,
  rulesFired,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Jika data tidak tersedia (misal server backend belum direstart), sembunyikan detail agar tidak crash
  if (!soilMembership || !waterMembership || !rulesFired) {
    return null;
  }

  const getSeasonText = (factor: number) => {
    if (factor > 1.0) return `Musim Hujan (Faktor: x${factor.toFixed(2)} - Menambah skor kesesuaian)`;
    if (factor < 1.0) return `Musim Kemarau (Faktor: x${factor.toFixed(2)} - Mengurangi skor kesesuaian)`;
    return `Musim Normal (Faktor: x${factor.toFixed(2)})`;
  };

  return (
    <div className="glass-card overflow-hidden transition-all duration-300">
      {/* Summary Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-200 hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-agri-500/10 p-2 text-agri-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-100 sm:text-base">
              Detail Analisis Logika Fuzzy
            </h3>
            <p className="text-xs text-slate-400">
              Lihat bagaimana skor kesesuaian dihitung berdasarkan metode Mamdani
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Expanded Content */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[1200px] border-t border-white/10 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-5 space-y-6 text-sm text-slate-300">
          {/* Section 1: Fuzzifikasi */}
          <div>
            <h4 className="mb-3 font-semibold text-white flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-agri-400" />
              1. Fuzzifikasi (Keanggotaan Input)
            </h4>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Soil card */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/15 pb-2">
                  <span className="font-medium text-slate-200">Kesuburan Tanah</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                    Nilai: {soilScore}/10
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Kurang Subur (Poor)</span>
                      <span className="text-slate-200">{soilMembership.poor.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${soilMembership.poor * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Sedang (Fair)</span>
                      <span className="text-slate-200">{soilMembership.fair.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${soilMembership.fair * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Sangat Subur (Rich)</span>
                      <span className="text-slate-200">{soilMembership.rich.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-agri-500 transition-all duration-500"
                        style={{ width: `${soilMembership.rich * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Water card */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/15 pb-2">
                  <span className="font-medium text-slate-200">Keandalan Sumber Air</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                    Nilai: {waterScore}/10
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Kurang (Scarce)</span>
                      <span className="text-slate-200">{waterMembership.scarce.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${waterMembership.scarce * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Cukup (Decent)</span>
                      <span className="text-slate-200">{waterMembership.decent.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${waterMembership.decent * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Melimpah (Ample)</span>
                      <span className="text-slate-200">{waterMembership.ample.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-agri-500 transition-all duration-500"
                        style={{ width: `${waterMembership.ample * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Inferensi Aturan */}
          <div>
            <h4 className="mb-3 font-semibold text-white flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-agri-400" />
              2. Inferensi Aturan (Rules Fired)
            </h4>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {rulesFired.map((rule) => (
                <div
                  key={rule.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg bg-white/5 border border-white/5 px-4 py-2 text-xs gap-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="rounded bg-agri-500/20 text-agri-300 px-1.5 py-0.5 font-bold">
                      {rule.name}
                    </span>
                    <span className="text-slate-300">{rule.rule_text}</span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-slate-500">Bobot:</span>
                    <span className="rounded border border-agri-500/30 bg-agri-500/10 px-2 py-0.5 text-[10px] font-semibold text-agri-300">
                      {rule.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Defuzzifikasi */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="mb-2 font-semibold text-white flex items-center gap-1.5">
              <Info className="h-4 w-4 text-agri-400" />
              3. Defuzzifikasi Centroid & Faktor Musim
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Output akhir dihitung menggunakan metode Centroid (Mamdani). Bobot dari setiap aturan yang aktif dipadukan dengan nilai tengah tingkat kesesuaian (Rendah = 25, Sedang = 55, Tinggi = 82) untuk mendapatkan nilai dasar, lalu disesuaikan dengan faktor musim.
            </p>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Defuzzifikasi:</span>
                <span className="text-slate-200 font-mono">Centroid (Mamdani)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Penyesuaian Musim:</span>
                <span className="text-slate-200">{getSeasonText(seasonFactor)}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 font-medium">
                <span className="text-slate-300">Skor Akhir Kesesuaian:</span>
                <span className="text-agri-400 font-bold font-mono">
                  {(rulesFired.length > 0) ? "Terhitung" : "Default"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
