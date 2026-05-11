import type { ISpeechProvider, SpeechCallbacks } from './ISpeechProvider';

/**
 * Uses Chromium's built-in webkitSpeechRecognition (Web Speech API).
 *
 * Pros: zero config, streaming, automatic punctuation in many languages.
 * Cons: in stock Electron the underlying Google service requires an API key
 *       baked into Chromium and may fail offline. For production, prefer
 *       Deepgram or local Whisper. Kept here as the default for first-run.
 */
export class WebSpeechProvider implements ISpeechProvider {
  readonly name = 'Web Speech (browser)';
  private recog: any = null;
  private stopped = false;

  constructor(private lang: string) {}

  async start(cb: SpeechCallbacks): Promise<void> {
    const Recog =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recog) {
      cb.onError?.(new Error('Web Speech API not available in this environment'));
      return;
    }
    const r = new Recog();
    r.lang = this.lang;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          cb.onFinal(res[0].transcript.trim());
        } else {
          interim += res[0].transcript;
        }
      }
      if (interim) cb.onPartial?.(interim.trim());
    };

    r.onerror = (e: any) => {
      // "no-speech" is fine — just means silence.
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      cb.onError?.(new Error(e.error || 'speech recognition error'));
    };

    r.onend = () => {
      // continuous mode tends to stop after long silences — auto-restart
      // while the user still wants to record.
      if (!this.stopped) {
        try { r.start(); } catch { /* ignore */ }
      } else {
        cb.onEnd?.();
      }
    };

    this.stopped = false;
    this.recog = r;
    r.start();
  }

  async stop(): Promise<void> {
    this.stopped = true;
    try { this.recog?.stop(); } catch { /* ignore */ }
    this.recog = null;
  }
}
