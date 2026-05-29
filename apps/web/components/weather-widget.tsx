"use client";

import { Cloud, Droplets, Thermometer, Wind, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

type ForecastDay = {
  tanggal: string;
  suhu_min: number;
  suhu_max: number;
  kelembapan: number;
  cuaca: string;
  angin: number;
  curah_hujan: number;
  icon: string;
};

type WeatherData = {
  suhu: number;
  kelembapan: number;
  cuaca: string;
  curah_hujan: number;
  angin: number;
  icon: string;
  forecast: ForecastDay[];
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

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

  function formatForecastDate(dateStr: string) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  }

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
    <div className="glass-card overflow-hidden transition-all duration-300 hover:shadow-agri-500/5">
      {/* Header Utama Cuaca */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-agri-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Cuaca Sembalun • Live
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {weather.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.cuaca}
              className="h-7 w-7 object-contain"
            />
          )}
          <span className="capitalize text-xs sm:text-sm font-medium text-slate-300">
            {weather.cuaca}
          </span>
        </div>
      </div>

      {/* Grid Cuaca Saat Ini */}
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

      {/* Panel Prakiraan 5 Hari */}
      {showForecast && weather.forecast && (
        <div className="border-t border-white/10 bg-slate-950/40 p-4 animate-fade-in-up">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Prakiraan Cuaca 5 Hari Ke Depan
          </h3>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
            {weather.forecast.slice(0, 5).map((day) => {
              const isRainy = day.curah_hujan >= 5.0;
              const isWindy = day.angin >= 6.0;
              return (
                <div
                  key={day.tanggal}
                  className="flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.01] p-3 text-center transition-all hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div>
                    {/* Tanggal */}
                    <div className="text-[10px] font-semibold text-slate-300">
                      {formatForecastDate(day.tanggal)}
                    </div>

                    {/* Ikon */}
                    <div className="my-1.5 flex justify-center">
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.cuaca}
                        className="h-10 w-10 object-contain"
                      />
                    </div>

                    {/* Deskripsi & Suhu */}
                    <div className="text-[9px] capitalize text-slate-500 leading-tight min-h-[22px] flex items-center justify-center">
                      {day.cuaca}
                    </div>
                    <div className="mt-1 text-xs font-bold text-white">
                      {day.suhu_min.toFixed(0)}° - {day.suhu_max.toFixed(0)}°C
                    </div>
                  </div>

                  {/* Statistik */}
                  <div className="mt-3 space-y-1 border-t border-white/5 pt-2 text-[9px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Lembap:</span>
                      <span className="text-slate-350">{day.kelembapan.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Angin:</span>
                      <span className="text-slate-350">{day.angin.toFixed(1)} m/s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hujan:</span>
                      <span className={day.curah_hujan > 0 ? "text-sky-400 font-medium" : "text-slate-350"}>
                        {day.curah_hujan.toFixed(1)} mm
                      </span>
                    </div>
                  </div>

                  {/* Peringatan Tani */}
                  {isRainy && (
                    <div className="mt-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-1 py-1 text-[8px] font-bold text-amber-300 leading-tight">
                      ⚠️ Tunda Pupuk/Semprot
                    </div>
                  )}
                  {!isRainy && isWindy && (
                    <div className="mt-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 px-1 py-1 text-[8px] font-bold text-rose-300 leading-tight">
                      💨 Angin Kencang
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tombol Toggle Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <button
          onClick={() => setShowForecast(!showForecast)}
          className="w-full flex items-center justify-center gap-1.5 border-t border-white/10 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-white/[0.005] hover:bg-white/[0.02] transition-colors"
        >
          {showForecast ? (
            <>
              Sembunyikan Prakiraan <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Lihat Prakiraan 5 Hari <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
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
    <div className="flex flex-col items-center gap-1 px-3 py-3 bg-white/[0.015]">
      {icon}
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </span>
      <span className="text-xs sm:text-sm font-semibold text-slate-200">{value}</span>
    </div>
  );
}
