mod fuzzy;
mod gemini;

use axum::{
    extract::ConnectInfo,
    extract::State,
    http::{Request, StatusCode},
    middleware,
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
    Json,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    env,
    net::SocketAddr,
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::Mutex;

// ── Request / Response types ──

#[derive(Deserialize)]
#[allow(dead_code)]
struct LandAnalysisRequest {
    jenis_tanah: String,
    luas_lahan_are: f64,
    sumber_air: String,
    musim: String,
    tanaman_sebelumnya: Option<String>,
    budget: String,
}

#[derive(Serialize)]
struct LandAnalysisResponse {
    suitability_score: f64,
    suitability_label: String,
    jenis_tanah: String,
    luas_lahan_are: f64,
    sumber_air: String,
    musim: String,
    soil_score: f64,
    water_score: f64,
    season_factor: f64,
    soil_membership: fuzzy::SoilMembership,
    water_membership: fuzzy::WaterMembership,
    rules_fired: Vec<fuzzy::FuzzyRuleFired>,
}

#[derive(Deserialize)]
struct CropRecommendRequest {
    jenis_tanah: String,
    luas_lahan_are: f64,
    sumber_air: String,
    musim: String,
    tanaman_sebelumnya: Option<String>,
    budget: String,
}

#[derive(Serialize)]
struct CropRecommendResponse {
    recommendations: Vec<gemini::CropItem>,
    tips_umum: String,
    source: String,
    suitability_score: f64,
    suitability_label: String,
    soil_score: f64,
    water_score: f64,
    season_factor: f64,
    soil_membership: fuzzy::SoilMembership,
    water_membership: fuzzy::WaterMembership,
    rules_fired: Vec<fuzzy::FuzzyRuleFired>,
}

#[derive(Deserialize)]
struct ChatRequest {
    history: Vec<gemini::ChatMessage>,
}

#[derive(Serialize)]
struct ChatResponse {
    reply: String,
}

#[derive(Serialize, Clone)]
struct ForecastDay {
    tanggal: String,
    suhu_min: f64,
    suhu_max: f64,
    kelembapan: f64,
    cuaca: String,
    angin: f64,
    curah_hujan: f64,
    icon: String,
}

#[derive(Serialize)]
struct WeatherResponse {
    suhu: f64,
    kelembapan: f64,
    cuaca: String,
    curah_hujan: f64,
    angin: f64,
    icon: String,
    forecast: Vec<ForecastDay>,
}

// ── Rate limiter ──

struct RateLimiter {
    window: Duration,
    max_requests: usize,
    requests: Mutex<HashMap<String, Vec<Instant>>>,
}

impl RateLimiter {
    fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            window,
            max_requests,
            requests: Mutex::new(HashMap::new()),
        }
    }

    async fn allow(&self, key: &str) -> bool {
        let mut requests = self.requests.lock().await;
        let now = Instant::now();
        let cutoff = now.checked_sub(self.window).unwrap_or(now);

        let entry = requests.entry(key.to_string()).or_insert_with(Vec::new);
        entry.retain(|timestamp| *timestamp > cutoff);

        if entry.len() >= self.max_requests {
            return false;
        }

        entry.push(now);
        true
    }
}

struct AiLimiters {
    rpm: RateLimiter,
    rpd: RateLimiter,
}

// ── Main ──

