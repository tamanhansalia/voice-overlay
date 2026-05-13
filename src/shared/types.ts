// Shared types between Electron main and the React renderer.
// Keep this file free of imports from either side so it can be safely consumed.

export type RecorderState = 'idle' | 'listening' | 'processing' | 'error';

export type ProviderName = 'whisper-local' | 'webspeech' | 'deepgram' | 'whisper-openai';

export type InjectionMode = 'type' | 'paste' | 'copy-only';

export interface AppSettings {
  /** Speech recognition provider to use. */
  provider: ProviderName;
  /** Global hotkey, Electron Accelerator syntax (e.g. "Alt+Space"). */
  hotkey: string;
  /** When true, hotkey is push-to-talk (hold to record). Otherwise toggle. */
  pushToTalk: boolean;
  /** How text is delivered to the focused app. */
  injectionMode: InjectionMode;
  /** Auto add periods/commas via the provider when supported. */
  autoPunctuation: boolean;
  /** BCP-47 language tag, e.g. "en-US", "hi-IN". */
  language: string;
  /** Start app on Windows login. */
  autoLaunch: boolean;
  /** API key for Deepgram (if used). */
  deepgramApiKey: string;
  /** API key for OpenAI (if Whisper API used). */
  openAiApiKey: string;
  /** Position (persisted) of the floating overlay. */
  overlayPosition: { x: number; y: number } | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  provider: 'whisper-local',
  hotkey: 'Alt+Space',
  pushToTalk: false,
  injectionMode: 'paste',
  autoPunctuation: true,
  language: 'en-US',
  autoLaunch: false,
  deepgramApiKey: '',
  openAiApiKey: '',
  overlayPosition: null
};

// IPC channel names — centralised so main + renderer can't drift.
export const IPC = {
  // Renderer -> main
  injectText: 'inject-text',
  copyToClipboard: 'copy-to-clipboard',
  getSettings: 'get-settings',
  setSettings: 'set-settings',
  openSettings: 'open-settings',
  quitApp: 'quit-app',
  overlayMoved: 'overlay-moved',
  setRecorderState: 'set-recorder-state',
  // Main -> renderer (overlay)
  hotkeyPressed: 'hotkey-pressed',
  hotkeyReleased: 'hotkey-released',
  settingsChanged: 'settings-changed'
} as const;
