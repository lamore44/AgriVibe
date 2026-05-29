"use client";

import { useState, useMemo } from "react";
import { Calculator, DollarSign, TrendingUp, ShieldAlert, Award } from "lucide-react";

type Props = {
  cropName: string;
  defaultLuasLahan: number;
};

type CropParams = {
  seedPerAre: number;
  seedPrice: number;
  fertilizerCostPerAre: number;
  laborCostPerAre: number;
  minYieldPerAre: number;
  maxYieldPerAre: number;
  defaultYieldPerAre: number;
  defaultPricePerKg: number;
  minPrice: number;
  maxPrice: number;
};

const CROP_PRESETS: Record<string, CropParams> = {
  "Bawang Merah": {
    seedPerAre: 12, // kg
    seedPrice: 35000, // Rp/kg
    fertilizerCostPerAre: 300000,
    laborCostPerAre: 200000,
    minYieldPerAre: 100,
    maxYieldPerAre: 160,
    defaultYieldPerAre: 130, // kg/are
    defaultPricePerKg: 25000,
    minPrice: 15000,
    maxPrice: 40000,
  },
  "Kentang": {
    seedPerAre: 18,
    seedPrice: 20000,
    fertilizerCostPerAre: 250000,
    laborCostPerAre: 180000,
    minYieldPerAre: 160,
    maxYieldPerAre: 240,
    defaultYieldPerAre: 200,
    defaultPricePerKg: 12000,
    minPrice: 8000,
    maxPrice: 20000,
  },
  "Wortel": {
    seedPerAre: 0.5,
    seedPrice: 150000,
    fertilizerCostPerAre: 150000,
    laborCostPerAre: 150000,
    minYieldPerAre: 200,
    maxYieldPerAre: 300,
    defaultYieldPerAre: 250,
    defaultPricePerKg: 7000,
    minPrice: 4000,
    maxPrice: 12000,
  },
  "Stroberi": {
    seedPerAre: 400, // 400 bibit
    seedPrice: 2000, // Rp/bibit
    fertilizerCostPerAre: 450000,
    laborCostPerAre: 250000,
    minYieldPerAre: 80,
    maxYieldPerAre: 130,
    defaultYieldPerAre: 100,
    defaultPricePerKg: 50000,
    minPrice: 30000,
    maxPrice: 80000,
  },
  "Bawang Putih": {
    seedPerAre: 10,
    seedPrice: 40000,
    fertilizerCostPerAre: 280000,
    laborCostPerAre: 180000,
    minYieldPerAre: 80,
    maxYieldPerAre: 120,
    defaultYieldPerAre: 100,
    defaultPricePerKg: 30000,
    minPrice: 20000,
    maxPrice: 45000,
  },
};

const FALLBACK_PRESET: CropParams = {
  seedPerAre: 10,
  seedPrice: 25000,
  fertilizerCostPerAre: 200000,
  laborCostPerAre: 150000,
  minYieldPerAre: 100,
  maxYieldPerAre: 200,
  defaultYieldPerAre: 150,
  defaultPricePerKg: 15000,
  minPrice: 8000,
  maxPrice: 30000,
};

