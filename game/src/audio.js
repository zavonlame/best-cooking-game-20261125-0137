// Dapur Kilat — sound: every effect is synthesised with WebAudio, no assets.
// A tiny step sequencer plays a light pentatonic loop while the kitchen runs.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.musicOn = true;
    this.step = 0;
    this.nextNoteAt = 0;
    this.sizzleNodes = new Map();
  }

  unlock() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }

  tone(freq, dur, type, vol, when = 0) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol, lowpass = 1200) {
    if (!this.ctx) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
  }

  pickup() { this.tone(660, 0.09, 'triangle', 0.25); this.tone(880, 0.08, 'triangle', 0.18, 0.05); }
  place() { this.tone(330, 0.08, 'triangle', 0.22); }
  chop() { this.noise(0.06, 0.35, 900); this.tone(180, 0.05, 'square', 0.12); }
  chopped() { this.tone(520, 0.1, 'triangle', 0.25); this.tone(780, 0.12, 'triangle', 0.2, 0.07); }
  cooked() { this.tone(880, 0.12, 'sine', 0.25); this.tone(1174, 0.16, 'sine', 0.2, 0.08); }
  serve() { this.tone(784, 0.12, 'triangle', 0.28); this.tone(1046, 0.14, 'triangle', 0.25, 0.09); this.tone(1318, 0.2, 'triangle', 0.22, 0.18); }
  wrong() { this.tone(220, 0.16, 'sawtooth', 0.16); this.tone(185, 0.2, 'sawtooth', 0.14, 0.1); }
  expire() { this.tone(311, 0.18, 'square', 0.18); this.tone(233, 0.26, 'square', 0.16, 0.14); }
  click() { this.tone(500, 0.05, 'triangle', 0.18); }
  sizzleStart() { this.noise(0.25, 0.12, 2400); }
  coin() { this.tone(1318, 0.09, 'sine', 0.2); this.tone(1760, 0.14, 'sine', 0.16, 0.06); }

  // Called every frame while playing: keeps the background loop ticking.
  musicTick(now) {
    if (!this.ctx || !this.musicOn) return;
    if (now < this.nextNoteAt) return;
    const pattern = [0, -1, 2, -1, 4, 3, 2, -1, 0, -1, 2, 4, 3, 2, 1, -1];
    const note = pattern[this.step % pattern.length];
    if (note >= 0) this.tone(SCALE[note], 0.22, 'sine', 0.07);
    this.step += 1;
    this.nextNoteAt = now + 0.24;
  }
}
