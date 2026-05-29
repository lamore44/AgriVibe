<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AgriVibe — Asisten Pertanian Cerdas Sembalun

AgriVibe adalah platform berbasis AI yang membantu petani di Kecamatan Sembalun, Lombok Timur menentukan **tanaman apa yang cocok ditanam** dan **bagaimana cara perawatan yang tepat** berdasarkan kondisi lahan dan cuaca.

## Fitur Utama

- **Analisis Lahan (Fuzzy Logic Mamdani)**: Mengkalkulasi skor kesesuaian lahan berdasarkan jenis tanah, sumber air, dan musim, lengkap dengan **Visualisasi Detail Keanggotaan Fuzzy & Aturan Inferensi** yang transparan.
- **Rekomendasi Tanaman AI**: Rekomendasi 3 tanaman terbaik disesuaikan dengan kondisi riil lahan menggunakan Gemini AI.
- **Asisten Chatbot AI**: Konsultasi tanya-jawab interaktif mengenai hama, penyakit, dan teknik budidaya spesifik untuk dataran tinggi Sembalun (1.200 mdpl).
- **Kalkulator Keuangan & Hasil Panen**: Estimasi modal kerja (bibit, pupuk, tenaga kerja), proyeksi tonase hasil panen, omset, laba bersih, serta ROI tanaman secara interaktif.
- **Kalender Tanam Interaktif**: Panduan tugas perawatan mingguan (todo list) mulai dari olah tanah hingga panen yang datanya disimpan di `localStorage`.
- **Cuaca Real-time**: Monitoring cuaca Sembalun live menggunakan OpenWeather API untuk memberikan tips pertanian yang relevan dengan cuaca saat ini.
- **Riwayat Rekomendasi**: Menyimpan data analisis sebelumnya secara lokal di browser petani.

## Tech Stack

```
apps/
  web/        # Next.js + Tailwind + shadcn/ui
  api/        # Rust (Axum) + Fuzzy Logic + Gemini API
```

## Menjalankan Aplikasi

**Prasyarat:** Node.js, Rust

1. Install dependencies web:
   `npm install`
2. Jalankan web app:
   `npm run dev:web`
3. Jalankan backend Rust:
   `npm run dev:api`

## Konfigurasi

Tambahkan API keys di `apps/api/.env`:
```
GEMINI_API_KEY=your_key
OPENWEATHER_API_KEY=your_key
```

## Pembuat & Hak Cipta

Aplikasi ini dirancang, dikembangkan, dan dikelola secara mandiri oleh:
* **Adhietya Pratama** - *Inisiator & Lead Developer*

## Lisensi

Proyek ini dilisensikan di bawah **MIT License** - lihat berkas [LICENSE](LICENSE) untuk detail hak cipta hukum lebih lanjut.
