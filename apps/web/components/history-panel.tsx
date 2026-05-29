"use client";

import { Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export type HistoryEntry = {
  id: string;
  timestamp: string;
  input: {
    jenis_tanah: string;
    luas_lahan_are: number;
    sumber_air: string;
    musim: string;
    budget: string;
  };
  suitability_score: number;
  crops: string[];
};

const STORAGE_KEY = "agrivibe_history";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry) {
  const history = loadHistory();
  history.unshift(entry);
  // Keep last 20 entries
  if (history.length > 20) history.length = 20;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

type Props = {
  entries: HistoryEntry[];
  onClear: () => void;
};

export default function HistoryPanel({ entries, onClear }: Props) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        id="toggle-history"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Clock className="h-4 w-4 text-slate-500" />
          Riwayat Rekomendasi ({entries.length})
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="border-t border-white/10">
          <div className="max-h-64 overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between border-b border-white/5 px-5 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">
                    {new Date(entry.timestamp).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-300">
                    {entry.crops.join(", ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.input.jenis_tanah} • {entry.input.luas_lahan_are} are
                    • Skor: {entry.suitability_score.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 px-5 py-2">
            <button
              type="button"
              id="clear-history"
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-rose-400/70 transition-colors hover:text-rose-400"
            >
              <Trash2 className="h-3 w-3" />
              Hapus semua riwayat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
