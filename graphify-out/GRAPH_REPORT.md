# Graph Report - .  (2026-05-15)

## Corpus Check
- Large corpus: 78 files · ~14,720,897 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 70 nodes · 66 edges · 19 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Feature Plans & Design Specs|Feature Plans & Design Specs]]
- [[_COMMUNITY_Sound & Speech Provider Logic|Sound & Speech Provider Logic]]
- [[_COMMUNITY_Global Hotkey Management|Global Hotkey Management]]
- [[_COMMUNITY_Text Injection Services|Text Injection Services]]
- [[_COMMUNITY_Deepgram Provider Integration|Deepgram Provider Integration]]
- [[_COMMUNITY_Main Process & Window Management|Main Process & Window Management]]
- [[_COMMUNITY_Whisper Engine (LocalCloud)|Whisper Engine (Local/Cloud)]]
- [[_COMMUNITY_Settings UI Logic|Settings UI Logic]]
- [[_COMMUNITY_Tray Icon & System Menu|Tray Icon & System Menu]]
- [[_COMMUNITY_Overlay UI Layout|Overlay UI Layout]]
- [[_COMMUNITY_Recorder Hook (State Machine)|Recorder Hook (State Machine)]]
- [[_COMMUNITY_Waveform Visualization|Waveform Visualization]]
- [[_COMMUNITY_Voice Command Processing|Voice Command Processing]]
- [[_COMMUNITY_System Robustness (ClipboardIPC)|System Robustness (Clipboard/IPC)]]
- [[_COMMUNITY_Preload IPC Bridge|Preload IPC Bridge]]
- [[_COMMUNITY_Global Type Definitions|Global Type Definitions]]
- [[_COMMUNITY_Shared Types & Constants|Shared Types & Constants]]
- [[_COMMUNITY_Speech Provider Interface|Speech Provider Interface]]
- [[_COMMUNITY_Voice Command Concepts|Voice Command Concepts]]

## God Nodes (most connected - your core abstractions)
1. `Enhanced Voice Overlay Features Plan` - 8 edges
2. `HotkeyManager` - 6 edges
3. `TextInjector` - 5 edges
4. `DeepgramProvider` - 5 edges
5. `getCtx()` - 4 edges
6. `playStartSound()` - 4 edges
7. `playStopSound()` - 4 edges
8. `playCommandSound()` - 4 edges
9. `WhisperLocalProvider` - 4 edges
10. `Visual Waveform Component Implementation Plan` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Enhanced Voice Overlay Features Plan` --references--> `Enhance Sound Cues Implementation Plan`  [EXTRACTED]
  docs/superpowers/plans/2026-05-15-enhanced-features.md → docs/superpowers/plans/2026-05-15-enhance-sound-cues.md
- `Enhanced Voice Overlay Features Plan` --references--> `Expand Settings Schema Implementation Plan`  [EXTRACTED]
  docs/superpowers/plans/2026-05-15-enhanced-features.md → docs/superpowers/plans/2026-05-15-expand-settings-schema.md
- `Enhanced Voice Overlay Features Plan` --references--> `Update Voice Command Processor Plan`  [EXTRACTED]
  docs/superpowers/plans/2026-05-15-enhanced-features.md → docs/superpowers/plans/2026-05-15-update-voice-command-processor.md
- `Enhanced Voice Overlay Features Plan` --references--> `Integrate Waveform and Settings into Overlay Plan`  [EXTRACTED]
  docs/superpowers/plans/2026-05-15-enhanced-features.md → docs/superpowers/plans/2026-05-15-integrate-waveform-overlay.md
- `Enhanced Voice Overlay Features Plan` --references--> `Revamp Settings UI Implementation Plan`  [EXTRACTED]
  docs/superpowers/plans/2026-05-15-enhanced-features.md → docs/superpowers/plans/2026-05-15-revamp-settings-ui.md

## Communities

### Community 0 - "Feature Plans & Design Specs"
Cohesion: 0.17
Nodes (13): AI Features, Sound Cues (Earcons), Visual Waveform, Enhance Sound Cues Implementation Plan, Enhanced Voice Overlay Features Plan, Expand Settings Schema Implementation Plan, Settings UI and History Logic Fix Plan, Integrate Waveform and Settings into Overlay Plan (+5 more)

### Community 1 - "Sound & Speech Provider Logic"
Cohesion: 0.38
Nodes (5): getCtx(), playCommandSound(), playStartSound(), playStopSound(), WhisperLocalProvider

### Community 2 - "Global Hotkey Management"
Cohesion: 0.29
Nodes (1): HotkeyManager

### Community 3 - "Text Injection Services"
Cohesion: 0.47
Nodes (1): TextInjector

### Community 4 - "Deepgram Provider Integration"
Cohesion: 0.33
Nodes (1): DeepgramProvider

### Community 5 - "Main Process & Window Management"
Cohesion: 0.5
Nodes (0): 

### Community 6 - "Whisper Engine (Local/Cloud)"
Cohesion: 0.83
Nodes (3): getPipe(), modelId(), transcribeAudio()

### Community 7 - "Settings UI Logic"
Cohesion: 0.67
Nodes (0): 

### Community 8 - "Tray Icon & System Menu"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Overlay UI Layout"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Recorder Hook (State Machine)"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Waveform Visualization"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Voice Command Processing"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "System Robustness (Clipboard/IPC)"
Cohesion: 1.0
Nodes (2): Fix Clipboard Bridge and State Race Conditions Plan, IPC Constants Cleanup Implementation Plan

### Community 14 - "Preload IPC Bridge"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Global Type Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Shared Types & Constants"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Speech Provider Interface"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Voice Command Concepts"
Cohesion: 1.0
Nodes (1): Voice Commands

## Knowledge Gaps
- **7 isolated node(s):** `Expand Settings Schema Implementation Plan`, `Fix Clipboard Bridge and State Race Conditions Plan`, `IPC Constants Cleanup Implementation Plan`, `Settings UI and History Logic Fix Plan`, `Update Voice Command Processor Plan` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Tray Icon & System Menu`** (2 nodes): `tray.ts`, `createTray()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Overlay UI Layout`** (2 nodes): `onMouseMove()`, `Overlay.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Recorder Hook (State Machine)`** (2 nodes): `useRecorder.ts`, `useRecorder()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Waveform Visualization`** (2 nodes): `Waveform.tsx`, `Waveform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Voice Command Processing`** (2 nodes): `processCommand()`, `commandProcessor.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `System Robustness (Clipboard/IPC)`** (2 nodes): `Fix Clipboard Bridge and State Race Conditions Plan`, `IPC Constants Cleanup Implementation Plan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Preload IPC Bridge`** (1 nodes): `preload.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Global Type Definitions`** (1 nodes): `global.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shared Types & Constants`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Speech Provider Interface`** (1 nodes): `ISpeechProvider.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Voice Command Concepts`** (1 nodes): `Voice Commands`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `Expand Settings Schema Implementation Plan`, `Fix Clipboard Bridge and State Race Conditions Plan`, `IPC Constants Cleanup Implementation Plan` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._