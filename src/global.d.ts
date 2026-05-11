import type { AppSettings } from './shared/types';

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
    };
  }
}
export {};
