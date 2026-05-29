"use client";

import { Cloud, Droplets, Thermometer, Wind } from "lucide-react";
import { useEffect, useState } from "react";

type WeatherData = {
  suhu: number;
  kelembapan: number;
  cuaca: string;
  curah_hujan: number;
  angin: number;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: WeatherData) => {
        if (active) setWeather(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="glass-card flex items-center gap-3 px-4 py-4 text-sm text-slate-500">
        <Cloud className="h-5 w-5" />
        <span>Data cuaca tidak tersedia saat ini</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="glass-card animate-pulse px-4 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300" />
          Memuat cuaca Sembalun...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-agri-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Cuaca Sembalun • Live
          </span>
        </div>
        <span className="capitalize text-sm text-slate-300">{weather.cuaca}</span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-4">
        <WeatherStat
          icon={<Thermometer className="h-4 w-4 text-rose-300" />}
          label="Suhu"
          value={`${weather.suhu.toFixed(1)}°C`}
        />
        <WeatherStat
          icon={<Droplets className="h-4 w-4 text-sky-300" />}
          label="Kelembapan"
          value={`${weather.kelembapan.toFixed(0)}%`}
        />
        <WeatherStat
          icon={<Cloud className="h-4 w-4 text-indigo-300" />}
          label="Curah Hujan"
          value={`${weather.curah_hujan.toFixed(1)} mm`}
        />
        <WeatherStat
          icon={<Wind className="h-4 w-4 text-teal-300" />}
          label="Angin"
          value={`${weather.angin.toFixed(1)} m/s`}
        />
      </div>
    </div>
  );
}

function WeatherStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-3 bg-white/[0.02]">
      {icon}
      <span className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-200">{value}</span>
    </div>
  );
}
