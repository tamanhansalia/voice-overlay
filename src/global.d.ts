import type { AppSettings, LogEntry } from './shared/types';

declare global {
  interface Window {
    api: {
      getSettings(): Promise<AppSettings>;
      setSettings(patch: Partial<AppSettings>): Promise<AppSettings>;
      onSettingsChanged(cb: (s: AppSettings) => void): () => void;
      injectText(text: string): Promise<void>;
      copyToClipboard(text: string): Promise<void>;
      onHotkey(cb: () => void): () => void;
      openSettings(): Promise<void>;
      quitApp(): Promise<void>;
      reportOverlayMoved(pos: { x: number; y: number }): void;
      startDrag(): void;
      stopDrag(): void;
      transcribeAudio(audio: Float32Array, lang?: string): Promise<string>;
      getLogs(): Promise<LogEntry[]>;
      clearLogs(): Promise<void>;
      onLog(cb: (entry: LogEntry) => void): () => void;
    };
  }
}
export {};
