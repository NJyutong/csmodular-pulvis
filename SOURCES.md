# Provenance and license decisions

## Download button artwork

The Windows, macOS and Linux download buttons were drawn for the Pulvis manuals. The Apple and Linux silhouettes are rasterized from Font Awesome Free 6.7.2 by Fonticons, Inc. Their size and color were adapted to the buttons. Font Awesome licenses its icon artwork under CC BY 4.0. [Font Awesome source and license](https://github.com/FortAwesome/Font-Awesome/blob/6.7.2/LICENSE.txt) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

The CsModular repository button uses the application icon shipped in the upstream desktop bundle, scaled to fit the button. [CsModular icon source](https://github.com/gleb812/csmodular/blob/main/src-tauri/icons/128x128.png)

## Pulvis application icon (2026-11-19)

The user supplied `深色粒子波纹应用图标.webp` from the local Downloads folder for
the 0.0.5 product icon. The original WebP is retained at
`assets/pulvis-source.webp`. The repository's `scripts/build-icons.py` uses the
pinned Pillow 12.3.0 release tool in `requirements-release.txt` to derive the
512 px PNG used by the README, installer interface, and Linux bundle, plus the
Windows ICO and macOS ICNS bundles. Regenerate with
`python -m pip install -r requirements-release.txt` followed by
`python scripts/build-icons.py`. The installer workflows reference only the
generated repository assets; no external image is fetched.
The user supplied the image directly, and no separate third-party license is
asserted for it.

Reviewed on 2026-11-12. Reference trees were supplied locally; nothing was cloned,
downloaded into them, modified or redistributed. `references/granular/` was
absent, but all four alternative directories supplied by the user existed.
These extracted trees do not establish upstream Git revisions; exact file
SHA-256 values are recorded in `reference-files.json` in the standalone plugin.

## P2 desktop installer integration (2026-11-19)

The cross-platform Tauri installer UI, icons, Rust package, and build workflow were
integrated from the local `csmodular-granular-upload-stage` repository at commit
`c6e003d`. That repository declares MIT in its root `LICENSE` and lists Zhang
Shengwei as the Cargo package author. Its MIT attribution is retained here. The
installer bundles the original granular files from this repository; it does not
bundle the CsModular host or any third-party DSP source. Dependencies remain
external Cargo/npm packages with their own license terms. The host patch remains
the P1-accepted formal-repository version because it passed the isolated-host P0/P1
checks; broader staging-only context-menu and color-picker changes were not copied.

## Studio UI & host integration updates (2026-11-20)

Original matte graphite widescreen (`500 × 300`) canvas panel rendering (`src/ui/PulvisPanel.js`),
read-only rendering of Csound source, grain activity, oscilloscope and left-output FFT tables (`giScope_*` / `giSpectrum_*`),
HiDPI canvas alignment (`main.js`), rounded Pulvis language menu (`src/ui/module-menu.css`),
and HSL/RGB/hex panel color tinting with theme reset (`src/ui/ModuleContextMenu.js`) were
authored directly for the Pulvis host integration patch (`integration/csmodular.patch`).
No third-party UI assets, fonts, audio files, or demo WAV files are bundled.

## Project introduction video for the site (2026-11-22)

The site loads the user-provided Bilibili embed for `BV1MGyVzmEwb` only after a
visitor clicks the hero button. Closing the dialog resets the iframe and stops
playback. The site does not load or offer a download of the local MP4 source.

## Pulvis 0.0.6 backend DSP engine upgrade (2026-11-24)

The 0.0.6 backend engine rewrite in `csound/GrainCore.txt` (`CMGrainCoreExtended`) is an original Csound implementation authored directly for Pulvis: unified 128-slot branchless voice pool (`0..63` persistent active voices + `64..127` block-local expiring snapshots), precomputed 4097-point Hann and Blackman window lookup tables (`tablei` at `ksmps > 1` with exact analytic parity at `ksmps == 1`), instantaneous envelope-weight overlap normalization, piecewise $C^1$ zero-THD soft-knee feedback saturator, unified target-note pitch quantizer (Relative interval and Lock to key with carrier phase alignment), host BPM tempo sync (`chnget "bpm"`), wet-only Wet Tone spectral tilt filter for Grain Freeze, and 3-tier CPU modes (`Eco` / `Balanced` / `Studio HQ`). No Csound built-in granular opcodes and no third-party DSP code or audio assets are used.

## Host

`E:/paper/csmodular-main` reports version 0.1.5. Its README says MIT and refers
to `LICENSE`, but that file was absent in the supplied tree. The original tree
was recorded in local Git commit `10136ca` before implementation. No substitute
upstream copyright notice was invented. The plugin LICENSE covers original
granular additions, not the host or context lines in the integration patch.

The actual runtime constant is `@csound/browser@7.0.0-beta33`, overriding an old
6.18.7 comment. The test-only pinned npm package has its own Apache-2.0 LICENSE
and THIRD_PARTY notices; Csound and bundled dependencies keep their own terms.
No dependency binaries are committed or copied into the plugin distribution.

## QB Nebulae V2

- Local: `E:/paper/QB_Nebulae_V2-master/Instruments/Granular Looper/a_granular_looper.instr`.
- Upstream: [Qu-Bit Electronix QB_Nebulae_V2](https://github.com/Qu-Bit-Electronix/QB_Nebulae_V2).
- Header: Stephen Hensley / Qu-bit Electronix, 2017. No explicit license grant
  was found in the relevant file or a root LICENSE/COPYING file.
- The file explicitly attributes its buffer UDOs to the Csound FLOSS Manual,
  without establishing a precise manual version or per-example grant.
- Inspected control organization, separate live/file sources, buffer recording
  and Freeze workflow. The primary DSP calls `partikkel` and `partikkelsync`
  around lines 762–817; those are not usable under this task's requirements.
- **No code copied or translated**, including `CopyPartialBuffer`, `CplxBufRec1`
  and `CplxBufRec2`. The modern FLOSS license cannot retroactively establish
  the license of their historical source. Only the source-selection/control
  workflow informed this implementation.

## Mutable Instruments Clouds

- Local: `E:/paper/eurorack-master/clouds/dsp/`.
- Upstream: [pichenettes/eurorack](https://github.com/pichenettes/eurorack).
- Inspected `granular_processor.cc`, `granular_sample_player.h`, `grain.h`,
  and `audio_buffer.h`. Their file headers carry Emilie Gillet, 2014, and an
  MIT permission notice; this statement is scoped to these DSP files, not the
  entire eurorack tree or hardware design.
- Ideas used: separate recorder and reader state; Freeze stops recording while
  playback continues; bounded voice pool; per-grain captured parameters;
  history reserved for both reader and writer trajectories; smoothed overlap gain.
- **No C++ code copied or translated.** The Csound implementation uses its own
  scheduler, sample-count lifetime arrays, analytic Hann/triangle functions,
  explicit linear interpolation and mathematical equal-power pan. It does not
  reuse Clouds' fixed-point phase format, lookup tables, envelope approximations,
  resamplers or gain-normalization implementation.
- Should actual MIT source be ported later, retain the corresponding complete
  copyright and permission notices. Architectural acknowledgment here does
  not stand in for that requirement.

## Csound FLOSS manual

- Local: `E:/paper/csound-floss-develop/book/`.
- Upstream: [csound-flossmanual/csound-floss](https://github.com/csound-flossmanual/csound-floss).
- Read `04-f-granular-synthesis.md`, specifically `04F02_GranSynth_basic.csd`
  (`schedkwhen` → separate grain instrument), and the self-made granulator
  section of `05-g-granular-synthesis.md` (`schedulek`, sound table, grain player).
- In this supplied snapshot, `14-g-credits.md` says copyright 2011–2023 Joachim
  Heintz and contributors, with book content under **CC-BY 4.0**. No separate
  permissive code grant was found in the inspected examples. This is not a
  claim about earlier manual releases or unrelated files.
- Ideas used: separating grain scheduling from grain lifecycle, and capturing
  position/rate/duration when a grain starts. **No example code copied or
  translated.** This project uses a fixed pool to avoid instrument scheduling
  and Zak ordering issues, not the manual's event-instrument implementation.

## B.Harvestr

- Local: `E:/paper/BHarvestr-master/src/Grain.hpp` and `Voice.hpp`.
- Upstream: [sjaehn/BHarvestr](https://github.com/sjaehn/BHarvestr).
- Both headers declare Sven Jähnichen, 2018, **GPL-3.0-or-later**. Licenses of
  bundled UI libraries are not evidence for relicensing its DSP files.
- Only the functional separation of grain lifetime, playback speed, level and
  pan was considered. **No source, source translation, layouts or audio assets
  were copied.** In particular the supplied `sine440.wav` was not used.

## Original implementation and sample material

The implementation was written for the existing CsModular UDO interfaces.
Park–Miller state arithmetic, Hann/triangle equations, linear interpolation and
equal-power panning are mathematical constructions implemented directly here,
not extracted from any reference source. The tests create small synthetic
signals; no third-party sample material ships with the library.

Generic opcode behavior was checked against the official manual and, more
importantly, actually compiled/rendered using the exact production WASM build.
`setksmps 1` is used only by the test-only per-sample reference engine and an
isolated opcode probe; the production block renderer does not use it:
[setksmps](https://csound.com/docs/manual/setksmps.html),
[xout](https://csound.com/docs/manual/xout.html),
[ftgentmp](https://csound.com/docs/manual/ftgentmp.html), and
[function tables](https://csound.com/docs/manual/TableTop.html).

The plugin's MIT notice is shipped beside its public library files. Reference
source trees remain outside both project Git repositories.
