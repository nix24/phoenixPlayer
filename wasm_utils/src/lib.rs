use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(left: usize, right: usize) -> usize {
    left + right
}
trait RoundToDecimals {
    fn round_to_decimals(&self, decimals: usize) -> f64;
}

impl RoundToDecimals for f64 {
    fn round_to_decimals(&self, decimals: usize) -> f64 {
        let multiplier = 10_f64.powi(decimals as i32);
        (self * multiplier).round() / multiplier
    }
}
#[wasm_bindgen]
pub fn format_bytes(bytes: f64, decimals: usize) -> String {
    if bytes == 0.0 {
        return "0 Bytes".to_string();
    }

    let k: f64 = 1024.0;
    let dm = if decimals < 1 { 0 } else { decimals };
    let sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    let i = (bytes.ln() / k.ln()).floor() as usize;
    let formatted_value = (bytes / k.powi(i as i32)).round_to_decimals(dm);

    format!("{} {}", formatted_value, sizes[i])
}

#[wasm_bindgen]
pub fn format_time(time: f64) -> String {
    let minutes = (time / 60.0).floor() as i32;
    let seconds = (time % 60.0).floor() as i32;
    format!("{}:{:02}", minutes, seconds)
}

#[derive(Serialize, Deserialize)]
pub struct Song {
    id: String,
    title: String,
    artist: String,
    album: String,
    cover_art: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct VideoInfo {
    title: String,
    author: String,
    length_seconds: u64,
}

#[wasm_bindgen]
pub fn search_songs(songs: &JsValue, query: &str) -> Result<JsValue, JsValue> {
    let songs: Vec<Song> = serde_wasm_bindgen::from_value(songs.clone())?;

    let query_lowercase = query.to_lowercase();

    let filtered: Vec<&Song> = songs
        .iter()
        .filter(|song| {
            song.title.to_lowercase().contains(&query_lowercase)
                || song.artist.to_lowercase().contains(&query_lowercase)
                || song.album.to_lowercase().contains(&query_lowercase)
        })
        .collect();

    let value = serde_wasm_bindgen::to_value(&filtered);
    Ok(value.unwrap())
}
