//! Lesson files (DAN-01, DAN-02, ADR-009): reading, atomic writing and the recovery copy kept by
//! the autosave. The web interface builds and reads the `.tablica` archive; this module only moves
//! bytes between the interface and the disk.

use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};

use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Manager, Runtime};

/// File name of the autosave copy in the recovery folder (P5: never the lesson file itself).
const RECOVERY_LESSON: &str = "autosave.tablica";
/// Description of the autosave copy (original path, time), written by the interface as JSON.
const RECOVERY_META: &str = "autosave.json";

/// Writes `data` to `path` atomically (DAN-01 K3): the bytes go to a temporary file in the same
/// folder, are flushed to the disk and only then replace the target. A failure at any point
/// leaves the previous file unchanged and removes the temporary file.
pub fn write_atomic(path: &Path, data: &[u8]) -> io::Result<()> {
    let name = path
        .file_name()
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "path has no file name"))?;
    let folder = match path.parent() {
        Some(parent) if !parent.as_os_str().is_empty() => parent.to_path_buf(),
        _ => PathBuf::from("."),
    };
    let mut temporary_name = std::ffi::OsString::from(".");
    temporary_name.push(name);
    temporary_name.push(format!(".{}.tmp", std::process::id()));
    let temporary = folder.join(temporary_name);
    let result = (|| {
        let mut file = File::create(&temporary)?;
        file.write_all(data)?;
        file.sync_all()?;
        drop(file);
        // On Windows `rename` replaces an existing file (MoveFileEx with REPLACE_EXISTING).
        fs::rename(&temporary, path)
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

/// Decodes a header value written by `encodeURIComponent` (paths may contain Polish letters,
/// which HTTP headers cannot carry as they are).
pub fn decode_component(value: &str) -> Result<String, String> {
    let bytes = value.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' {
            let hex = value
                .get(index + 1..index + 3)
                .ok_or_else(|| "invalid percent encoding".to_string())?;
            let byte = u8::from_str_radix(hex, 16).map_err(|_| "invalid percent encoding")?;
            out.push(byte);
            index += 3;
        } else {
            out.push(bytes[index]);
            index += 1;
        }
    }
    String::from_utf8(out).map_err(|_| "invalid UTF-8 in header".to_string())
}

fn header(request: &Request<'_>, name: &str) -> Result<String, String> {
    let value = request
        .headers()
        .get(name)
        .ok_or_else(|| format!("missing header {name}"))?
        .to_str()
        .map_err(|_| format!("invalid header {name}"))?;
    decode_component(value)
}

fn raw_body<'a>(request: &'a Request<'_>) -> Result<&'a [u8], String> {
    match request.body() {
        InvokeBody::Raw(data) => Ok(data),
        InvokeBody::Json(_) => Err("expected raw bytes".to_string()),
    }
}

fn recovery_folder<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    let folder = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("recovery");
    Ok(folder)
}

/// Reads a lesson file (DAN-01 K4: Open, Recent files).
#[tauri::command]
pub fn lesson_read(path: String) -> Result<Response, String> {
    fs::read(&path)
        .map(Response::new)
        .map_err(|error| error.to_string())
}

/// Writes a lesson file atomically (DAN-01 K3). The path comes in the `path` header, URI-encoded.
#[tauri::command]
pub fn lesson_write(request: Request<'_>) -> Result<(), String> {
    let path = header(&request, "path")?;
    write_atomic(Path::new(&path), raw_body(&request)?).map_err(|error| error.to_string())
}

/// Writes the autosave copy and its description to the recovery folder (DAN-02, P5).
#[tauri::command]
pub fn recovery_write<R: Runtime>(app: AppHandle<R>, request: Request<'_>) -> Result<(), String> {
    let folder = recovery_folder(&app)?;
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    let meta = header(&request, "meta")?;
    write_atomic(&folder.join(RECOVERY_LESSON), raw_body(&request)?)
        .and_then(|()| write_atomic(&folder.join(RECOVERY_META), meta.as_bytes()))
        .map_err(|error| error.to_string())
}

/// Description of the autosave copy left by a session that did not close properly (DAN-02 K3);
/// `None` when there is none.
#[tauri::command]
pub fn recovery_meta<R: Runtime>(app: AppHandle<R>) -> Result<Option<String>, String> {
    let folder = recovery_folder(&app)?;
    if !folder.join(RECOVERY_LESSON).is_file() {
        return Ok(None);
    }
    match fs::read_to_string(folder.join(RECOVERY_META)) {
        Ok(meta) => Ok(Some(meta)),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(Some("{}".to_string())),
        Err(error) => Err(error.to_string()),
    }
}

/// Reads the autosave copy.
#[tauri::command]
pub fn recovery_read<R: Runtime>(app: AppHandle<R>) -> Result<Response, String> {
    let folder = recovery_folder(&app)?;
    fs::read(folder.join(RECOVERY_LESSON))
        .map(Response::new)
        .map_err(|error| error.to_string())
}

/// Removes the autosave copy (after saving the lesson, opening another one or a proper close).
#[tauri::command]
pub fn recovery_clear<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let folder = recovery_folder(&app)?;
    for name in [RECOVERY_LESSON, RECOVERY_META] {
        match fs::remove_file(folder.join(name)) {
            Ok(()) => {}
            Err(error) if error.kind() == io::ErrorKind::NotFound => {}
            Err(error) => return Err(error.to_string()),
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn leftovers(folder: &Path) -> Vec<String> {
        fs::read_dir(folder)
            .unwrap()
            .map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned())
            .filter(|name| name.ends_with(".tmp"))
            .collect()
    }

    #[test]
    fn dan_01_atomic_write_creates_and_replaces_the_file() {
        let folder = tempfile::tempdir().unwrap();
        let path = folder.path().join("Lekcja żółw.tablica");
        write_atomic(&path, b"first").unwrap();
        assert_eq!(fs::read(&path).unwrap(), b"first");
        write_atomic(&path, b"second, longer").unwrap();
        assert_eq!(fs::read(&path).unwrap(), b"second, longer");
        assert!(leftovers(folder.path()).is_empty());
    }

    #[test]
    fn dan_01_failed_atomic_write_keeps_the_previous_target() {
        let folder = tempfile::tempdir().unwrap();
        // A folder in place of the file: the final replacement fails.
        let path = folder.path().join("lesson.tablica");
        fs::create_dir(&path).unwrap();
        fs::write(path.join("inside.txt"), b"kept").unwrap();
        assert!(write_atomic(&path, b"new").is_err());
        assert_eq!(fs::read(path.join("inside.txt")).unwrap(), b"kept");
        assert!(leftovers(folder.path()).is_empty());
    }

    #[test]
    fn dan_01_atomic_write_into_a_missing_folder_fails_without_traces() {
        let folder = tempfile::tempdir().unwrap();
        let path = folder.path().join("missing").join("lesson.tablica");
        assert!(write_atomic(&path, b"data").is_err());
        assert!(!path.exists());
    }

    #[test]
    fn dan_01_header_paths_are_decoded() {
        assert_eq!(
            decode_component("C%3A%5CLekcje%5C%C5%BC%C3%B3%C5%82w%20Nr%201.tablica").unwrap(),
            "C:\\Lekcje\\żółw Nr 1.tablica"
        );
        assert!(decode_component("%zz").is_err());
        assert!(decode_component("%4").is_err());
    }
}
