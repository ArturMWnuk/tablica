//! Automatic run of the prototypes (`cargo run -- --auto`).
//! On Windows it drives real input (mouse, keyboard, synthetic pen), so it takes over the mouse
//! for about a minute. Results go to `results/auto-<os>.json`.

use std::time::{Duration, Instant};

use serde::Serialize;
use serde_json::{json, Value};
use tauri::{
    AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};
use xcap::image::RgbaImage;

use crate::overlay::{self, Rect};
use crate::{capture, Shared, UiEvent};

#[derive(Serialize)]
struct Check {
    /// Requirement the check prepares (e.g. TLO-02).
    id: &'static str,
    feature: &'static str,
    /// `None` when the check could not be run on this platform.
    ok: Option<bool>,
    detail: Value,
}

struct Run<'a> {
    app: &'a AppHandle,
    scale: f64,
    checks: Vec<Check>,
}

const TARGET: Rect = Rect {
    x: 200,
    y: 200,
    w: 500,
    h: 400,
};
const OVERLAY: Rect = Rect {
    x: 150,
    y: 150,
    w: 700,
    h: 550,
};
const MINIBAR_POS: (i32, i32) = (900, 150);
const PROBE: Rect = Rect {
    x: 200,
    y: 200,
    w: 900,
    h: 500,
};

impl Run<'_> {
    fn state(&self) -> tauri::State<'_, Shared> {
        self.app.state::<Shared>()
    }

    fn mark(&self) -> usize {
        self.state().events.lock().expect("events lock").len()
    }

    fn since(&self, mark: usize) -> Vec<UiEvent> {
        self.state().events.lock().expect("events lock")[mark..].to_vec()
    }

    fn wait(
        &self,
        mark: usize,
        timeout_ms: u64,
        pred: impl Fn(&UiEvent) -> bool,
    ) -> Option<UiEvent> {
        let end = Instant::now() + Duration::from_millis(timeout_ms);
        while Instant::now() < end {
            if let Some(e) = self.since(mark).into_iter().find(|e| pred(e)) {
                return Some(e);
            }
            std::thread::sleep(Duration::from_millis(50));
        }
        None
    }

    fn got(&self, mark: usize, window: &str, kind: &str) -> bool {
        self.since(mark)
            .iter()
            .any(|e| e.window == window && e.kind == kind)
    }

    fn check(&mut self, id: &'static str, feature: &'static str, ok: Option<bool>, detail: Value) {
        self.checks.push(Check {
            id,
            feature,
            ok,
            detail,
        });
    }

    fn passthrough(&self) -> bool {
        *self.state().passthrough.lock().expect("mode lock")
    }

    /// Physical screen point of a CSS point inside a window placed at `origin`.
    fn at(&self, origin: (i32, i32), css: (f64, f64)) -> (i32, i32) {
        (
            origin.0 + (css.0 * self.scale) as i32,
            origin.1 + (css.1 * self.scale) as i32,
        )
    }

    fn window(&self, label: &str, url: &str, rect: Rect, decorations: bool) -> WebviewWindow {
        let w = WebviewWindowBuilder::new(self.app, label, WebviewUrl::App(url.into()))
            .title(label)
            .decorations(decorations)
            .visible(false)
            .build()
            .expect("create window");
        w.set_position(PhysicalPosition::new(rect.x, rect.y))
            .expect("position");
        w.set_size(PhysicalSize::new(rect.w, rect.h)).expect("size");
        w.show().expect("show");
        let _ = w.set_focus();
        w
    }
}

fn pixel(image: &RgbaImage, p: (i32, i32)) -> [u8; 4] {
    image.get_pixel(p.0 as u32, p.1 as u32).0
}

fn is_green(px: [u8; 4]) -> bool {
    px[1] > 150 && px[0] < 100 && px[2] < 100
}

fn is_red(px: [u8; 4]) -> bool {
    px[0] > 150 && px[1] < 90 && px[2] < 90
}

fn os_version() -> String {
    #[cfg(windows)]
    {
        std::process::Command::new("cmd")
            .args(["/C", "ver"])
            .output()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_owned())
            .unwrap_or_default()
    }
    #[cfg(not(windows))]
    {
        std::process::Command::new("uname")
            .arg("-a")
            .output()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_owned())
            .unwrap_or_default()
    }
}

