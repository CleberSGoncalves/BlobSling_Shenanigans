// ============================================================
// MusicManager — Trilha dinâmica com Web Audio API
// Estados: menu, gameplay, urgent, boss, victory, gameover
// ============================================================

let audioCtx = null;
let masterGain = null;
let currentState = null;
let loopNodes = [];
let muted = false;
let volume = 0.4;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function setMusicVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (masterGain) masterGain.gain.value = muted ? 0 : volume;
}

export function muteMusic(state) {
  muted = state;
  if (masterGain) masterGain.gain.value = muted ? 0 : volume;
}

function stopAllLoops() {
  loopNodes.forEach(n => {
    try { n.stop(); } catch (e) {}
    try { n.disconnect(); } catch (e) {}
  });
  loopNodes = [];
}

function createLoop(freqs, type, gainVal, speed, offset = 0) {
  const ctx = getCtx();
  const loopGain = ctx.createGain();
  loopGain.gain.value = 0;
  loopGain.connect(masterGain);

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    // Leve vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = speed;
    lfoGain.gain.value = freq * 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    g.gain.value = gainVal / freqs.length;
    osc.connect(g);
    g.connect(loopGain);
    osc.start(ctx.currentTime + offset + i * 0.1);
    loopNodes.push(osc, lfo);
  });

  // Fade in suave
  loopGain.gain.setValueAtTime(0, ctx.currentTime);
  loopGain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + 0.8);
  loopNodes.push(loopGain);
  return loopGain;
}

function createPad(notes, duration) {
  const ctx = getCtx();
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.5);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.5 + 0.3);
    gain.gain.setValueAtTime(0.08, ctx.currentTime + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime + i * 0.5);
    osc.stop(ctx.currentTime + duration);
    loopNodes.push(osc);
  });
}

// ---- Trilhas por estado ----

function playMenuMusic() {
  const ctx = getCtx();
  // Pad etéreo de menu
  createLoop([220, 277.18, 329.63, 440], 'sine', 0.12, 0.3);
  createLoop([110, 146.83], 'triangle', 0.07, 0.2, 0.2);
  // Arpejo suave
  const arpNotes = [261.63, 329.63, 392, 523.25];
  const step = 0.5;
  arpNotes.forEach((freq, i) => {
    const loopArp = () => {
      if (currentState !== 'menu') return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(g); g.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
      loopNodes.push(osc);
      setTimeout(loopArp, arpNotes.length * step * 1000);
    };
    setTimeout(loopArp, i * step * 1000);
  });
}

function playGameplayMusic(urgent = false) {
  stopAllLoops();
  if (urgent) {
    // Urgente: frequências tensas, ritmo acelerado
    createLoop([164.81, 220, 246.94], 'sawtooth', 0.09, 4);
    createLoop([82.41, 110], 'square', 0.05, 6);
    // Pulso rítmico urgente
    const ctx = getCtx();
    const beatInterval = 250;
    const beatLoop = () => {
      if (currentState !== 'gameplay_urgent') return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square'; osc.frequency.value = 60;
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(g); g.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
      loopNodes.push(osc);
      setTimeout(beatLoop, beatInterval);
    };
    beatLoop();
  } else {
    // Normal: melodia aventureira
    createLoop([261.63, 329.63, 392, 523.25], 'triangle', 0.1, 2);
    createLoop([130.81, 164.81], 'sine', 0.06, 1.5);
    // Arpejo gameplay
    const ctx = getCtx();
    const arpSequence = [392, 523.25, 659.25, 783.99, 659.25, 523.25];
    let arpIdx = 0;
    const arpLoop = () => {
      if (currentState !== 'gameplay') return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = arpSequence[arpIdx % arpSequence.length];
      arpIdx++;
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(g); g.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
      loopNodes.push(osc);
      setTimeout(arpLoop, 300);
    };
    arpLoop();
  }
}

function playVictoryStinger() {
  const ctx = getCtx();
  stopAllLoops();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
    osc.connect(g); g.connect(masterGain);
    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.6);
  });
  // Pad de vitória
  createPad([523.25, 659.25, 783.99], 2.5);
}

function playGameOverStinger() {
  const ctx = getCtx();
  stopAllLoops();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.8);
  g.gain.setValueAtTime(0.35, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
  osc.connect(g); g.connect(masterGain);
  osc.start(); osc.stop(ctx.currentTime + 1.1);
}

// ---- API Pública ----

export function setMusicState(state) {
  if (state === currentState) return;
  currentState = state;
  stopAllLoops();

  switch (state) {
    case 'menu':
      playMenuMusic();
      break;
    case 'gameplay':
      playGameplayMusic(false);
      break;
    case 'gameplay_urgent':
      playGameplayMusic(true);
      break;
    case 'victory':
      playVictoryStinger();
      break;
    case 'gameover':
      playGameOverStinger();
      break;
    case 'silence':
    default:
      break;
  }
}

export function stopMusic() {
  stopAllLoops();
  currentState = null;
}
