#!/usr/bin/env python3
"""Native Pulvis plugin installer/uninstaller for CsModular on Linux."""

import hashlib
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

PAYLOAD_ROOT = Path(os.environ.get("PULVIS_PAYLOAD_DIR", "/usr/share/pulvis/payload"))
STATE_FILE = Path("/var/lib/pulvis/installed-hosts.json")
LIBRARY_NAME = "pulvis"
LEGACY_LIBRARY_NAME = "granular"
MIGRATION_MARKER = "_pulvis-library-registration-before-install"
INVENTORY_FILE = "_pulvis-installed-sha256.json"
MODULE_IDS = ("GrainFreeze", "GrainSample", "GrainOsc")
OWNED_FILES = (
    "modules/GrainFreeze.js",
    "modules/GrainFreeze.txt",
    "modules/GrainSample.js",
    "modules/GrainSample.txt",
    "modules/GrainOsc.js",
    "modules/GrainOsc.txt",
    "_meta.json",
    "README.md",
    "README.zh-CN.md",
    "README.ru.md",
    "LICENSE",
    "assets/pulvis-icon.png",
    "assets/pulvis-header-en.png",
    "assets/pulvis-social-preview.png",
    "assets/pulvis-header-zh-CN.png",
    "assets/pulvis-header-ru.png",
    "examples/pulvis-demo.json",
)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(dir=str(path.parent), prefix=f".{path.name}.", suffix=".tmp")
    tmp_path = Path(tmp_name)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp_path, path)
    finally:
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                pass


def is_libraries_dir(path: Path) -> bool:
    index_path = path / "_index.json"
    if not path.is_dir() or not index_path.is_file():
        return False
    try:
        data = json.loads(index_path.read_text(encoding="utf-8"))
        return isinstance(data.get("libraries"), list) and all(isinstance(x, str) for x in data["libraries"])
    except Exception:
        return False


def resolve_libraries_dir(raw: str) -> Path:
    path = Path(raw).expanduser().resolve()
    if path.name in (LIBRARY_NAME, LEGACY_LIBRARY_NAME) and is_libraries_dir(path.parent):
        return path.parent
    if is_libraries_dir(path):
        return path
    for sub in ("public/libraries", "dist/libraries", "resources/libraries", "libraries"):
        candidate = path / sub
        if is_libraries_dir(candidate):
            return candidate
    raise RuntimeError(f"Not a valid CsModular libraries folder (missing valid _index.json): {path}")


def detect_host_libraries() -> list[Path]:
    found: list[Path] = []
    seen: set[Path] = set()
    candidates: list[Path] = []
    for env_var in ("CSMODULAR_HOST_ROOT", "CSMODULAR_ROOT"):
        val = os.environ.get(env_var)
        if val:
            candidates.append(Path(val))
    candidates.extend([
        Path("/usr/lib/csmodular"),
        Path("/usr/lib/CsModular"),
        Path("/usr/share/csmodular"),
        Path("/opt/CsModular"),
        Path("/opt/csmodular"),
    ])
    home = os.environ.get("HOME")
    if home:
        h = Path(home)
        candidates.extend([
            h / ".local/lib/csmodular",
            h / ".local/share/csmodular",
            h / "csmodular-main",
            h / "Projects/csmodular-main",
        ])
    for root in candidates:
        for sub in ("", "public/libraries", "dist/libraries", "resources/libraries", "libraries"):
            cand = (root / sub) if sub else root
            if is_libraries_dir(cand):
                resolved = cand.resolve()
                if resolved not in seen:
                    seen.add(resolved)
                    found.append(resolved)
    return found


def record_host(libraries_dir: Path, installed: bool) -> None:
    try:
        hosts: list[str] = []
        if STATE_FILE.is_file():
            hosts = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        key = str(libraries_dir.resolve())
        hosts = [h for h in hosts if h != key]
        if installed:
            hosts.append(key)
        if hosts:
            write_atomic(STATE_FILE, (json.dumps(hosts, indent=2) + "\n").encode("utf-8"))
        elif STATE_FILE.is_file():
            STATE_FILE.unlink()
    except PermissionError:
        pass


def remove_empty_dirs(path: Path, stop_at: Path) -> None:
    current = path
    while current != stop_at and current.is_dir():
        try:
            current.rmdir()
        except OSError:
            break
        current = current.parent


