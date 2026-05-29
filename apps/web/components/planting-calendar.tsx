"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, CheckCircle2, ChevronRight, Circle, Trash2, X } from "lucide-react";

type Props = {
  cropName: string;
  onClose: () => void;
};

type TaskStep = {
  week: number;
  title: string;
  description: string;
};

const CROP_CALENDARS: Record<string, TaskStep[]> = {
  "Bawang Merah": [
    { week: 1, title: "Persiapan Lahan", description: "Cangkul tanah sedalam 20-30 cm, buat bedengan lebar 1m, berikan pupuk kandang/kompos sebagai pupuk dasar." },
    { week: 2, title: "Penanaman Bibit", description: "Pilih bibit umbi yang sehat, potong sedikit ujung umbi untuk merangsang tunas, tanam dengan jarak 15x15 cm." },
    { week: 3, title: "Penyiraman Awal", description: "Siram rutin 2x sehari (pagi & sore). Jaga tanah tetap lembab tetapi tidak becek/menggenang." },
    { week: 4, title: "Pemupukan Pertama", description: "Berikan pupuk NPK (dosis rendah) sekitar 10-15 hari setelah tanam di sekeliling pangkal batang." },
    { week: 5, title: "Penyiangan Gulma", description: "Cabut rumput liar di sekitar tanaman agar tidak berebut nutrisi, lakukan penggemburan tanah tipis-tipis." },
    { week: 6, title: "Penyiraman & Pantau Hama", description: "Kurangi penyiraman jika sering hujan. Periksa daun dari ulat grayak atau bintik ungu (alternaria)." },
    { week: 7, title: "Pemupukan Kedua", description: "Berikan pupuk susulan NPK + KCl untuk merangsang pembesaran umbi bawang merah." },
    { week: 8, title: "Pemeliharaan Umbi", description: "Pastikan umbi tidak tertimbun tanah terlalu dalam agar pertumbuhan maksimal dan tidak mudah busuk." },
    { week: 9, title: "Pengeringan Lahan", description: "Hentikan penyiraman (sekitar 7 hari sebelum panen) agar umbi lebih padat dan tahan lama disimpan." },
    { week: 10, title: "Masa Panen", description: "Panen saat 70-80% daun menguning dan layu. Cabut perlahan di pagi hari, ikat, lalu jemur di bawah terik matahari." },
  ],
  "Kentang": [
    { week: 1, title: "Persiapan Lahan", description: "Buat bedengan tinggi (~30 cm) untuk drainase yang baik. Campurkan pupuk kandang matang melimpah." },
    { week: 2, title: "Penanaman Umbi", description: "Tanam umbi bibit bertunas dengan kedalaman 10 cm, mata tunas menghadap ke atas. Jarak tanam 30x70 cm." },
    { week: 3, title: "Penyiraman & Mulsa", description: "Siram secukupnya. Mulsa jerami dapat ditambahkan untuk menjaga kelembapan dan kehangatan tanah." },
    { week: 4, title: "Pemantauan Tunas", description: "Tunas biasanya mulai muncul. Pastikan tidak ada genangan air yang bisa membusukkan umbi." },
    { week: 5, title: "Pembubunan Pertama", description: "Timbun tanah di sekitar pangkal batang (tinggi 10 cm) agar umbi tidak terkena sinar matahari langsung." },
    { week: 6, title: "Pemupukan Susulan", description: "Berikan pupuk NPK di sepanjang larikan bedengan, lalu siram agar pupuk meresap." },
    { week: 7, title: "Penyiangan & Pemeliharaan", description: "Bersihkan gulma pengganggu dan gemburkan tanah di sela-sela bedengan secara hati-hati." },
    { week: 8, title: "Pengendalian Hama Daun", description: "Waspadai hawar daun (Phytophthora) di musim hujan Sembalun. Gunakan fungisida organik/aman jika ada gejala." },
    { week: 9, title: "Pembubunan Kedua", description: "Timbun tanah kembali di sekeliling batang untuk memperluas ruang pembesaran kentang." },
    { week: 10, title: "Penyiraman Masa Umbi", description: "Kentang memerlukan air stabil saat pembesaran umbi. Siram secara berkala tanpa berlebih." },
    { week: 11, title: "Hentikan Penyiraman", description: "Hentikan penyiraman saat daun mulai menguning alami agar kulit kentang mengeras (tidak mudah lecet)." },
    { week: 12, title: "Panen Kentang", description: "Gali bedengan dengan sekop garpu secara hati-hati agar umbi tidak terluka. Kering-anginkan kentang sebelum disimpan." },
  ],
  "Stroberi": [
    { week: 1, title: "Media & Mulsa Plastik", description: "Olah tanah dengan kompos, buat bedengan, pasang mulsa plastik hitam perak untuk menekan gulma." },
    { week: 2, title: "Penanaman Bibit", description: "Lubangi mulsa plastik dengan jarak 25x30 cm, tanam bibit stroberi polibek. Pastikan mahkota tanaman tidak tertimbun." },
    { week: 3, title: "Penyiraman & Stolon", description: "Siram setiap pagi/sore. Potong sulur/stolon baru agar nutrisi fokus membesarkan tanaman induk." },
    { week: 4, title: "Pemupukan Daun", description: "Semprot pupuk daun organik/cair untuk merangsang percabangan dan kerimbunan daun." },
    { week: 5, title: "Pemangkasan Daun Tua", description: "Potong daun yang tua, kering, atau terkena bercak agar sirkulasi udara baik dan mencegah jamur." },
    { week: 6, title: "Pemupukan Buah", description: "Berikan pupuk kalium tinggi (NPK buah) untuk merangsang pembungaan pertama." },
    { week: 7, title: "Perawatan Bunga", description: "Jaga kelembapan tanah. Bunga stroberi akan mulai mekar. Lindungi dari serangan siput atau burung." },
    { week: 8, title: "Pematangan Buah", description: "Buah stroberi muda mulai terbentuk. Pastikan buah bertumpu di atas plastik mulsa (tidak menyentuh tanah basah)." },
    { week: 9, title: "Panen Stroberi", description: "Petik buah yang sudah 80-100% merah di pagi hari menggunakan gunting stek beserta tangkainya." },
  ],
};

