import type { AppSettings, LogEntry } from './shared/types';

declare global {
  interface Window {
    api: {
      getSettings(): Promise<AppSettings>;
      setSettings(patch: Partial<AppSettings>): Promise<AppSettings>;
      onSettingsChanged(cb: (s: AppSettings) => void): () => void;
      injectText(text: string): Promise<void>;
      copyToClipboard(text: string): Promise<void>;
      readClipboard(): Promise<string>;
      executeCommand(commandType: string): Promise<void>;
      askAI(prompt: string, system: string): Promise<string>;
      askBlackbox(prompt: string, system: string): Promise<string>;
      captureScreen(): Promise<string>;
      onHotkey(cb: () => void): () => void;
      onHotkeyReleased(cb: () => void): () => void;
      onStopRecordingRequested(cb: () => void): () => void;
      openSettings(): Promise<void>;
      resetOverlayPosition(): Promise<AppSettings>;
      quitApp(): Promise<void>;
      reportOverlayMoved(pos: { x: number; y: number }): void;
      startDrag(): void;
      stopDrag(): void;
      transcribeAudio(audio: Float32Array, lang?: string): Promise<string>;
      getLogs(): Promise<LogEntry[]>;
      clearLogs(): Promise<void>;
      getTranscriptionHistory(): Promise<string[]>;
      clearTranscriptionHistory(): Promise<void>;
      recordTranscription(text: string): Promise<void>;
      onLog(cb: (entry: LogEntry) => void): () => void;
    };
  }
}
export {};