#[tokio::main]
async fn main() {
    // Load .env — try multiple paths because CWD may be the repo root
    let _ = dotenvy::from_filename("apps/api/.env");
    let _ = dotenvy::dotenv();
    let global_limiter = Arc::new(RateLimiter::new(60, Duration::from_secs(60)));
    let ai_limiters = Arc::new(AiLimiters {
        rpm: RateLimiter::new(3, Duration::from_secs(60)),
        rpd: RateLimiter::new(7, Duration::from_secs(24 * 3600)),
    });

    let app = Router::new()
        .route("/api/health", get(|| async { "AgriVibe Backend aktif — Platform Bantuan Petani Sembalun" }))
        .route("/api/analyze-land", post(handle_analyze_land))
        .route(
            "/api/recommend-crops",
            post(handle_recommend_crops).layer(middleware::from_fn_with_state(ai_limiters.clone(), ai_rate_limit_middleware)),
        )
        .route("/api/weather", get(handle_weather))
        .route(
            "/api/chat",
            post(handle_chat).layer(middleware::from_fn_with_state(ai_limiters, ai_rate_limit_middleware)),
        )
        .layer(middleware::from_fn_with_state(global_limiter, rate_limit_middleware));

    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse()
        .unwrap_or(3001);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("🌾 AgriVibe backend listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}

// ── Input Validation (OWASP A03: Injection) ──

fn validate_land_input(
    jenis_tanah: &str,
    sumber_air: &str,
    musim: &str,
    budget: &str,
    tanaman_sebelumnya: Option<&str>,
) -> Result<(), String> {
    let valid_soils = ["vulkanik", "lempung", "berpasir", "liat"];
    if !valid_soils.contains(&jenis_tanah.to_lowercase().as_str()) {
        return Err("Jenis tanah tidak valid. Harus vulkanik, lempung, berpasir, atau liat.".to_string());
    }

    let valid_water = ["irigasi", "tadah_hujan", "sungai", "sumur"];
    if !valid_water.contains(&sumber_air.to_lowercase().as_str()) {
        return Err("Sumber air tidak valid. Harus irigasi, tadah_hujan, sungai, atau sumur.".to_string());
    }

    let valid_seasons = ["hujan", "kemarau"];
    if !valid_seasons.contains(&musim.to_lowercase().as_str()) {
        return Err("Musim tidak valid. Harus hujan atau kemarau.".to_string());
    }

    let valid_budgets = ["rendah", "sedang", "tinggi"];
    if !valid_budgets.contains(&budget.to_lowercase().as_str()) {
        return Err("Budget tidak valid. Harus rendah, sedang, atau tinggi.".to_string());
    }

    if let Some(prev) = tanaman_sebelumnya {
        if prev.len() > 50 {
            return Err("Nama tanaman sebelumnya terlalu panjang (maksimal 50 karakter).".to_string());
        }
        if !prev.chars().all(|c| c.is_alphanumeric() || c.is_whitespace() || c == '/' || c == '-' || c == '_') {
            return Err("Nama tanaman sebelumnya mengandung karakter berbahaya.".to_string());
        }
    }

    Ok(())
}

fn validate_chat_request(history: &[gemini::ChatMessage]) -> Result<(), String> {
    if history.len() > 20 {
        return Err("Riwayat obrolan terlalu panjang (maksimal 20 pesan).".to_string());
    }
    for msg in history {
        if msg.content.len() > 500 {
            return Err("Pesan terlalu panjang (maksimal 500 karakter).".to_string());
        }
    }
    Ok(())
}

// ── Handlers ──

async fn handle_analyze_land(
    Json(payload): Json<LandAnalysisRequest>,
) -> Result<Json<LandAnalysisResponse>, (StatusCode, String)> {
    if let Err(err_msg) = validate_land_input(
        &payload.jenis_tanah,
        &payload.sumber_air,
        &payload.musim,
        &payload.budget,
        payload.tanaman_sebelumnya.as_deref(),
    ) {
        return Err((StatusCode::BAD_REQUEST, err_msg));
    }

    let fuzzy_input = fuzzy::FuzzyInput {
        jenis_tanah: payload.jenis_tanah.clone(),
        sumber_air: payload.sumber_air.clone(),
        musim: payload.musim.clone(),
    };

    let result = fuzzy::calculate_suitability(&fuzzy_input);

    Ok(Json(LandAnalysisResponse {
        suitability_score: result.suitability_score,
        suitability_label: result.label,
        jenis_tanah: payload.jenis_tanah,
        luas_lahan_are: payload.luas_lahan_are,
        sumber_air: payload.sumber_air,
        musim: payload.musim,
        soil_score: result.soil_score,
        water_score: result.water_score,
        season_factor: result.season_factor,
        soil_membership: result.soil_membership,
        water_membership: result.water_membership,
        rules_fired: result.rules_fired,
    }))
}

async fn handle_recommend_crops(
    Json(payload): Json<CropRecommendRequest>,
) -> Result<Json<CropRecommendResponse>, (StatusCode, String)> {
    if let Err(err_msg) = validate_land_input(
        &payload.jenis_tanah,
        &payload.sumber_air,
        &payload.musim,
        &payload.budget,
        payload.tanaman_sebelumnya.as_deref(),
    ) {
        return Err((StatusCode::BAD_REQUEST, err_msg));
    }

    // 1) Hitung skor kesesuaian lahan
    let fuzzy_input = fuzzy::FuzzyInput {
        jenis_tanah: payload.jenis_tanah.clone(),
        sumber_air: payload.sumber_air.clone(),
        musim: payload.musim.clone(),
    };
    let fuzzy_result = fuzzy::calculate_suitability(&fuzzy_input);

    // 2) Ambil data cuaca (best-effort)
    let weather = fetch_weather().await;

    // 3) Kirim ke Gemini
    let gemini_input = gemini::GeminiCropInput {
        jenis_tanah: payload.jenis_tanah,
        luas_lahan_are: payload.luas_lahan_are,
        sumber_air: payload.sumber_air,
        musim: payload.musim,
        tanaman_sebelumnya: payload.tanaman_sebelumnya,
        budget: payload.budget,
        suitability_score: fuzzy_result.suitability_score,
        suitability_label: fuzzy_result.label.clone(),
        suhu: weather.as_ref().map(|w| w.suhu),
        kelembapan: weather.as_ref().map(|w| w.kelembapan),
        cuaca_desc: weather.as_ref().map(|w| w.cuaca.clone()),
        curah_hujan: weather.as_ref().map(|w| w.curah_hujan),
    };

    match gemini::generate_crop_recommendation(&gemini_input).await {
        Ok(output) => Ok(Json(CropRecommendResponse {
            recommendations: output.recommendations,
            tips_umum: output.tips_umum,
            source: "gemini".to_string(),
            suitability_score: fuzzy_result.suitability_score,
            suitability_label: fuzzy_result.label.clone(),
            soil_score: fuzzy_result.soil_score,
            water_score: fuzzy_result.water_score,
            season_factor: fuzzy_result.season_factor,
            soil_membership: fuzzy_result.soil_membership.clone(),
            water_membership: fuzzy_result.water_membership.clone(),
            rules_fired: fuzzy_result.rules_fired.clone(),
        })),
        Err(err) => {
            eprintln!("Gemini error: {}", err);
            let fallback = gemini::fallback_recommendation(&gemini_input);
            Ok(Json(CropRecommendResponse {
                recommendations: fallback.recommendations,
                tips_umum: fallback.tips_umum,
                source: "fallback".to_string(),
                suitability_score: fuzzy_result.suitability_score,
                suitability_label: fuzzy_result.label.clone(),
                soil_score: fuzzy_result.soil_score,
                water_score: fuzzy_result.water_score,
                season_factor: fuzzy_result.season_factor,
                soil_membership: fuzzy_result.soil_membership.clone(),
                water_membership: fuzzy_result.water_membership.clone(),
                rules_fired: fuzzy_result.rules_fired.clone(),
            }))
        }
    }
}

async fn handle_chat(Json(payload): Json<ChatRequest>) -> Result<Json<ChatResponse>, (StatusCode, String)> {
    if let Err(err_msg) = validate_chat_request(&payload.history) {
        return Err((StatusCode::BAD_REQUEST, err_msg));
    }
    match gemini::generate_chat_response(payload.history).await {
        Ok(reply) => Ok(Json(ChatResponse { reply })),
        Err(err) => Err((StatusCode::INTERNAL_SERVER_ERROR, err)),
    }
}

async fn handle_weather() -> Result<Json<WeatherResponse>, (StatusCode, String)> {
    match fetch_weather().await {
        Some(w) => Ok(Json(w)),
        None => Err((StatusCode::SERVICE_UNAVAILABLE, "Weather data unavailable".into())),
    }
}

fn mock_weather() -> WeatherResponse {
    use chrono::{Duration as ChronoDuration, Local};
    let now = Local::now();
    
    let mut forecast = Vec::new();
    let mock_data = [
        ("hujan ringan", 16.0, 22.0, 80.0, 2.1, 2.5, "10d"),
        ("berawan", 17.0, 23.0, 75.0, 1.8, 0.0, "03d"),
        ("cerah berawan", 18.0, 24.0, 70.0, 2.2, 0.0, "02d"),
        ("hujan sedang", 16.0, 21.0, 85.0, 3.2, 8.5, "09d"),
        ("hujan lebat", 15.0, 20.0, 88.0, 4.1, 15.0, "10d"),
    ];
    
    for (i, &(cuaca, temp_min, temp_max, kelembapan, angin, curah_hujan, icon)) in mock_data.iter().enumerate() {
        let day = now + ChronoDuration::try_days((i + 1) as i64).unwrap_or_else(|| ChronoDuration::zero());
        forecast.push(ForecastDay {
            tanggal: day.format("%Y-%m-%d").to_string(),
            suhu_min: temp_min,
            suhu_max: temp_max,
            kelembapan,
            cuaca: cuaca.to_string(),
            angin,
            curah_hujan,
            icon: icon.to_string(),
        });
    }
    
    WeatherResponse {
        suhu: 19.5,
        kelembapan: 82.0,
        cuaca: "hujan ringan".to_string(),
        curah_hujan: 1.2,
        angin: 2.5,
        icon: "10d".to_string(),
        forecast,
    }
}

/// Fetch cuaca Sembalun dari OpenWeather API.
/// Koordinat Sembalun: lat -8.3619, lon 116.5084
async fn fetch_weather() -> Option<WeatherResponse> {
    let api_key = match env::var("OPENWEATHER_API_KEY") {
        Ok(k) => k,
        Err(_) => {
            eprintln!("[weather] OPENWEATHER_API_KEY not set. Using mock weather fallback.");
            return Some(mock_weather());
        }
    };

    let client = reqwest::Client::new();
    let current_url = format!(
        "https://api.openweathermap.org/data/2.5/weather?lat=-8.3619&lon=116.5084&units=metric&lang=id&appid={}",
        api_key
    );
    let forecast_url = format!(
        "https://api.openweathermap.org/data/2.5/forecast?lat=-8.3619&lon=116.5084&units=metric&lang=id&appid={}",
        api_key
    );

    // Fetch both endpoints in parallel using tokio::join!
    let current_future = client.get(&current_url).send();
    let forecast_future = client.get(&forecast_url).send();
    let (current_res, forecast_res) = tokio::join!(current_future, forecast_future);

    // Read and parse current weather response
    let current_resp = match current_res {
        Ok(r) if r.status().is_success() => r.json::<serde_json::Value>().await.ok(),
        _ => None,
    };

    // Read and parse forecast weather response
    let forecast_resp = match forecast_res {
        Ok(r) if r.status().is_success() => r.json::<serde_json::Value>().await.ok(),
        _ => None,
    };

    // If both failed, fall back to mock
    if current_resp.is_none() && forecast_resp.is_none() {
        eprintln!("[weather] Both API requests failed. Using mock weather fallback.");
        return Some(mock_weather());
    }

    let default_val = serde_json::Value::Null;
    let curr = current_resp.unwrap_or(default_val.clone());
    
    // Helper: extract number (handles both integer and float JSON values)
    let as_num = |v: &serde_json::Value| -> Option<f64> {
        v.as_f64().or_else(|| v.as_i64().map(|i| i as f64))
    };

    let main_obj = curr.get("main");
    let suhu = main_obj
        .and_then(|m| m.get("temp"))
        .and_then(|v| as_num(v))
        .unwrap_or(20.0);

    let kelembapan = main_obj
        .and_then(|m| m.get("humidity"))
        .and_then(|v| as_num(v))
        .unwrap_or(80.0);

    let cuaca = curr
        .get("weather")
        .and_then(|w| w.get(0))
        .and_then(|w| w.get("description"))
        .and_then(|v| v.as_str())
        .unwrap_or("tidak diketahui")
        .to_string();

    let curah_hujan = curr
        .get("rain")
        .and_then(|r| r.get("1h"))
        .and_then(|v| as_num(v))
        .unwrap_or(0.0);

    let angin = curr
        .get("wind")
        .and_then(|w| w.get("speed"))
        .and_then(|v| as_num(v))
        .unwrap_or(0.0);

    let icon = curr
        .get("weather")
        .and_then(|w| w.get(0))
        .and_then(|w| w.get("icon"))
        .and_then(|v| v.as_str())
        .unwrap_or("01d")
        .to_string();

    let mut forecast_days = Vec::new();
    if let Some(f_data) = forecast_resp {
        let mut forecast_map: HashMap<String, Vec<serde_json::Value>> = HashMap::new();
        let today_str = chrono::Local::now().format("%Y-%m-%d").to_string();

        if let Some(list_arr) = f_data.get("list").and_then(|l| l.as_array()) {
            for item in list_arr {
                if let Some(dt_txt) = item.get("dt_txt").and_then(|d| d.as_str()) {
                    if dt_txt.len() >= 10 {
                        let date_key = dt_txt[0..10].to_string();
                        // Hanya masukkan prakiraan jika bukan tanggal hari ini (prakiraan mulai besok)
                        if date_key != today_str {
                            forecast_map.entry(date_key).or_insert_with(Vec::new).push(item.clone());
                        }
                    }
                }
            }
        }

        let mut sorted_keys: Vec<String> = forecast_map.keys().cloned().collect();
        sorted_keys.sort();

        for date_key in sorted_keys {
            let items = &forecast_map[&date_key];
            if items.is_empty() { continue; }

            let mut temp_min = f64::MAX;
            let mut temp_max = f64::MIN;
            let mut total_humidity = 0.0;
            let mut total_wind = 0.0;
            let mut total_rain = 0.0;
            let mut count = 0.0;

            let mut representative_item = &items[0];
            for item in items {
                if let Some(dt_txt) = item.get("dt_txt").and_then(|d| d.as_str()) {
                    if dt_txt.contains("12:00:00") {
                        representative_item = item;
                    }
                }

                let main_obj = item.get("main");
                if let Some(t) = main_obj.and_then(|m| m.get("temp")).and_then(|v| as_num(v)) {
                    if t < temp_min { temp_min = t; }
                    if t > temp_max { temp_max = t; }
                }
                if let Some(h) = main_obj.and_then(|m| m.get("humidity")).and_then(|v| as_num(v)) {
                    total_humidity += h;
                }
                if let Some(w) = item.get("wind").and_then(|w| w.get("speed")).and_then(|v| as_num(v)) {
                    total_wind += w;
                }
                if let Some(r) = item.get("rain").and_then(|r| r.get("3h")).and_then(|v| as_num(v)) {
                    total_rain += r;
                }
                count += 1.0;
            }

            if count == 0.0 { continue; }

            let avg_humidity = total_humidity / count;
            let avg_wind = total_wind / count;

            let f_cuaca = representative_item
                .get("weather")
                .and_then(|w| w.get(0))
                .and_then(|w| w.get("description"))
                .and_then(|v| v.as_str())
                .unwrap_or("tidak diketahui")
                .to_string();

            let f_icon = representative_item
                .get("weather")
                .and_then(|w| w.get(0))
                .and_then(|w| w.get("icon"))
                .and_then(|v| v.as_str())
                .unwrap_or("01d")
                .to_string();

            forecast_days.push(ForecastDay {
                tanggal: date_key,
                suhu_min: if temp_min == f64::MAX { 18.0 } else { temp_min },
                suhu_max: if temp_max == f64::MIN { 24.0 } else { temp_max },
                kelembapan: avg_humidity,
                cuaca: f_cuaca,
                angin: avg_wind,
                curah_hujan: total_rain,
                icon: f_icon,
            });
        }
    }

    if forecast_days.is_empty() {
        forecast_days = mock_weather().forecast;
    }

    eprintln!("[weather] Success: {}°C, {}%, {} — with {} forecast days", suhu, kelembapan, cuaca, forecast_days.len());

    Some(WeatherResponse {
        suhu,
        kelembapan,
        cuaca,
        curah_hujan,
        angin,
        icon,
        forecast: forecast_days,
    })
}

// ── Middleware ──

async fn rate_limit_middleware(
    State(limiter): State<Arc<RateLimiter>>,
    request: Request<axum::body::Body>,
    next: middleware::Next,
) -> Response {
    let mut ip_str = String::new();
    if let Some(xff) = request.headers().get("x-forwarded-for") {
        if let Ok(s) = xff.to_str() {
            if let Some(first_ip) = s.split(',').next() {
                ip_str = first_ip.trim().to_string();
            }
        }
    }
    if ip_str.is_empty() {
        if let Some(xri) = request.headers().get("x-real-ip") {
            if let Ok(s) = xri.to_str() {
                ip_str = s.trim().to_string();
            }
        }
    }
    if ip_str.is_empty() {
        if let Some(info) = request.extensions().get::<ConnectInfo<SocketAddr>>() {
            ip_str = info.0.ip().to_string();
        }
    }

    if !ip_str.is_empty() {
        if !limiter.allow(&ip_str).await {
            return (
                StatusCode::TOO_MANY_REQUESTS,
                Json(serde_json::json!({
                    "error": "Batas kecepatan global terlampaui. Silakan coba beberapa saat lagi."
                })),
            )
                .into_response();
        }
    }

    next.run(request).await
}

async fn ai_rate_limit_middleware(
    State(limiters): State<Arc<AiLimiters>>,
    request: Request<axum::body::Body>,
    next: middleware::Next,
) -> Response {
    let mut ip_str = String::new();
    if let Some(xff) = request.headers().get("x-forwarded-for") {
        if let Ok(s) = xff.to_str() {
            if let Some(first_ip) = s.split(',').next() {
                ip_str = first_ip.trim().to_string();
            }
        }
    }
    if ip_str.is_empty() {
        if let Some(xri) = request.headers().get("x-real-ip") {
            if let Ok(s) = xri.to_str() {
                ip_str = s.trim().to_string();
            }
        }
    }
    if ip_str.is_empty() {
        if let Some(info) = request.extensions().get::<ConnectInfo<SocketAddr>>() {
            ip_str = info.0.ip().to_string();
        }
    }

    // Identifikasi pengguna menggunakan User ID atau fallback ke IP address
    let user_key = request
        .headers()
        .get("x-user-id")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or(ip_str);

    // 1. Periksa batas RPM (3 per menit)
    if !limiters.rpm.allow(&user_key).await {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({
                "error": "Batas kecepatan (RPM) terlampaui. Anda hanya diperbolehkan mengirim 3 permintaan per menit ke AI."
            })),
        )
            .into_response();
    }

    // 2. Periksa batas RPD (7 per hari)
    if !limiters.rpd.allow(&user_key).await {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({
                "error": "Batas harian (RPD) terlampaui. Anda telah mencapai batas 7 kali penggunaan AI per hari."
            })),
        )
            .into_response();
    }

    next.run(request).await
}
