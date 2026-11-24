# GitHub repository setup

Prepare the public repository manually from the GitHub account `NJyutong`.

## Repository

- Repository name: `csmodular-pulvis`
- Visibility: Public
- Default branch: `main`
- Initialize with README, license or `.gitignore`: leave all unchecked. The local Pulvis repository already has its own formal Git history; retain that history when connecting the new repository.
- Existing repository: keep `NJyutong/csmodular-granular` as the legacy repository. Its history is separate from the local Pulvis history. Do not rename it, merge unrelated histories, or force-push over it.

The authenticated account has admin access to `NJyutong/csmodular-granular`. No repository named `csmodular-pulvis` was found during preparation. The local Pulvis checkout has no configured remote, so connect it to the new empty repository after creating it.

## About

- Description: `Original Csound granular synthesis plugin library for CsModular (Grain Freeze, Grain Sample, Grain Osc) with live source and spectrum views, stereo patching, and English, Chinese and Russian user manuals.`
- Website: `https://github.com/NJyutong/csmodular-pulvis/releases`
- Topics: `csound`, `granular-synthesis`, `modular-synthesizer`, `audio-synthesis`, `sound-design`, `audio-plugin`, `csmodular`, `dsp`, `tauri`, `rust`
- Social preview: upload `assets/pulvis-social-preview.png` (1280 × 640 px).

## Actions

The repository contains two workflows:

- **Build and verify Pulvis packages**: run manually (or automatically on `main` / `v*` tag push) to build separate Windows x64, Windows ARM64, macOS Apple Silicon (`arm64` `.pkg`), macOS Intel (`x64` `.pkg`), Linux Debian (`x64` `.deb`), and source archive artifacts. Each uploaded artifact includes its package and `.sha256` file. Build failure logs upload separately.
- **Host compatibility and regression checks**: run manually and fill in the host repository plus the clean-source and installed-UI refs. The previous acceptance refs `10136ca` and `9dbe666` were not found in the public upstream `gleb812/csmodular`; use a host fork or repository that actually contains both accepted snapshots. For a private host repository, add an Actions secret named `HOST_CHECKOUT_TOKEN` with read access. Public repositories need no secret.

## First release

- Tag: `v0.0.6`
- Release title: `Pulvis 0.0.6`
- Release notes: copy the relevant language section from `release-notes/0.0.6.md`.
- Attach: `Pulvis-0.0.6-windows-x64.exe`, `Pulvis-0.0.6-windows-arm64.exe`, `Pulvis-0.0.6-macos-arm64.pkg`, `Pulvis-0.0.6-macos-x64.pkg`, `Pulvis-0.0.6-linux-x64.deb`, `Pulvis-0.0.6-source.zip`, and `SHA256SUMS.txt`. The individual `.sha256` sidecars may also be attached.

The README download URLs already point to these GitHub release asset names. Once the release exists, download each asset from GitHub and verify its SHA-256 against the uploaded manifest before sharing the links.
