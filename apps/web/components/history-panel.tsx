"use client";

import { Clock, Trash2, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
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
  fullResult?: any; // Stores the complete RecommendResponse object for offline loading
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
  onSelectEntry: (entry: HistoryEntry) => void;
};

export default function HistoryPanel({ entries, onClear, onSelectEntry }: Props) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        id="toggle-history"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/5 cursor-pointer"
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
            {entries.map((entry) => {
              const isClickable = !!entry.fullResult;
              return (
                <div
                  key={entry.id}
                  onClick={() => isClickable && onSelectEntry(entry)}
                  className={`flex items-center justify-between border-b border-white/5 px-5 py-3.5 last:border-0 text-left transition-all ${
                    isClickable
                      ? "hover:bg-white/[0.04] cursor-pointer group active:bg-white/[0.08]"
                      : "opacity-60"
                  }`}
                  title={isClickable ? "Klik untuk memuat ulang rekomendasi ini" : undefined}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-500">
                      {new Date(entry.timestamp).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-200 group-hover:text-agri-400 transition-colors">
                      {entry.crops.join(", ")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {entry.input.jenis_tanah} • {entry.input.luas_lahan_are} are
                      • Skor Kesesuaian: {entry.suitability_score.toFixed(0)}/100
                    </p>
                  </div>
                  {isClickable && (
                    <div className="ml-4 flex items-center text-slate-500 group-hover:text-slate-350 group-hover:translate-x-0.5 transition-all">
                      <span className="text-[10px] hidden sm:inline mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Muat Ulang
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t border-white/10 px-5 py-2.5">
            <button
              type="button"
              id="clear-history"
              onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-rose-450/70 transition-colors hover:text-rose-400 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus semua riwayat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
