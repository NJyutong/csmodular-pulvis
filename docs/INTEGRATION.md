# Pulvis 0.0.6: CsModular Host Integration

This guide describes how this repository integrates the Grain Freeze, Grain Sample, and Grain Osc modules with the CsModular host. It follows the host architecture and module-contribution conventions while documenting the implementation in this plugin checkout.

For user-facing instructions, see the [English manual](../README.md). Localized user manuals remain at the repository root; technical documents in docs are English only.

## 1. Integration model

CsModular modules have a JavaScript definition for the editor and a Csound UDO wrapper for audio generation. The host loads module definitions from its library index, builds the patch from modules and cables, and asks CsoundGenerator to emit orchestra code.

The Pulvis library follows that model:

- modules/GrainFreeze.js and modules/GrainFreeze.txt — live-recording module; installed under public/libraries/pulvis/modules/.
- modules/GrainSample.js and modules/GrainSample.txt — WAV-backed module; installed under public/libraries/pulvis/modules/.
- modules/GrainOsc.js and modules/GrainOsc.txt — oscillator-backed module; installed under public/libraries/pulvis/modules/.
- _index.json and _meta.json — module and library metadata; installed under public/libraries/pulvis/.
- _manifest.sha256.json — SHA-256 integrity manifest verified before installation; regenerated via `node scripts/write-manifest.mjs`.
- csound/GrainCore.txt — shared grain engine; installed as public/csound/modules/GrainCore.txt.
- examples/pulvis-demo.json — example host patch; installed as public/patches/pulvis-demo.json.
- integration/csmodular-poly.patch — integration for upstream `d749239` (polyphonic host). The source installer checks both baselines before applying a patch.
- integration/csmodular.patch — host-side loader, sample, UI, localization, and build integration; applied to the host checkout.

The JavaScript files describe controls, ports, and editor presentation. Grain scheduling and audio processing do not run in JavaScript or Rust.

All three modules set `pulvisStudio: true` (`500 × 300`, `gridHeight: 20`) and are rendered by the host's `src/ui/PulvisPanel.js` in a matte anodized graphite dual-deck hardware layout (`GrainFreeze`: 3 × 3 left + 3 × 3 right; `GrainOsc`: 3 × 3 left + 2 × 3 vertically centered right; `GrainSample`: symmetric 3 / 3 / 2 left and right). Csound publishes one display frame per instance at 30 Hz. Source view draws the selected oscillator table, recording or snapshot peak history, or the loaded GEN01 sample overview. The right pane reads the active grain positions, ages and window amplitudes. The module context menu switches between **Show left-channel spectrum** and **Show source**. The spectrum shows the module’s post-level left output using a 2048-point Hann FFT and a 512-sample hop. The analyser taps the signal before Zak routing. Unpatched outputs produce no signal at the speakers.

Grain Osc provides separate `Phase warp` and `Phase jitter` controls. `Phase warp` changes the wave within each oscillator cycle; `Phase jitter` randomizes the starting phase of each grain. Both controls start at 0. Grain Osc and Grain Sample have no audio input or Wet mix control. Grain Freeze is the only module with an audio input and Wet mix control (and displays concise `Capture` / `捕捉快照` / `Снимок` on its momentary capture button while preserving `Capture snapshot` in module metadata).

Right-clicking a Pulvis title bar opens `ModuleContextMenu.js` (`src/ui/module-menu.css`):

- **About** opens a centered dialog with the project website, version, copyright, and MIT license.
- **Language** provides a rounded dropdown (`System default`, `简体中文`, `Русский`, `English`) persisted in `localStorage`, updating all open Pulvis panels and module context menus immediately. The host's main module browser (`src/ui/ContextMenu.js`, `Space` / empty right-click) intentionally stays in English (`Pulvis`, `Pulvis Grain Freeze`, `Pulvis Grain Osc`, `Pulvis Grain Sample`) so it matches the English host UI.
- **Panel color** tints the matte panel chassis and accent color across the 32 color swatches (`ColorPicker.js`, parsing `#hex`, `rgb/rgba`, and `hsl/hsla`), and **↺ Follow theme** immediately clears the custom override and restores the default matte graphite palette.

The host integration also enables HiDPI supersampled canvas rendering (`main.js` `_getCanvasDpr()`, `canvas.style.objectFit = 'fill'`, and CSS-pixel bounds for `panelInView()`, `ContextMenu`, and `Minimap`) so panels, labels, cables, and overlays stay sharp and aligned under display scaling and zoom. Install the CsModular host first, then install Pulvis; once installed, opening the host automatically lists Pulvis in the module browser (for source-checkout development, run `npm run dev` or `node dev-server.mjs` in `csmodular-main`).

