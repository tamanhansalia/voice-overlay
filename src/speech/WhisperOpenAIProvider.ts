import type { ISpeechProvider, SpeechCallbacks } from './ISpeechProvider';

/**
 * Chunked transcription via OpenAI\'s Whisper API.
 *
 * Records short windows of audio (~3s) and POSTs each to /v1/audio/transcriptions.
 * Not true streaming, but good accuracy and trivial setup. For fully local /
 * offline operation, swap this for a whisper.cpp binary spawned from main.
 */
export class WhisperOpenAIProvider implements ISpeechProvider {
  readonly name = 'Whisper (OpenAI API)';

  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private cb: SpeechCallbacks | null = null;
  private stopped = false;

  constructor(private apiKey: string, private lang: string) {}

  async start(cb: SpeechCallbacks): Promise<void> {
    if (!this.apiKey) {
      cb.onError?.(new Error('OpenAI API key not configured'));
      return;
    }
    this.cb = cb;
    this.stopped = false;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { noiseSuppression: true, echoCancellation: true }
    });

    const startWindow = () => {
      if (this.stopped || !this.stream) return;
      const rec = new MediaRecorder(this.stream, { mimeType: 'audio/webm' });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (blob.size > 4000) await this.transcribe(blob);
        if (!this.stopped) startWindow();
      };
      rec.start();
      this.mediaRecorder = rec;
      // 3-second sliding window — tune for latency vs. accuracy.
      setTimeout(() => {
        try { rec.state !== 'inactive' && rec.stop(); } catch { /* ignore */ }
      }, 3000);
    };

    startWindow();
  }

  private async transcribe(blob: Blob) {
    const fd = new FormData();
    fd.append('file', blob, 'audio.webm');
    fd.append('model', 'whisper-1');
    fd.append('language', this.lang.split('-')[0]);
    fd.append('response_format', 'json');
    try {
      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + this.apiKey },
        body: fd
      });
      if (!res.ok) {
        this.cb?.onError?.(new Error('Whisper API ' + res.status));
        return;
      }
      const data = await res.json();
      const text = (data.text ?? '').trim();
      if (text) this.cb?.onFinal(text);
    } catch (e: any) {
      this.cb?.onError?.(new Error(e?.message ?? 'Whisper request failed'));
    }
  }

  async stop(): Promise<void> {
    this.stopped = true;
    try { this.mediaRecorder?.state !== 'inactive' && this.mediaRecorder?.stop(); } catch { /* ignore */ }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.mediaRecorder = null;
    this.stream = null;
    this.cb = null;
  }
}
