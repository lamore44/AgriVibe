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
    net::{IpAddr, SocketAddr},
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

#[derive(Serialize)]
struct WeatherResponse {
    suhu: f64,
    kelembapan: f64,
    cuaca: String,
    curah_hujan: f64,
    angin: f64,
}

// ── Rate limiter ──

struct RateLimiter {
    window: Duration,
    max_requests: usize,
    requests: Mutex<HashMap<IpAddr, Vec<Instant>>>,
}

impl RateLimiter {
    fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            window,
            max_requests,
            requests: Mutex::new(HashMap::new()),
        }
    }

    async fn allow(&self, ip: IpAddr) -> bool {
        let mut requests = self.requests.lock().await;
        let now = Instant::now();
        let cutoff = now - self.window;

        let entry = requests.entry(ip).or_insert_with(Vec::new);
        entry.retain(|timestamp| *timestamp > cutoff);

        if entry.len() >= self.max_requests {
            return false;
        }

        entry.push(now);
        true
    }
}

// ── Main ──

#[tokio::main]
async fn main() {
    // Load .env — try multiple paths because CWD may be the repo root
    let _ = dotenvy::from_filename("apps/api/.env");
    let _ = dotenvy::dotenv();
    let limiter = Arc::new(RateLimiter::new(30, Duration::from_secs(60)));

    let app = Router::new()
        .route("/api/health", get(|| async { "AgriVibe Backend aktif — Platform Bantuan Petani Sembalun" }))
        .route("/api/analyze-land", post(handle_analyze_land))
        .route("/api/recommend-crops", post(handle_recommend_crops))
        .route("/api/weather", get(handle_weather))
        .route("/api/chat", post(handle_chat))
        .layer(middleware::from_fn_with_state(limiter, rate_limit_middleware));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("🌾 AgriVibe backend listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}

// ── Handlers ──

async fn handle_analyze_land(Json(payload): Json<LandAnalysisRequest>) -> Json<LandAnalysisResponse> {
    let fuzzy_input = fuzzy::FuzzyInput {
        jenis_tanah: payload.jenis_tanah.clone(),
        sumber_air: payload.sumber_air.clone(),
        musim: payload.musim.clone(),
    };

    let result = fuzzy::calculate_suitability(&fuzzy_input);

    Json(LandAnalysisResponse {
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
    })
}

async fn handle_recommend_crops(Json(payload): Json<CropRecommendRequest>) -> Json<CropRecommendResponse> {
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
        Ok(output) => Json(CropRecommendResponse {
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
        }),
        Err(err) => {
            eprintln!("Gemini error: {}", err);
            let fallback = gemini::fallback_recommendation(&gemini_input);
            Json(CropRecommendResponse {
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
            })
        }
    }
}

async fn handle_chat(Json(payload): Json<ChatRequest>) -> Result<Json<ChatResponse>, (StatusCode, String)> {
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

/// Fetch cuaca Sembalun dari OpenWeather API.
/// Koordinat Sembalun: lat -8.3619, lon 116.5084
async fn fetch_weather() -> Option<WeatherResponse> {
    let api_key = match env::var("OPENWEATHER_API_KEY") {
        Ok(k) => k,
        Err(_) => {
            eprintln!("[weather] OPENWEATHER_API_KEY not set");
            return None;
        }
    };

    let url = format!(
        "https://api.openweathermap.org/data/2.5/weather?lat=-8.3619&lon=116.5084&units=metric&lang=id&appid={}",
        api_key
    );

    let client = reqwest::Client::new();
    let response = match client.get(&url).send().await {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[weather] HTTP request failed: {}", e);
            return None;
        }
    };

    let status = response.status();
    let body = match response.text().await {
        Ok(t) => t,
        Err(e) => {
            eprintln!("[weather] Failed to read body: {}", e);
            return None;
        }
    };

    if !status.is_success() {
        eprintln!("[weather] API returned status {}: {}", status, body);
        return None;
    }

    let resp: serde_json::Value = match serde_json::from_str(&body) {
        Ok(v) => v,
        Err(e) => {
            eprintln!("[weather] JSON parse failed: {} — body: {}", e, &body[..200.min(body.len())]);
            return None;
        }
    };

    // Helper: extract number (handles both integer and float JSON values)
    let as_num = |v: &serde_json::Value| -> Option<f64> {
        v.as_f64().or_else(|| v.as_i64().map(|i| i as f64))
    };

    let main_obj = resp.get("main");
    let suhu = main_obj
        .and_then(|m| m.get("temp"))
        .and_then(|v| as_num(v))
        .unwrap_or(0.0);

    let kelembapan = main_obj
        .and_then(|m| m.get("humidity"))
        .and_then(|v| as_num(v))
        .unwrap_or(0.0);

    let cuaca = resp
        .get("weather")
        .and_then(|w| w.get(0))
        .and_then(|w| w.get("description"))
        .and_then(|v| v.as_str())
        .unwrap_or("tidak diketahui")
        .to_string();

    let curah_hujan = resp
        .get("rain")
        .and_then(|r| r.get("1h"))
        .and_then(|v| as_num(v))
        .unwrap_or(0.0);

    let angin = resp
        .get("wind")
        .and_then(|w| w.get("speed"))
        .and_then(|v| as_num(v))
        .unwrap_or(0.0);

    eprintln!("[weather] Success: {}°C, {}%, {}", suhu, kelembapan, cuaca);

    Some(WeatherResponse {
        suhu,
        kelembapan,
        cuaca,
        curah_hujan,
        angin,
    })
}

// ── Middleware ──

async fn rate_limit_middleware(
    State(limiter): State<Arc<RateLimiter>>,
    request: Request<axum::body::Body>,
    next: middleware::Next,
) -> Response {
    let ip = request
        .extensions()
        .get::<ConnectInfo<SocketAddr>>()
        .map(|info| info.0.ip());

    if let Some(ip) = ip {
        if !limiter.allow(ip).await {
            return (StatusCode::TOO_MANY_REQUESTS, "Rate limit exceeded").into_response();
        }
    }

    next.run(request).await
}
