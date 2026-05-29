//! Fuzzy Logic — Soil Suitability Score (Mamdani)
//!
//! Menghitung skor kesesuaian lahan pertanian di Sembalun berdasarkan:
//! - Jenis tanah (dinormalisasi ke 0-10)
//! - Sumber air (dinormalisasi ke 0-10)
//! - Musim (faktor pengali)
//!
//! Output: suitability_score (0-100)

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Clone, Debug)]
pub struct FuzzyInput {
    /// Jenis tanah: "vulkanik", "lempung", "berpasir", "liat"
    pub jenis_tanah: String,
    /// Sumber air: "irigasi", "tadah_hujan", "sungai", "sumur"
    pub sumber_air: String,
    /// Musim: "hujan" atau "kemarau"
    pub musim: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SoilMembership {
    pub poor: f64,
    pub fair: f64,
    pub rich: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WaterMembership {
    pub scarce: f64,
    pub decent: f64,
    pub ample: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FuzzyRuleFired {
    pub name: String,
    pub rule_text: String,
    pub value: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FuzzyOutput {
    pub suitability_score: f64,
    pub label: String,
    pub soil_score: f64,
    pub water_score: f64,
    pub season_factor: f64,
    pub soil_membership: SoilMembership,
    pub water_membership: WaterMembership,
    pub rules_fired: Vec<FuzzyRuleFired>,
}

/// Konversi jenis tanah ke nilai numerik kesuburan (0-10).
/// Tanah vulkanik Sembalun sangat subur karena mineral dari Rinjani.
fn soil_value(jenis_tanah: &str) -> f64 {
    match jenis_tanah {
        "vulkanik" => 9.0,
        "lempung" => 7.0,
        "liat" => 5.0,
        "berpasir" => 3.5,
        _ => 5.0,
    }
}

/// Konversi sumber air ke nilai keandalan (0-10).
fn water_value(sumber_air: &str) -> f64 {
    match sumber_air {
        "irigasi" => 9.0,
        "sungai" => 7.5,
        "sumur" => 6.0,
        "tadah_hujan" => 4.0,
        _ => 5.0,
    }
}

/// Faktor musim — musim hujan = lebih banyak air tapi risiko hama,
/// kemarau = kurang air tapi lebih stabil.
fn season_factor(musim: &str) -> f64 {
    match musim {
        "hujan" => 1.05,
        "kemarau" => 0.90,
        _ => 1.0,
    }
}

pub fn calculate_suitability(input: &FuzzyInput) -> FuzzyOutput {
    let soil = soil_value(&input.jenis_tanah);
    let water = water_value(&input.sumber_air);
    let season = season_factor(&input.musim);

    // --- FUZZYFIKASI ---

    // Kesuburan tanah
    let soil_poor   = left_shoulder(soil, 3.0, 5.0);
    let soil_fair   = triangle(soil, 4.0, 6.0, 8.0);
    let soil_rich   = right_shoulder(soil, 7.0, 9.0);

    // Keandalan air
    let water_scarce = left_shoulder(water, 3.0, 5.5);
    let water_decent = triangle(water, 4.5, 6.5, 8.5);
    let water_ample  = right_shoulder(water, 7.0, 9.0);

    // --- INFERENSI (9 rules) ---

    // R1: rich soil + ample water → TINGGI
    let r_high_1 = soil_rich.min(water_ample);
    // R2: rich soil + decent water → TINGGI
    let r_high_2 = soil_rich.min(water_decent);
    // R3: fair soil + ample water → SEDANG-TINGGI (Dianggap High juga di model ini)
    let r_high_3 = soil_fair.min(water_ample);

    // R4: fair soil + decent water → SEDANG
    let r_mid_1 = soil_fair.min(water_decent);
    // R5: rich soil + scarce water → SEDANG
    let r_mid_2 = soil_rich.min(water_scarce);
    // R6: poor soil + ample water → SEDANG
    let r_mid_3 = soil_poor.min(water_ample);

    // R7: poor soil + decent water → RENDAH
    let r_low_1 = soil_poor.min(water_decent);
    // R8: fair soil + scarce water → RENDAH
    let r_low_2 = soil_fair.min(water_scarce);
    // R9: poor soil + scarce water → RENDAH
    let r_low_3 = soil_poor.min(water_scarce);

    let out_high = r_high_1.max(r_high_2).max(r_high_3);
    let out_mid  = r_mid_1.max(r_mid_2).max(r_mid_3);
    let out_low  = r_low_1.max(r_low_2).max(r_low_3);

    // --- DEFUZZYFIKASI (Centroid) ---
    // Crisp centers: Low=25, Mid=55, High=82
    let numerator   = (out_low * 25.0) + (out_mid * 55.0) + (out_high * 82.0);
    let denominator = out_low + out_mid + out_high;

    let raw_score = if denominator == 0.0 {
        50.0
    } else {
        numerator / denominator
    };

    // Terapkan faktor musim
    let score = (raw_score * season).clamp(0.0, 100.0);

    let label = if score >= 70.0 {
        "Sangat Sesuai".to_string()
    } else if score >= 45.0 {
        "Cukup Sesuai".to_string()
    } else {
        "Kurang Sesuai".to_string()
    };

    // Kumpulkan aturan yang aktif (> 0)
    let mut rules_fired = Vec::new();
    let rules_data = vec![
        ("R1", "Jika tanah sangat subur (Rich) & air melimpah (Ample) -> Kesesuaian TINGGI", r_high_1),
        ("R2", "Jika tanah sangat subur (Rich) & air cukup (Decent) -> Kesesuaian TINGGI", r_high_2),
        ("R3", "Jika tanah sedang (Fair) & air melimpah (Ample) -> Kesesuaian TINGGI", r_high_3),
        ("R4", "Jika tanah sedang (Fair) & air cukup (Decent) -> Kesesuaian SEDANG", r_mid_1),
        ("R5", "Jika tanah sangat subur (Rich) & air kurang (Scarce) -> Kesesuaian SEDANG", r_mid_2),
        ("R6", "Jika tanah kurang subur (Poor) & air melimpah (Ample) -> Kesesuaian SEDANG", r_mid_3),
        ("R7", "Jika tanah kurang subur (Poor) & air cukup (Decent) -> Kesesuaian RENDAH", r_low_1),
        ("R8", "Jika tanah sedang (Fair) & air kurang (Scarce) -> Kesesuaian RENDAH", r_low_2),
        ("R9", "Jika tanah kurang subur (Poor) & air kurang (Scarce) -> Kesesuaian RENDAH", r_low_3),
    ];

    for (name, text, val) in rules_data {
        if val > 0.0 {
            rules_fired.push(FuzzyRuleFired {
                name: name.to_string(),
                rule_text: text.to_string(),
                value: (val * 100.0).round() / 100.0,
            });
        }
    }

    FuzzyOutput {
        suitability_score: (score * 10.0).round() / 10.0,
        label,
        soil_score: soil,
        water_score: water,
        season_factor: season,
        soil_membership: SoilMembership {
            poor: (soil_poor * 100.0).round() / 100.0,
            fair: (soil_fair * 100.0).round() / 100.0,
            rich: (soil_rich * 100.0).round() / 100.0,
        },
        water_membership: WaterMembership {
            scarce: (water_scarce * 100.0).round() / 100.0,
            decent: (water_decent * 100.0).round() / 100.0,
            ample: (water_ample * 100.0).round() / 100.0,
        },
        rules_fired,
    }
}

// ── Membership functions ──

fn left_shoulder(x: f64, a: f64, b: f64) -> f64 {
    if x <= a { 1.0 }
    else if x >= b { 0.0 }
    else { (b - x) / (b - a) }
}

fn right_shoulder(x: f64, a: f64, b: f64) -> f64 {
    if x <= a { 0.0 }
    else if x >= b { 1.0 }
    else { (x - a) / (b - a) }
}

fn triangle(x: f64, a: f64, b: f64, c: f64) -> f64 {
    if x <= a || x >= c { 0.0 }
    else if (x - b).abs() < f64::EPSILON { 1.0 }
    else if x < b { (x - a) / (b - a) }
    else { (c - x) / (c - b) }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn vulkanik_irigasi_hujan_is_high() {
        let input = FuzzyInput {
            jenis_tanah: "vulkanik".into(),
            sumber_air: "irigasi".into(),
            musim: "hujan".into(),
        };
        let output = calculate_suitability(&input);
        assert!(output.suitability_score >= 70.0, "Expected high score, got {}", output.suitability_score);
        assert_eq!(output.label, "Sangat Sesuai");
    }

    #[test]
    fn berpasir_tadah_hujan_kemarau_is_low() {
        let input = FuzzyInput {
            jenis_tanah: "berpasir".into(),
            sumber_air: "tadah_hujan".into(),
            musim: "kemarau".into(),
        };
        let output = calculate_suitability(&input);
        assert!(output.suitability_score < 45.0, "Expected low score, got {}", output.suitability_score);
    }
}
