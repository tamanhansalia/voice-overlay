/**
 * Common contract every speech-recognition backend implements.
 *
 * Implementations must be:
 *  - Re-entrant safe: start() after stop() must work without leaks.
 *  - Streaming where possible: emit partial transcripts via onPartial().
 *  - Final transcripts: emit via onFinal() — the orchestrator will inject this.
 */
export interface SpeechCallbacks {
  /** Live, low-confidence transcript — used for the UI ticker only. */
  onPartial?: (text: string) => void;
  /** Stable transcript chunk — injected into the focused app. */
  onFinal: (text: string) => void;
  /** Provider hit a non-recoverable error. */
  onError?: (err: Error) => void;
  /** Provider stopped on its own (e.g. silence timeout). */
  onEnd?: () => void;
  /** Current microphone volume level (0.0 to 1.0). */
  onVolume?: (volume: number) => void;
}

export interface ISpeechProvider {
  /** Begin capturing microphone audio and producing transcripts. */
  start(cb: SpeechCallbacks): Promise<void>;
  /** Stop capture and flush any pending final transcript. */
  stop(): Promise<void>;
  /** Human-readable provider name shown in settings. */
  readonly name: string;
}
