use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;

// ── Gemini config ──
const GEMINI_BASE: &str = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODELS: &[&str] = &[
    "gemini-3.1-flash-lite",    // Gemini 3.1 Flash-Lite (500 RPD)
    "gemini-2.0-flash-lite",    // Gemini 2.0 Flash-Lite (20 RPD)
    "gemini-2.0-flash",         // Gemini 2.0 Flash (20 RPD)
    "gemini-2.5-flash-lite",    // Gemini 2.5 Flash-Lite (20 RPD)
    "gemini-2.5-flash",         // Gemini 2.5 Flash (20 RPD)
    "gemini-3.5-flash",         // Gemini 3.5 Flash (20 RPD)
];

/// Data yang dikirim untuk generate rekomendasi tanaman.
#[derive(Debug)]
pub struct GeminiCropInput {
    pub jenis_tanah: String,
    pub luas_lahan_are: f64,
    pub sumber_air: String,
    pub musim: String,
    pub tanaman_sebelumnya: Option<String>,
    pub budget: String,
    pub suitability_score: f64,
    pub suitability_label: String,
    // Data cuaca
    pub suhu: Option<f64>,
    pub kelembapan: Option<f64>,
    pub cuaca_desc: Option<String>,
    pub curah_hujan: Option<f64>,
}

