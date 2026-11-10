//! MM-09 prototype: capture of a screen fragment with xcap (ADR-010).
//! Flow: hide Tablica windows, capture the primary monitor, show a full-screen selection
//! window with the frozen image, crop the selected rectangle, show Tablica again.

use std::time::{Duration, Instant};

use serde_json::json;
use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindowBuilder,
};
use xcap::image::{imageops, ImageFormat, RgbaImage};

use crate::Shared;

/// Windows hidden while the screen is captured.
pub const TABLICA_WINDOWS: [&str; 3] = ["main", "overlay", "minibar"];

pub struct Captured {
    pub image: RgbaImage,
}

/// Captures the primary monitor. Returns the image and the capture time in milliseconds.
pub fn capture_primary() -> Result<(RgbaImage, f64), String> {
    let started = Instant::now();
    let monitors = xcap::Monitor::all().map_err(|e| e.to_string())?;
    let monitor = monitors
        .into_iter()
        .find(|m| m.is_primary().unwrap_or(false))
        .ok_or("no primary monitor")?;
    let image = monitor.capture_image().map_err(|e| e.to_string())?;
    Ok((image, started.elapsed().as_secs_f64() * 1000.0))
}

pub fn crop(image: &RgbaImage, rect: [u32; 4]) -> RgbaImage {
    let [x, y, w, h] = rect;
    imageops::crop_imm(image, x, y, w, h).to_image()
}

pub fn png_bytes(image: &RgbaImage) -> Result<Vec<u8>, String> {
    let mut out = std::io::Cursor::new(Vec::new());
    image
        .write_to(&mut out, ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    Ok(out.into_inner())
}

pub fn png_data_url(image: &RgbaImage) -> Result<String, String> {
    use base64::Engine;
    let png = png_bytes(image)?;
    Ok(format!(
        "data:image/png;base64,{}",
        base64::engine::general_purpose::STANDARD.encode(png)
    ))
}

fn set_tablica_visible(app: &AppHandle, visible: bool) {
    for label in TABLICA_WINDOWS {
        if let Some(w) = app.get_webview_window(label) {
            let _ = if visible { w.show() } else { w.hide() };
        }
    }
}

pub fn start_region_capture(app: &AppHandle) -> tauri::Result<()> {
    set_tablica_visible(app, false);
    // Give the compositor time to remove the hidden windows from the screen.
    std::thread::sleep(Duration::from_millis(250));
    let state = app.state::<Shared>();
    let (image, ms) = match capture_primary() {
        Ok(result) => result,
        Err(e) => {
            set_tablica_visible(app, true);
            state.push("rust", "capture-error", json!(e));
            return Ok(());
        }
    };
    state.push(
        "rust",
        "capture-full",
        json!({ "ms": ms, "w": image.width(), "h": image.height() }),
    );
    *state.capture.lock().expect("capture lock") = Some(Captured { image });

    let monitor = app.primary_monitor()?.ok_or(tauri::Error::WindowNotFound)?;
    let select = WebviewWindowBuilder::new(app, "select", WebviewUrl::App("select.html".into()))
        .title("Tablica: zaznacz fragment")
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .build()?;
    select.set_position(PhysicalPosition::new(
        monitor.position().x,
        monitor.position().y,
    ))?;
    select.set_size(PhysicalSize::new(
        monitor.size().width,
        monitor.size().height,
    ))?;
    select.show()?;
    select.set_focus()?;
    Ok(())
}

/// `rect` in physical pixels of the captured image; `None` means Esc (cancelled).
pub fn finish_region_capture(app: &AppHandle, rect: Option<[u32; 4]>) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("select") {
        let _ = w.close();
    }
    set_tablica_visible(app, true);
    let state = app.state::<Shared>();
    let Some(rect) = rect else {
        state.push("rust", "capture-cancelled", json!(null));
        return app.emit("captured", json!(null)).map_err(|e| e.to_string());
    };
    let fragment = {
        let guard = state.capture.lock().expect("capture lock");
        let captured = guard.as_ref().ok_or("no capture")?;
        crop(&captured.image, rect)
    };
    let png = png_bytes(&fragment)?;
    std::fs::write(crate::results_dir().join("capture-fragment.png"), &png)
        .map_err(|e| e.to_string())?;
    let payload = json!({
        "w": fragment.width(),
        "h": fragment.height(),
        "dataUrl": png_data_url(&fragment)?,
    });
    state.push(
        "rust",
        "capture-fragment",
        json!({ "w": fragment.width(), "h": fragment.height() }),
    );
    app.emit("captured", payload).map_err(|e| e.to_string())
}
