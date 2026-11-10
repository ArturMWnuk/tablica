//! Step 1.1 prototypes (T7): platform risks checked before building the features.
//! This crate is NOT part of the application. It exists to answer the questions from
//! `docs/etapy/ETAP-1-plan.md`, step 1.1, and its results go to `docs/etapy/ETAP-1-prototypy.md`.
//!
//! Run interactively: `cargo run`. Run the automatic checks: `cargo run -- --auto`.

mod auto;
mod capture;
#[cfg(windows)]
mod input;
mod overlay;

use std::sync::Mutex;
use std::time::Instant;

use serde::Serialize;
use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// One message reported by a prototype page.
#[derive(Clone, Serialize)]
pub struct UiEvent {
    pub window: String,
    pub kind: String,
    pub data: Value,
    pub at_ms: u128,
}

/// State shared by commands, the shortcut handler and the automatic run.
pub struct Shared {
    pub started: Instant,
    pub events: Mutex<Vec<UiEvent>>,
    pub passthrough: Mutex<bool>,
    pub capture: Mutex<Option<capture::Captured>>,
}

impl Shared {
    pub fn push(&self, window: &str, kind: &str, data: Value) {
        let event = UiEvent {
            window: window.to_owned(),
            kind: kind.to_owned(),
            data,
            at_ms: self.started.elapsed().as_millis(),
        };
        self.events.lock().expect("events lock").push(event);
    }
}

/// Directory where the prototypes write their results.
pub fn results_dir() -> std::path::PathBuf {
    let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("results");
    let _ = std::fs::create_dir_all(&dir);
    dir
}

#[tauri::command]
fn report(window: tauri::Window, state: State<'_, Shared>, kind: String, data: Value) {
    state.push(window.label(), &kind, data);
}

#[tauri::command]
fn open_overlay(app: AppHandle) -> Result<(), String> {
    overlay::open_fullscreen(&app).map_err(|e| e.to_string())
}

#[tauri::command]
fn close_overlay(app: AppHandle) {
    overlay::close(&app);
}

#[tauri::command]
fn toggle_mode(app: AppHandle) -> Result<bool, String> {
    overlay::toggle(&app).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_mode(state: State<'_, Shared>) -> bool {
    *state.passthrough.lock().expect("mode lock")
}

#[tauri::command]
async fn start_region_capture(app: AppHandle) -> Result<(), String> {
    capture::start_region_capture(&app).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_capture_image(state: State<'_, Shared>) -> Result<String, String> {
    let guard = state.capture.lock().expect("capture lock");
    let captured = guard.as_ref().ok_or("no capture")?;
    capture::png_data_url(&captured.image)
}

#[tauri::command]
fn finish_region_capture(app: AppHandle, rect: Option<[u32; 4]>) -> Result<(), String> {
    capture::finish_region_capture(&app, rect)
}

#[tauri::command]
fn open_probe(app: AppHandle, page: String) -> Result<(), String> {
    let label = page.split(['.', '?']).next().unwrap_or("probe").to_owned();
    if let Some(existing) = app.get_webview_window(&label) {
        return existing.set_focus().map_err(|e| e.to_string());
    }
    WebviewWindowBuilder::new(&app, label, WebviewUrl::App(page.into()))
        .title("Tablica: prototyp")
        .inner_size(900.0, 640.0)
        .build()
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn save_result(name: String, base64_data: String) -> Result<String, String> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| e.to_string())?;
    let safe: String = name
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '-' | '_'))
        .collect();
    let path = results_dir().join(safe);
    std::fs::write(&path, bytes).map_err(|e| e.to_string())?;
    Ok(path.display().to_string())
}

/// Ctrl+Shift+Space switches between drawing and pass-through (D9).
fn mode_shortcut() -> Shortcut {
    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space)
}

fn main() {
    let auto_run = std::env::args().any(|a| a == "--auto");
    tauri::Builder::default()
        .manage(Shared {
            started: Instant::now(),
            events: Mutex::new(Vec::new()),
            passthrough: Mutex::new(false),
            capture: Mutex::new(None),
        })
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if shortcut == &mode_shortcut() && event.state() == ShortcutState::Pressed {
                        let state = app.state::<Shared>();
                        state.push("rust", "shortcut", Value::Null);
                        if let Err(e) = overlay::toggle(app) {
                            state.push("rust", "error", Value::String(e.to_string()));
                        }
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            report,
            open_overlay,
            close_overlay,
            toggle_mode,
            get_mode,
            start_region_capture,
            get_capture_image,
            finish_region_capture,
            open_probe,
            save_result
        ])
        .setup(move |app| {
            app.global_shortcut().register(mode_shortcut())?;
            if auto_run {
                let handle = app.handle().clone();
                std::thread::spawn(move || {
                    let code = auto::run(&handle);
                    let _ = handle.emit("auto-finished", code);
                    handle.exit(code);
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the prototypes");
}
