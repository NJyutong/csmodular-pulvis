use serde::Serialize;
use serde_json::{json, Value};
use std::{
    collections::HashSet,
    fs,
    io,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::DialogExt;

const LIBRARY_NAME: &str = "pulvis";
const LEGACY_LIBRARY_NAME: &str = "granular";
const MIGRATION_MARKER: &str = "_pulvis-library-registration-before-install";
const MODULES: &[&str] = &["GrainFreeze", "GrainSample", "GrainOsc"];
const INSTALL_FILES: &[&str] = &[
    "modules/GrainFreeze.js",
    "modules/GrainFreeze.txt",
    "modules/GrainSample.js",
    "modules/GrainSample.txt",
    "modules/GrainOsc.js",
    "modules/GrainOsc.txt",
    "modules/GrainCore.txt",
    "_meta.json",
    "README.md",
    "README.zh-CN.md",
    "README.ru.md",
    "LICENSE",
    "assets/pulvis-icon.png",
    "assets/pulvis-social-preview.png",
    "assets/pulvis-header-en.png",
    "assets/pulvis-header-zh-CN.png",
    "assets/pulvis-header-ru.png",
    "examples/pulvis-demo.json",
    MIGRATION_MARKER,
];
const BUNDLED_INDEX: &[u8] = include_bytes!("../../../_index.json");
const BUNDLED_CORE: &[u8] = include_bytes!("../../../csound/GrainCore.txt");
const BUNDLED_FILES: &[(&str, &[u8])] = &[
    (
        "modules/GrainFreeze.js",
        include_bytes!("../../../modules/GrainFreeze.js"),
    ),
    (
        "modules/GrainFreeze.txt",
        include_bytes!("../../../modules/GrainFreeze.txt"),
    ),
    (
        "modules/GrainSample.js",
        include_bytes!("../../../modules/GrainSample.js"),
    ),
    (
        "modules/GrainSample.txt",
        include_bytes!("../../../modules/GrainSample.txt"),
    ),
    (
        "modules/GrainOsc.js",
        include_bytes!("../../../modules/GrainOsc.js"),
    ),
    (
        "modules/GrainOsc.txt",
        include_bytes!("../../../modules/GrainOsc.txt"),
    ),
    ("_meta.json", include_bytes!("../../../_meta.json")),
    ("README.md", include_bytes!("../../../README.md")),
    (
        "README.zh-CN.md",
        include_bytes!("../../../README.zh-CN.md"),
    ),
    ("README.ru.md", include_bytes!("../../../README.ru.md")),
    ("LICENSE", include_bytes!("../../../LICENSE")),
    (
        "assets/pulvis-icon.png",
        include_bytes!("../../../assets/pulvis-icon.png"),
    ),
    (
        "assets/pulvis-social-preview.png",
        include_bytes!("../../../assets/pulvis-social-preview.png"),
    ),
    (
        "assets/pulvis-header-en.png",
        include_bytes!("../../../assets/pulvis-header-en.png"),
    ),
    (
        "assets/pulvis-header-zh-CN.png",
        include_bytes!("../../../assets/pulvis-header-zh-CN.png"),
    ),
    (
        "assets/pulvis-header-ru.png",
        include_bytes!("../../../assets/pulvis-header-ru.png"),
    ),
    (
        "examples/pulvis-demo.json",
        include_bytes!("../../../examples/pulvis-demo.json"),
    ),
];

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct InstallerStatus {
    installed: bool,
    version: Option<String>,
    destination: String,
    legacy_user_copy_present: bool,
}

fn io_error(error: io::Error) -> String {
    if error.kind() == io::ErrorKind::PermissionDenied {
        "permission-denied".to_owned()
    } else {
        error.to_string()
    }
}

fn library_directory(libraries_directory: &str) -> Result<PathBuf, String> {
    let libraries_path = PathBuf::from(libraries_directory);
    if !libraries_path.is_absolute() {
        return Err("library-folder-invalid".to_owned());
    }
    if !libraries_path.is_dir() {
        return Err("library-folder-missing".to_owned());
    }

    let index_path = libraries_path.join("_index.json");
    if !index_path.is_file() {
        return Err("library-folder-invalid".to_owned());
    }
    let index_bytes = fs::read(&index_path).map_err(io_error)?;
    let index: Value = serde_json::from_slice(&index_bytes)
        .map_err(|_| "library-folder-invalid".to_owned())?;
    index
        .get("libraries")
        .and_then(Value::as_array)
        .ok_or_else(|| "library-folder-invalid".to_owned())?;

    let canonical = fs::canonicalize(&libraries_path).map_err(io_error)?;
    Ok(canonical.join(LIBRARY_NAME))
}

fn update_host_library_registration(libraries_path: &Path, install: bool, previous: Option<&str>) -> Result<String, String> {
    let index_path = libraries_path.join("_index.json");
    let mut index: Value = serde_json::from_slice(&fs::read(&index_path).map_err(io_error)?)
        .map_err(|_| "library-folder-invalid".to_owned())?;
    let libraries = index
        .get_mut("libraries")
        .and_then(Value::as_array_mut)
        .ok_or_else(|| "library-folder-invalid".to_owned())?;

    if install {
        let prior = if libraries.iter().any(|entry| entry.as_str() == Some(LIBRARY_NAME)) {
            LIBRARY_NAME
        } else if !libraries_path.join(LEGACY_LIBRARY_NAME).exists() && libraries.iter().any(|entry| entry.as_str() == Some(LEGACY_LIBRARY_NAME)) {
            for entry in libraries.iter_mut() {
                if entry.as_str() == Some(LEGACY_LIBRARY_NAME) {
                    *entry = Value::String(LIBRARY_NAME.to_owned());
                }
            }
            LEGACY_LIBRARY_NAME
        } else {
            libraries.push(Value::String(LIBRARY_NAME.to_owned()));
            "none"
        };
        let bytes = serde_json::to_vec_pretty(&index).map_err(|error| error.to_string())?;
        fs::write(index_path, bytes).map_err(io_error)?;
        Ok(prior.to_owned())
    } else {
        match previous.unwrap_or("none") {
            LEGACY_LIBRARY_NAME => {
                for entry in libraries.iter_mut() {
                    if entry.as_str() == Some(LIBRARY_NAME) {
                        *entry = Value::String(LEGACY_LIBRARY_NAME.to_owned());
                    }
                }
            }
            "none" => libraries.retain(|entry| entry.as_str() != Some(LIBRARY_NAME)),
            _ => {}
        }
        let bytes = serde_json::to_vec_pretty(&index).map_err(|error| error.to_string())?;
        fs::write(index_path, bytes).map_err(io_error)?;
        Ok(String::new())
    }
}

fn installed_version(path: &Path) -> Option<String> {
    let metadata = fs::read(path.join("_meta.json")).ok()?;
    let value: Value = serde_json::from_slice(&metadata).ok()?;
    value.get("version")?.as_str().map(str::to_owned)
}

fn shared_core_path(library_path: &Path) -> Result<PathBuf, String> {
    let libraries_directory = library_path
        .parent()
        .ok_or_else(|| "library-folder-invalid".to_owned())?;
    let resource_directory = libraries_directory
        .parent()
        .ok_or_else(|| "library-folder-invalid".to_owned())?;
    Ok(resource_directory
        .join("csound")
        .join("modules")
        .join("GrainCore.txt"))
}

fn remove_if_bundled(path: &Path, expected: &[u8]) -> Result<(), String> {
    match fs::read(path) {
        Ok(contents) if contents == expected => fs::remove_file(path).map_err(io_error),
        Ok(_) => Ok(()),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(io_error(error)),
    }
}

fn remove_shared_core_if_unchanged(library_path: &Path) -> Result<(), String> {
    let core_path = shared_core_path(library_path)?;
    remove_if_bundled(&core_path, BUNDLED_CORE)?;
    if let Some(directory) = core_path.parent() {
        remove_directory_if_empty(directory);
        if let Some(parent) = directory.parent() { remove_directory_if_empty(parent); }
    }
    Ok(())
}

fn plugin_files_present(path: &Path) -> bool {
    MODULES
        .iter()
        .any(|name| path.join("modules").join(format!("{name}.js")).is_file())
}

fn user_library_directory(app: &AppHandle, name: &str) -> Result<PathBuf, String> {
    let documents = app.path().document_dir().map_err(|error| error.to_string())?;
    Ok(documents
        .join("CsModular")
        .join("libraries")
        .join(name))
}

fn status(app: &AppHandle, libraries_directory: Option<&str>) -> Result<InstallerStatus, String> {
    let Some(libraries_directory) = libraries_directory else {
        return Ok(InstallerStatus {
            installed: false,
            version: None,
            destination: String::new(),
            legacy_user_copy_present: false,
        });
    };

    let destination = library_directory(libraries_directory)?;
    let installed = BUNDLED_FILES.iter().all(|(name, _)| destination.join(name).is_file())
        && destination.join("_index.json").is_file()
        && shared_core_path(&destination)?.is_file();
    let version = installed_version(&destination);
    let legacy_user_copy_present = [LIBRARY_NAME, LEGACY_LIBRARY_NAME].iter().any(|name| {
        user_library_directory(app, name)
            .map(|path| plugin_files_present(&path))
            .unwrap_or(false)
    });

    Ok(InstallerStatus {
        installed,
        version,
        destination: destination.to_string_lossy().into_owned(),
        legacy_user_copy_present,
    })
}

fn module_name(value: &Value) -> Option<&str> {
    value.as_str().or_else(|| value.get("name")?.as_str())
}

fn update_index(path: &Path, bundled_index: &[u8], remove_plugin: bool) -> Result<(), String> {
    let bundled: Value = serde_json::from_slice(bundled_index).map_err(|error| error.to_string())?;
    let bundled_modules = bundled
        .get("modules")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let plugin_names: HashSet<&str> = MODULES.iter().copied().collect();

    let mut current: Value = if path.is_file() {
        let bytes = fs::read(path).map_err(io_error)?;
        serde_json::from_slice(&bytes).map_err(|error| error.to_string())?
    } else {
        json!({ "modules": [] })
    };
    let modules = current
        .get_mut("modules")
        .and_then(Value::as_array_mut)
        .ok_or_else(|| "The library index has an invalid modules list.".to_owned())?;
    modules.retain(|entry| !module_name(entry).is_some_and(|name| plugin_names.contains(name)));
    if !remove_plugin {
        modules.extend(bundled_modules);
    }

    if modules.is_empty() {
        if path.exists() {
            fs::remove_file(path).map_err(io_error)?;
        }
    } else {
        let bytes = serde_json::to_vec_pretty(&current).map_err(|error| error.to_string())?;
        fs::write(path, bytes).map_err(io_error)?;
    }
    Ok(())
}

fn has_other_modules(index_path: &Path) -> bool {
    let Ok(bytes) = fs::read(index_path) else {
        return false;
    };
    let Ok(index) = serde_json::from_slice::<Value>(&bytes) else {
        return false;
    };
    index
        .get("modules")
        .and_then(Value::as_array)
        .is_some_and(|modules| !modules.is_empty())
}

fn remove_file_if_present(path: &Path) -> Result<(), String> {
    if path.is_file() {
        fs::remove_file(path).map_err(io_error)?;
    }
    Ok(())
}

fn remove_directory_if_empty(path: &Path) {
    if !path.is_dir() {
        return;
    }
    let is_empty = fs::read_dir(path)
        .ok()
        .and_then(|mut entries| entries.next())
        .is_none();
    if is_empty {
        let _ = fs::remove_dir(path);
    }
}

fn remove_plugin_files(path: &Path, bundled_index: &[u8]) -> Result<(), String> {
    let index_path = path.join("_index.json");
    if index_path.is_file() {
        update_index(&index_path, bundled_index, true)?;
    }

    let keep_metadata = has_other_modules(&index_path);
    for relative in INSTALL_FILES {
        if *relative == "_index.json" || (*relative == "_meta.json" && keep_metadata) {
            continue;
        }
        let target = path.join(relative);
        if *relative == MIGRATION_MARKER {
            remove_file_if_present(&target)?;
        } else if *relative == "modules/GrainCore.txt" {
            remove_if_bundled(&target, BUNDLED_CORE)?;
        } else if let Some((_, expected)) = BUNDLED_FILES.iter().find(|(name, _)| name == relative) {
            remove_if_bundled(&target, expected)?;
        }
    }

    remove_directory_if_empty(&path.join("modules"));
    remove_directory_if_empty(&path.join("assets"));
    remove_directory_if_empty(&path.join("examples"));
    remove_directory_if_empty(path);
    Ok(())
}

fn add_layout_candidates(root: &Path, candidates: &mut Vec<PathBuf>) {
    for relative in [
        "public/libraries",
        "dist/libraries",
        "resources/libraries",
        "Contents/Resources/libraries",
        "libraries",
    ] {
        candidates.push(root.join(relative));
    }
}

fn add_host_directory_candidates(root: &Path, candidates: &mut Vec<PathBuf>) {
    for name in ["CsModular", "csmodular", "csmodular-main"] {
        let host_root = root.join(name);
        candidates.push(host_root.join("libraries"));
        candidates.push(host_root.join("resources/libraries"));
        candidates.push(host_root.join("public/libraries"));
    }
}

fn add_ancestors(start: &Path, candidates: &mut Vec<PathBuf>) {
    for ancestor in start.ancestors().take(8) {
        add_layout_candidates(ancestor, candidates);
    }
}

#[cfg(windows)]
#[link(name = "kernel32")]
unsafe extern "system" {
    fn GetDriveTypeW(root_path_name: *const u16) -> u32;
}

#[cfg(windows)]
fn is_fixed_drive(root: &Path) -> bool {
    use std::os::windows::ffi::OsStrExt;

    let mut root_wide: Vec<u16> = root.as_os_str().encode_wide().collect();
    root_wide.push(0);
    // SAFETY: root_wide is a valid, null-terminated UTF-16 path for this call.
    unsafe { GetDriveTypeW(root_wide.as_ptr()) == 3 }
}

#[cfg(windows)]
fn add_windows_repository_candidates(candidates: &mut Vec<PathBuf>) {
    fn is_host_directory(name: &str) -> bool {
        matches!(
            name.to_ascii_lowercase().as_str(),
            "csmodular" | "csmodular-main"
        )
    }

    fn inspect_parent(parent: &Path, candidates: &mut Vec<PathBuf>) {
        let Ok(entries) = fs::read_dir(parent) else {
            return;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }
            let name = entry.file_name().to_string_lossy().into_owned();
            if is_host_directory(&name) {
                add_layout_candidates(&path, candidates);
            } else if matches!(
                name.to_ascii_lowercase().as_str(),
                "paper" | "projects" | "source" | "repos" | "code" | "dev" | "workspace" | "workspaces"
            ) {
                if let Ok(children) = fs::read_dir(&path) {
                    for child in children.flatten() {
                        let child_path = child.path();
                        if child_path.is_dir()
                            && is_host_directory(&child.file_name().to_string_lossy())
                        {
                            add_layout_candidates(&child_path, candidates);
                        }
                    }
                }
            }
        }
    }

    for variable in ["ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA"] {
        if let Some(root) = std::env::var_os(variable).map(PathBuf::from) {
            add_host_directory_candidates(&root, candidates);
            add_host_directory_candidates(&root.join("Programs"), candidates);
        }
    }

    if let Some(home) = std::env::var_os("USERPROFILE").map(PathBuf::from) {
        for relative in [
            "source/repos",
            "Documents/GitHub",
            "Projects",
            "Code",
            "Documents/Projects",
            "OneDrive/Documents/GitHub",
        ] {
            inspect_parent(&home.join(relative), candidates);
        }
    }

    for drive in b'C'..=b'Z' {
        let root = PathBuf::from(format!("{}:\\", drive as char));
        if is_fixed_drive(&root) {
            add_host_directory_candidates(&root, candidates);
            inspect_parent(&root, candidates);
        }
    }
}

