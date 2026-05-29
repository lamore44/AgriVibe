import { ChevronDown, ChevronUp, Calculator, Calendar } from "lucide-react";
import { useState } from "react";
import CropCalculator from "@/components/crop-calculator";

export type CropItemData = {
  nama_tanaman: string;
  skor_kesesuaian: number;
  alasan: string;
  panduan_perawatan: {
    persiapan_lahan: string;
    penanaman: string;
    pemupukan: string;
    pengairan: string;
    pengendalian_hama: string;
    panen: string;
  };
  estimasi_panen: string;
  tips_cuaca: string;
};

const CROP_EMOJIS: Record<string, string> = {
  "bawang merah": "🧅",
  "bawang putih": "🧄",
  kentang: "🥔",
  stroberi: "🍓",
  kopi: "☕",
  "kopi arabika": "☕",
  tomat: "🍅",
  cabai: "🌶️",
  wortel: "🥕",
  kubis: "🥬",
  selada: "🥗",
  "daun bawang": "🌿",
};

function getCropEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🌱";
}

type Props = {
  crop: CropItemData;
  rank: number;
  style?: React.CSSProperties;
  defaultLuasLahan: number;
  onStartCalendar: (cropName: string) => void;
};

export default function CropCard({ crop, rank, style, defaultLuasLahan, onStartCalendar }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const emoji = getCropEmoji(crop.nama_tanaman);

  const scoreColor =
    crop.skor_kesesuaian >= 75
      ? "text-agri-400"
      : crop.skor_kesesuaian >= 50
        ? "text-amber-400"
        : "text-rose-400";

  const scoreBg =
    crop.skor_kesesuaian >= 75
      ? "from-agri-500/20 to-agri-600/10"
      : crop.skor_kesesuaian >= 50
        ? "from-amber-500/20 to-amber-600/10"
        : "from-rose-500/20 to-rose-600/10";

  const rankBadge =
    rank === 1
      ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
      : rank === 2
        ? "bg-slate-400/15 text-slate-300 border-slate-400/25"
        : "bg-orange-700/15 text-orange-300 border-orange-500/25";

  const careSteps = [
    { label: "Persiapan Lahan", value: crop.panduan_perawatan.persiapan_lahan, icon: "🏗️" },
    { label: "Penanaman", value: crop.panduan_perawatan.penanaman, icon: "🌱" },
    { label: "Pemupukan", value: crop.panduan_perawatan.pemupukan, icon: "💧" },
    { label: "Pengairan", value: crop.panduan_perawatan.pengairan, icon: "🚿" },
    { label: "Pengendalian Hama", value: crop.panduan_perawatan.pengendalian_hama, icon: "🛡️" },
    { label: "Panen", value: crop.panduan_perawatan.panen, icon: "🎉" },
  ];

  return (
    <div
      className="glass-card overflow-hidden transition-all duration-300 hover:shadow-glass-lg"
      style={style}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${scoreBg} px-5 py-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emoji}</span>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {crop.nama_tanaman}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Estimasi panen: {crop.estimasi_panen}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rankBadge}`}
            >
              #{rank}
            </span>
            <span className={`text-2xl font-bold ${scoreColor}`}>
              {crop.skor_kesesuaian}
              <span className="text-sm font-normal opacity-60">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-slate-300">{crop.alasan}</p>

        {/* Tips Cuaca */}
        <div className="mt-3 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2">
          <p className="text-xs text-sky-200">
            <span className="mr-1 font-medium">🌤️ Tips Cuaca:</span>
            {crop.tips_cuaca}
          </p>
        </div>

        {/* Fitur Tambahan: Kalkulator & Kalender */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
              showCalculator
                ? "border-agri-400 bg-agri-500/10 text-agri-300 shadow-[0_0_12px_rgba(34,197,94,0.15)]"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <Calculator className="h-4 w-4" />
            {showCalculator ? "Sembunyikan Laba" : "Kalkulasi Laba"}
          </button>
          
          <button
            type="button"
            onClick={() => onStartCalendar(crop.nama_tanaman)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-gradient-to-r from-agri-600 to-agri-500 py-2.5 text-xs font-semibold text-white transition-all hover:from-agri-500 hover:to-agri-400 shadow-md hover:shadow-agri-500/20"
          >
            <Calendar className="h-4 w-4" />
            Jadwal Tanam
          </button>
        </div>

        {/* Kalkulator Section */}
        {showCalculator && (
          <div className="mt-4 animate-fade-in-up">
            <CropCalculator cropName={crop.nama_tanaman} defaultLuasLahan={defaultLuasLahan} />
          </div>
        )}

        {/* Expand toggle */}
        <button
          type="button"
          id={`expand-crop-${rank}`}
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-slate-200"
        >
          {expanded ? (
            <>
              Tutup panduan perawatan <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Lihat panduan perawatan <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        {/* Care guide - expandable */}
        {expanded && (
          <div className="mt-4 space-y-3 animate-fade-in-up">
            {careSteps.map((step) => (
              <div
                key={step.label}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-agri-400">
                  {step.icon} {step.label}
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {step.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