const GENERAL_STEPS: TaskStep[] = [
  { week: 1, title: "Persiapan Lahan", description: "Olah tanah, buat bedengan, dan campurkan pupuk organik/kompos dasar secukupnya." },
  { week: 2, title: "Penanaman", description: "Tanam bibit atau benih dengan kedalaman dan jarak tanam yang ideal untuk jenis tanaman tersebut." },
  { week: 3, title: "Penyiraman Rutin", description: "Lakukan penyiraman secara teratur (pagi/sore) sesuai kebutuhan air tanaman." },
  { week: 4, title: "Penyiangan Gulma", description: "Bersihkan gulma liar di sekeliling bedengan agar tanaman utama tumbuh optimal." },
  { week: 5, title: "Pemupukan Fase Tumbuh", description: "Gunakan pupuk nitrogen/NPK fase vegetatif untuk merangsang rimbun daun dan batang." },
  { week: 6, title: "Pengendalian Hama", description: "Amati gejala serangan hama/penyakit daun. Semprot pestisida nabati/organik jika diperlukan." },
  { week: 7, title: "Pemupukan Fase Buah", description: "Berikan pupuk tinggi kalium/fosfat untuk merangsang pembentukan bunga, buah, atau umbi." },
  { week: 8, title: "Pengairan Terkontrol", description: "Kurangi air saat pembentukan rasa/kematangan buah agar tidak hambar atau membusuk." },
  { week: 9, title: "Pemanenan", description: "Panen hasil kebun Anda sesuai dengan tanda fisik kematangan komoditas." },
];

