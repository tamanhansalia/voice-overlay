# Graph Report - .  (2026-05-16)

## Corpus Check
- Large corpus: 72 files · ~17,388,609 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 80 nodes · 79 edges · 22 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Feature Plans & Specs|Feature Plans & Specs]]
- [[_COMMUNITY_Audio & Whisper Providers|Audio & Whisper Providers]]
- [[_COMMUNITY_Global Hotkey Management|Global Hotkey Management]]
- [[_COMMUNITY_Text Injection System|Text Injection System]]
- [[_COMMUNITY_Deepgram Integration|Deepgram Integration]]
- [[_COMMUNITY_Electron Main Process|Electron Main Process]]
- [[_COMMUNITY_Whisper AI Engine|Whisper AI Engine]]
- [[_COMMUNITY_Overlay UI Components|Overlay UI Components]]
- [[_COMMUNITY_Settings Window UI|Settings Window UI]]
- [[_COMMUNITY_System Tray Management|System Tray Management]]
- [[_COMMUNITY_Recorder Hook Logic|Recorder Hook Logic]]
- [[_COMMUNITY_Audio Waveform Visualization|Audio Waveform Visualization]]
- [[_COMMUNITY_Voice Command Processing|Voice Command Processing]]
- [[_COMMUNITY_Maintenance Plans|Maintenance Plans]]
- [[_COMMUNITY_Electron Licenses|Electron Licenses]]
- [[_COMMUNITY_Chromium Licenses|Chromium Licenses]]
- [[_COMMUNITY_Release Assets (Icons)|Release Assets (Icons)]]
- [[_COMMUNITY_Electron Preload Script|Electron Preload Script]]
- [[_COMMUNITY_TypeScript Global Definitions|TypeScript Global Definitions]]
- [[_COMMUNITY_Shared Constants & Types|Shared Constants & Types]]
- [[_COMMUNITY_Speech Provider Interfaces|Speech Provider Interfaces]]
- [[_COMMUNITY_Voice Command Concepts|Voice Command Concepts]]

