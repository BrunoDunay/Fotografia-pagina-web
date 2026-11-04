// Música original del video promocional, sintetizada aquí (sin muestras ni derechos de terceros).
// Pop cálido a 100 BPM en Re mayor: cada compás dura 2.4 s y los cambios de escena caen en compás.
// Uso: node tools/music.mjs assets/music.wav
import { writeFileSync } from 'node:fs';

const SR = 44100;
const BEAT = 0.6;
const BAR = 4 * BEAT;
const BARS = 12;
const DUR = BARS * BAR; // 28.8 s
const N = Math.round(DUR * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 20261013;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
function add(buf, start, len, fn) {
  const s0 = Math.max(0, Math.round(start * SR));
  const n = Math.min(N - s0, Math.round(len * SR));
  for (let i = 0; i < n; i++) buf[s0 + i] += fn(i / SR);
}
const both = (start, len, fn, pan = 0) => {
  const l = Math.cos(((pan + 1) * Math.PI) / 4), r = Math.sin(((pan + 1) * Math.PI) / 4);
  add(L, start, len, (t) => fn(t) * l);
  add(R, start, len, (t) => fn(t) * r);
};

// Piano eléctrico suave: fundamental y armónicos que se apagan a distinto ritmo.
function keys(start, midi, gain = 1, len = 1.6, pan = 0) {
  const f = hz(midi);
  both(start, len, (t) => {
    const a = Math.min(1, t / 0.006);
    return a * gain * 0.2 * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.4) + 0.42 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t * 4.2) + 0.2 * Math.sin(2 * Math.PI * 3 * f * t) * Math.exp(-t * 7) + 0.1 * Math.sin(2 * Math.PI * 5.02 * f * t) * Math.exp(-t * 12));
  }, pan);
}
// Cuerda pulsada para el arpegio.
function pluck(start, midi, gain = 1, pan = 0) {
  const f = hz(midi);
  both(start, 0.5, (t) => {
    const tri = 2 * Math.abs(2 * ((t * f) % 1) - 1) - 1;
    return (tri * 0.7 + Math.sin(2 * Math.PI * f * t) * 0.5) * Math.exp(-t * 9) * Math.min(1, t / 0.003) * 0.12 * gain;
  }, pan);
}

// Re · La · Si menor · Sol (I–V–vi–IV), tres vueltas.
const CHORDS = [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]];
const ROOTS = [38, 33, 35, 31];
// Intensidad por compás: entrada, subida, cuerpo, puente ligero y cierre.
const LEVEL = [0, 1, 2, 3, 3, 3, 3, 3, 3, 2, 3, 0];

for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const lvl = LEVEL[bar];
  const chord = CHORDS[bar % 4];
  const root = ROOTS[bar % 4];
  const last = bar === BARS - 1;

  // Acordes: redonda al entrar; después, golpes en 1 y en el "y" de 2.
  for (const [i, note] of chord.entries()) {
    keys(t0, note, lvl === 0 ? 1.2 : 0.9, last ? 2.6 : 1.7, (i - 1) * 0.35);
    if (lvl >= 2 && !last) keys(t0 + 1.5 * BEAT, note, 0.6, 1.2, (1 - i) * 0.35);
  }
  keys(t0, root + 12, 0.9, last ? 2.6 : 1.8);
  if (last) continue;

  // Arpegio en corcheas: lo que le da el paso.
  if (lvl >= 1 || bar === 0) {
    const up = [0, 1, 2, 1, 0, 2, 1, 2];
    for (let e = 0; e < 8; e++) {
      if (bar === 0 && e < 4) continue;
      pluck(t0 + e * BEAT / 2, chord[up[e]] + 12, lvl >= 3 ? 1 : 0.75, Math.sin(e * 1.7) * 0.6);
      if (lvl >= 3 && e % 2 === 1) pluck(t0 + e * BEAT / 2 + BEAT * 0.75, chord[up[e]] + 24, 0.3, -Math.sin(e * 1.7) * 0.6);
    }
  }
  // Bajo redondo.
  if (lvl >= 2) {
    for (const [b, len] of [[0, 1.4], [2, 0.9], [3.5, 0.45]]) {
      const f = hz(b === 3.5 ? root + 7 : root);
      both(t0 + b * BEAT, len * BEAT, (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * 2 * f * t)) * Math.min(1, t / 0.01) * Math.exp(-t * 2.2) * 0.34);
    }
  }
  // Bombo suave en 1 y 3 (y un empujón antes del 4 cuando va completo).
  if (lvl >= 1) {
    for (const b of lvl >= 3 ? [0, 2, 2.75] : [0, 2]) {
      both(t0 + b * BEAT, 0.3, (t) => Math.sin(2 * Math.PI * (50 * t + (70 / 30) * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 11) * (b === 2.75 ? 0.45 : 0.75));
    }
  }
  // Chasquido en 2 y 4.
  if (lvl >= 2) {
    for (const b of [1, 3]) {
      let bp = 0, prev = 0;
      both(t0 + b * BEAT, 0.16, (t) => { const n = rnd(); bp += 0.45 * (n - bp); const band = bp - prev; prev = bp * 0.5; return band * Math.exp(-t * 34) * 0.6; }, b === 1 ? -0.2 : 0.2);
    }
  }
  // Sonaja en corcheas.
  if (lvl >= 3) {
    for (let e = 0; e < 8; e++) {
      let prev = 0;
      both(t0 + e * BEAT / 2, 0.07, (t) => { const n = rnd(); const hp = n - prev; prev = n; return hp * Math.exp(-t * 60) * (e % 2 ? 0.11 : 0.06); }, e % 2 ? 0.4 : -0.4);
    }
  }
}

// Subida de aire antes de que entre el cuerpo y un brillo al llegar al cierre.
for (const bar of [3, 10]) {
  let prev = 0;
  both(bar * BAR - 2 * BEAT, 2 * BEAT, (t) => { const n = rnd(); const hp = n - prev; prev = n * 0.85; return hp * (t / (2 * BEAT)) ** 2 * 0.1; });
}
for (const [i, note] of [86, 90, 93].entries()) keys(11 * BAR + i * 0.09, note, 0.5, 2.4, (i - 1) * 0.5);

let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.02) * Math.min(1, (DUR - t) / 1.2);
  L[i] = Math.tanh(L[i] * 1.35) * fade;
  R[i] = Math.tanh(R[i] * 1.35) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  out.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4);
}
writeFileSync(process.argv[2], out);
console.log(`música: ${DUR}s, pico ${peak.toFixed(2)}`);
