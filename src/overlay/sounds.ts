let audioCtx: AudioContext | null = null;

function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playStartSound(volume = 0.1) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
  osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1); // E6

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playStopSound(volume = 0.1) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, ctx.currentTime); // E5
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // A4

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playCommandSound(volume = 0.1) {
  const ctx = getCtx();
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
  osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1108.73, ctx.currentTime); // C#6
  osc2.frequency.exponentialRampToValueAtTime(2217.46, ctx.currentTime + 0.1); // C#7

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.2);
  osc2.stop(ctx.currentTime + 0.2);
}
