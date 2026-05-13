import type { ISpeechProvider, SpeechCallbacks } from './ISpeechProvider';

/**
 * Streaming transcription via Deepgram\'s WebSocket API.
 *
 * Requires `deepgramApiKey` in settings. Sends 16kHz PCM frames from the
 * mic, receives interim + final transcripts back in real time.
 */
export class DeepgramProvider implements ISpeechProvider {
  readonly name = 'Deepgram (streaming)';

  private ws: WebSocket | null = null;
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;

  constructor(
    private apiKey: string,
    private lang: string,
    private autoPunctuation: boolean
  ) {}

  async start(cb: SpeechCallbacks): Promise<void> {
    if (!this.apiKey) {
      cb.onError?.(new Error('Deepgram API key not configured'));
      return;
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, noiseSuppression: true, echoCancellation: true }
    });

    const params = new URLSearchParams({
      model: 'nova-2',
      language: this.lang.split('-')[0],
      smart_format: String(this.autoPunctuation),
      interim_results: 'true',
      encoding: 'linear16',
      sample_rate: '16000'
    });
    const url = 'wss://api.deepgram.com/v1/listen?' + params.toString();
    this.ws = new WebSocket(url, ['token', this.apiKey]);

    this.ws.onopen = () => this.startAudioPipe();
    this.ws.onerror = () => {
      cb.onError?.(new Error('Deepgram WebSocket error'));
      this.stop();
    };
    this.ws.onclose = () => {
      this.stop();
    };
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const alt = msg?.channel?.alternatives?.[0];
        const transcript: string = alt?.transcript ?? '';
        if (!transcript) return;
        if (msg.is_final) cb.onFinal(transcript.trim());
        else cb.onPartial?.(transcript.trim());
      } catch {
        // Ignore non-JSON keepalives.
      }
    };
  }

  private startAudioPipe() {
    if (!this.stream || !this.ws) return;
    this.audioCtx = new AudioContext({ sampleRate: 16000 });
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    // ScriptProcessor is deprecated but universally supported; for production
    // swap for an AudioWorkletNode shipped in its own file.
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);
    this.processor.onaudioprocess = (e) => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;
      const input = e.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.ws.send(pcm.buffer);
    };
  }

  async stop(): Promise<void> {
    const ws = this.ws;
    const audioCtx = this.audioCtx;
    const processor = this.processor;
    const stream = this.stream;

    this.ws = null;
    this.audioCtx = null;
    this.processor = null;
    this.stream = null;

    try { processor?.disconnect(); } catch { /* ignore */ }
    try { await audioCtx?.close(); } catch { /* ignore */ }
    stream?.getTracks().forEach((t) => t.stop());

    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ type: 'CloseStream' })); } catch { /* ignore */ }
      try { ws.close(); } catch { /* ignore */ }
    }
  }
}