## 2. Signal flow and host routing

On upstream `d749239`, Voice runs in instruments 100 and above, one per host voice. Each voice uses its own routed Zak buses. Voice zero receives the positive display table ID and supplies the panel display. Other voices receive its negative ID and read the same module control channels. FX runs once in instrument 2. After each compile, the host writes the module channels and global quality setting using the newly allocated display map. Patch JSON stores module options in `pulvisSettings`, including WAV roots and cents for each slot. The earlier host runs Voice in instrument 1. Patches connect module ports through the host's Zak cable buses. The plugin does not add another instrument or a private inter-module audio bus.

Each Pulvis wrapper:

1. Grain Freeze reads its audio input with Zak at the host's configured block size; Grain Sample and Grain Osc have no audio input.
2. Reads control-rate inputs with zkr.
3. Calls the shared CMGrainCoreExtended UDO.
4. Writes its left and right outputs to the Zak buses allocated by the host.

Grain Sample and Grain Osc have stereo outputs and no audio inputs. Grain Freeze is the only module with a mono audio input; it records that signal into its private live ring buffer and mixes the dry signal with the granular output. All outputs remain patchable through ordinary host cables; connect them to an output module such as Outs2 to reach the sound device.

The wrappers must keep Zak reads and writes at the host block size. Do not move Zak I/O into a local-block-size core: Zak buses are allocated by the host's orchestra.

## 3. Shared DSP and dependency loading

csound/GrainCore.txt is the single source of the plugin's shared grain algorithm. The three module .txt files are thin wrappers and declare the dependency:

    ;@ requires GrainCore.txt

The host integration resolves required UDO files from public/csound/modules/, orders dependencies before their callers, and includes a shared dependency once. Missing files and dependency cycles must be reported as generation errors. Sample-table declarations are emitted before the UDOs when a patch contains Grain Sample.

The 0.0.6 shared core (`CMGrainCoreExtended` in `csound/GrainCore.txt`) is a ground-up upgrade of the original Csound granular engine:

- **Unified 128-slot branchless voice pool:** Slots `0..63` hold persistent active voices while slots `64..127` hold block-local expiring snapshots, keeping grain starts and ends sample-accurate across arbitrary host `ksmps` without voice stealing (when all 64 persistent slots are full, new triggers are dropped).
- **Precomputed 4097-point Hann & Blackman window LUTs:** Replaces per-sample `cos()` evaluation in the hot render loop with linear-interpolated table lookups (`tablei`) at `ksmps > 1`, retaining exact analytic formulas at `ksmps == 1` for bit-exact reference parity.
- **Instantaneous envelope-weight overlap normalization:** Divides the wet sum by the square root of smoothed overlap weight. Coherent grains still add in phase, so their output level rises with density.
- **Piecewise $C^1$ zero-THD soft-knee feedback saturator:** Remains bit-exact linear for `|x| <= 0.7` and transitions smoothly into `±1` without hard-clipping artifacts in Grain Freeze feedback loops.
- **Unified Target-Note Quantizer:** Supports both **Relative interval** (`Free`, `Octaves`, `Octaves + 5ths`, `Maj Pent`, `Min Pent`) and **Lock to key** (`C`–`B` + `Major`, `Natural Minor`, `Maj Pent`, `Min Pent`, `Dorian`). `GrainOsc` quantizes from its known `A3` root with phase-coherent carrier alignment; `GrainSample` applies per-slot `Sample root + fine detune (±50 c)`; `GrainFreeze` stays in Relative interval mode.
- **Host BPM Tempo Sync:** Reads CsModular's `bpm` channel (`1/1`–`1/32`, including triplets) with instant subdivision switching (`kNextTrigger` clamping) while preserving `TimeJitter` humanization.
- **Grain Freeze Wet Tone:** Constant-loudness wet-only spectral tilt filter placed strictly after the feedback tap and before the Dry/Wet mix so dry audio stays crisp and feedback never compounds tonal tilt.
- **3-tier CPU Mode (`Balanced` / `Eco` / `Studio HQ`):** Defaults to frontend `Auto` hardware detection. `Eco` mode caps active voices at 16, switches `GrainOsc` to a `tableikt` fast path, caps sinc interpolation at 32 taps, and evaluates interior envelopes at k-rate midpoint (up to `3.88×` faster on extreme `+48 st` workloads).