pub fn run(app: &AppHandle) -> i32 {
    std::thread::sleep(Duration::from_millis(1500));
    let monitor = app.primary_monitor().ok().flatten();
    let scale = monitor.as_ref().map(|m| m.scale_factor()).unwrap_or(1.0);
    let mut r = Run {
        app,
        scale,
        checks: Vec::new(),
    };
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.minimize();
    }

    overlay_checks(&mut r);
    capture_checks(&mut r);
    pen_checks(&mut r);
    media_checks(&mut r);

    let report = json!({
        "generated_ms": r.state().started.elapsed().as_millis(),
        "os": std::env::consts::OS,
        "os_version": os_version(),
        "webview": tauri::webview_version().unwrap_or_default(),
        "monitor": monitor.map(|m| json!({
            "size": [m.size().width, m.size().height],
            "scale": m.scale_factor(),
        })),
        "checks": r.checks,
        "events": r.since(0),
    });
    let path = crate::results_dir().join(format!("auto-{}.json", std::env::consts::OS));
    let text = serde_json::to_string_pretty(&report).unwrap_or_default();
    match std::fs::write(&path, text) {
        Ok(()) => 0,
        Err(_) => 1,
    }
}

fn overlay_checks(r: &mut Run) {
    let mark = r.mark();
    let target = r.window("target", "target.html", TARGET, true);
    r.wait(mark, 5000, |e| e.window == "target" && e.kind == "ready");
    std::thread::sleep(Duration::from_millis(300));

    let mark = r.mark();
    if let Err(e) = overlay::open(r.app, OVERLAY, MINIBAR_POS, true) {
        r.check(
            "TLO-02",
            "overlay window",
            Some(false),
            json!(e.to_string()),
        );
        return;
    }
    let overlay_ready = r
        .wait(mark, 5000, |e| e.window == "overlay" && e.kind == "ready")
        .is_some();
    let minibar_ready = r
        .wait(mark, 5000, |e| e.window == "minibar" && e.kind == "ready")
        .is_some();
    std::thread::sleep(Duration::from_millis(700));

    let target_center = (
        TARGET.x + TARGET.w as i32 / 2,
        TARGET.y + TARGET.h as i32 / 2,
    );
    let stroke = r.at((OVERLAY.x, OVERLAY.y), (60.0, 60.0));
    match capture::capture_primary() {
        Ok((img, ms)) => {
            let under = pixel(&img, target_center);
            let drawn = pixel(&img, stroke);
            r.check(
                "TLO-02",
                "transparent overlay shows the program underneath and the drawing",
                Some(overlay_ready && is_green(under) && is_red(drawn)),
                json!({ "pixel_under_overlay": under, "pixel_of_drawing": drawn,
                        "capture_ms": ms, "overlay_ready": overlay_ready }),
            );
        }
        Err(e) => r.check("TLO-02", "transparent overlay", Some(false), json!(e)),
    }

    #[cfg(windows)]
    {
        use crate::input;
        // Drawing mode: the overlay takes the click.
        let mark = r.mark();
        input::click(target_center.0, target_center.1);
        std::thread::sleep(Duration::from_millis(600));
        let to_overlay = r.got(mark, "overlay", "pointerdown");
        let to_target = r.got(mark, "target", "pointerdown");
        r.check(
            "TLO-02",
            "drawing mode: overlay captures the click",
            Some(to_overlay && !to_target),
            json!({ "overlay": to_overlay, "target": to_target }),
        );

        // Pass-through: click, wheel and keyboard reach the program underneath.
        let _ = overlay::set_passthrough(r.app, true);
        std::thread::sleep(Duration::from_millis(400));
        let mark = r.mark();
        input::click(target_center.0, target_center.1);
        std::thread::sleep(Duration::from_millis(500));
        input::wheel(target_center.0, target_center.1, -240);
        std::thread::sleep(Duration::from_millis(500));
        input::chord(&[input::VK_A]);
        std::thread::sleep(Duration::from_millis(600));
        let click = r.got(mark, "target", "pointerdown");
        let wheel = r.got(mark, "target", "wheel");
        let key = r.got(mark, "target", "keydown");
        let overlay_got = r.got(mark, "overlay", "pointerdown");
        let drawing_visible = capture::capture_primary()
            .map(|(img, _)| is_red(pixel(&img, stroke)))
            .unwrap_or(false);
        r.check(
            "TLO-02",
            "pass-through: click, wheel and key reach the program underneath, drawing stays",
            Some(click && wheel && key && !overlay_got && drawing_visible),
            json!({ "click": click, "wheel": wheel, "key": key,
                    "overlay_got_click": overlay_got, "drawing_visible": drawing_visible }),
        );

        // The mini-bar stays clickable in pass-through mode and switches the mode back.
        let mark = r.mark();
        let button = r.at(MINIBAR_POS, (60.0, 28.0));
        input::click(button.0, button.1);
        std::thread::sleep(Duration::from_millis(700));
        let clicked = r.got(mark, "minibar", "toggle-click");
        r.check(
            "TLO-02",
            "mini-bar clickable in pass-through, button switches to drawing",
            Some(minibar_ready && clicked && !r.passthrough()),
            json!({ "minibar_click": clicked, "passthrough_after": r.passthrough() }),
        );

        // Global shortcut Ctrl+Shift+Space (D9) switches the mode twice.
        let before = r.passthrough();
        input::chord(&[input::VK_CONTROL, input::VK_SHIFT, input::VK_SPACE]);
        std::thread::sleep(Duration::from_millis(600));
        let after_first = r.passthrough();
        input::chord(&[input::VK_CONTROL, input::VK_SHIFT, input::VK_SPACE]);
        std::thread::sleep(Duration::from_millis(600));
        let after_second = r.passthrough();
        r.check(
            "TLO-02",
            "global shortcut Ctrl+Shift+Space toggles the mode",
            Some(after_first != before && after_second == before),
            json!({ "before": before, "after_first": after_first, "after_second": after_second }),
        );
    }
    #[cfg(not(windows))]
    r.check(
        "TLO-02",
        "input routing (click, wheel, key, mini-bar, shortcut)",
        None,
        json!("input injection implemented only for Windows; check manually"),
    );

    // Leave the overlay open for the capture checks; close target afterwards.
    let _ = target;
}

