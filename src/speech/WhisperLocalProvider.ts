import type { ISpeechProvider, SpeechCallbacks } from './ISpeechProvider';

const CHUNK_MS = 5000;
// Load ONNX Runtime WASM from CDN to avoid bundling binary assets in the Electron app.
const WASM_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';

export class WhisperLocalProvider implements ISpeechProvider {
  readonly name = 'Whisper (local, offline)';
  private rec: MediaRecorder | null = null;
  private stopped = false;
  private pipe: any = null;

  private async init(onProgress?: (msg: string) => void) {
    if (this.pipe) return;
    const { pipeline, env } = await import('@xenova/transformers');
    (env.backends as any).onnx.wasm.wasmPaths = WASM_CDN;
    env.allowRemoteModels = true;
    env.useBrowserCache = true;
    this.pipe = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny.en',
      {
        quantized: true,
        progress_callback: (p: any) => {
          if (p.status === 'downloading' && onProgress) {
            const pct = p.loaded && p.total
              ? Math.round((p.loaded / p.total) * 100)
              : null;
            onProgress(pct !== null ? `Downloading model ${pct}%…` : 'Downloading model…');
          }
        }
      }
    );
  }

  async start(cb: SpeechCallbacks): Promise<void> {
    this.stopped = false;

    cb.onPartial?.('Loading Whisper model (first run ~40 MB, then cached)…');
    try {
      await this.init((msg) => cb.onPartial?.(msg));
    } catch (e: any) {
      cb.onError?.(new Error('Whisper init failed: ' + (e?.message ?? String(e))));
      return;
    }

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
          const decoded = await audioCtx.decodeAudioData(arrayBuf);
          audioCtx.close();
          const float32 = decoded.getChannelData(0);
          const out = await this.pipe(float32, { sampling_rate: 16000 });
          const text = (out?.text ?? '').trim();
          if (text && !this.stopped) cb.onFinal(text);
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
