"use client";

import { Droplets, Leaf, MapPin, Sprout, Wallet } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

const SembalunMap = dynamic(() => import("./sembalun-map"), { ssr: false });

export type LandFormData = {
  jenis_tanah: string;
  luas_lahan_are: number;
  sumber_air: string;
  musim: string;
  tanaman_sebelumnya: string | null;
  budget: string;
};

const SOIL_TYPES = [
  { value: "vulkanik", label: "Vulkanik" },
  { value: "lempung", label: "Lempung" },
  { value: "berpasir", label: "Berpasir" },
  { value: "liat", label: "Liat" },
];

const WATER_SOURCES = [
  { value: "irigasi", label: "Irigasi" },
  { value: "tadah_hujan", label: "Tadah Hujan" },
  { value: "sungai", label: "Sungai" },
  { value: "sumur", label: "Sumur" },
];

const PREV_CROPS = [
  { value: "", label: "Belum pernah / Tidak ada" },
  { value: "bawang_merah", label: "Bawang Merah" },
  { value: "bawang_putih", label: "Bawang Putih" },
  { value: "kentang", label: "Kentang" },
  { value: "stroberi", label: "Stroberi" },
  { value: "kopi", label: "Kopi Arabika" },
  { value: "tomat", label: "Tomat" },
  { value: "cabai", label: "Cabai" },
  { value: "wortel", label: "Wortel" },
  { value: "kubis", label: "Kubis" },
  { value: "selada", label: "Selada" },
  { value: "daun_bawang", label: "Daun Bawang" },
];

const BUDGETS = [
  { value: "rendah", label: "Rendah" },
  { value: "sedang", label: "Sedang" },
  { value: "tinggi", label: "Tinggi" },
];

type Props = {
  onSubmit: (data: LandFormData) => void;
  isLoading: boolean;
};

export default function LandForm({ onSubmit, isLoading }: Props) {
  const [jenisTanah, setJenisTanah] = useState("vulkanik");
  const [luasLahan, setLuasLahan] = useState<number | "">(5);
  const [sumberAir, setSumberAir] = useState("irigasi");
  const [musim, setMusim] = useState("kemarau");
  const [tanamanSebelumnya, setTanamanSebelumnya] = useState("");
  const [budget, setBudget] = useState("sedang");
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      jenis_tanah: jenisTanah,
      luas_lahan_are: luasLahan === "" ? 1 : Number(luasLahan),
      sumber_air: sumberAir,
      musim,
      tanaman_sebelumnya: tanamanSebelumnya || null,
      budget,
    });
  };

  const handleSelectRegion = (jenisTanahVal: string, sumberAirVal: string, regionName: string) => {
    setJenisTanah(jenisTanahVal);
    setSumberAir(sumberAirVal);
    setSelectedRegionName(regionName);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Kolom Kiri: Form Isian */}
      <form onSubmit={handleSubmit} id="land-form" className="space-y-5 lg:col-span-7">
        
        {/* Balon Notifikasi Auto-Fill */}
        {selectedRegionName && (
          <div className="rounded-xl border border-agri-500/20 bg-agri-500/10 px-4 py-2.5 text-xs text-agri-300 animate-fade-in-up">
            🚀 Wilayah <strong>{selectedRegionName}</strong> dipilih! Jenis tanah diset ke <strong className="text-white capitalize">{jenisTanah}</strong> &amp; sumber air diset ke <strong className="text-white capitalize">{sumberAir.replace("_", " ")}</strong>.
          </div>
        )}

        {/* Baris 1: Jenis Tanah & Luas Lahan */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="jenis-tanah" className="form-label">
              <Leaf className="mr-1 inline h-3.5 w-3.5 text-agri-400" />
              Jenis Tanah
            </label>
            <select
              id="jenis-tanah"
              className="form-select"
              value={jenisTanah}
              onChange={(e) => {
                setJenisTanah(e.target.value);
                setSelectedRegionName(null); // Reset label wilayah jika diubah manual
              }}
            >
              {SOIL_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="luas-lahan" className="form-label">
              <MapPin className="mr-1 inline h-3.5 w-3.5 text-agri-400" />
              Luas Lahan (are)
            </label>
            <input
              id="luas-lahan"
              type="number"
              min={1}
              max={1000}
              step={1}
              className="form-input"
              value={luasLahan}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setLuasLahan("");
                } else {
                  const num = Number(val);
                  if (!isNaN(num)) {
                    setLuasLahan(num);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Baris 2: Sumber Air & Budget */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="sumber-air" className="form-label">
              <Droplets className="mr-1 inline h-3.5 w-3.5 text-sky-400" />
              Sumber Air
            </label>
            <select
              id="sumber-air"
              className="form-select"
              value={sumberAir}
              onChange={(e) => {
                setSumberAir(e.target.value);
                setSelectedRegionName(null); // Reset label wilayah jika diubah manual
              }}
            >
              {WATER_SOURCES.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="form-label">
              <Wallet className="mr-1 inline h-3.5 w-3.5 text-amber-400" />
              Budget
            </label>
            <select
              id="budget"
              className="form-select"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              {BUDGETS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Baris 3: Musim */}
        <div>
          <span className="form-label">Musim Saat Ini</span>
          <div className="mt-1 flex gap-3">
            {(["hujan", "kemarau"] as const).map((m) => (
              <button
                key={m}
                type="button"
                id={`musim-${m}`}
                className={`form-radio flex-1 text-center ${musim === m ? "form-radio-active" : ""}`}
                onClick={() => setMusim(m)}
              >
                {m === "hujan" ? "🌧️ Hujan" : "☀️ Kemarau"}
              </button>
            ))}
          </div>
        </div>

        {/* Baris 4: Tanaman sebelumnya */}
        <div>
          <label htmlFor="tanaman-sebelumnya" className="form-label">
            <Sprout className="mr-1 inline h-3.5 w-3.5 text-agri-400" />
            Tanaman Sebelumnya (opsional)
          </label>
          <select
            id="tanaman-sebelumnya"
            className="form-select"
            value={tanamanSebelumnya}
            onChange={(e) => setTanamanSebelumnya(e.target.value)}
          >
            {PREV_CROPS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="submit-analysis"
          className="btn-primary w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Menganalisis lahan...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analisis Lahan &amp; Dapatkan Rekomendasi
            </>
          )}
        </button>
      </form>

      {/* Kolom Kanan: Peta GIS Sembalun */}
      <div className="lg:col-span-5 flex flex-col justify-between border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:border-white/10 lg:pt-0 lg:pl-6">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            🗺️ Peta Wilayah Sembalun (GIS)
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
            Pilih atau klik wilayah di peta untuk mendeteksi ketinggian, kecenderungan jenis tanah, dan ketersediaan air secara otomatis.
          </p>
        </div>
        <div className="flex-1">
          <SembalunMap onSelectRegion={handleSelectRegion} />
        </div>
      </div>
    </div>
  );
}

// Re-export the icon used in the button to avoid import issues
function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
    </svg>
  );
}
