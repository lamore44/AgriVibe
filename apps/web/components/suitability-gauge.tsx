"use client";

type Props = {
  score: number;
  label: string;
};

export default function SuitabilityGauge({ score, label }: Props) {
  const clamped = Math.min(100, Math.max(0, score));
  const pct = clamped / 100;

  const barColor =
    clamped >= 70 ? "from-agri-400 to-agri-500"
    : clamped >= 45 ? "from-amber-400 to-amber-500"
    : "from-rose-400 to-rose-500";

  const textColor =
    clamped >= 70 ? "text-agri-400"
    : clamped >= 45 ? "text-amber-400"
    : "text-rose-400";

  return (
    <div className="glass-card px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Skor Kesesuaian Lahan
          </p>
          <p className="text-sm text-slate-500">Fuzzy Logic (Mamdani)</p>
        </div>
        <div className="text-right">
          <span className={`text-3xl font-bold ${textColor}`}>{clamped.toFixed(1)}</span>
          <span className="text-sm text-slate-500">/100</span>
        </div>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} animate-gauge-fill origin-left`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">Kurang Sesuai</span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
        <span className="text-slate-500">Sangat Sesuai</span>
      </div>
    </div>
  );
}
