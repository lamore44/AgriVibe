"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Info, MapPin } from "lucide-react";

type Region = {
  id: string;
  name: string;
  coords: [number, number];
  color: string;
  jenisTanah: string;
  sumberAir: string;
  altitude: string;
  description: string;
};

const REGIONS: Region[] = [
  {
    id: "lawang",
    name: "Sembalun Lawang",
    coords: [-8.3582, 116.5244],
    color: "#10b981", // Emerald
    jenisTanah: "vulkanik",
    sumberAir: "irigasi",
    altitude: "1.150 mdpl",
    description: "Kawasan sentra stroberi dan bawang. Berdasarkan BPS (2025), wilayah ini memiliki luas 52,29 km² (21,27% dari total kecamatan) dengan elevasi 1.150 mdpl dan tanah vulkanik subur.",
  },
  {
    id: "bumbung",
    name: "Sembalun Bumbung",
    coords: [-8.3908, 116.5262],
    color: "#3b82f6", // Blue
    jenisTanah: "vulkanik",
    sumberAir: "sumur",
    altitude: "1.250 mdpl",
    description: "Kawasan dengan elevasi tertinggi (~1.250 mdpl). Merujuk data BPS (2025), wilayah ini memiliki luas terbesar yaitu 55,97 km² (22,76% dari kecamatan), dominan untuk kentang dan bawang putih.",
  },
  {
    id: "sajang",
    name: "Sajang",
    coords: [-8.2982, 116.5074],
    color: "#eab308", // Yellow
    jenisTanah: "berpasir",
    sumberAir: "sungai",
    altitude: "800 mdpl",
    description: "Wilayah lereng dengan luas 38,62 km² (15,71% dari kecamatan) dan ketinggian ~800 mdpl. Menurut BPS (2025), memiliki tanah berpasir vulkanik yang sangat ideal untuk Kopi Arabika.",
  },
  {
    id: "bilok_petung",
    name: "Bilok Petung",
    coords: [-8.2612, 116.5367],
    color: "#ec4899", // Pink
    jenisTanah: "liat",
    sumberAir: "tadah_hujan",
    altitude: "300 mdpl",
    description: "Dataran rendah dekat pesisir (~300 mdpl) dengan luas wilayah 33,59 km² (13,66% dari kecamatan). Sesuai data BPS (2025), didominasi tanah liat cocok untuk cabai dan jagung.",
  },
];

interface Props {
  onSelectRegion: (jenisTanah: string, sumberAir: string, regionName: string) => void;
}

export default function SembalunMap({ onSelectRegion }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapRef.current) return;

    // Inisialisasi peta Leaflet berpusat di Sembalun
    const map = L.map(mapContainerRef.current, {
      center: [-8.33, 116.518],
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });

    mapRef.current = map;

    // Gunakan CartoDB Dark Matter tile layer untuk tampilan gelap premium
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Plot setiap wilayah sebagai lingkaran interaktif
    REGIONS.forEach((region) => {
      const circle = L.circle(region.coords, {
        color: region.color,
        fillColor: region.color,
        fillOpacity: 0.25,
        radius: 1200, // radius 1.2km
        weight: 2,
      }).addTo(map);

      // Event hover
      circle.on("mouseover", () => {
        circle.setStyle({ fillOpacity: 0.45, weight: 3 });
        setHoveredRegion(region);
      });

      circle.on("mouseout", () => {
        circle.setStyle({ fillOpacity: 0.25, weight: 2 });
        setHoveredRegion(null);
      });

      // Event klik wilayah
      circle.on("click", () => {
        setSelectedRegion(region);
        onSelectRegion(region.jenisTanah, region.sumberAir, region.name);
        map.setView(region.coords, 12, { animate: true });
      });

      // Tambahkan label teks statis pada peta untuk setiap wilayah
      const labelIcon = L.divIcon({
        className: "custom-map-label",
        html: `<span style="color: ${region.color}; text-shadow: 0 0 4px rgba(0,0,0,0.8);" class="text-[9px] font-bold uppercase tracking-wider">${region.name}</span>`,
        iconSize: [100, 20],
        iconAnchor: [50, -10],
      });
      L.marker(region.coords, { icon: labelIcon }).addTo(map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onSelectRegion]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {styleBlock}
      
      {/* Container Peta dengan Filter Dark Mode custom */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[240px] sm:h-[280px] rounded-2xl border border-white/10 overflow-hidden relative z-0 dark-map shadow-glass"
      />

      {/* Detail Wilayah Terpilih */}
      <div className="rounded-xl border border-white/15 bg-white/[0.02] p-3 text-xs min-h-[90px] flex flex-col justify-center">
        {selectedRegion ? (
          <div className="space-y-1.5 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" style={{ color: selectedRegion.color }} />
                {selectedRegion.name}
              </span>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-350">
                {selectedRegion.altitude}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {selectedRegion.description}
            </p>
            <div className="flex gap-4 pt-1 text-[10px] text-slate-500 font-medium">
              <span>Tanah: <strong className="text-slate-300 capitalize">{selectedRegion.jenisTanah}</strong></span>
              <span>Air: <strong className="text-slate-300 capitalize">{selectedRegion.sumberAir.replace("_", " ")}</strong></span>
            </div>
          </div>
        ) : hoveredRegion ? (
          <div className="space-y-1 text-slate-300">
            <p className="font-semibold flex items-center gap-1" style={{ color: hoveredRegion.color }}>
              <MapPin className="h-3.5 w-3.5" />
              {hoveredRegion.name} ({hoveredRegion.altitude})
            </p>
            <p className="text-[10px] text-slate-500">Klik lingkaran untuk memilih dusun ini</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-slate-500 py-2">
            <Info className="h-5 w-5 mb-1.5 text-slate-600 animate-bounce" />
            <p className="font-semibold text-[11px]">Klik wilayah di peta untuk mengisi data otomatis</p>
            <p className="text-[9px] text-slate-600">Sembalun Lawang • Sembalun Bumbung • Sajang • Bilok Petung</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Menambahkan custom styles agar peta menyatu dengan estetika website
const styleBlock = (
  <style jsx global>{`
    .custom-map-label {
      text-align: center;
      background: transparent;
      border: none;
    }
    .dark-map .leaflet-container {
      background: #05080e !important;
    }
    .dark-map .leaflet-bar a {
      background-color: #1e293b !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      color: #94a3b8 !important;
    }
    .dark-map .leaflet-bar a:hover {
      background-color: #334155 !important;
      color: #ffffff !important;
    }
  `}</style>
);