export default function CropCalculator({ cropName, defaultLuasLahan }: Props) {
  // Ambil preset berdasarkan nama tanaman, hilangkan case sensitive
  const preset = useMemo(() => {
    const key = Object.keys(CROP_PRESETS).find(
      (k) => cropName.toLowerCase().includes(k.toLowerCase())
    );
    return key ? CROP_PRESETS[key] : FALLBACK_PRESET;
  }, [cropName]);

  const [luasLahan, setLuasLahan] = useState(defaultLuasLahan || 10);
  const [yieldPerAre, setYieldPerAre] = useState(preset.defaultYieldPerAre);
  const [pricePerKg, setPricePerKg] = useState(preset.defaultPricePerKg);

  // Kalkulasi Keuangan
  const financialData = useMemo(() => {
    const seedCostPerAre = preset.seedPerAre * preset.seedPrice;
    const totalCostPerAre = seedCostPerAre + preset.fertilizerCostPerAre + preset.laborCostPerAre;
    
    const totalModal = Math.round(luasLahan * totalCostPerAre);
    const totalYield = luasLahan * yieldPerAre;
    const totalOmset = Math.round(totalYield * pricePerKg);
    const labaBersih = totalOmset - totalModal;
    
    const roi = totalModal > 0 ? (labaBersih / totalModal) * 100 : 0;
    const bepPrice = totalYield > 0 ? Math.round(totalModal / totalYield) : 0;

    return {
      totalModal,
      totalYield,
      totalOmset,
      labaBersih,
      roi,
      bepPrice,
    };
  }, [luasLahan, yieldPerAre, pricePerKg, preset]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <Calculator className="h-5 w-5 text-agri-400" />
        <h4 className="font-display font-semibold text-white">
          Kalkulator Estimasi Panen & Laba - <span className="text-agri-300">{cropName}</span>
        </h4>
      </div>

      {/* Inputs */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Luas Lahan */}
        <div className="space-y-2">
          <label className="flex justify-between text-xs font-medium text-slate-400">
            <span>Luas Lahan</span>
            <span className="text-slate-200 font-semibold">{luasLahan} Are</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={luasLahan}
            onChange={(e) => setLuasLahan(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-agri-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1 Are</span>
            <span>100 Are</span>
          </div>
        </div>

        {/* Hasil Panen per Are */}
        <div className="space-y-2">
          <label className="flex justify-between text-xs font-medium text-slate-400">
            <span>Hasil Panen / Are</span>
            <span className="text-slate-200 font-semibold">{yieldPerAre} kg</span>
          </label>
          <input
            type="range"
            min={preset.minYieldPerAre}
            max={preset.maxYieldPerAre}
            value={yieldPerAre}
            onChange={(e) => setYieldPerAre(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-agri-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{preset.minYieldPerAre} kg</span>
            <span>{preset.maxYieldPerAre} kg</span>
          </div>
        </div>

        {/* Harga Jual per Kg */}
        <div className="space-y-2">
          <label className="flex justify-between text-xs font-medium text-slate-400">
            <span>Harga Jual / kg</span>
            <span className="text-slate-200 font-semibold">{formatRupiah(pricePerKg)}</span>
          </label>
          <input
            type="range"
            min={preset.minPrice}
            max={preset.maxPrice}
            step="500"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-agri-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{formatRupiah(preset.minPrice)}</span>
            <span>{formatRupiah(preset.maxPrice)}</span>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Modal */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Modal Kerja</p>
          <p className="text-base font-bold text-slate-200">{formatRupiah(financialData.totalModal)}</p>
          <p className="text-[10px] text-slate-500">Bibit, pupuk, pengolahan & tenaga</p>
        </div>

        {/* Omset */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Estimasi Hasil Panen</p>
          <p className="text-base font-bold text-slate-200">
            {financialData.totalYield.toLocaleString("id-ID")} kg
          </p>
          <p className="text-[10px] text-slate-500">Omset: {formatRupiah(financialData.totalOmset)}</p>
        </div>

        {/* Laba Bersih */}
        <div
          className={`rounded-xl border p-4 space-y-1 ${
            financialData.labaBersih >= 0
              ? "border-agri-500/20 bg-agri-500/5"
              : "border-rose-500/20 bg-rose-500/5"
          }`}
        >
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Laba Bersih Estimasi</p>
          <p
            className={`text-base font-bold ${
              financialData.labaBersih >= 0 ? "text-agri-400 text-glow" : "text-rose-400"
            }`}
          >
            {formatRupiah(financialData.labaBersih)}
          </p>
          <div className="flex items-center gap-1.5 text-[10px]">
            {financialData.labaBersih >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-agri-400" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            )}
            <span className={financialData.labaBersih >= 0 ? "text-agri-300" : "text-rose-300"}>
              {financialData.labaBersih >= 0 ? "Menguntungkan" : "Rugi (Sesuaikan harga/panen)"}
            </span>
          </div>
        </div>

        {/* ROI / BEP */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">ROI & Titik Impas (BEP)</p>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-200">
              {financialData.roi.toFixed(0)}%
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              BEP: {formatRupiah(financialData.bepPrice)}/kg
            </span>
          </div>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-amber-400" />
            Rasio pengembalian modal
          </p>
        </div>
      </div>
    </div>
  );
}
