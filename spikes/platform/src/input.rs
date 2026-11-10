//! Windows-only input injection used by the automatic run: real mouse and keyboard events
//! (SendInput) and a synthetic pen with pressure (InjectSyntheticPointerInput, Windows 10 1809+).
//! These events go through the same OS path as hardware input, so the WebView sees them as real.

use std::mem::{size_of, zeroed};
use std::thread::sleep;
use std::time::Duration;

use windows_sys::Win32::Foundation::{GetLastError, POINT};
use windows_sys::Win32::UI::Controls::{
    CreateSyntheticPointerDevice, DestroySyntheticPointerDevice, POINTER_FEEDBACK_DEFAULT,
    POINTER_TYPE_INFO,
};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    SendInput, INPUT, INPUT_KEYBOARD, INPUT_MOUSE, KEYEVENTF_KEYUP, MOUSEEVENTF_ABSOLUTE,
    MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP, MOUSEEVENTF_MOVE, MOUSEEVENTF_WHEEL, VIRTUAL_KEY,
};
use windows_sys::Win32::UI::Input::Pointer::{
    InjectSyntheticPointerInput, POINTER_FLAGS, POINTER_FLAG_DOWN, POINTER_FLAG_INCONTACT,
    POINTER_FLAG_INRANGE, POINTER_FLAG_PRIMARY, POINTER_FLAG_UP, POINTER_FLAG_UPDATE,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    GetSystemMetrics, SetCursorPos, PEN_MASK_PRESSURE, PT_PEN, SM_CXSCREEN, SM_CYSCREEN,
};

pub const VK_CONTROL: VIRTUAL_KEY = 0x11;
pub const VK_SHIFT: VIRTUAL_KEY = 0x10;
pub const VK_SPACE: VIRTUAL_KEY = 0x20;
pub const VK_A: VIRTUAL_KEY = 0x41;
pub const VK_ESCAPE: VIRTUAL_KEY = 0x1B;

fn send(inputs: &[INPUT]) {
    // SAFETY: `inputs` is a valid slice of initialised INPUT structures.
    unsafe {
        SendInput(
            inputs.len() as u32,
            inputs.as_ptr(),
            size_of::<INPUT>() as i32,
        );
    }
}

fn mouse(flags: u32, dx: i32, dy: i32, data: i32) -> INPUT {
    // SAFETY: INPUT is a plain C struct; all-zero is a valid value.
    let mut input: INPUT = unsafe { zeroed() };
    input.r#type = INPUT_MOUSE;
    input.Anonymous.mi.dx = dx;
    input.Anonymous.mi.dy = dy;
    input.Anonymous.mi.mouseData = data as u32;
    input.Anonymous.mi.dwFlags = flags;
    input
}

fn key(vk: VIRTUAL_KEY, up: bool) -> INPUT {
    // SAFETY: INPUT is a plain C struct; all-zero is a valid value.
    let mut input: INPUT = unsafe { zeroed() };
    input.r#type = INPUT_KEYBOARD;
    input.Anonymous.ki.wVk = vk;
    input.Anonymous.ki.dwFlags = if up { KEYEVENTF_KEYUP } else { 0 };
    input
}

/// Absolute move to physical pixel (x, y) of the primary monitor.
pub fn move_to(x: i32, y: i32) {
    // SAFETY: plain Win32 calls without pointers.
    let (w, h) = unsafe { (GetSystemMetrics(SM_CXSCREEN), GetSystemMetrics(SM_CYSCREEN)) };
    let nx = (x * 65535) / (w - 1).max(1);
    let ny = (y * 65535) / (h - 1).max(1);
    send(&[mouse(MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE, nx, ny, 0)]);
}

pub fn click(x: i32, y: i32) {
    // SAFETY: plain Win32 call without pointers.
    unsafe {
        SetCursorPos(x, y);
    }
    move_to(x, y);
    sleep(Duration::from_millis(60));
    send(&[mouse(MOUSEEVENTF_LEFTDOWN, 0, 0, 0)]);
    sleep(Duration::from_millis(40));
    send(&[mouse(MOUSEEVENTF_LEFTUP, 0, 0, 0)]);
}

pub fn wheel(x: i32, y: i32, delta: i32) {
    move_to(x, y);
    sleep(Duration::from_millis(60));
    send(&[mouse(MOUSEEVENTF_WHEEL, 0, 0, delta)]);
}