The plugin must implement scheduling, voice lifetime, table reads, interpolation, playback phase, windows, random state, overlap mixing, and live-ring-buffer behavior in its own Csound source. Do not call or wrap Csound's built-in granular opcodes, including partikkel, partikkelsync, grain, grain2, grain3, syncgrain, granule, diskgrain, fof, fof2, fog, sndwarp, sndwarpst, mincer, or temposcal.

The shared core renders active grains in audio-rate vectors within the host block. Module wrappers perform Zak I/O at the host block size.

## 4. WAV import path

Grain Sample uses the host's sample-import integration:

1. The user selects one of eight sample slots (`#1`–`#8` in the OLED slot strip or the `Slot` knob) and chooses a WAV file either by clicking the centered **Open WAV…** button on an empty slot or from the module context menu (**Load WAV → slot…**). No demo WAV file is bundled with the plugin.
2. JavaScript checks supported WAV metadata, retains the file bytes for the current app session, and transfers them to Csound's virtual file system.
3. The generator declares sample tables only when Grain Sample is present in the patch.
4. Csound's GEN01 loads the source and the granular core reads it during synthesis. JavaScript does not decode, resample, or process grain audio.

Current import limits are:

- One file: at most 256 MiB and 5 minutes.
- Per app session: at most 512 MiB of source files and 48,000,000 decoded mono frames.
- Sample rates: 8–192 kHz.
- Mono or stereo; stereo input uses the left channel.
- PCM 8/16/24/32-bit, IEEE float32/64, and standard WAVE_FORMAT_EXTENSIBLE.
- RF64, RIFX, and more than two channels are unsupported.

Sample bytes persist through Stop/Start and recompilation within the current app session. They are not embedded in patch JSON and are not restored after the app is closed or reloaded. Replacing a sample safely restarts the audio engine so an active voice cannot keep reading a replaced table. See the [user manual](../README.md) for the complete sample workflow and limitations.

## 5. Install

The plugin targets the CsModular 0.1.5 source layout. Run the installer from the plugin repository root:

    node scripts/install.mjs E:/paper/csmodular-main

For a host carrying the earlier WAV session integration, the source installer applies `integration/wav-session-compat.patch` and checks that the resulting integration matches the current patch. For a clean baseline it applies `integration/csmodular.patch`. Before touching the host checkout, both `scripts/install.mjs` and the desktop installer scripts verify every file listed in `_manifest.sha256.json` and abort immediately if the manifest is missing or any byte has been modified. Once verified, the installer stages the payload and copies the ready-to-use modules, metadata, manuals, license, shared core and demo patch into the host.

### Desktop application packages

Pulvis 0.0.6 provides standard native installers with no WebView, GTK, or WebKit runtime dependencies: separate Windows x64 (`Pulvis-0.0.6-windows-x64.exe`) and Windows ARM64 (`Pulvis-0.0.6-windows-arm64.exe`) Inno Setup wizards, separate macOS Apple Silicon (`Pulvis-0.0.6-macos-arm64.pkg`) and macOS Intel (`Pulvis-0.0.6-macos-x64.pkg`) native `.pkg` installers, and a standard Linux amd64 Debian `.deb` (`Pulvis-0.0.6-linux-x64.deb`). Each installer writes module files into the host's `libraries/pulvis` directory, places `GrainCore.txt` in the sibling `csound/modules/` directory, and registers `pulvis` in `libraries/_index.json`. All desktop installers require the host integration to be present already.

The selected host must include the Pulvis-compatible loader, sample-import, and build integration. The desktop installer registers `pulvis` in `libraries/_index.json`; old `granular` registrations and folders are migrated. The command-line installer applies the integration to supported source checkouts. The desktop installer detects common host locations and provides a folder picker for source checkouts or custom paths. Its interface supports English, Simplified Chinese, and Russian and follows the system language unless a language is selected manually. The selected host directory must be writable by the installer.

The package version is shared by the library metadata, root package, Tauri configuration, Rust crate, localized manuals, and CI artifact names. `npm run package:smoke` checks those values, the installer resource manifest and the shared-core destination without compiling the native application.

## 6. Common integration issues

- **A required UDO is missing:** confirm that csound/GrainCore.txt was installed to public/csound/modules/GrainCore.txt, then recompile the patch.
- **A module does not appear in the library:** check that its entry in _index.json is stable or passable; release builds filter out development and broken modules.
- **A sample slot is silent:** empty slots produce silence. Re-import files after closing or reloading the app because samples are session data.
- **The module has no sound-device output:** route its Zak outputs through the patch to a host output module such as Outs2.

## 7. License

Copyright © 2026 Zhang Shengwei. Released under the MIT License; see [LICENSE](../LICENSE).
