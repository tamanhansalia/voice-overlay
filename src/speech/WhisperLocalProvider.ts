import type { ISpeechProvider, SpeechCallbacks } from './ISpeechProvider';

const CHUNK_MS = 5000;

export class WhisperLocalProvider implements ISpeechProvider {
  readonly name = 'Whisper (local, offline)';
  private rec: MediaRecorder | null = null;
  private stopped = false;

  constructor(private lang: string) {}

  async start(cb: SpeechCallbacks): Promise<void> {
    this.stopped = false;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
      cb.onError?.(new Error('Mic access denied: ' + e.message));
      return;
    }

    cb.onPartial?.('');

    const loop = () => {
      if (this.stopped) {
        stream.getTracks().forEach((t) => t.stop());
        cb.onEnd?.();
        return;
      }

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      this.rec = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = async () => {
        if (this.stopped) {
          stream.getTracks().forEach((t) => t.stop());
          cb.onEnd?.();
          return;
        }
        try {
          cb.onPartial?.('▸ recognizing…');
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const arrayBuf = await blob.arrayBuffer();
          const audioCtx = new AudioContext({ sampleRate: 16000 });
          try {
            const decoded = await audioCtx.decodeAudioData(arrayBuf);
            const float32 = decoded.getChannelData(0);
            const text = await window.api.transcribeAudio(float32, this.lang);
            if (text && !this.stopped) cb.onFinal(text);
          } finally {
            audioCtx.close();
          }
          cb.onPartial?.('');
        } catch (e) {
          console.error('[WhisperLocal] chunk error:', e);
          cb.onPartial?.('');
        }
        loop();
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, CHUNK_MS);
    };

    loop();
  }

  async stop(): Promise<void> {
    this.stopped = true;
    if (this.rec?.state === 'recording') this.rec.stop();
    this.rec = null;
  }
}