export default function PlantingCalendar({ cropName, onClose }: Props) {
  // Dapatkan langkah-langkah jadwal berdasarkan preset
  const steps = useMemo(() => {
    const key = Object.keys(CROP_CALENDARS).find(
      (k) => cropName.toLowerCase().includes(k.toLowerCase())
    );
    return key ? CROP_CALENDARS[key] : GENERAL_STEPS;
  }, [cropName]);

  const storageKey = `agrivibe_cal_${cropName.replace(/\s+/g, "_").toLowerCase()}`;

  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);

  // Load status dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompletedWeeks(JSON.parse(saved));
      } catch {
        setCompletedWeeks([]);
      }
    }
  }, [storageKey]);

  // Simpan status
  const toggleWeek = (week: number) => {
    let updated;
    if (completedWeeks.includes(week)) {
      updated = completedWeeks.filter((w) => w !== week);
    } else {
      updated = [...completedWeeks, week];
    }
    setCompletedWeeks(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const resetCalendar = () => {
    if (confirm("Reset ulang semua progres kalender tanam ini?")) {
      setCompletedWeeks([]);
      localStorage.removeItem(storageKey);
    }
  };

  const progressPercent = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.round((completedWeeks.length / steps.length) * 100);
  }, [completedWeeks, steps]);

  // Temukan minggu aktif (minggu pertama yang belum dicentang)
  const activeWeek = useMemo(() => {
    const uncompleted = steps.find((s) => !completedWeeks.includes(s.week));
    return uncompleted ? uncompleted.week : null;
  }, [completedWeeks, steps]);

  return (
    <div className="glass-card animate-fade-in-up relative flex flex-col max-h-[85vh] w-full max-w-xl overflow-hidden border border-white/20 bg-slate-950/90 shadow-glass-lg backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-agri-500/10 p-2 text-agri-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">Kalender Tanam</h3>
            <p className="text-xs text-slate-400">{cropName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completedWeeks.length > 0 && (
            <button
              onClick={resetCalendar}
              title="Reset Progres"
              className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900/60 px-5 py-3 border-b border-white/5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Progres Penanaman</span>
          <span className="text-agri-400 font-bold">{progressPercent}% Selesai</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-agri-500 to-agri-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {progressPercent === 100 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center space-y-1 animate-pulse-soft">
            <p className="text-sm font-bold text-amber-300">🎉 Selamat! Penanaman Selesai</p>
            <p className="text-xs text-slate-300">
              Semua langkah dari pembibitan hingga panen telah dilalui. Semoga hasil panen melimpah!
            </p>
          </div>
        )}

        <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
          {steps.map((step) => {
            const isCompleted = completedWeeks.includes(step.week);
            const isActive = step.week === activeWeek;

            return (
              <div
                key={step.week}
                onClick={() => toggleWeek(step.week)}
                className={`relative group cursor-pointer select-none transition-all duration-200 ${
                  isCompleted ? "opacity-60" : ""
                }`}
              >
                {/* Timeline Node */}
                <div className="absolute -left-[31px] top-1 transition-transform group-hover:scale-110">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 bg-slate-950 text-agri-400 fill-agri-950" />
                  ) : isActive ? (
                    <Circle className="h-5 w-5 bg-slate-950 text-agri-400 fill-agri-500/20 animate-pulse" />
                  ) : (
                    <Circle className="h-5 w-5 bg-slate-950 text-slate-600" />
                  )}
                </div>

                {/* Content Box */}
                <div
                  className={`rounded-xl border p-4 transition-all duration-200 ${
                    isActive
                      ? "border-agri-500/30 bg-agri-500/5 shadow-[0_0_15px_rgba(34,197,94,0.05)]"
                      : isCompleted
                      ? "border-white/5 bg-transparent"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? "text-agri-400" : "text-slate-500"
                      }`}
                    >
                      Minggu {step.week}
                    </span>
                    {isCompleted && (
                      <span className="rounded bg-agri-500/10 px-1.5 py-0.5 text-[9px] font-bold text-agri-300 uppercase">
                        Selesai
                      </span>
                    )}
                  </div>
                  <h4
                    className={`mt-1 font-display font-semibold ${
                      isCompleted ? "text-slate-400 line-through" : "text-slate-100"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
