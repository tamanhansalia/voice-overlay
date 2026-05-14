# Graph Report - .  (2026-05-14)

## Corpus Check
- Large corpus: 44 files · ~6,694,821 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 89 nodes · 70 edges · 27 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Main Process & Settings|Main Process & Settings]]
- [[_COMMUNITY_Logging System|Logging System]]
- [[_COMMUNITY_Global Hotkeys|Global Hotkeys]]
- [[_COMMUNITY_Deepgram Integration|Deepgram Integration]]
- [[_COMMUNITY_Whisper OpenAI Integration|Whisper OpenAI Integration]]
- [[_COMMUNITY_Text Injection|Text Injection]]
- [[_COMMUNITY_Web Speech Integration|Web Speech Integration]]
- [[_COMMUNITY_Local Whisper Integration|Local Whisper Integration]]
- [[_COMMUNITY_Project Core (Readme)|Project Core (Readme)]]
- [[_COMMUNITY_Whisper Engine|Whisper Engine]]
- [[_COMMUNITY_Overlay UI & Recording|Overlay UI & Recording]]
- [[_COMMUNITY_Text Injection Modes|Text Injection Modes]]
- [[_COMMUNITY_Speech Providers|Speech Providers]]
- [[_COMMUNITY_Auto Launch|Auto Launch]]
- [[_COMMUNITY_System Tray|System Tray]]
- [[_COMMUNITY_Settings UI|Settings UI]]
- [[_COMMUNITY_Speech Provider Factory|Speech Provider Factory]]
- [[_COMMUNITY_Overlay HTML|Overlay HTML]]
- [[_COMMUNITY_Settings HTML|Settings HTML]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Preload Script|Preload Script]]
- [[_COMMUNITY_Global Types|Global Types]]
- [[_COMMUNITY_Overlay Entry|Overlay Entry]]
- [[_COMMUNITY_Settings Entry|Settings Entry]]
- [[_COMMUNITY_Shared Types|Shared Types]]
- [[_COMMUNITY_Speech Provider Interface|Speech Provider Interface]]
- [[_COMMUNITY_App Icon|App Icon]]

## God Nodes (most connected - your core abstractions)
1. `Logger` - 6 edges
2. `HotkeyManager` - 5 edges
3. `DeepgramProvider` - 5 edges
4. `WhisperOpenAIProvider` - 5 edges
5. `SettingsStore` - 4 edges
6. `TextInjector` - 4 edges
7. `WebSpeechProvider` - 4 edges
8. `WhisperLocalProvider` - 4 edges
9. `getPipe()` - 3 edges
10. `Voice Overlay` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Overlay()` --calls--> `useRecorder()`  [INFERRED]
  src\overlay\Overlay.tsx → src\overlay\useRecorder.ts

## Hyperedges (group relationships)
- **Application Technology Stack** — readme_electron, readme_react, readme_typescript [EXTRACTED 1.00]
- **Speech Backend Providers** — readme_web_speech, readme_deepgram, readme_whisper_openai [EXTRACTED 0.95]
- **Text Injection Modes** — readme_paste_mode, readme_type_mode, readme_copy_only [EXTRACTED 0.95]

## Communities

### Community 0 - "Main Process & Settings"
Cohesion: 0.25
Nodes (2): createOverlay(), SettingsStore

### Community 1 - "Logging System"
Cohesion: 0.33
Nodes (1): Logger

### Community 2 - "Global Hotkeys"
Cohesion: 0.4
Nodes (1): HotkeyManager

### Community 3 - "Deepgram Integration"
Cohesion: 0.33
Nodes (1): DeepgramProvider

### Community 4 - "Whisper OpenAI Integration"
Cohesion: 0.4
Nodes (1): WhisperOpenAIProvider

### Community 5 - "Text Injection"
Cohesion: 0.5
Nodes (1): TextInjector

### Community 6 - "Web Speech Integration"
Cohesion: 0.4
Nodes (1): WebSpeechProvider

### Community 7 - "Local Whisper Integration"
Cohesion: 0.4
Nodes (1): WhisperLocalProvider

### Community 8 - "Project Core (Readme)"
Cohesion: 0.4
Nodes (5): Electron, React, TypeScript, uiohook-napi, Voice Overlay

### Community 9 - "Whisper Engine"
Cohesion: 0.83
Nodes (3): getPipe(), modelId(), transcribeAudio()

### Community 10 - "Overlay UI & Recording"
Cohesion: 0.5
Nodes (2): Overlay(), useRecorder()

### Community 11 - "Text Injection Modes"
Cohesion: 0.67
Nodes (4): Copy Only Mode, @nut-tree-fork/nut-js, Paste Mode, Type Keystrokes Mode

### Community 12 - "Speech Providers"
Cohesion: 0.67
Nodes (3): Deepgram Provider, Web Speech Provider, Whisper OpenAI Provider

### Community 13 - "Auto Launch"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "System Tray"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Settings UI"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Speech Provider Factory"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Overlay HTML"
Cohesion: 1.0
Nodes (1): overlay.tsx

### Community 18 - "Settings HTML"
Cohesion: 1.0
Nodes (1): settings.tsx

### Community 19 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Preload Script"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Global Types"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Overlay Entry"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Settings Entry"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Shared Types"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Speech Provider Interface"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "App Icon"
Cohesion: 1.0
Nodes (1): App Icon

## Knowledge Gaps
- **9 isolated node(s):** `React`, `TypeScript`, `Web Speech Provider`, `Whisper OpenAI Provider`, `Copy Only Mode` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Auto Launch`** (2 nodes): `setAutoLaunch()`, `autoLaunch.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `System Tray`** (2 nodes): `tray.ts`, `createTray()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings UI`** (2 nodes): `scrollToSection()`, `Settings.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Speech Provider Factory`** (2 nodes): `makeProvider()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Overlay HTML`** (2 nodes): `overlay.html`, `overlay.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings HTML`** (2 nodes): `settings.html`, `settings.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `electron.vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Preload Script`** (1 nodes): `preload.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Global Types`** (1 nodes): `global.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Overlay Entry`** (1 nodes): `overlay.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Entry`** (1 nodes): `settings.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shared Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Speech Provider Interface`** (1 nodes): `ISpeechProvider.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Icon`** (1 nodes): `App Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `React`, `TypeScript`, `Web Speech Provider` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._