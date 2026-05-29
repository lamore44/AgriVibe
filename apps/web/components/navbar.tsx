"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Info, Home, Sprout } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/75 py-3.5 backdrop-blur-md shadow-glass">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <Link href="/" className="group flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/5 transition-transform group-hover:scale-105">
            <img src="/logo.jpg" alt="Logo AgriVibe" className="h-full w-full object-cover" />
          </div>
          <span className="font-display text-sm font-bold tracking-wider text-white group-hover:text-agri-400 transition-colors whitespace-nowrap">
            AgriVibe<span className="text-agri-400"> Sembalun</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 sm:px-3.5 text-xs font-semibold transition-all ${
              pathname === "/"
                ? "bg-agri-500/10 text-agri-400 border border-agri-500/20"
                : "text-slate-400 hover:text-white border border-transparent hover:bg-white/5"
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
          
          <Link
            href="/crops"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 sm:px-3.5 text-xs font-semibold transition-all ${
              pathname === "/crops"
                ? "bg-agri-500/10 text-agri-400 border border-agri-500/20"
                : "text-slate-400 hover:text-white border border-transparent hover:bg-white/5"
            }`}
          >
            <Sprout className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Direktori</span>
          </Link>
          
          <Link
            href="/about"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 sm:px-3.5 text-xs font-semibold transition-all ${
              pathname === "/about"
                ? "bg-agri-500/10 text-agri-400 border border-agri-500/20"
                : "text-slate-400 hover:text-white border border-transparent hover:bg-white/5"
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tentang</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
