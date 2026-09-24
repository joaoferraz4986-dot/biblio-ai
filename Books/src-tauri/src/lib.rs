use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde::Deserialize;
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;

const MAX_FILES: usize = 10_000;
const MAX_FILE_BYTES: u64 = 64 * 1024 * 1024;
const MAX_TOTAL_BYTES: usize = 256 * 1024 * 1024;
const MAX_DEPTH: usize = 32;

#[derive(Debug, Deserialize)]
struct ProjectFile {
    path: String,
    data: Vec<u8>,
}

#[derive(Default)]
struct ProjectState {
    root: Mutex<Option<PathBuf>>,
    root_file: Mutex<Option<PathBuf>>,
}

fn validate_relative(relative: &str) -> Result<PathBuf, String> {
    let path = Path::new(relative);
    if relative.is_empty() || path.is_absolute() {
        return Err("Caminho relativo inválido.".to_string());
    }
    for (index, component) in path.components().enumerate() {
        if matches!(
            component,
            Component::ParentDir | Component::RootDir | Component::Prefix(_)
        ) || !matches!(component, Component::Normal(_))
            || index > MAX_DEPTH
        {
            return Err("Caminho fora da pasta do projeto.".to_string());
        }
    }
    Ok(path.to_path_buf())
}

fn canonical_root(root: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(root);
    if path.as_os_str().is_empty() {
        return Err("A pasta do projeto não foi escolhida.".to_string());
    }
    let canonical = fs::canonicalize(&path)
        .map_err(|_| "Não foi possível resolver a pasta do projeto.".to_string())?;
    if !canonical.is_dir() {
        return Err("A raiz do projeto não é uma pasta.".to_string());
    }
    Ok(canonical)
}

fn authorized_root(state: &State<ProjectState>, requested: &str) -> Result<PathBuf, String> {
    let stored = state
        .root
        .lock()
        .map_err(|_| "Estado nativo indisponível.".to_string())?
        .clone()
        .ok_or_else(|| "A pasta do projeto não foi autorizada.".to_string())?;
    let requested = canonical_root(requested)?;
    if requested != stored {
        return Err("A pasta solicitada não corresponde à pasta autorizada.".to_string());
    }
    Ok(stored)
}

fn reject_symlinks(root: &Path, relative: &Path) -> Result<(), String> {
    let mut current = root.to_path_buf();
    for component in relative.components() {
        current.push(component.as_os_str());
        if let Ok(metadata) = fs::symlink_metadata(&current) {
            if metadata.file_type().is_symlink() {
                return Err("Links simbólicos não são permitidos na pasta do projeto.".to_string());
            }
        }
    }
    Ok(())
}

fn safe_path(root: &Path, relative: &str) -> Result<PathBuf, String> {
    let relative = validate_relative(relative)?;
    reject_symlinks(root, &relative)?;
    let target = root.join(&relative);
    let mut existing = target.clone();
    while !existing.exists() {
        existing = existing
            .parent()
            .ok_or_else(|| "Caminho inválido.".to_string())?
            .to_path_buf();
    }
    let existing = fs::canonicalize(existing)
        .map_err(|_| "Não foi possível resolver o caminho do projeto.".to_string())?;
    if !existing.starts_with(root) {
        return Err("Caminho fora da pasta do projeto.".to_string());
    }
    Ok(target)
}

fn project_path(
    state: &State<ProjectState>,
    root: &str,
    relative: &str,
) -> Result<PathBuf, String> {
    let root = authorized_root(state, root)?;
    safe_path(&root, relative)
}

