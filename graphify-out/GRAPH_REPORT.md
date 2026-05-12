# Graph Report - .  (2026-05-12)

## Corpus Check
- Large corpus: 28 files · ~1,341,836 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 76 nodes · 60 edges · 22 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Project Overview & Core Concepts|Project Overview & Core Concepts]]
- [[_COMMUNITY_Main Process & Settings Management|Main Process & Settings Management]]
- [[_COMMUNITY_Hotkey Management|Hotkey Management]]
- [[_COMMUNITY_Deepgram Speech Provider|Deepgram Speech Provider]]
- [[_COMMUNITY_Whisper OpenAI Provider|Whisper OpenAI Provider]]
- [[_COMMUNITY_Web Speech Provider|Web Speech Provider]]
- [[_COMMUNITY_Text Injection Mechanism|Text Injection Mechanism]]
- [[_COMMUNITY_Overlay UI & Audio Recording|Overlay UI & Audio Recording]]
- [[_COMMUNITY_Auto-launch Configuration|Auto-launch Configuration]]
- [[_COMMUNITY_System Tray Integration|System Tray Integration]]
- [[_COMMUNITY_Settings UI Component|Settings UI Component]]
- [[_COMMUNITY_Provider Factory|Provider Factory]]
- [[_COMMUNITY_Overlay Entry Points|Overlay Entry Points]]
- [[_COMMUNITY_Settings Entry Points|Settings Entry Points]]
- [[_COMMUNITY_Build Configuration (Vite)|Build Configuration (Vite)]]
- [[_COMMUNITY_Utility Scripts|Utility Scripts]]
- [[_COMMUNITY_Electron Preload|Electron Preload]]
- [[_COMMUNITY_Global Type Definitions|Global Type Definitions]]
- [[_COMMUNITY_Overlay Source (TSX)|Overlay Source (TSX)]]
- [[_COMMUNITY_Settings Source (TSX)|Settings Source (TSX)]]
- [[_COMMUNITY_Shared Data Types|Shared Data Types]]
- [[_COMMUNITY_Speech Provider Interface|Speech Provider Interface]]

## God Nodes (most connected - your core abstractions)
1. `Voice Overlay` - 15 edges
2. `HotkeyManager` - 5 edges
3. `DeepgramProvider` - 5 edges
4. `WhisperOpenAIProvider` - 5 edges
5. `SettingsStore` - 4 edges
6. `WebSpeechProvider` - 4 edges
7. `TextInjector` - 3 edges
8. `Deepgram Provider` - 3 edges
9. `createOverlay()` - 2 edges
10. `Overlay()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Overlay()` --calls--> `useRecorder()`  [INFERRED]
  src\overlay\Overlay.tsx → src\overlay\useRecorder.ts

## Hyperedges (group relationships)
- **Speech Backend Providers** — web_speech_provider, deepgram_provider, whisper_openai_provider [EXTRACTED 0.95]
- **Text Injection Modes** — paste_mode, type_mode, copy_mode [EXTRACTED 0.95]
- **Application Technology Stack** — electron_framework, react_framework, typescript_language [EXTRACTED 1.00]

## Communities

### Community 0 - "Project Overview & Core Concepts"
Cohesion: 0.15
Nodes (14): Copy Only Mode, Deepgram Provider, Electron, Global Hotkey (Alt+Space), @nut-tree-fork/nut-js, Paste Mode, React, Renderer-only Audio (+6 more)

### Community 1 - "Main Process & Settings Management"
Cohesion: 0.22
Nodes (3): electron-store, createOverlay(), SettingsStore

### Community 2 - "Hotkey Management"
Cohesion: 0.4
Nodes (1): HotkeyManager

### Community 3 - "Deepgram Speech Provider"
Cohesion: 0.33
Nodes (1): DeepgramProvider

### Community 4 - "Whisper OpenAI Provider"
Cohesion: 0.33
Nodes (1): WhisperOpenAIProvider

### Community 5 - "Web Speech Provider"
Cohesion: 0.4
Nodes (1): WebSpeechProvider

### Community 6 - "Text Injection Mechanism"
Cohesion: 0.67
Nodes (1): TextInjector

### Community 7 - "Overlay UI & Audio Recording"
Cohesion: 0.5
Nodes (2): Overlay(), useRecorder()

### Community 8 - "Auto-launch Configuration"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "System Tray Integration"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Settings UI Component"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Provider Factory"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Overlay Entry Points"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Settings Entry Points"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Build Configuration (Vite)"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Utility Scripts"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Electron Preload"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Global Type Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Overlay Source (TSX)"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Settings Source (TSX)"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Shared Data Types"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Speech Provider Interface"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **10 isolated node(s):** `Electron`, `React`, `TypeScript`, `Windows 10/11`, `@nut-tree-fork/nut-js` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Auto-launch Configuration`** (2 nodes): `setAutoLaunch()`, `autoLaunch.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `System Tray Integration`** (2 nodes): `tray.ts`, `createTray()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings UI Component`** (2 nodes): `update()`, `Settings.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Provider Factory`** (2 nodes): `makeProvider()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Overlay Entry Points`** (2 nodes): `overlay.html`, `overlay.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Entry Points`** (2 nodes): `settings.html`, `settings.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Build Configuration (Vite)`** (1 nodes): `electron.vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Utility Scripts`** (1 nodes): `extract_ast.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Electron Preload`** (1 nodes): `preload.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Global Type Definitions`** (1 nodes): `global.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Overlay Source (TSX)`** (1 nodes): `overlay.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Source (TSX)`** (1 nodes): `settings.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shared Data Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Speech Provider Interface`** (1 nodes): `ISpeechProvider.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Voice Overlay` connect `Project Overview & Core Concepts` to `Main Process & Settings Management`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `electron-store` connect `Main Process & Settings Management` to `Project Overview & Core Concepts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `Electron`, `React`, `TypeScript` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._