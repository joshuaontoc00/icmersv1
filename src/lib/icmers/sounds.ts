// Web Audio sounds — no audio files.
let ctx: AudioContext | null = null;
let muted = false;

export function setSoundMuted(value: boolean) {
  muted = value;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call from a user gesture so later sounds are allowed to play. */
export function unlockAudio() {
  getCtx();
}

function tone(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  opts: { type?: OscillatorType; gain?: number; attack?: number } = {},
) {
  const { type = "sine", gain = 0.2, attack = 0.012 } = opts;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + attack);
  g.gain.setValueAtTime(gain, start + Math.max(attack, dur - 0.06));
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/** Clinic alert: three loud two-tone pulses. */
export function playClinicAlert() {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.03;
  for (let i = 0; i < 3; i++) {
    const base = t + i * 0.6;
    tone(c, 960, base, 0.22, { type: "square", gain: 0.32 });
    tone(c, 700, base + 0.25, 0.22, { type: "square", gain: 0.32 });
  }
}

/** User acknowledgment: soft rising three-note chime. */
export function playAckChime() {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.03;
  [523.25, 659.25, 783.99].forEach((f, i) => {
    tone(c, f, t + i * 0.18, 0.55, { gain: 0.16, attack: 0.02 });
  });
}

/** Sent: short single ding. */
export function playSentDing() {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.02;
  tone(c, 1318.5, t, 0.6, { gain: 0.22, attack: 0.005 });
  tone(c, 2637, t, 0.35, { gain: 0.04, attack: 0.005 });
}
