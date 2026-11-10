//! TLO-02 prototype: transparent overlay window, pass-through mode and an always clickable
//! mini-bar living in its own window (ADR-010).

use serde_json::json;
use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

use crate::Shared;

/// A rectangle in physical screen pixels.
#[derive(Clone, Copy, Debug)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub w: u32,
    pub h: u32,
}

/// Mini-bar size in logical pixels.
pub const MINIBAR_SIZE: (f64, f64) = (300.0, 56.0);

fn place(window: &WebviewWindow, rect: Rect) -> tauri::Result<()> {
    window.set_position(PhysicalPosition::new(rect.x, rect.y))?;
    window.set_size(PhysicalSize::new(rect.w, rect.h))?;
    Ok(())
}

/// Opens the overlay over `area` and the mini-bar at `minibar` (top-left corner, physical).
pub fn open(
    app: &AppHandle,
    area: Rect,
    minibar: (i32, i32),
    auto_draw: bool,
) -> tauri::Result<()> {
    if app.get_webview_window("overlay").is_none() {
        let url = if auto_draw {
            "overlay.html?auto=1"
        } else {
            "overlay.html"
        };
        let overlay = WebviewWindowBuilder::new(app, "overlay", WebviewUrl::App(url.into()))
            .title("Tablica: nakładka")
            .transparent(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .visible(false)
            .build()?;
        place(&overlay, area)?;
        overlay.show()?;
    }
    if app.get_webview_window("minibar").is_none() {
        let bar = WebviewWindowBuilder::new(app, "minibar", WebviewUrl::App("minibar.html".into()))
            .title("Tablica: mini-pasek")
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .inner_size(MINIBAR_SIZE.0, MINIBAR_SIZE.1)
            .visible(false)
            .build()?;
        bar.set_position(PhysicalPosition::new(minibar.0, minibar.1))?;
        bar.show()?;
    }
    set_passthrough(app, false)
}

/// Opens the overlay over the whole primary monitor with the mini-bar at the top centre.
pub fn open_fullscreen(app: &AppHandle) -> tauri::Result<()> {
    let monitor = app.primary_monitor()?.ok_or(tauri::Error::WindowNotFound)?;
    let pos = monitor.position();
    let size = monitor.size();
    let scale = monitor.scale_factor();
    let bar_x = pos.x + (size.width as i32 - (MINIBAR_SIZE.0 * scale) as i32) / 2;
    open(
        app,
        Rect {
            x: pos.x,
            y: pos.y,
            w: size.width,
            h: size.height,
        },
        (bar_x, pos.y + (16.0 * scale) as i32),
        false,
    )
}

pub fn close(app: &AppHandle) {
    for label in ["overlay", "minibar"] {
        if let Some(w) = app.get_webview_window(label) {
            let _ = w.close();
        }
    }
    *app.state::<Shared>().passthrough.lock().expect("mode lock") = false;
}

/// Drawing mode (`false`): the overlay takes the input. Pass-through (`true`): clicks,
/// scrolling and keys go to the program underneath; the drawings stay visible.
pub fn set_passthrough(app: &AppHandle, on: bool) -> tauri::Result<()> {
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.set_ignore_cursor_events(on)?;
    }
    let state = app.state::<Shared>();
    *state.passthrough.lock().expect("mode lock") = on;
    state.push("rust", "mode", json!({ "passthrough": on }));
    app.emit("mode", on)?;
    Ok(())
}

pub fn toggle(app: &AppHandle) -> tauri::Result<bool> {
    let next = !*app.state::<Shared>().passthrough.lock().expect("mode lock");
    set_passthrough(app, next)?;
    Ok(next)
}