fn collect_files(
    root: &Path,
    current: &Path,
    output: &mut Vec<String>,
    depth: usize,
) -> Result<(), String> {
    if depth > MAX_DEPTH {
        return Err("A árvore do projeto é profunda demais.".to_string());
    }
    if !current.exists() {
        return Ok(());
    }
    for entry in
        fs::read_dir(current).map_err(|_| "Não foi possível listar o projeto.".to_string())?
    {
        let entry =
            entry.map_err(|_| "Não foi possível ler uma entrada do projeto.".to_string())?;
        let path = entry.path();
        let metadata = fs::symlink_metadata(&path)
            .map_err(|_| "Não foi possível ler uma entrada do projeto.".to_string())?;
        if metadata.file_type().is_symlink() {
            return Err("Links simbólicos não são permitidos na pasta do projeto.".to_string());
        }
        if metadata.is_dir() {
            collect_files(root, &path, output, depth + 1)?;
        } else if metadata.is_file() {
            let relative = path
                .strip_prefix(root)
                .map_err(|_| "Caminho fora da pasta do projeto.".to_string())?
                .to_string_lossy()
                .replace('\\', "/");
            output.push(relative);
            if output.len() > MAX_FILES {
                return Err("O projeto contém arquivos demais.".to_string());
            }
        }
    }
    Ok(())
}

#[tauri::command]
fn set_project_root(
    app: AppHandle,
    state: State<ProjectState>,
    root: String,
) -> Result<String, String> {
    let root = canonical_root(&root)?;
    app.asset_protocol_scope()
        .allow_directory(&root, true)
        .map_err(|_| "Não foi possível autorizar os assets da pasta.".to_string())?;
    let mut stored_root = state
        .root
        .lock()
        .map_err(|_| "Estado nativo indisponível.".to_string())?;
    if let Some(previous) = stored_root.as_ref().filter(|previous| **previous != root) {
        let _ = app.asset_protocol_scope().forbid_directory(previous, true);
    }
    if let Some(path) = state
        .root_file
        .lock()
        .map_err(|_| "Estado nativo indisponível.".to_string())?
        .as_ref()
    {
        fs::write(path, root.to_string_lossy().as_bytes())
            .map_err(|_| "Não foi possível salvar a pasta do projeto.".to_string())?;
    }
    *stored_root = Some(root.clone());
    Ok(root.to_string_lossy().to_string())
}

#[tauri::command]
async fn pick_project_directory(app: AppHandle) -> Result<Option<String>, String> {
    let selected = app.dialog().file().blocking_pick_folder();
    let Some(selected) = selected else {
        return Ok(None);
    };
    let path = PathBuf::try_from(selected)
        .map_err(|_| "O diálogo retornou um caminho inválido.".to_string())?;
    Ok(Some(
        canonical_root(&path.to_string_lossy())?
            .to_string_lossy()
            .to_string(),
    ))
}

#[tauri::command]
fn read_project_file(
    state: State<ProjectState>,
    root: String,
    relative_path: String,
) -> Result<String, String> {
    let path = project_path(&state, &root, &relative_path)?;
    let metadata = fs::metadata(&path).map_err(|_| "Arquivo não encontrado.".to_string())?;
    if metadata.len() > MAX_FILE_BYTES {
        return Err("Arquivo grande demais.".to_string());
    }
    fs::read_to_string(path).map_err(|_| "Não foi possível ler o arquivo.".to_string())
}

#[tauri::command]
fn read_project_file_base64(
    state: State<ProjectState>,
    root: String,
    relative_path: String,
) -> Result<String, String> {
    let path = project_path(&state, &root, &relative_path)?;
    let metadata = fs::metadata(&path).map_err(|_| "Arquivo não encontrado.".to_string())?;
    if metadata.len() > MAX_FILE_BYTES {
        return Err("Arquivo grande demais.".to_string());
    }
    let bytes = fs::read(path).map_err(|_| "Não foi possível ler o arquivo.".to_string())?;
    Ok(STANDARD.encode(bytes))
}

#[tauri::command]
fn list_project_files(
    state: State<ProjectState>,
    root: String,
    relative_path: String,
) -> Result<Vec<String>, String> {
    let authorized = authorized_root(&state, &root)?;
    let base = if relative_path.is_empty() {
        authorized.clone()
    } else {
        safe_path(&authorized, &relative_path)?
    };
    let mut files = Vec::new();
    collect_files(&authorized, &base, &mut files, 0)?;
    Ok(files)
}

