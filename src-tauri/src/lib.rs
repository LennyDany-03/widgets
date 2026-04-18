#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            use tauri::Manager;
            let window = app.get_webview_window("main").unwrap();

            // Remove from alt-tab / taskbar
            window.set_skip_taskbar(true).ok();

            // Position in top-left corner (adjust to your preferred spot)
            window.set_position(tauri::PhysicalPosition::new(30, 30)).ok();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