fn detect_libraries_directory(app: &AppHandle) -> Result<Option<String>, String> {
    let mut candidates = Vec::new();
    if let Ok(executable) = std::env::current_exe() {
        if let Some(parent) = executable.parent() {
            add_ancestors(parent, &mut candidates);
        }
    }
    if let Ok(current_directory) = std::env::current_dir() {
        add_ancestors(&current_directory, &mut candidates);
    }
    if let Ok(resource_directory) = app.path().resource_dir() {
        add_layout_candidates(&resource_directory, &mut candidates);
        add_ancestors(&resource_directory, &mut candidates);
    }

    if let Some(home) = std::env::var_os("HOME").map(PathBuf::from) {
        for relative in [
            "Applications/CsModular.app",
            "Projects/csmodular-main",
            "source/repos/csmodular-main",
            "Documents/GitHub/csmodular-main",
            "Code/csmodular-main",
            ".local/lib/csmodular",
            ".local/share/csmodular",
        ] {
            let root = home.join(relative);
            add_layout_candidates(&root, &mut candidates);
            add_host_directory_candidates(&root, &mut candidates);
        }
    }

    #[cfg(target_os = "macos")]
    for root in [
        PathBuf::from("/Applications/CsModular.app"),
        PathBuf::from("/Applications/CsModular"),
    ] {
        add_layout_candidates(&root, &mut candidates);
    }

    #[cfg(target_os = "linux")]
    for root in [PathBuf::from("/usr/lib/csmodular"), PathBuf::from("/opt/CsModular")] {
        add_layout_candidates(&root, &mut candidates);
        add_host_directory_candidates(&root, &mut candidates);
    }

    #[cfg(windows)]
    add_windows_repository_candidates(&mut candidates);

    for candidate in candidates {
        let Some(candidate_text) = candidate.to_str() else {
            continue;
        };
        if library_directory(candidate_text).is_ok() {
            let canonical = fs::canonicalize(&candidate).map_err(io_error)?;
            return Ok(Some(canonical.to_string_lossy().into_owned()));
        }
    }

    Ok(None)
}

