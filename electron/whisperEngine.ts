import path from 'node:path';
import { app } from 'electron';

type Pipe = (input: Float32Array, opts: Record<string, unknown>) => Promise<{ text?: string }>;

const pipes = new Map<string, Pipe>();
const pending = new Map<string, Promise<Pipe>>();

function modelId(lang: string): string {
  if (lang === 'auto') return 'Xenova/whisper-tiny';
  return lang.startsWith('en') ? 'Xenova/whisper-tiny.en' : 'Xenova/whisper-tiny';
}

async function getPipe(lang: string): Promise<Pipe> {
  const id = modelId(lang);
  if (pipes.has(id)) return pipes.get(id)!;
  if (!pending.has(id)) {
    const p = (async (): Promise<Pipe> => {
      const { pipeline, env } = await import('@xenova/transformers');
      env.cacheDir = path.join(app.getPath('userData'), 'whisper-models');
      env.allowRemoteModels = true;
      env.useBrowserCache = false;
      const pipe = await pipeline('automatic-speech-recognition', id, { quantized: true }) as Pipe;
      pipes.set(id, pipe);
      return pipe;
    })();
    pending.set(id, p);
  }
  return pending.get(id)!;
}

export async function transcribeAudio(float32: Float32Array, lang = 'en-US'): Promise<string> {
  const pipe = await getPipe(lang);
  const opts: Record<string, unknown> = { sampling_rate: 16000 };
  if (lang !== 'auto') {
    opts.language = lang.split('-')[0];
  }
  const result = await pipe(float32, opts);
  return (result?.text ?? '').trim();
}
