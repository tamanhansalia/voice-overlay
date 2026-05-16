let audioCtx: AudioContext | null = null;

type AudioContextWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function getCtx(): AudioContext | null {
  const AudioContextCtor = window.AudioContext || (window as AudioContextWindow).webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!audioCtx) audioCtx = new AudioContextCtor();
  return audioCtx;
}

function resumeCtx(ctx: AudioContext) {
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {
      // The next user gesture will try again.
    });
  }
}

function normalizedVolume(volume: number) {
  return Math.min(Math.max(volume, 0), 1);
}

export function playStartSound(volume = 0.1) {
  const ctx = getCtx();
  if (!ctx) return;
  resumeCtx(ctx);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const level = normalizedVolume(volume);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
  osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1); // E6

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(level, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playStopSound(volume = 0.1) {
  const ctx = getCtx();
  if (!ctx) return;
  resumeCtx(ctx);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const level = normalizedVolume(volume);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, ctx.currentTime); // E5
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // A4

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(level, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playCommandSound(volume = 0.1) {
  const ctx = getCtx();
  if (!ctx) return;
  resumeCtx(ctx);

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const level = normalizedVolume(volume);

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
  osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1108.73, ctx.currentTime); // C#6
  osc2.frequency.exponentialRampToValueAtTime(2217.46, ctx.currentTime + 0.1); // C#7

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(level, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  osc1.onended = () => {
    osc1.disconnect();
    osc2.disconnect();
    gain.disconnect();
  };

  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.2);
  osc2.stop(ctx.currentTime + 0.2);
}