#[tauri::command]
fn installer_status(app: AppHandle, libraries_directory: Option<String>) -> Result<InstallerStatus, String> {
    status(&app, libraries_directory.as_deref())
}

#[tauri::command]
async fn select_libraries_directory(
    app: AppHandle,
    title: String,
    initial_directory: Option<String>,
) -> Result<Option<String>, String> {
    let mut dialog = app.dialog().file().set_title(title);
    if let Some(path) = initial_directory {
        let path = PathBuf::from(path);
        if path.is_dir() {
            dialog = dialog.set_directory(path);
        }
    }

    match dialog.blocking_pick_folder() {
        Some(path) => {
            let path = path.into_path().map_err(|error| error.to_string())?;
            Ok(Some(path.to_string_lossy().into_owned()))
        }
        None => Ok(None),
    }
}

#[tauri::command]
fn detect_host_libraries_directory(app: AppHandle) -> Result<Option<String>, String> {
    detect_libraries_directory(&app)
}

#[tauri::command]
fn system_locale() -> String {
    ["LC_ALL", "LC_MESSAGES", "LANGUAGE", "LANG"]
        .into_iter()
        .find_map(|name| std::env::var(name).ok().filter(|value| !value.is_empty()))
        .unwrap_or_else(|| "en".to_owned())
}