fn capture_checks(r: &mut Run) {
    let stroke = r.at((OVERLAY.x, OVERLAY.y), (60.0, 60.0));
    for label in capture::TABLICA_WINDOWS {
        if let Some(w) = r.app.get_webview_window(label) {
            let _ = w.hide();
        }
    }
    let hide_started = Instant::now();
    std::thread::sleep(Duration::from_millis(250));
    match capture::capture_primary() {
        Ok((img, ms)) => {
            let hidden = !is_red(pixel(&img, stroke));
            let rect = [
                TARGET.x as u32 + 50,
                TARGET.y as u32 + 50,
                TARGET.w - 100,
                TARGET.h - 100,
            ];
            let fragment = capture::crop(&img, rect);
            let center = fragment
                .get_pixel(fragment.width() / 2, fragment.height() / 2)
                .0;
            let saved = capture::png_bytes(&fragment)
                .and_then(|png| {
                    std::fs::write(crate::results_dir().join("auto-fragment.png"), png)
                        .map_err(|e| e.to_string())
                })
                .is_ok();
            r.check(
                "MM-09",
                "hide Tablica, capture the screen with xcap, crop a fragment",
                Some(hidden && is_green(center) && fragment.width() == rect[2] && saved),
                json!({ "tablica_hidden_in_capture": hidden, "capture_ms": ms,
                        "hide_and_capture_ms": hide_started.elapsed().as_secs_f64() * 1000.0,
                        "screen": [img.width(), img.height()],
                        "fragment": [fragment.width(), fragment.height()],
                        "fragment_center": center }),
            );
        }
        Err(e) => r.check("MM-09", "screen capture", Some(false), json!(e)),
    }

    #[cfg(windows)]
    {
        use crate::input;
        // Interactive flow: frozen screen, the user drags a rectangle, Esc cancels.
        let mark = r.mark();
        let started = Instant::now();
        let _ = capture::start_region_capture(r.app);
        let ready = r.wait(mark, 8000, |e| e.window == "select" && e.kind == "ready");
        let ready_ms = started.elapsed().as_secs_f64() * 1000.0;
        std::thread::sleep(Duration::from_millis(300));
        input::mouse_stroke(&[(300, 300), (400, 350), (500, 400)], 40);
        let fragment = r.wait(mark, 5000, |e| e.kind == "capture-fragment");
        let size_ok = fragment
            .as_ref()
            .map(|e| e.data["w"] == 200 && e.data["h"] == 100)
            .unwrap_or(false);
        r.check(
            "MM-09",
            "region selection: drag a rectangle on the frozen screen, fragment 200x100 returned",
            Some(ready.is_some() && size_ok),
            json!({ "select_ready_ms": ready_ms, "fragment": fragment.map(|e| e.data) }),
        );

        let mark = r.mark();
        let _ = capture::start_region_capture(r.app);
        let ready = r.wait(mark, 8000, |e| e.window == "select" && e.kind == "ready");
        std::thread::sleep(Duration::from_millis(300));
        input::chord(&[input::VK_ESCAPE]);
        let cancelled = r
            .wait(mark, 3000, |e| e.kind == "capture-cancelled")
            .is_some();
        let tablica_back = r
            .app
            .get_webview_window("overlay")
            .and_then(|w| w.is_visible().ok())
            .unwrap_or(false);
        r.check(
            "MM-09",
            "region selection: Esc cancels and Tablica comes back",
            Some(ready.is_some() && cancelled && tablica_back),
            json!({ "cancelled": cancelled, "overlay_visible_again": tablica_back }),
        );
    }

    overlay::close(r.app);
    if let Some(w) = r.app.get_webview_window("target") {
        let _ = w.close();
    }
}