/// Presses the keys in order and releases them in reverse order.
pub fn chord(keys: &[VIRTUAL_KEY]) {
    let mut inputs: Vec<INPUT> = keys.iter().map(|k| key(*k, false)).collect();
    inputs.extend(keys.iter().rev().map(|k| key(*k, true)));
    send(&inputs);
}

/// Drags the mouse with the left button along `points`, `step_ms` between moves.
pub fn mouse_stroke(points: &[(i32, i32)], step_ms: u64) {
    let Some(&(x0, y0)) = points.first() else {
        return;
    };
    move_to(x0, y0);
    sleep(Duration::from_millis(50));
    send(&[mouse(MOUSEEVENTF_LEFTDOWN, 0, 0, 0)]);
    for &(x, y) in &points[1..] {
        sleep(Duration::from_millis(step_ms));
        move_to(x, y);
    }
    sleep(Duration::from_millis(step_ms));
    send(&[mouse(MOUSEEVENTF_LEFTUP, 0, 0, 0)]);
}

fn pen_frame(
    device: windows_sys::Win32::UI::Controls::HSYNTHETICPOINTERDEVICE,
    x: i32,
    y: i32,
    flags: POINTER_FLAGS,
    pressure: u32,
) -> Result<(), u32> {
    // SAFETY: POINTER_TYPE_INFO is a plain C struct; all-zero is a valid value.
    let mut info: POINTER_TYPE_INFO = unsafe { zeroed() };
    info.r#type = PT_PEN;
    // SAFETY: the union member matches `r#type == PT_PEN`.
    let pen = unsafe { &mut info.Anonymous.penInfo };
    pen.pointerInfo.pointerType = PT_PEN;
    pen.pointerInfo.pointerId = 0;
    pen.pointerInfo.pointerFlags = flags | POINTER_FLAG_PRIMARY;
    pen.pointerInfo.ptPixelLocation = POINT { x, y };
    pen.penMask = PEN_MASK_PRESSURE;
    pen.pressure = pressure;
    // SAFETY: `info` is a valid, initialised POINTER_TYPE_INFO and count is 1.
    let ok = unsafe { InjectSyntheticPointerInput(device, &info, 1) };
    if ok == 0 {
        // SAFETY: plain Win32 call.
        Err(unsafe { GetLastError() })
    } else {
        Ok(())
    }
}

/// Draws a pen stroke along `points` (x, y, pressure 0..=1024).
/// Returns the Win32 error code of the first failed injection.
pub fn pen_stroke(points: &[(i32, i32, u32)], step_ms: u64) -> Result<(), u32> {
    let Some(&(x0, y0, p0)) = points.first() else {
        return Ok(());
    };
    // SAFETY: plain Win32 call; the handle is destroyed below.
    let device = unsafe { CreateSyntheticPointerDevice(PT_PEN, 1, POINTER_FEEDBACK_DEFAULT) };
    if device.is_null() {
        // SAFETY: plain Win32 call.
        return Err(unsafe { GetLastError() });
    }
    let result = (|| {
        pen_frame(
            device,
            x0,
            y0,
            POINTER_FLAG_INRANGE | POINTER_FLAG_UPDATE,
            0,
        )?;
        sleep(Duration::from_millis(step_ms));
        pen_frame(
            device,
            x0,
            y0,
            POINTER_FLAG_INRANGE | POINTER_FLAG_INCONTACT | POINTER_FLAG_DOWN,
            p0,
        )?;
        let mut last = (x0, y0);
        for &(x, y, p) in &points[1..] {
            sleep(Duration::from_millis(step_ms));
            pen_frame(
                device,
                x,
                y,
                POINTER_FLAG_INRANGE | POINTER_FLAG_INCONTACT | POINTER_FLAG_UPDATE,
                p,
            )?;
            last = (x, y);
        }
        sleep(Duration::from_millis(step_ms));
        pen_frame(
            device,
            last.0,
            last.1,
            POINTER_FLAG_INRANGE | POINTER_FLAG_UP,
            0,
        )?;
        sleep(Duration::from_millis(step_ms));
        pen_frame(device, last.0, last.1, POINTER_FLAG_UPDATE, 0)
    })();
    // SAFETY: `device` was created above and is not used afterwards.
    unsafe { DestroySyntheticPointerDevice(device) };
    result
}
