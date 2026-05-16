import { contextBridge, ipcRenderer } from 'electron';
import { IPC, AppSettings, LogEntry } from '../src/shared/types';

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
  recordTranscription: (text: string): Promise<void> =>
    ipcRenderer.invoke(IPC.recordTranscription, text),
  readClipboard: (): Promise<string> => ipcRenderer.invoke(IPC.readClipboard),

  executeCommand: (commandType: string): Promise<void> =>
    ipcRenderer.invoke(IPC.executeCommand, commandType),

  askAI: (prompt: string, system: string): Promise<string> =>
    ipcRenderer.invoke(IPC.askAI, prompt, system),

  askBlackbox: (prompt: string, system: string): Promise<string> =>
    ipcRenderer.invoke(IPC.askBlackbox, prompt, system),

  captureScreen: (): Promise<string> =>
    ipcRenderer.invoke(IPC.captureScreen),

  // Hotkey signal coming back from the main process
  onHotkey: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on(IPC.hotkeyPressed, handler);
    return () => ipcRenderer.removeListener(IPC.hotkeyPressed, handler);
  },

  onHotkeyReleased: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on(IPC.hotkeyReleased, handler);
    return () => ipcRenderer.removeListener(IPC.hotkeyReleased, handler);
  },

  // Window controls
  openSettings: () => ipcRenderer.invoke(IPC.openSettings),
  quitApp: () => ipcRenderer.invoke(IPC.quitApp),

  // Position tracking
  reportOverlayMoved: (pos: { x: number; y: number }) =>
    ipcRenderer.send(IPC.overlayMoved, pos),

  // Window dragging (required for focusable:false windows where CSS drag doesn't work)
  startDrag: () => ipcRenderer.send(IPC.dragStart),
  stopDrag: () => ipcRenderer.send(IPC.dragStop),

  // Whisper transcription (runs in main process — avoids WASM/ONNX issues in renderer)
  transcribeAudio: (audio: Float32Array, lang?: string): Promise<string> =>
    ipcRenderer.invoke(IPC.transcribeAudio, audio, lang),

  // Logs
  getLogs: (): Promise<LogEntry[]> => ipcRenderer.invoke(IPC.getLogs),
  clearLogs: (): Promise<void> => ipcRenderer.invoke(IPC.clearLogs),
  getTranscriptionHistory: (): Promise<string[]> => ipcRenderer.invoke(IPC.getTranscriptionHistory),
  clearTranscriptionHistory: (): Promise<void> => ipcRenderer.invoke(IPC.clearTranscriptionHistory),
  onLog: (cb: (entry: LogEntry) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, entry: LogEntry) => cb(entry);
    ipcRenderer.on(IPC.logEvent, handler);
    return () => ipcRenderer.removeListener(IPC.logEvent, handler);
  }
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
