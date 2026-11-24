# Build and cleanup

This page describes how Pulvis installers and the source archive are built, checked and cleaned up.

## Source-checkout installation

The [0.0.6 source archive](https://github.com/NJyutong/csmodular-pulvis/releases/download/v0.0.6/Pulvis-0.0.6-source.zip) includes the module generator and host integration patches. In the plugin checkout run:

```sh
node scripts/build-modules.mjs
node scripts/write-manifest.mjs
node scripts/install.mjs <path-to-compatible-csmodular-host>
```

Before writing to the host, `scripts/install.mjs` (and the Windows/Linux desktop installer scripts) verifies all digests in `_manifest.sha256.json` and aborts if any tracked file has been modified or removed. For a locally maintained host with the audio engine, generator and panel integration already applied, the installer also accepts `--sync-assets` after the host path. It checks those integration files before refreshing the library, manuals, example and shared core.

## Local builds

Run commands from the repository root:

```powershell
npm run build:windows-x64         # Windows x64 installer
npm run build:windows-arm64       # Windows ARM64 installer
npm run build:windows-installer   # builds both x64 and ARM64 installers
npm run release:checksums
```

```sh
# macOS (built-in pkgbuild + productbuild, no WebView/Tauri/Rust required)
npm run build:macos-arm64    # Apple Silicon (hostArchitectures="arm64")
npm run build:macos-x64      # Intel (hostArchitectures="x86_64")
# or build both .pkg installers in one run:
npm run build:macos-all
```

```sh
# Linux (standard dpkg-deb, no WebView/GTK/WebKit/Rust required)
npm run build:linux-deb
npm run release:checksums
```

The Windows commands require Inno Setup 7.1.1 and build separate native installers for Windows x64 (`ArchitecturesAllowed=x64os`) and Windows ARM64 (`ArchitecturesAllowed=arm64`). The macOS commands run on macOS (or GitHub Actions `macos-14`) using Apple's built-in `pkgbuild` and `productbuild` tools to produce native `.pkg` installers with no WebView or Rust runtime. The Debian command runs on Linux using `dpkg-deb` directly with no GTK, WebKit, or Tauri dependencies. The source archive is built from a committed revision with:

```sh
node scripts/package-source.mjs <commit> release-assets/0.0.6
```

By default, verified packages are written to `release-assets/<version>/`:

- `Pulvis-<version>-windows-x64.exe`
- `Pulvis-<version>-windows-arm64.exe`
- `Pulvis-<version>-macos-arm64.pkg` (Apple Silicon)
- `Pulvis-<version>-macos-x64.pkg` (Intel)
- `Pulvis-<version>-linux-x64.deb`
- `Pulvis-<version>-source.zip`
- A matching `<filename>.sha256` file for each package
- `SHA256SUMS.txt`, generated after all six package files and sidecars are present

The Windows and Debian builders use a unique run directory under `D:\csmodular-tools\pulvis-builds`. WSL uses `/mnt/d/csmodular-tools/pulvis-builds`; native Linux uses the system temporary directory. The Debian build keeps its Cargo target and temporary Tauri CLI installation inside that run directory. The source packager writes its Git archive there as well.

Before publishing, each builder copies the package into a unique staging directory beside the final output, reads the staged bytes back, checks the package format where applicable, and verifies the SHA-256 sidecar. A per-filename lock prevents two tasks from publishing the same output name simultaneously. The previous output is restored if a publish step fails.

After a successful verification, the local command removes only its own run directory. It does not clean the output directory or another build's temporary path. On failure, command output and diagnostics are written to `test-results/build-logs/`; the current run's recoverable intermediate files are then removed.

## CI builds

Each Windows, Linux and source-archive job gets a directory named with its workflow run ID, attempt and artifact kind. Packages and `.sha256` sidecars are uploaded before the final cleanup step removes that exact directory. If a build fails, the job uploads logs from the task's `logs/` directory first, then removes the task directory. CI cleanup validates the directory name and confirms it is a direct child of `RUNNER_TEMP`; it cannot target another run or a final package.

The uploaded workflow artifacts are retained for 30 days. For a GitHub release, attach the three verified packages and `SHA256SUMS.txt`; compare each downloaded package hash with its `.sha256` sidecar or the aggregate list.

## Проверка и очистка

Локальные пакеты сохраняются в `release-assets/<version>/`, а для каждого пакета создаётся файл `.sha256`. Команда `npm run release:checksums` сверяет три файла и их sidecar, затем создаёт `SHA256SUMS.txt`.

Каждая сборка получает отдельный временный каталог. В Windows он находится в `D:\csmodular-tools\pulvis-builds`, в WSL — в `/mnt/d/csmodular-tools/pulvis-builds`, в нативном Linux — в системном каталоге временных файлов. После проверки удаляется только каталог текущей сборки. При ошибке журнал сохраняется в `test-results/build-logs/`, а восстанавливаемые промежуточные файлы удаляются.

В CI пакет и SHA-файл загружаются до очистки каталога задачи. При ошибке сначала загружаются журналы, затем заключительный шаг удаляет только каталог текущего запуска внутри `RUNNER_TEMP`.
