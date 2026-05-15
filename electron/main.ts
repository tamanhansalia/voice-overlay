import { app, BrowserWindow, ipcMain, screen, clipboard, session, desktopCapturer } from 'electron';
import path from 'node:path';
import os from 'node:os';
import { IPC, AppSettings } from '../src/shared/types';
import { settingsStore } from './settings';
import { logger } from './logger';
import { textInjector } from './textInjector';
import { HotkeyManager } from './hotkeys';
import { createTray } from './tray';
import { setAutoLaunch } from './autoLaunch';
import { transcribeAudio } from './whisperEngine';

// Mica material requires Windows 11 (build 22000+). Guard so Win10 doesn't freeze.
const isWin11 = process.platform === 'win32' &&
  parseInt((os.release().split('.')[2] ?? '0'), 10) >= 22000;

const isDev = !app.isPackaged;
const RESOURCES_PATH = isDev
  ? path.join(__dirname, '../../resources')
  : process.resourcesPath;

const ICON_PATH = path.join(RESOURCES_PATH, 'icon.png');
const ICON_ICO = path.join(RESOURCES_PATH, 'icon.ico');
const APP_ICON = process.platform === 'win32' ? ICON_ICO : ICON_PATH;

const transcriptionHistory: string[] = [];

let overlayWin: BrowserWindow | null = null;
let settingsWin: BrowserWindow | null = null;
let hotkeys: HotkeyManager | null = null;
let dragInterval: ReturnType<typeof setInterval> | null = null;

// Single-instance guard so a second launch focuses the existing app.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', () => {
  if (overlayWin) {
    if (!overlayWin.isVisible()) overlayWin.show();
    overlayWin.focus();
  }
});

function createOverlay(): BrowserWindow {
  const settings = settingsStore.getAll();
  const display = screen.getPrimaryDisplay();
  const width = 160;
  const height = 220; // Increased from 160 to prevent ticker clipping
  const pos = settings.overlayPosition ?? {
    x: display.workArea.x + display.workArea.width - width - 24,
    y: display.workArea.y + display.workArea.height - height - 80
  };

  const win = new BrowserWindow({
    width,
    height,
    x: pos.x,
    y: pos.y,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    show: false,
    icon: APP_ICON,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Float above fullscreen apps too.
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Pass mouse events through the transparent regions by default.
  // The renderer toggles this off when the cursor is over the orb/drag-handle.
  win.setIgnoreMouseEvents(true, { forward: true });

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/overlay.html`);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/overlay.html'));
  }

  win.once('ready-to-show', () => win.show());

  win.on('closed', () => {
    if (dragInterval) {
      clearInterval(dragInterval);
      dragInterval = null;
    }
    overlayWin = null;
  });

  // Persist position after drag ends — debounced to avoid a disk write on every pixel moved.
  let moveDebounce: ReturnType<typeof setTimeout> | null = null;
  win.on('moved', () => {
    if (moveDebounce) clearTimeout(moveDebounce);
    moveDebounce = setTimeout(() => {
      const [x, y] = win.getPosition();
      settingsStore.update({ overlayPosition: { x, y } });
      moveDebounce = null;
    }, 300);
  });

  return win;
}

function createSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 850,
    height: 650,
    minWidth: 600,
    minHeight: 500,
    title: 'Voice Overlay — Settings',
    autoHideMenuBar: true,
    frame: true,
    ...(isWin11 && { backgroundMaterial: 'mica' as const }),
    icon: APP_ICON,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (process.env['ELECTRON_RENDERER_URL']) {
    settingsWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/settings.html`);
  } else {
    settingsWin.loadFile(path.join(__dirname, '../renderer/settings.html'));
  }

  settingsWin.on('closed', () => {
    settingsWin = null;
  });
}

