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

    this.ws.onopen = () => this.startAudioPipe(cb);
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

  private startAudioPipe(cb: SpeechCallbacks) {
    if (!this.stream || !this.ws) return;
    
    // Create at hardware rate to avoid browser resampling bugs, then we'll downsample.
    this.audioCtx = new AudioContext();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    const hardwareRate = this.audioCtx.sampleRate;
    
    // Add volume analysis
    const analyser = this.audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.audioCtx || !this.ws) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;
      cb.onVolume?.(Math.min(1, avg / 128));
      requestAnimationFrame(checkVolume);
    };
    checkVolume();
    
    // We want 16000Hz for Deepgram.
    const targetRate = 16000;
    
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);

    this.processor.onaudioprocess = (e) => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;
      
      const input = e.inputBuffer.getChannelData(0);
      
      // Simple downsampling (picking every Nth sample if hardwareRate is a multiple, 
      // or linear interpolation for others). Linear interpolation is safer.
      const ratio = hardwareRate / targetRate;
      const targetLength = Math.round(input.length / ratio);
      const pcm = new Int16Array(targetLength);
      
      for (let i = 0; i < targetLength; i++) {
        const index = i * ratio;
        const low = Math.floor(index);
        const high = Math.ceil(index);
        const weight = index - low;
        
        // Linear interpolation
        let s: number;
        if (high < input.length) {
          s = input[low] * (1 - weight) + input[high] * weight;
        } else {
          s = input[low];
        }
        
        // Clamp and convert to Int16
        const clamped = Math.max(-1, Math.min(1, s));
        pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
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
