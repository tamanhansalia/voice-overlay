# Voice Overlay

A lightweight, always-on-top **voice-to-text overlay for Windows**. Click the
floating mic (or press a global hotkey), speak, and the transcribed text is
typed into whichever app is currently focused — terminals, browsers, IDEs,
ChatGPT, Claude, anywhere.

> Built with **Electron + React + TypeScript** using a pluggable speech
> backend (Web Speech / Deepgram / OpenAI Whisper).

---

## Features

- Tiny circular floating overlay, draggable, always-on-top
- Global hotkey (default `Alt+Space`) — toggle or push-to-talk
- Streaming transcription with live ticker under the overlay
- Auto-inject into the focused app via clipboard-paste (default) or simulated keystrokes
- "Copy only" fallback mode
- System tray icon with Show/Hide/Settings/Quit
- Auto-start on Windows login (optional)
- Persistent overlay position
- Glassmorphism / Windows-11 visual style
- Pluggable speech providers — add your own in `src/speech/`

## Project structure

```
voice-overlay/
├── package.json
├── electron.vite.config.ts
├── tsconfig.json / tsconfig.node.json / tsconfig.web.json
├── electron/                      # Electron main + preload (Node side)
│   ├── main.ts                    # window/tray/IPC/hotkey wiring
│   ├── preload.ts                 # narrow window.api surface
│   ├── settings.ts                # electron-store wrapper
│   ├── textInjector.ts            # paste/type via @nut-tree-fork/nut-js
│   ├── hotkeys.ts                 # global shortcut manager
│   ├── tray.ts                    # system tray + context menu
│   └── autoLaunch.ts              # Windows login auto-start
├── src/                           # React renderer (two entry points)
│   ├── overlay.html / overlay.tsx # floating overlay window
│   ├── settings.html / settings.tsx
│   ├── overlay/                   # Overlay UI + recorder hook
│   │   ├── Overlay.tsx
│   │   ├── Overlay.css
│   │   └── useRecorder.ts
│   ├── settings/                  # Settings UI
│   │   ├── Settings.tsx
│   │   └── Settings.css
│   ├── speech/                    # Pluggable speech backends
│   │   ├── ISpeechProvider.ts
│   │   ├── WebSpeechProvider.ts
│   │   ├── DeepgramProvider.ts
│   │   ├── WhisperOpenAIProvider.ts
│   │   └── index.ts               # factory
│   ├── shared/types.ts            # types + IPC channel names (no imports!)
│   ├── styles/globals.css
│   └── global.d.ts                # window.api typing
└── resources/
    ├── icon.png                   # tray icon
    └── icon.ico                   # installer icon
```

## Requirements

- **Windows 10/11**
- **Node.js 18+** and **npm**
- (For text injection) Visual Studio Build Tools — `@nut-tree-fork/nut-js`
  ships with prebuilt binaries for Windows x64, so a fresh `npm install`
  should Just Work. If it doesn\'t, install the
  [Windows build tools](https://github.com/nodejs/node-gyp#on-windows).

## Install

```bash
git clone <your repo or this folder>
cd voice-overlay
npm install
```

## Run in dev

```bash
npm run dev
```

This launches Electron with hot-reload for both renderer windows. The overlay
appears in the bottom-right of your primary display. Right-click the orb (or
the tray icon) for settings.

## Build & package

```bash
# Build the JS bundles into ./out
npm run build

# Produce an NSIS installer (.exe) into ./release/<version>/
npm run package
```

Output: `release/0.1.0/Voice Overlay Setup 0.1.0.exe`

For an unpacked dev build (`win-unpacked/Voice Overlay.exe`):

```bash
npm run package:dir
```

## Configuring a speech provider

The default is **Web Speech**, which works in Electron but depends on
Chromium\'s built-in Google service and may fail offline. For production use
pick one of the alternatives in **Settings → Provider**:

| Provider | Latency | Cost | Offline |
|---|---|---|---|
| Web Speech | low | free | no (network needed) |
| Deepgram (streaming) | lowest | paid (free tier) | no |
| Whisper (OpenAI API) | medium | paid | no |

### Adding a local Whisper.cpp provider (offline)

1. Build or download `whisper.exe` and a model (e.g. `ggml-base.en.bin`).
2. Drop them into `resources/whisper/`.
3. Create `src/speech/WhisperCppProvider.ts` that records to a temp .wav and
   shells out via `child_process.spawn` from the **main** process (IPC the
   blob from renderer to main first — renderers can\'t spawn).
4. Register it in `src/speech/index.ts` and add it to the dropdown in
   `Settings.tsx`.

## Hotkey

Default: `Alt+Space`. Change in Settings — uses
[Electron accelerator syntax](https://www.electronjs.org/docs/latest/api/accelerator)
(`CommandOrControl+Shift+V`, `Alt+CapsLock`, etc.).

> True **push-to-talk (hold to record)** needs a key-down/key-up hook, which
> Electron\'s `globalShortcut` doesn\'t expose. The setting is wired through
> so you can implement it with [`uiohook-napi`](https://github.com/SnosMe/uiohook-napi)
> — replace `electron/hotkeys.ts` with a uIOhook listener that emits
> `hotkeyPressed` / `hotkeyReleased` IPC events.

## Text injection modes

- **Paste (default)** — write to clipboard, send Ctrl+V, restore previous
  clipboard. Fast and unicode-safe. Works in CMD, PowerShell, Windows
  Terminal, VS Code, Chrome, ChatGPT, Claude, Notepad.
- **Type keystrokes** — per-character emulation via nut-js. Use this for
  apps that block paste (some password fields).
- **Copy only** — never auto-paste; just put text on the clipboard.

## Performance tips

- **Avoid `nodeIntegration`** — already disabled. Preload + contextBridge
  keeps the renderer light and safe.
- **Single overlay window** — kept transparent + frameless at 96x96 px. CPU
  is essentially zero when idle.
- **Provider only runs while recording.** When you stop, the MediaStream is
  released, the AudioContext closed, and the WebSocket / MediaRecorder torn
  down. RAM idles around ~80–100 MB for the whole app.
- **Renderer-only audio.** The mic is opened from the renderer process, so
  the main process never touches audio buffers — keeps the heavy thread
  lean and avoids IPC for high-rate PCM frames.
- **Settings persistence** is debounced via electron-store\'s synchronous
  writes — fine because writes only happen on user input.

## Microphone permission

On first run Windows will prompt for microphone access. If you\'ve denied it,
go to **Settings → Privacy → Microphone** and allow desktop apps to use it.
The overlay surfaces an error state if `getUserMedia` is rejected.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Orb does nothing on click | Open DevTools (Ctrl+Shift+I on the overlay during `npm run dev`) and check console for provider errors. |
| Web Speech "network" error | Switch to Deepgram or Whisper-OpenAI in Settings. |
| `nut-js` build failure on install | Install Visual Studio 2022 Build Tools with the **Desktop development with C++** workload. |
| Paste mode types nothing | Some apps block synthesised paste — switch to "Type keystrokes" mode. |
| Overlay off-screen after monitor change | Right-click tray → Hide overlay → Show overlay; if needed delete `%APPDATA%/voice-overlay/config.json`. |

## License

MIT.