## God Nodes (most connected - your core abstractions)
1. `Enhanced Voice Overlay Features Plan` - 8 edges
2. `HotkeyManager` - 6 edges
3. `playStartSound()` - 6 edges
4. `playStopSound()` - 6 edges
5. `playCommandSound()` - 6 edges
6. `TextInjector` - 5 edges
7. `DeepgramProvider` - 5 edges
8. `getCtx()` - 4 edges
9. `WhisperLocalProvider` - 4 edges
10. `Visual Waveform Component Implementation Plan` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Electron License (v0.3.0)` --semantically_similar_to--> `Electron License (v0.3.1)`  [INFERRED] [semantically similar]
  release/0.3.0/win-unpacked/LICENSE.electron.txt → release/0.3.1/win-unpacked/LICENSE.electron.txt
- `Chromium Credits & Licenses (v0.3.0)` --semantically_similar_to--> `Chromium Credits & Licenses (v0.3.1)`  [INFERRED] [semantically similar]
  release/0.3.0/win-unpacked/LICENSES.chromium.html → release/0.3.1/win-unpacked/LICENSES.chromium.html
- `Application Icon (v0.3.0)` --semantically_similar_to--> `Application Icon (v0.3.1)`  [INFERRED] [semantically similar]
  release/0.3.0/win-unpacked/resources/icon.png → release/0.3.1/win-unpacked/resources/icon.png
- `Enhanced Voice Overlay Features Plan` --references--> `Enhance Sound Cues Implementation Plan`  [EXTRACTED]
  docs/superpowers/plans/2026-05-15-enhanced-features.md → docs/superpowers/plans/2026-05-15-enhance-sound-cues.md
- `Enhanced Voice Overlay Features Plan` --references--> `Expand Settings Schema Implementation Plan`  [EXTRACTED]
  docs/superpowers/plans/2026-05-15-enhanced-features.md → docs/superpowers/plans/2026-05-15-expand-settings-schema.md

## Hyperedges (group relationships)
- **Release 0.3.0 Distribution Package** — release_0_3_0_electron_license, release_0_3_0_chromium_licenses, release_0_3_0_icon [EXTRACTED 1.00]
- **Release 0.3.1 Distribution Package** — release_0_3_1_electron_license, release_0_3_1_chromium_licenses, release_0_3_1_icon [EXTRACTED 1.00]

## Communities

### Community 0 - "Feature Plans & Specs"
Cohesion: 0.17
Nodes (13): AI Features, Sound Cues (Earcons), Visual Waveform, Enhance Sound Cues Implementation Plan, Enhanced Voice Overlay Features Plan, Expand Settings Schema Implementation Plan, Settings UI and History Logic Fix Plan, Integrate Waveform and Settings into Overlay Plan (+5 more)

### Community 1 - "Audio & Whisper Providers"
Cohesion: 0.38
Nodes (7): getCtx(), normalizedVolume(), playCommandSound(), playStartSound(), playStopSound(), resumeCtx(), WhisperLocalProvider

### Community 2 - "Global Hotkey Management"
Cohesion: 0.29
Nodes (1): HotkeyManager

### Community 3 - "Text Injection System"
Cohesion: 0.47
Nodes (1): TextInjector

### Community 4 - "Deepgram Integration"
Cohesion: 0.33
Nodes (1): DeepgramProvider

### Community 5 - "Electron Main Process"
Cohesion: 0.5
Nodes (0): 

### Community 6 - "Whisper AI Engine"
Cohesion: 0.83
Nodes (3): getPipe(), modelId(), transcribeAudio()

### Community 7 - "Overlay UI Components"
Cohesion: 0.5
Nodes (0): 

### Community 8 - "Settings Window UI"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "System Tray Management"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Recorder Hook Logic"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Audio Waveform Visualization"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Voice Command Processing"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Maintenance Plans"
Cohesion: 1.0
Nodes (2): Fix Clipboard Bridge and State Race Conditions Plan, IPC Constants Cleanup Implementation Plan

### Community 14 - "Electron Licenses"
Cohesion: 1.0
Nodes (2): Electron License (v0.3.0), Electron License (v0.3.1)

### Community 15 - "Chromium Licenses"
Cohesion: 1.0
Nodes (2): Chromium Credits & Licenses (v0.3.0), Chromium Credits & Licenses (v0.3.1)

### Community 16 - "Release Assets (Icons)"
Cohesion: 1.0
Nodes (2): Application Icon (v0.3.0), Application Icon (v0.3.1)

### Community 17 - "Electron Preload Script"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "TypeScript Global Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Shared Constants & Types"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Speech Provider Interfaces"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Voice Command Concepts"
Cohesion: 1.0
Nodes (1): Voice Commands

## Knowledge Gaps
- **13 isolated node(s):** `Expand Settings Schema Implementation Plan`, `Fix Clipboard Bridge and State Race Conditions Plan`, `IPC Constants Cleanup Implementation Plan`, `Settings UI and History Logic Fix Plan`, `Update Voice Command Processor Plan` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `System Tray Management`** (2 nodes): `tray.ts`, `createTray()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Recorder Hook Logic`** (2 nodes): `useRecorder.ts`, `useRecorder()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Audio Waveform Visualization`** (2 nodes): `Waveform.tsx`, `Waveform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Voice Command Processing`** (2 nodes): `processCommand()`, `commandProcessor.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Maintenance Plans`** (2 nodes): `Fix Clipboard Bridge and State Race Conditions Plan`, `IPC Constants Cleanup Implementation Plan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Electron Licenses`** (2 nodes): `Electron License (v0.3.0)`, `Electron License (v0.3.1)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chromium Licenses`** (2 nodes): `Chromium Credits & Licenses (v0.3.0)`, `Chromium Credits & Licenses (v0.3.1)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Release Assets (Icons)`** (2 nodes): `Application Icon (v0.3.0)`, `Application Icon (v0.3.1)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Electron Preload Script`** (1 nodes): `preload.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TypeScript Global Definitions`** (1 nodes): `global.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shared Constants & Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Speech Provider Interfaces`** (1 nodes): `ISpeechProvider.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Voice Command Concepts`** (1 nodes): `Voice Commands`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `playStartSound()` (e.g. with `.start()` and `.stop()`) actually correct?**
  _`playStartSound()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `playStopSound()` (e.g. with `.start()` and `.stop()`) actually correct?**
  _`playStopSound()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `playCommandSound()` (e.g. with `.start()` and `.stop()`) actually correct?**
  _`playCommandSound()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Expand Settings Schema Implementation Plan`, `Fix Clipboard Bridge and State Race Conditions Plan`, `IPC Constants Cleanup Implementation Plan` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._