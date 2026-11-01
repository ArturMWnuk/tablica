//! Rust core of Tablica: windows, files and system integration.
//! Layers live in the web interface as plugins; the core does not know about them (WAR-12).

/// Application context generated from `tauri.conf.json` and the built web interface.
fn context() -> tauri::Context<tauri::Wry> {
    tauri::generate_context!()
}

/// Entry point shared by desktop (`main.rs`) and mobile builds.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(context())
        .expect("error while running Tablica");
}

#[cfg(test)]
mod tests {
    #[test]
    fn plat_01_config_identifies_the_application() {
        let context = super::context();
        let config = context.config();
        assert_eq!(config.product_name.as_deref(), Some("Tablica"));
        assert_eq!(config.identifier, "io.github.arturmwnuk.tablica");
    }

    #[test]
    fn nf_01_crate_is_licensed_under_gpl3() {
        assert_eq!(env!("CARGO_PKG_LICENSE"), "GPL-3.0-only");
    }
}
