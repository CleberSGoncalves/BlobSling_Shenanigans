// ============================================================
// Audio Procedural — FluidCleb Intro & Game SFX
// Web Audio API pura (sem arquivos externos)
// ============================================================

let audioCtx = null;
let masterGain = null;
let muted = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function muteAudio(state) {
  muted = state;
  if (masterGain) masterGain.gain.value = state ? 0 : 0.6;
}

// Blob launch whoosh
export function playSlingshot() {
  const ctx = getCtx();
  if (muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

// Blob bounce
export function playBounce(velocity = 1) {
  const ctx = getCtx();
  if (muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'sine';
  const freq = Math.min(800, 200 + velocity * 50);
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.3 * Math.min(1, velocity / 10), ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

// Portal reached
export function playPortalSuccess() {
  const ctx = getCtx();
  if (muted) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.12 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.35);
  });
}

// Blob split
export function playBlobSplit() {
  const ctx = getCtx();
  if (muted) return;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'triangle';
    osc.frequency.value = 300 + i * 150;
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.2);
    osc.start(ctx.currentTime + i * 0.05);
    osc.stop(ctx.currentTime + i * 0.05 + 0.25);
  }
}

// Explosion
export function playExplosion() {
  const ctx = getCtx();
  if (muted) return;
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  src.buffer = buffer;
  src.connect(filter); filter.connect(gain); gain.connect(masterGain);
  gain.gain.setValueAtTime(0.8, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  src.start();
}

// Level fail
export function playFail() {
  const ctx = getCtx();
  if (muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
}

// Sticky blob sound
export function playSticky() {
  const ctx = getCtx();
  if (muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(masterGain);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

// ============================================================
// FluidCleb Intro Audio — áudio sintético procedural
// ============================================================
export function playFluidClebIntro() {
  const ctx = getCtx();
  if (muted) return;

  // Pad base — evolução lenta
  const pad = ctx.createOscillator();
  const padGain = ctx.createGain();
  pad.type = 'sine';
  pad.frequency.setValueAtTime(110, ctx.currentTime);
  pad.frequency.linearRampToValueAtTime(220, ctx.currentTime + 1.5);
  padGain.gain.setValueAtTime(0, ctx.currentTime);
  padGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
  padGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.8);
  pad.connect(padGain); padGain.connect(masterGain);
  pad.start(ctx.currentTime);
  pad.stop(ctx.currentTime + 2.9);

  // Fusão central (0.7s) — impacto
  const impact = ctx.createOscillator();
  const impactGain = ctx.createGain();
  impact.type = 'triangle';
  impact.frequency.setValueAtTime(440, ctx.currentTime + 0.7);
  impact.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.0);
  impactGain.gain.setValueAtTime(0, ctx.currentTime + 0.7);
  impactGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.75);
  impactGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  impact.connect(impactGain); impactGain.connect(masterGain);
  impact.start(ctx.currentTime + 0.7);
  impact.stop(ctx.currentTime + 1.3);

  // Sweep final
  const sweep = ctx.createOscillator();
  const sweepGain = ctx.createGain();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(200, ctx.currentTime + 1.5);
  sweep.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 2.5);
  sweepGain.gain.setValueAtTime(0, ctx.currentTime + 1.5);
  sweepGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.7);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8);
  sweep.connect(sweepGain); sweepGain.connect(masterGain);
  sweep.start(ctx.currentTime + 1.5);
  sweep.stop(ctx.currentTime + 2.9);
}