// Serialize changes to the two registries across installer processes.
struct InstallationLock(PathBuf);
impl InstallationLock {
    fn acquire(libraries: &Path) -> Result<Self, String> {
        let path = libraries.join(".pulvis-install-lock");
        fs::create_dir(&path).map_err(io_error)?;
        Ok(Self(path))
    }
}
impl Drop for InstallationLock {
    fn drop(&mut self) { let _ = fs::remove_dir(&self.0); }
}

// Save only paths owned or edited by this operation. Unrelated modules can be large.
struct Snapshot {
    files: Vec<(PathBuf, Option<Vec<u8>>)>,
    missing_dirs: Vec<PathBuf>,
}
impl Snapshot {
    fn capture(library: &Path, libraries: &Path) -> Result<Self, String> {
        let resource = libraries.parent().ok_or("library-folder-invalid")?;
        let mut paths: Vec<PathBuf> = INSTALL_FILES.iter().map(|p| library.join(p)).collect();
        paths.extend([library.join("_index.json"), libraries.join("_index.json"), shared_core_path(library)?]);
        let mut files = Vec::new();
        let mut missing_dirs = Vec::new();
        for path in paths {
            for parent in path.ancestors().skip(1).take_while(|p| *p != resource) {
                match fs::symlink_metadata(parent) {
                    Ok(meta) if meta.is_dir() => (),
                    Ok(_) => return Err("library-folder-invalid".into()),
                    Err(e) if e.kind() == io::ErrorKind::NotFound => {
                        if !missing_dirs.iter().any(|p: &PathBuf| p == parent) { missing_dirs.push(parent.to_owned()); }
                    }
                    Err(e) => return Err(io_error(e)),
                }
            }
            let bytes = match fs::symlink_metadata(&path) {
                Ok(meta) if meta.is_file() => Some(fs::read(&path).map_err(io_error)?),
                Ok(_) => return Err("library-folder-invalid".into()),
                Err(e) if e.kind() == io::ErrorKind::NotFound => None,
                Err(e) => return Err(io_error(e)),
            };
            files.push((path, bytes));
        }
        missing_dirs.sort_by_key(|p| std::cmp::Reverse(p.components().count()));
        Ok(Self { files, missing_dirs })
    }
    fn restore(self, destination: &Path, libraries: &Path) -> Result<(), String> {
        for (path, bytes) in self.files {
            let path = match path.strip_prefix(libraries.join(LEGACY_LIBRARY_NAME)) {
                Ok(relative) => destination.join(relative),
                Err(_) => path,
            };
            match bytes {
                Some(bytes) => {
                    if fs::read(&path).ok().as_deref() == Some(bytes.as_slice()) { continue; }
                    fs::create_dir_all(path.parent().ok_or("library-folder-invalid")?).map_err(io_error)?;
                    fs::write(path, bytes).map_err(io_error)?;
                }
                None => remove_file_if_present(&path)?,
            }
        }
        for dir in self.missing_dirs {
            let dir = match dir.strip_prefix(libraries.join(LEGACY_LIBRARY_NAME)) {
                Ok(relative) => destination.join(relative),
                Err(_) => dir,
            };
            remove_directory_if_empty(&dir);
        }
        Ok(())
    }
}

