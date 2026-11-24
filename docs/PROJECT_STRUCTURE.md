# Pulvis project structure

Pulvis is a standalone granular synthesis plugin library for the CsModular host. This repository contains the module definitions, shared Csound engine, host integration patch, desktop installers, example patch and three user manuals. The host application is maintained separately.

## Main files

```text
csmodular-pulvis/
├── README.md                         English user manual
├── README.zh-CN.md                   Simplified Chinese user manual
├── README.ru.md                      Russian user manual
├── LICENSE                           MIT license
├── _index.json / _meta.json          Library metadata
├── _manifest.sha256.json             Install-time SHA-256 integrity manifest
├── csound/GrainCore.txt              Shared Csound grain engine
├── modules/                          Paired JavaScript UI and Csound UDO files
├── integration/
│   ├── csmodular.patch               Host integration changes (UI, HiDPI, Csound tables, WAV, locale)
│   ├── csmodular-poly.patch          Polyphonic host baseline integration
│   ├── display-menu.patch            Migrate title-bar view buttons to the module menu
│   ├── engine-*.patch                Upgrade patches for engine settings, channel resync & patch persistence
│   ├── studio-*.patch                Upgrade earlier studio panel integrations
│   └── wav-session-compat.patch      Upgrade patch for hosts with earlier WAV session integration
├── assets/                           Product icon source, PNG/ICO/ICNS icons and social preview
├── scripts/write-manifest.mjs        Regenerate _manifest.sha256.json for tracked payload files
├── scripts/install.mjs               Verify SHA-256 manifest and install into a host source checkout
├── scripts/build-artifacts.mjs       Isolated package staging and cleanup
├── installer/                        Windows Inno and Linux Tauri installers
├── release-notes/                    Versioned multilingual release notes
├── .github/workflows/                Package and host-check workflows
├── tests/                            Contracts, DSP, v2.0 benchmarks, host, UI and package checks
├── examples/pulvis-demo.json         Example patch
└── docs/                             Integration, build, test and setup guides
```

## Runtime flow

The host loads each JavaScript module definition and its paired Csound wrapper. `src/ui/PulvisPanel.js` renders the matte graphite widescreen (`500 × 300`) hardware panels, uses frames polled by `CsoundEngine.js` from Csound’s per-instance display, waveform and FFT tables for live oscilloscope and 2048-point Hann FFT displays, and pairs with `ModuleContextMenu.js` (source/spectrum selection, engine options, language, centered About dialog, color swatches + theme reset) while keeping the host `ContextMenu.js` browser in English. The Csound wrappers call the upgraded 0.0.6 `CMGrainCoreExtended` engine in `csound/GrainCore.txt` (unified 128-slot branchless voice pool, 4097-point window LUTs, instantaneous envelope-weight overlap normalization, piecewise $C^1$ soft-knee feedback saturator, unified target-note quantizer, host BPM tempo sync, wet-only Wet Tone tilt EQ, and 3-tier Auto/Eco/Balanced/Studio HQ CPU modes) and exchange audio through the host's Zak cable buses. Host `instr 1` (or `100+` on polyphonic hosts) is the Voice layer; `instr 2` is the FX layer.

Grain Sample's interface selects a WAV file (via the empty-slot **Open WAV…** button or right-click menu; no demo WAV is bundled), validates its header, and transfers the bytes to Csound's virtual file system. Csound performs file decoding and all grain audio processing.

## Editing and installation

When a module's controls, ports or DSP arguments change, update its JavaScript definition and Csound wrapper together. Keep the shared core, library metadata, example patch and all three user manuals aligned.

The command-line installer verifies `_manifest.sha256.json` before modifying any host files (aborting immediately if a tracked file is missing or modified), applies `integration/csmodular.patch` when needed, and copies the modules, metadata, shared core, manuals, license and example into a source checkout. The desktop installers likewise verify `_manifest.sha256.json` before installing into a compatible host that already includes that integration, writing the shared core into the host's `csound/modules/` directory.

```powershell
node scripts/install.mjs E:/paper/csmodular-main
```

Use `npm run check:quick` for fast regressions and package checks, and `npm run check:full` for complete host, browser, DSP and package acceptance. See [TESTING.md](TESTING.md) for isolated host requirements and [BUILDING.md](BUILDING.md) for package builds, checksums, logs and temporary-file cleanup. Native Tauri builds require Rust and platform system dependencies.