/// Struktur output yang kita harapkan.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CropRecommendationOutput {
    pub recommendations: Vec<CropItem>,
    pub tips_umum: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CropItem {
    pub nama_tanaman: String,
    pub skor_kesesuaian: u32,
    pub alasan: String,
    pub panduan_perawatan: CareGuide,
    pub estimasi_panen: String,
    pub tips_cuaca: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CareGuide {
    pub persiapan_lahan: String,
    pub penanaman: String,
    pub pemupukan: String,
    pub pengairan: String,
    pub pengendalian_hama: String,
    pub panen: String,
}

// ══════════════════════════════════════════════════════════════════════
//  Entry point — Hanya Gemini AI, lalu fallback statis
// ══════════════════════════════════════════════════════════════════════

pub async fn generate_crop_recommendation(input: &GeminiCropInput) -> Result<CropRecommendationOutput, String> {
    let prompt = build_crop_prompt(input);
    let client = Client::new();

    // Coba Gemini (jika GEMINI_API_KEY ada)
    if let Ok(gemini_key) = env::var("GEMINI_API_KEY") {
        for model in GEMINI_MODELS {
            let endpoint = format!("{}/{}:generateContent?key={}", GEMINI_BASE, model, gemini_key);
            eprintln!("[ai] Trying Gemini ({})...", model);
            match call_gemini(&client, &endpoint, &prompt).await {
                Ok(result) => {
                    eprintln!("[ai] ✅ Gemini ({}) success!", model);
                    return Ok(result);
                }
                Err(err) => {
                    eprintln!("[ai] ❌ Gemini ({}) failed: {}", model, err);
                    // Kalau 429, coba model selanjutnya
                    if !err.contains("429") && !err.contains("RESOURCE_EXHAUSTED") {
                        break; // Error lain, langsung skip semua Gemini
                    }
                }
            }
        }
    }

    Err("Gemini AI gagal memberikan rekomendasi. Pastikan GEMINI_API_KEY valid.".to_string())
}

// ══════════════════════════════════════════════════════════════════════
//  Gemini API call
// ══════════════════════════════════════════════════════════════════════

async fn call_gemini(
    client: &Client,
    endpoint: &str,
    prompt: &str,
) -> Result<CropRecommendationOutput, String> {
    let response = client
        .post(endpoint)
        .json(&json!({
            "contents": [
                {
                    "role": "user",
                    "parts": [{ "text": prompt }]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1500,
                "responseMimeType": "application/json"
            }
        }))
        .send()
        .await
        .map_err(|err| format!("Request failed: {}", err))?;

    let status = response.status();
    let body_text = response.text().await.map_err(|err| format!("Read body failed: {}", err))?;

    eprintln!("[gemini] HTTP status: {}", status);
    eprintln!("[gemini] Response (first 500 chars): {}", &body_text[..body_text.len().min(500)]);

    if !status.is_success() {
        return Err(format!("Gemini API returned HTTP {}: {}", status, &body_text[..body_text.len().min(500)]));
    }

    let payload: serde_json::Value =
        serde_json::from_str(&body_text).map_err(|err| format!("JSON parse failed: {}", err))?;

    // Check for API-level error
    if let Some(error) = payload.get("error") {
        let msg = error.get("message").and_then(|v| v.as_str()).unwrap_or("unknown");
        let code = error.get("code").and_then(|v| v.as_i64()).unwrap_or(0);
        return Err(format!("Gemini API error (code {}): {}", code, msg));
    }

    // Check for safety block
    if let Some(candidates) = payload.get("candidates") {
        if let Some(first) = candidates.get(0) {
            if let Some(reason) = first.get("finishReason").and_then(|v| v.as_str()) {
                if reason == "SAFETY" {
                    return Err("Gemini blocked by safety filter".to_string());
                }
            }
        }
    }

    // Check for promptFeedback block
    if let Some(feedback) = payload.get("promptFeedback") {
        if let Some(reason) = feedback.get("blockReason").and_then(|v| v.as_str()) {
            return Err(format!("Gemini prompt blocked: {}", reason));
        }
    }

    let text = payload
        .get("candidates")
        .and_then(|v| v.get(0))
        .and_then(|v| v.get("content"))
        .and_then(|v| v.get("parts"))
        .and_then(|v| v.get(0))
        .and_then(|v| v.get("text"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| format!("Unexpected Gemini response structure: {}", &body_text[..body_text.len().min(500)]))?;

    let result: CropRecommendationOutput =
        serde_json::from_str(text).map_err(|err| format!("JSON parse error: {} — raw: {}", err, text))?;

    Ok(result)
}

// ══════════════════════════════════════════════════════════════════════
//  Prompt builder
// ══════════════════════════════════════════════════════════════════════

fn build_crop_prompt(input: &GeminiCropInput) -> String {
    let tanaman_sblm = input.tanaman_sebelumnya.as_deref().unwrap_or("Tidak ada / belum pernah tanam");
    let suhu = input.suhu.map_or("Tidak tersedia".into(), |v| format!("{:.1}°C", v));
    let kelembapan = input.kelembapan.map_or("Tidak tersedia".into(), |v| format!("{:.0}%", v));
    let cuaca = input.cuaca_desc.as_deref().unwrap_or("Tidak tersedia");
    let curah = input.curah_hujan.map_or("Tidak tersedia".into(), |v| format!("{:.1} mm", v));

    format!(
r#"Anda adalah asisten pertanian AI untuk petani di Sembalun, Lombok Timur.
Lokasi: Kecamatan Sembalun, ketinggian rata-rata 1.200 mdpl, iklim pegunungan tropis.
Tanaman yang umum dan berhasil di Sembalun: bawang merah, bawang putih, kentang, stroberi, kopi arabika, tomat, cabai, wortel, kubis, selada, daun bawang.

DATA LAHAN PETANI:
- Jenis tanah: {jenis_tanah}
- Luas lahan: {luas_lahan} are
- Sumber air: {sumber_air}
- Musim saat ini: {musim}
- Tanaman sebelumnya: {tanaman_sblm}
- Budget petani: {budget}
- Skor kesesuaian lahan (Fuzzy Logic): {skor:.1}/100 ({label})

DATA CUACA SAAT INI DI SEMBALUN:
- Suhu: {suhu}
- Kelembapan: {kelembapan}
- Kondisi cuaca: {cuaca}
- Curah hujan: {curah}

INSTRUKSI PENTING:
1. ANALISIS PARAMETER INPUT: Rekomendasi harus didasarkan sepenuhnya pada data lahan & cuaca di atas. Penjelasan di kolom 'alasan' untuk setiap tanaman WAJIB merujuk dan menghubungkan parameter input berikut secara nyata:
   - Jenis tanah ({jenis_tanah}) & skor kesesuaian ({skor:.1}/100 - {label}).
   - Sumber air ({sumber_air}) & Musim ({musim}) & Kondisi cuaca ({cuaca}).
   - Budget petani ({budget}).
   - Rotasi terhadap tanaman sebelumnya ({tanaman_sblm}).
2. OPTIMALISASI TOKEN & SINGKAT: Jawaban di setiap field JSON (terutama 'alasan', 'panduan_perawatan' (tiap langkah), 'tips_cuaca', dan 'tips_umum') harus sangat ringkas, padat, langsung ke inti (to-the-point), dan tidak bertele-tele. Batasi setiap deskripsi teks maksimal 2 kalimat.
3. Berikan tepat 3 rekomendasi tanaman terbaik yang paling cocok.
4. Gunakan Bahasa Indonesia yang sederhana dan mudah dipahami oleh petani lokal Sembalun.

WAJIB output JSON dengan struktur:
{{
  "recommendations": [
    {{
      "nama_tanaman": "...",
      "skor_kesesuaian": 0-100,
      "alasan": "penjelasan sangat singkat kenapa tanaman ini cocok dengan merujuk jenis tanah, air/musim, budget, tanaman sebelumnya, dan skor fuzzy",
      "panduan_perawatan": {{
        "persiapan_lahan": "langkah persiapan lahan singkat",
        "penanaman": "cara menanam singkat",
        "pemupukan": "pemupukan singkat",
        "pengairan": "pengairan singkat",
        "pengendalian_hama": "hama singkat",
        "panen": "panen singkat"
      }},
      "estimasi_panen": "berapa bulan sampai panen",
      "tips_cuaca": "tips singkat berdasarkan cuaca saat ini"
    }}
  ],
  "tips_umum": "saran umum singkat untuk petani berdasarkan keseluruhan kondisi"
}}"#,
        jenis_tanah = input.jenis_tanah,
        luas_lahan = input.luas_lahan_are,
        sumber_air = input.sumber_air,
        musim = input.musim,
        tanaman_sblm = tanaman_sblm,
        budget = input.budget,
        skor = input.suitability_score,
        label = input.suitability_label,
        suhu = suhu,
        kelembapan = kelembapan,
        cuaca = cuaca,
        curah = curah,
    )
}

// ══════════════════════════════════════════════════════════════════════
//  Fallback statis jika semua AI gagal
// ══════════════════════════════════════════════════════════════════════

/// Fallback jika semua AI gagal — berikan rekomendasi statis.
pub fn fallback_recommendation(input: &GeminiCropInput) -> CropRecommendationOutput {
    let base_crops = vec![
        ("Bawang Merah", 80, "Bawang merah sangat cocok di dataran tinggi Sembalun dengan tanah vulkanik yang subur."),
        ("Kentang", 75, "Kentang tumbuh baik di ketinggian 1.200 mdpl dengan suhu sejuk."),
        ("Kubis", 70, "Kubis cocok untuk iklim pegunungan dan relatif mudah dirawat."),
    ];

    let recommendations = base_crops
        .into_iter()
        .map(|(nama, skor, alasan)| CropItem {
            nama_tanaman: nama.to_string(),
            skor_kesesuaian: skor,
            alasan: alasan.to_string(),
            panduan_perawatan: CareGuide {
                persiapan_lahan: "Olah tanah sedalam 20-30 cm, buat bedengan dengan lebar 1 meter.".into(),
                penanaman: "Tanam dengan jarak 15-20 cm antar tanaman.".into(),
                pemupukan: "Gunakan pupuk kandang saat persiapan, pupuk NPK saat pertumbuhan.".into(),
                pengairan: "Siram secukupnya, hindari genangan air.".into(),
                pengendalian_hama: "Periksa tanaman rutin, gunakan pestisida organik jika perlu.".into(),
                panen: "Panen saat tanaman sudah menunjukkan tanda matang sesuai jenisnya.".into(),
            },
            estimasi_panen: "2-4 bulan".into(),
            tips_cuaca: format!("Perhatikan kondisi musim {} saat ini, sesuaikan jadwal penyiraman.", input.musim),
        })
        .collect();

    CropRecommendationOutput {
        recommendations,
        tips_umum: "Pastikan drainase lahan baik, gunakan mulsa untuk menjaga kelembapan tanah, dan lakukan rotasi tanaman secara berkala untuk menjaga kesuburan tanah.".into(),
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChatMessage {
    pub role: String, // "user" atau "assistant" / "model"
    pub content: String,
}

pub async fn generate_chat_response(history: Vec<ChatMessage>) -> Result<String, String> {
    let client = Client::new();
    
    // System instruction untuk menjaga chatbot agar hanya menjawab topik pertanian Sembalun
    let system_instruction = "Kamu adalah AgriVibe AI, asisten penyuluh pertanian cerdas untuk petani di Kecamatan Sembalun, Lombok Timur. Tugas utama Anda ADALAH HANYA menjawab pertanyaan seputar pertanian, budidaya tanaman, hama, penyakit tanaman, pupuk, pengairan, cuaca pertanian, atau petunjuk teknis tani lokal Sembalun. Jika pengguna bertanya tentang topik di luar pertanian (seperti politik, pemrograman komputer, matematika, sejarah, gosip, resep makanan umum, obrolan santai, meminta lelucon/jokes, pantun, tebak-tebakan, atau humor lainnya), Anda WAJIB menolak menjawab dengan sopan, menjelaskan batasan tugas Anda, dan mengarahkan mereka untuk menanyakan seputar masalah pertanian Sembalun. Jangan pernah memberikan jokes atau lelucon meskipun diminta. Jawablah dengan ramah, sopan, praktis, ringkas, langsung ke inti, dan maksimal 3 paragraf pendek.";

    // Coba Gemini jika GEMINI_API_KEY ada
    if let Ok(gemini_key) = env::var("GEMINI_API_KEY") {
        for model in GEMINI_MODELS {
            let endpoint = format!("{}/{}:generateContent?key={}", GEMINI_BASE, model, gemini_key);
            
            // Format history ke format Gemini
            let mut contents = Vec::new();
            for msg in &history {
                let role = if msg.role == "assistant" || msg.role == "model" { "model" } else { "user" };
                contents.push(json!({
                    "role": role,
                    "parts": [{ "text": msg.content }]
                }));
            }
            
            let req_body = json!({
                "contents": contents,
                "systemInstruction": {
                    "parts": [{ "text": system_instruction }]
                },
                "generationConfig": {
                    "temperature": 0.6,
                    "maxOutputTokens": 1500
                }
            });
            
            match client.post(&endpoint).json(&req_body).send().await {
                Ok(resp) => {
                    let status = resp.status();
                    if status.is_success() {
                        if let Ok(body_text) = resp.text().await {
                            if let Ok(payload) = serde_json::from_str::<serde_json::Value>(&body_text) {
                                if let Some(text) = payload
                                    .get("candidates")
                                    .and_then(|v| v.get(0))
                                    .and_then(|v| v.get("content"))
                                    .and_then(|v| v.get("parts"))
                                    .and_then(|v| v.get(0))
                                    .and_then(|v| v.get("text"))
                                    .and_then(|v| v.as_str())
                                {
                                    return Ok(text.to_string());
                                }
                            }
                        }
                    } else {
                        if let Ok(err_text) = resp.text().await {
                            eprintln!("[chat] Gemini {} returned error status: {} - {}", model, status, err_text);
                        }
                    }
                }
                Err(err) => {
                    eprintln!("[chat] Gemini {} request failed: {}", model, err);
                }
            }
        }
    }
    
    Err("Gemini AI gagal memberikan respon chat. Pastikan GEMINI_API_KEY valid.".to_string())
}
