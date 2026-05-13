import type { ISpeechProvider, SpeechCallbacks } from './ISpeechProvider';
import { WhisperLocalProvider } from './WhisperLocalProvider';

/**
 * Uses Chromium's built-in webkitSpeechRecognition (Web Speech API).
 * Stock Electron builds lack Google's API key, so on a "network" or
 * "service-not-allowed" error the provider automatically falls back to
 * the bundled offline WhisperLocalProvider — no user action required.
 */
export class WebSpeechProvider implements ISpeechProvider {
  readonly name = 'Web Speech (browser)';
  private recog: any = null;
  private stopped = false;
  private fallback: WhisperLocalProvider | null = null;
  private needsFallback = false;

  constructor(private lang: string) {}

  async start(cb: SpeechCallbacks): Promise<void> {
    const Recog =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recog) {
      // No Web Speech API at all — go straight to offline Whisper.
      this.fallback = new WhisperLocalProvider();
      return this.fallback.start(cb);
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
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      this.stopped = true;
      if (e.error === 'network' || e.error === 'service-not-allowed' || e.error === 'not-allowed') {
        // Google service unavailable in this Electron build — fall back to offline Whisper.
        this.needsFallback = true;
        return;
      }
      cb.onError?.(new Error(e.error || 'speech recognition error'));
    };

    r.onend = async () => {
      if (this.needsFallback) {
        this.needsFallback = false;
        cb.onPartial?.('Switching to offline Whisper…');
        this.fallback = new WhisperLocalProvider();
        await this.fallback.start(cb);
        return;
      }
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
    if (this.fallback) {
      await this.fallback.stop();
      this.fallback = null;
      return;
    }
    try { this.recog?.stop(); } catch { /* ignore */ }
    this.recog = null;
  }
}