#[tauri::command]
fn install_plugin(app: AppHandle, libraries_directory: String) -> Result<InstallerStatus, String> {
    let destination = library_directory(&libraries_directory)?;
    install_at(&destination)?;
    status(&app, Some(&libraries_directory))
}

fn install_at(destination: &Path) -> Result<(), String> {
    let libraries_path = destination.parent().ok_or("library-folder-invalid")?.to_owned();
    let _lock = InstallationLock::acquire(&libraries_path)?;
    let legacy_destination = libraries_path.join(LEGACY_LIBRARY_NAME);
    let migrate = !destination.exists() && legacy_destination.exists();
    let original = if migrate { legacy_destination.as_path() } else { destination };
    let snapshot = Snapshot::capture(original, &libraries_path)?;
    if migrate {
        fs::rename(&legacy_destination, destination).map_err(io_error)?;
    }
    let result = (|| -> Result<(), String> {
        fs::create_dir_all(destination).map_err(io_error)?;
        let previous_registration = update_host_library_registration(&libraries_path, true, None)?;

        for (relative, contents) in BUNDLED_FILES {
            let target = destination.join(relative);
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent).map_err(io_error)?;
            }
            fs::write(target, contents).map_err(io_error)?;
        }

        // Clean up the old installer layout, then put the shared dependency where the host resolves UDOs.
        remove_if_bundled(&destination.join("modules/GrainCore.txt"), BUNDLED_CORE)?;
        let core_path = shared_core_path(destination)?;
        if let Some(parent) = core_path.parent() {
            fs::create_dir_all(parent).map_err(io_error)?;
        }
        fs::write(&core_path, BUNDLED_CORE).map_err(io_error)?;

        update_index(&destination.join("_index.json"), BUNDLED_INDEX, false)?;
        let marker = destination.join(MIGRATION_MARKER);
        if !marker.exists() {
            fs::write(marker, previous_registration.as_bytes()).map_err(io_error)?;
        }
        Ok(())
    })();
    if let Err(error) = result {
        snapshot.restore(destination, &libraries_path)?;
        if migrate { fs::rename(destination, &legacy_destination).map_err(io_error)?; }
        return Err(error);
    }
    Ok(())
}

