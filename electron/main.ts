import { app, BrowserWindow, ipcMain, screen, clipboard } from 'electron';
import path from 'node:path';
import { IPC, AppSettings } from '../src/shared/types';
import { settingsStore } from './settings';
import { textInjector } from './textInjector';
import { HotkeyManager } from './hotkeys';
import { createTray } from './tray';
import { setAutoLaunch } from './autoLaunch';

const ICON_PATH = path.join(__dirname, '../../resources/icon.png');

let overlayWin: BrowserWindow | null = null;
let settingsWin: BrowserWindow | null = null;
let hotkeys: HotkeyManager | null = null;

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
  const size = 96; // overlay window size (icon + glow padding)
  const pos = settings.overlayPosition ?? {
    x: display.workArea.x + display.workArea.width - size - 24,
    y: display.workArea.y + display.workArea.height - size - 80
  };

  const win = new BrowserWindow({
    width: size,
    height: size,
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

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/overlay.html`);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/overlay.html'));
  }

  win.once('ready-to-show', () => win.show());

  // Persist position whenever the user drags the overlay.
  win.on('moved', () => {
    const [x, y] = win.getPosition();
    settingsStore.update({ overlayPosition: { x, y } });
  });

  return win;
}

function createSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 560,
    height: 720,
    title: 'Voice Overlay — Settings',
    backgroundColor: '#0f0f12',
    autoHideMenuBar: true,
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

  ipcMain.on(IPC.overlayMoved, (_e, pos: { x: number; y: number }) => {
    settingsStore.update({ overlayPosition: pos });
  });
}

app.whenReady().then(async () => {
  registerIpc();
  overlayWin = createOverlay();

  hotkeys = new HotkeyManager(() => overlayWin);
  hotkeys.register(settingsStore.getAll().hotkey);

  createTray({
    overlay: overlayWin,
    openSettings: () => createSettingsWindow(),
    iconPath: ICON_PATH
  });

  await setAutoLaunch(settingsStore.getAll().autoLaunch);
});

app.on('will-quit', () => {
  hotkeys?.unregisterAll();
});

// Do not quit when all windows are closed — this is a tray app.
app.on('window-all-closed', () => {
});