#[tauri::command]
async fn save_binary_file(
    app: AppHandle,
    name: String,
    data: Vec<u8>,
) -> Result<Option<String>, String> {
    if data.len() > MAX_TOTAL_BYTES {
        return Err("Arquivo de exportação grande demais.".to_string());
    }
    let filename = Path::new(&name)
        .file_name()
        .and_then(|value| value.to_str())
        .filter(|value| !value.is_empty())
        .unwrap_or("books-export.bin");
    let selected = app
        .dialog()
        .file()
        .set_file_name(filename)
        .blocking_save_file();
    let Some(selected) = selected else {
        return Ok(None);
    };
    let path = PathBuf::try_from(selected)
        .map_err(|_| "O diálogo retornou um caminho inválido.".to_string())?;
    if path.is_dir() {
        return Err("O destino escolhido é uma pasta.".to_string());
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|_| "Não foi possível criar o destino.".to_string())?;
    }
    fs::write(&path, data).map_err(|_| "Não foi possível salvar o arquivo.".to_string())?;
    Ok(Some(path.to_string_lossy().to_string()))
}

#[tauri::command]
fn save_project(
    state: State<ProjectState>,
    root: String,
    files: Vec<ProjectFile>,
    remove: Vec<String>,
) -> Result<(), String> {
    let authorized = authorized_root(&state, &root)?;
    if files.len() > MAX_FILES || remove.len() > MAX_FILES {
        return Err("O projeto contém operações demais.".to_string());
    }
    let total: usize = files.iter().map(|file| file.data.len()).sum();
    if total > MAX_TOTAL_BYTES {
        return Err("O projeto é grande demais para uma gravação.".to_string());
    }
    for relative in remove {
        let target = safe_path(&authorized, &relative)?;
        if target.is_file() {
            fs::remove_file(target)
                .map_err(|_| "Não foi possível remover um arquivo.".to_string())?;
        }
    }
    for file in files {
        let target = safe_path(&authorized, &file.path)?;
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)
                .map_err(|_| "Não foi possível criar uma pasta do projeto.".to_string())?;
        }
        fs::write(target, file.data)
            .map_err(|_| "Não foi possível gravar um arquivo do projeto.".to_string())?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{safe_path, validate_relative};
    use std::fs;
    use std::path::PathBuf;

    #[test]
    fn aceita_caminho_relativo() {
        assert!(validate_relative("content/catalog.json").is_ok());
    }

    #[test]
    fn rejeita_traversal() {
        assert!(validate_relative("../fora.txt").is_err());
        assert!(validate_relative("/tmp/fora.txt").is_err());
    }

    #[cfg(unix)]
    #[test]
    fn rejeita_link_simbolico_para_fora_da_raiz() {
        use std::os::unix::fs::symlink;

        let base = std::env::temp_dir().join(format!("books-security-{}", std::process::id()));
        let root = base.join("project");
        let outside = base.join("outside");
        fs::create_dir_all(&root).unwrap();
        fs::create_dir_all(&outside).unwrap();
        let link = root.join("external");
        let _ = fs::remove_file(&link);
        symlink(&outside, &link).unwrap();

        assert!(safe_path(&PathBuf::from(&root), "external/secret.txt").is_err());
        fs::remove_file(link).unwrap();
        fs::remove_dir_all(base).unwrap();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ProjectState::default())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let config_dir = app.path().app_config_dir()?;
            fs::create_dir_all(&config_dir)?;
            let root_file = config_dir.join("project-root.txt");
            *app.state::<ProjectState>().root_file.lock().unwrap() = Some(root_file.clone());
            if let Ok(saved) = fs::read_to_string(root_file) {
                if let Ok(root) = canonical_root(saved.trim()) {
                    app.asset_protocol_scope().allow_directory(&root, true)?;
                    *app.state::<ProjectState>().root.lock().unwrap() = Some(root);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_project_root,
            pick_project_directory,
            read_project_file,
            read_project_file_base64,
            list_project_files,
            save_binary_file,
            save_project
        ])
        .run(tauri::generate_context!())
        .expect("erro ao executar o aplicativo Books");
}