#[tauri::command]
fn uninstall_plugin(app: AppHandle, libraries_directory: String) -> Result<InstallerStatus, String> {
    let destination = library_directory(&libraries_directory)?;
    uninstall_at(&destination)?;
    status(&app, Some(&libraries_directory))
}

fn uninstall_at(destination: &Path) -> Result<(), String> {
    let libraries_path = destination.parent().ok_or("library-folder-invalid")?.to_owned();
    let _lock = InstallationLock::acquire(&libraries_path)?;
    if !destination.exists() { return Ok(()); }
    let snapshot = Snapshot::capture(destination, &libraries_path)?;
    let marker_path = destination.join(MIGRATION_MARKER);
    let previous_registration = match fs::read_to_string(marker_path) {
        Ok(value) => value,
        Err(error) if error.kind() == io::ErrorKind::NotFound => return Err("library-folder-unsupported".into()),
        Err(error) => return Err(io_error(error)),
    };
    let result = (|| -> Result<(), String> {
        remove_plugin_files(destination, BUNDLED_INDEX)?;
        remove_shared_core_if_unchanged(destination)?;
        let legacy_destination = libraries_path.join(LEGACY_LIBRARY_NAME);
        let restore_legacy = previous_registration == LEGACY_LIBRARY_NAME && destination.exists() && !legacy_destination.exists();
        let registration = if has_other_modules(&destination.join("_index.json")) && previous_registration != LEGACY_LIBRARY_NAME {
            LIBRARY_NAME
        } else if !destination.exists() && (previous_registration == LIBRARY_NAME || !legacy_destination.exists()) {
            "none"
        } else { previous_registration.trim() };
        update_host_library_registration(&libraries_path, false, Some(registration))?;
        if restore_legacy { fs::rename(destination, &legacy_destination).map_err(io_error)?; }
        Ok(())
    })();
    if let Err(error) = result {
        snapshot.restore(destination, &libraries_path)?;
        return Err(error);
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            installer_status,
            detect_host_libraries_directory,
            system_locale,
            select_libraries_directory,
            install_plugin,
            uninstall_plugin
        ])
        .run(tauri::generate_context!())
        .expect("error while running Pulvis Installer");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rollback_repeat_and_uninstall_preserve_other_files() {
        let root = std::env::temp_dir().join(format!("pulvis-transaction-{}", std::process::id()));
        fs::create_dir(&root).unwrap();
        let libraries = root.join("libraries");
        let destination = libraries.join(LIBRARY_NAME);
        fs::create_dir_all(&destination).unwrap();
        let index = libraries.join("_index.json");
        let original = br#"{"libraries":["my-lib"],"note":"keep"}"#;
        fs::write(&index, original).unwrap();
        fs::write(destination.join("_index.json"), b"invalid").unwrap();
        fs::write(destination.join("README.md"), b"original").unwrap();
        assert!(install_at(&destination).is_err());
        assert_eq!(fs::read(&index).unwrap(), original);
        assert_eq!(fs::read(destination.join("README.md")).unwrap(), b"original");
        assert!(!destination.join("modules").exists());
        assert!(!root.join("csound").exists());
        fs::remove_file(destination.join("_index.json")).unwrap();
        let guard = InstallationLock::acquire(&libraries).unwrap();
        assert!(install_at(&destination).is_err());
        drop(guard);
        install_at(&destination).unwrap();
        install_at(&destination).unwrap();
        assert_eq!(fs::read(destination.join(MIGRATION_MARKER)).unwrap(), b"none");
        fs::write(destination.join("README.md"), b"user edits").unwrap();
        uninstall_at(&destination).unwrap();
        assert_eq!(fs::read(destination.join("README.md")).unwrap(), b"user edits");
        assert!(!destination.join("modules").exists());
        assert!(!root.join("csound/modules/GrainCore.txt").exists());
        let restored: Value = serde_json::from_slice(&fs::read(index).unwrap()).unwrap();
        assert_eq!(restored, serde_json::from_slice::<Value>(original).unwrap());
        fs::remove_dir_all(root).unwrap();
    }
}