function registerIpc() {
  ipcMain.handle(IPC.injectText, async (_e, text: string) => {
    const { injectionMode } = settingsStore.getAll();
    await textInjector.inject(text, injectionMode);
  });

  ipcMain.handle(IPC.copyToClipboard, (_e, text: string) => {
    clipboard.writeText(text);
  });

  ipcMain.handle(IPC.recordTranscription, (_e, text: string) => {
    transcriptionHistory.push(text.trim());
    if (transcriptionHistory.length > 50) transcriptionHistory.shift();
  });

  ipcMain.handle('read-clipboard', () => clipboard.readText());

  ipcMain.handle(IPC.getTranscriptionHistory, () => transcriptionHistory);

  ipcMain.handle(IPC.clearTranscriptionHistory, () => {
    transcriptionHistory.length = 0;
  });

  ipcMain.handle(IPC.getSettings, () => settingsStore.getAll());

  ipcMain.handle(IPC.setSettings, async (_e, patch: Partial<AppSettings>) => {
    const previous = settingsStore.getAll();
    const next = settingsStore.update(patch);

    if (patch.hotkey && patch.hotkey !== previous.hotkey && hotkeys) {
      hotkeys.register(next.hotkey);
    }
    if (patch.autoLaunch !== undefined && patch.autoLaunch !== previous.autoLaunch) {
      await setAutoLaunch(next.autoLaunch);
    }

    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send(IPC.settingsChanged, next);
    });
    return next;
  });

  ipcMain.handle(IPC.openSettings, () => createSettingsWindow());
  ipcMain.handle(IPC.quitApp, () => app.quit());

  ipcMain.handle(IPC.executeCommand, async (_e, commandType: string) => {
    await textInjector.runCommand(commandType);
  });

  ipcMain.handle('capture-screen', async () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const sources = await desktopCapturer.getSources({ 
      types: ['screen'], 
      thumbnailSize: { width: primaryDisplay.size.width, height: primaryDisplay.size.height } 
    });
    return sources[0]?.thumbnail.toDataURL();
  });

  ipcMain.handle(IPC.askAI, async (_e, prompt: string, system: string) => {
    const { openAiApiKey } = settingsStore.getAll();
    if (!openAiApiKey) throw new Error('OpenAI API key missing');

    const isImage = prompt.startsWith('data:image');
    const userContent = isImage 
      ? [
          { type: 'text', text: 'Describe what you see in this screenshot briefly and accurately.' },
          { type: 'image_url', image_url: { url: prompt } }
        ]
      : prompt;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userContent }
        ],
        temperature: 0.3
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content.trim();
  });

  ipcMain.handle(IPC.getLogs, () => logger.getHistory());
  ipcMain.handle(IPC.clearLogs, () => logger.clear());

  ipcMain.on(IPC.overlayMoved, (_e, pos: { x: number; y: number }) => {
    settingsStore.update({ overlayPosition: pos });
  });

  // Custom drag for focusable:false windows (CSS -webkit-app-region:drag is blocked by the OS
  // when the window has no focus capability). We poll cursor position at ~120 fps and shift
  // the window by the delta so the overlay follows the cursor naturally.
  ipcMain.on('set-ignore-mouse-events', (_e, ignore: boolean) => {
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.setIgnoreMouseEvents(ignore, { forward: true });
    }
  });

  ipcMain.on(IPC.dragStart, () => {
    if (!overlayWin || dragInterval) return;
    // Disable pass-through while dragging so pointer events stay with the overlay.
    overlayWin.setIgnoreMouseEvents(false);
    let last = screen.getCursorScreenPoint();
    dragInterval = setInterval(() => {
      if (!overlayWin) return;
      const curr = screen.getCursorScreenPoint();
      if (curr.x !== last.x || curr.y !== last.y) {
        const [wx, wy] = overlayWin.getPosition();
        overlayWin.setPosition(wx + curr.x - last.x, wy + curr.y - last.y);
        last = curr;
      }
    }, 8);
  });

  ipcMain.on(IPC.dragStop, () => {
    if (dragInterval) { clearInterval(dragInterval); dragInterval = null; }
    if (overlayWin) {
      overlayWin.setIgnoreMouseEvents(true, { forward: true });
      const [x, y] = overlayWin.getPosition();
      settingsStore.update({ overlayPosition: { x, y } });
    }
  });

  ipcMain.handle(IPC.transcribeAudio, async (_e, rawData: unknown, lang?: string) => {
    let float32: Float32Array;
    if (rawData instanceof Float32Array) {
      float32 = rawData;
    } else if (Buffer.isBuffer(rawData)) {
      float32 = new Float32Array(rawData.buffer, rawData.byteOffset, rawData.byteLength / 4);
    } else {
      float32 = new Float32Array(rawData as ArrayLike<number>);
    }
    return transcribeAudio(float32, lang ?? 'en-US');
  });
}

app.whenReady().then(async () => {
  // Enable SharedArrayBuffer so @xenova/transformers can use multi-threaded WASM workers.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': ['same-origin'],
        'Cross-Origin-Embedder-Policy': ['credentialless'],
      },
    });
  });

  registerIpc();
  overlayWin = createOverlay();

  hotkeys = new HotkeyManager(() => overlayWin);
  hotkeys.register(settingsStore.getAll().hotkey);

  createTray({
    overlay: overlayWin,
    openSettings: () => createSettingsWindow(),
    iconPath: APP_ICON
  });

  await setAutoLaunch(settingsStore.getAll().autoLaunch);
});

app.on('will-quit', () => {
  hotkeys?.unregisterAll();
});

// Do not quit when all windows are closed — this is a tray app.
app.on('window-all-closed', () => {
});
