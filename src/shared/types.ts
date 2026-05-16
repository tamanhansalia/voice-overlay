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
  /** API key for Blackbox AI. */
  blackboxApiKey: string;
  /** Model to use for Blackbox AI. */
  blackboxModel: string;
  /** Whether Blackbox AI is enabled for commands. */
  blackboxEnabled: boolean;
  /** Position (persisted) of the floating overlay. */
  overlayPosition: { x: number; y: number } | null;
  /** Whether to play sound effects. */
  soundEffectsEnabled: boolean;
  /** Volume of sound effects (0.0 to 1.0). */
  soundEffectsVolume: number;
  /** Whether to listen for voice commands. */
  voiceCommandsEnabled: boolean;
  /** 'prefix' means command follows a trigger word, 'always' means any match triggers. */
  voiceCommandMode: 'prefix' | 'always';
  /** Whether AI features are enabled. */
  aiEnabled: boolean;
  /** Whether to show the audio waveform. */
  waveformEnabled: boolean;
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
  blackboxApiKey: '',
  blackboxModel: 'gpt-4o',
  blackboxEnabled: false,
  overlayPosition: null,
  soundEffectsEnabled: true,
  soundEffectsVolume: 0.5,
  voiceCommandsEnabled: true,
  voiceCommandMode: 'prefix',
  aiEnabled: true,
  waveformEnabled: true
};

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

// IPC channel names — centralised so main + renderer can't drift.
export const IPC = {
  // Renderer -> main
  injectText: 'inject-text',
  copyToClipboard: 'copy-to-clipboard',
  recordTranscription: 'record-transcription',
  getSettings: 'get-settings',
  setSettings: 'set-settings',
  openSettings: 'open-settings',
  quitApp: 'quit-app',
  overlayMoved: 'overlay-moved',
  setRecorderState: 'set-recorder-state',
  getLogs: 'get-logs',
  clearLogs: 'clear-logs',
  getTranscriptionHistory: 'get-transcription-history',
  clearTranscriptionHistory: 'clear-transcription-history',
  dragStart: 'drag-start',
  dragStop: 'drag-stop',
  setIgnoreMouseEvents: 'set-ignore-mouse-events',
  transcribeAudio: 'speech:transcribe',
  executeCommand: 'execute-command',
  askAI: 'ask-ai',
  askBlackbox: 'ask-blackbox',
  readClipboard: 'read-clipboard',
  captureScreen: 'capture-screen',
  resetOverlayPosition: 'reset-overlay-position',
  // Main -> renderer (overlay)
  hotkeyPressed: 'hotkey-pressed',
  hotkeyReleased: 'hotkey-released',
  stopRecordingRequested: 'stop-recording-requested',
  settingsChanged: 'settings-changed',
  logEvent: 'log-event'
} as const;