def verify_payload_integrity() -> None:
    manifest_path = PAYLOAD_ROOT / "_manifest.sha256.json"
    if not manifest_path.is_file():
        return
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    files = manifest.get("files")
    if manifest.get("algorithm") != "sha256" or not isinstance(files, dict):
        raise RuntimeError("Integrity check failed: invalid _manifest.sha256.json. Installation aborted.")
    for rel, expected in files.items():
        candidate = PAYLOAD_ROOT / rel
        if candidate.is_file():
            actual = sha256_bytes(candidate.read_bytes())
            if actual != expected:
                raise RuntimeError(f"Integrity check failed: {rel} has been modified. Installation aborted.")


def install_to(libraries_dir: Path) -> None:
    verify_payload_integrity()
    if not is_libraries_dir(libraries_dir):
        raise RuntimeError(f"Invalid CsModular libraries folder: {libraries_dir}")
    plugin_dir = libraries_dir / LIBRARY_NAME
    legacy_dir = libraries_dir / LEGACY_LIBRARY_NAME
    core_path = libraries_dir.parent / "csound" / "modules" / "GrainCore.txt"
    host_demo_path = libraries_dir.parent / "patches" / "pulvis-demo.json"
    host_index_path = libraries_dir / "_index.json"
    module_index_path = plugin_dir / "_index.json"
    marker_path = plugin_dir / MIGRATION_MARKER
    inventory_path = plugin_dir / INVENTORY_FILE

    migrated = False
    backups: dict[Path, bytes | None] = {}

    def backup_file(p: Path) -> None:
        if p not in backups:
            backups[p] = p.read_bytes() if p.is_file() else None

    try:
        if not plugin_dir.exists() and legacy_dir.is_dir():
            legacy_dir.rename(plugin_dir)
            migrated = True

        host_index = json.loads(host_index_path.read_text(encoding="utf-8"))
        libs: list[str] = host_index["libraries"]
        has_marker = marker_path.is_file()
        if has_marker:
            prior = marker_path.read_text(encoding="utf-8").strip()
        elif LIBRARY_NAME in libs:
            prior = LIBRARY_NAME
        elif LEGACY_LIBRARY_NAME in libs and not legacy_dir.exists():
            prior = LEGACY_LIBRARY_NAME
        else:
            prior = "none"

        payload_index = json.loads((PAYLOAD_ROOT / "_index.json").read_text(encoding="utf-8"))
        existing_modules = []
        if module_index_path.is_file():
            existing_obj = json.loads(module_index_path.read_text(encoding="utf-8"))
            if not isinstance(existing_obj.get("modules"), list):
                raise RuntimeError(f"Invalid module index: {module_index_path}")
            existing_modules = [
                m for m in existing_obj["modules"]
                if (m if isinstance(m, str) else m.get("name")) not in MODULE_IDS
            ]

        hashes: dict[str, str] = {}
        for rel in OWNED_FILES:
            src = PAYLOAD_ROOT / rel
            data = src.read_bytes()
            dst = plugin_dir / rel
            backup_file(dst)
            write_atomic(dst, data)
            hashes[rel] = sha256_bytes(data)

        core_data = (PAYLOAD_ROOT / "csound" / "GrainCore.txt").read_bytes()
        backup_file(core_path)
        write_atomic(core_path, core_data)
        hashes["__GrainCore__"] = sha256_bytes(core_data)

        demo_data = (PAYLOAD_ROOT / "examples" / "pulvis-demo.json").read_bytes()
        backup_file(host_demo_path)
        write_atomic(host_demo_path, demo_data)
        hashes["__HostDemo__"] = sha256_bytes(demo_data)

        merged_modules = {"modules": existing_modules + payload_index["modules"]}
        backup_file(module_index_path)
        write_atomic(module_index_path, (json.dumps(merged_modules, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))

        if not has_marker:
            backup_file(marker_path)
            write_atomic(marker_path, prior.encode("utf-8"))

        backup_file(inventory_path)
        write_atomic(inventory_path, (json.dumps(hashes, indent=2) + "\n").encode("utf-8"))

        if prior == LEGACY_LIBRARY_NAME:
            libs = [LIBRARY_NAME if x == LEGACY_LIBRARY_NAME else x for x in libs]
        if LIBRARY_NAME not in libs:
            libs.append(LIBRARY_NAME)
        host_index["libraries"] = libs
        backup_file(host_index_path)
        write_atomic(host_index_path, (json.dumps(host_index, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))

        record_host(libraries_dir, True)
        print(f"Installed Pulvis into {plugin_dir}")
    except Exception:
        for p, old in backups.items():
            try:
                if old is None:
                    if p.is_file():
                        p.unlink()
                else:
                    write_atomic(p, old)
            except OSError:
                pass
        if migrated and plugin_dir.exists() and not legacy_dir.exists():
            try:
                plugin_dir.rename(legacy_dir)
            except OSError:
                pass
        raise


def uninstall_from(libraries_dir: Path) -> None:
    plugin_dir = libraries_dir / LIBRARY_NAME
    if not plugin_dir.is_dir():
        record_host(libraries_dir, False)
        return
    legacy_dir = libraries_dir / LEGACY_LIBRARY_NAME
    core_path = libraries_dir.parent / "csound" / "modules" / "GrainCore.txt"
    host_index_path = libraries_dir / "_index.json"
    module_index_path = plugin_dir / "_index.json"
    marker_path = plugin_dir / MIGRATION_MARKER
    inventory_path = plugin_dir / INVENTORY_FILE

    prior = marker_path.read_text(encoding="utf-8").strip() if marker_path.is_file() else "none"
    hashes = json.loads(inventory_path.read_text(encoding="utf-8")) if inventory_path.is_file() else {}

    others = []
    if module_index_path.is_file():
        mod_obj = json.loads(module_index_path.read_text(encoding="utf-8"))
        others = [
            m for m in mod_obj.get("modules", [])
            if (m if isinstance(m, str) else m.get("name")) not in MODULE_IDS
        ]
        if others:
            write_atomic(module_index_path, (json.dumps({"modules": others}, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))
        else:
            module_index_path.unlink()

    for rel in OWNED_FILES:
        if rel == "_meta.json" and others:
            continue
        target = plugin_dir / rel
        if target.is_file():
            expected = hashes.get(rel)
            if not expected or sha256_bytes(target.read_bytes()) == expected:
                target.unlink()

    for extra in (marker_path, inventory_path):
        if extra.is_file():
            extra.unlink()

    if core_path.is_file():
        expected_core = hashes.get("__GrainCore__")
        if not expected_core or sha256_bytes(core_path.read_bytes()) == expected_core:
            core_path.unlink()
            remove_empty_dirs(core_path.parent, libraries_dir.parent)

    for sub in ("modules", "assets", "examples"):
        remove_empty_dirs(plugin_dir / sub, libraries_dir)
    remove_empty_dirs(plugin_dir, libraries_dir)

    if host_index_path.is_file():
        host_index = json.loads(host_index_path.read_text(encoding="utf-8"))
        libs = host_index.get("libraries", [])
        if prior == LEGACY_LIBRARY_NAME and others:
            libs = [LEGACY_LIBRARY_NAME if x == LIBRARY_NAME else x for x in libs]
        elif not others:
            libs = [x for x in libs if x != LIBRARY_NAME]
        host_index["libraries"] = libs
        write_atomic(host_index_path, (json.dumps(host_index, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))

    if prior == LEGACY_LIBRARY_NAME and plugin_dir.is_dir() and not legacy_dir.exists():
        plugin_dir.rename(legacy_dir)

    record_host(libraries_dir, False)
    print(f"Removed Pulvis from {libraries_dir}")


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help"):
        print("Usage:")
        print("  pulvis-install <csmodular-dir-or-libraries-dir>")
        print("  pulvis-install install <csmodular-dir-or-libraries-dir>")
        print("  pulvis-install uninstall <csmodular-dir-or-libraries-dir>")
        print("  pulvis-install auto-install")
        print("  pulvis-install auto-uninstall")
        return 0

    cmd = argv[0]
    if cmd == "auto-install":
        hosts = detect_host_libraries()
        if not hosts:
            print("Pulvis payload installed to /usr/share/pulvis/payload.")
            print("No system CsModular host detected automatically.")
            print("Run: pulvis-install /path/to/csmodular/libraries")
            return 0
        for host in hosts:
            install_to(host)
        return 0

    if cmd == "auto-uninstall":
        hosts: list[Path] = []
        if STATE_FILE.is_file():
            try:
                hosts = [Path(p) for p in json.loads(STATE_FILE.read_text(encoding="utf-8"))]
            except Exception:
                hosts = []
        for host in hosts:
            if host.is_dir():
                uninstall_from(host)
        return 0

    if cmd == "install":
        if len(argv) < 2:
            raise RuntimeError("Missing target CsModular directory.")
        install_to(resolve_libraries_dir(argv[1]))
        return 0

    if cmd == "uninstall":
        if len(argv) < 2:
            raise RuntimeError("Missing target CsModular directory.")
        uninstall_from(resolve_libraries_dir(argv[1]))
        return 0

    install_to(resolve_libraries_dir(cmd))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except Exception as exc:
        print(f"pulvis-install error: {exc}", file=sys.stderr)
        raise SystemExit(1)
