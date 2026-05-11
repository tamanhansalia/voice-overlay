import { contextBridge, ipcRenderer } from 'electron';
import { IPC, AppSettings } from '../src/shared/types';

/**
 * The preload script is the only place the renderer touches Node.js / Electron.
 * Everything is funnelled through a narrow, typed API on window.api so the
 * React code stays sandbox-friendly.
 */
const api = {
  // Settings
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.getSettings),
  setSettings: (patch: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC.setSettings, patch),
  onSettingsChanged: (cb: (s: AppSettings) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, s: AppSettings) => cb(s);
    ipcRenderer.on(IPC.settingsChanged, handler);
    return () => ipcRenderer.removeListener(IPC.settingsChanged, handler);
  },

  // Text delivery
  injectText: (text: string): Promise<void> => ipcRenderer.invoke(IPC.injectText, text),
  copyToClipboard: (text: string): Promise<void> =>
    ipcRenderer.invoke(IPC.copyToClipboard, text),

  // Hotkey signal coming back from the main process
  onHotkey: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on(IPC.hotkeyPressed, handler);
    return () => ipcRenderer.removeListener(IPC.hotkeyPressed, handler);
  },

  // Window controls
  openSettings: () => ipcRenderer.invoke(IPC.openSettings),
  quitApp: () => ipcRenderer.invoke(IPC.quitApp),

  // Position tracking
  reportOverlayMoved: (pos: { x: number; y: number }) =>
    ipcRenderer.send(IPC.overlayMoved, pos)
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