fn pen_checks(r: &mut Run) {
    let mark = r.mark();
    let pen = r.window("pen", "pen.html?auto=1", PROBE, true);
    let caps = r.wait(mark, 5000, |e| e.window == "pen" && e.kind == "caps");
    std::thread::sleep(Duration::from_millis(500));
    r.check(
        "NF-04",
        "WebView pointer capabilities (coalesced, predicted, desynchronized canvas)",
        caps.as_ref().map(|_| true),
        caps.map(|e| e.data).unwrap_or(Value::Null),
    );

    #[cfg(windows)]
    {
        use crate::input;
        let y = PROBE.y + PROBE.h as i32 / 2;
        let x0 = PROBE.x + 100;
        let steps = 80;
        let pen_points: Vec<(i32, i32, u32)> = (0..=steps)
            .map(|i| {
                let x = x0 + i * 8;
                let wave = ((i as f64) / 6.0).sin() * 40.0;
                (x, y + wave as i32, 100 + (i as u32 * 900) / steps as u32)
            })
            .collect();
        let mark = r.mark();
        let injected = input::pen_stroke(&pen_points, 8);
        let summary = r.wait(mark, 4000, |e| e.window == "pen" && e.kind == "summary");
        let ok = summary.as_ref().map(|s| {
            let d = &s.data;
            d["pointerType"] == "pen"
                && d["pressureMax"].as_f64().unwrap_or(0.0)
                    > d["pressureMin"].as_f64().unwrap_or(0.0)
                && d["latencyP95"].as_f64().map(|v| v <= 4.0).unwrap_or(false)
        });
        r.check(
            "WEJ-02/NF-04",
            "synthetic pen (Windows Ink): pressure reaches the WebView, latency p95 <= 4 ms",
            Some(injected.is_ok() && ok.unwrap_or(false)),
            json!({ "inject_error": injected.err(), "summary": summary.map(|s| s.data) }),
        );

        // Windows ignores mouse input for a moment after pen input (palm/pen arbitration).
        std::thread::sleep(Duration::from_millis(1500));
        let mouse_points: Vec<(i32, i32)> = pen_points.iter().map(|p| (p.0, p.1 + 60)).collect();
        let mark = r.mark();
        input::mouse_stroke(&mouse_points, 8);
        let summary = r.wait(mark, 4000, |e| e.window == "pen" && e.kind == "summary");
        let ok = summary.as_ref().map(|s| {
            s.data["latencyP95"]
                .as_f64()
                .map(|v| v <= 4.0)
                .unwrap_or(false)
        });
        r.check(
            "NF-04",
            "mouse stroke: event-to-segment latency p95 <= 4 ms",
            Some(ok.unwrap_or(false)),
            summary.map(|s| s.data).unwrap_or(Value::Null),
        );
    }
    #[cfg(not(windows))]
    r.check(
        "WEJ-02/NF-04",
        "pen and mouse strokes",
        None,
        json!("input injection implemented only for Windows; draw manually in pen.html"),
    );
    let _ = pen.close();
}

fn media_checks(r: &mut Run) {
    let mark = r.mark();
    let video = r.window("video", "video.html?auto=1", PROBE, true);
    let result = r.wait(mark, 25000, |e| e.window == "video" && e.kind == "result");
    r.check(
        "MM-02",
        "MP4 H.264: record with MediaRecorder, play back in <video>",
        Some(
            result
                .as_ref()
                .map(|e| e.data["played"] == true)
                .unwrap_or(false),
        ),
        result.map(|e| e.data).unwrap_or(json!("timeout")),
    );
    let _ = video.close();

    for host in ["www.youtube.com", "www.youtube-nocookie.com"] {
        let label = if host.contains("nocookie") {
            "youtube-nocookie"
        } else {
            "youtube"
        };
        let mark = r.mark();
        let window = r.window(label, &format!("youtube.html?host={host}"), PROBE, true);
        let result = r.wait(mark, 30000, |e| e.window == label && e.kind == "result");
        r.check(
            "MM-05",
            if label == "youtube" {
                "YouTube IFrame API (youtube.com) plays in the WebView"
            } else {
                "YouTube IFrame API (youtube-nocookie.com) plays in the WebView"
            },
            Some(
                result
                    .as_ref()
                    .map(|e| e.data["playing"] == true)
                    .unwrap_or(false),
            ),
            result.map(|e| e.data).unwrap_or(json!("timeout")),
        );
        let _ = window.close();
    }
}
