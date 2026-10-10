// Âm thanh tổng hợp bằng Web Audio – không dùng file nhạc, không giai điệu có bản quyền.
export interface AudioApi {
  /** Mở khóa AudioContext (gọi trong pointerdown đầu tiên). */
  unlock(): void;
  /** Chạm đúng: ding cao. */
  ding(): void;
  /** Sai: bụp nhỏ, trầm nhẹ – không chê. */
  bup(): void;
  /** Nhận sao: arpeggio. */
  star(): void;
  /** Lên cấp: fanfare ngắn. */
  levelUp(): void;
  /** Nốt ngũ cung C D E G A (2 quãng tám = 10 nốt, dùng 9 nốt đầu cho G4/G5). */
  note(index: number): void;
}

const PENTATONIC_HZ = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0,
] as const;

type WindowWithWebkitAudio = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

export function createAudio(isEnabled: () => boolean): AudioApi {
  let ctx: AudioContext | null = null;

  function ensure(): AudioContext | null {
    if (ctx) return ctx;
    const w = window as WindowWithWebkitAudio;
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(
    freq: number,
    delay: number,
    dur: number,
    type: OscillatorType = 'sine',
    peak = 0.16,
    endFreq?: number,
  ): void {
    if (!isEnabled()) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    unlock() {
      const c = ensure();
      if (c && c.state === 'suspended') void c.resume();
    },
    ding() {
      tone(880, 0, 0.16);
      tone(1320, 0.05, 0.22, 'sine', 0.12);
    },
    bup() {
      tone(190, 0, 0.16, 'triangle', 0.1, 140);
    },
    star() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.28, 'sine', 0.13));
    },
    levelUp() {
      [523.25, 659.25, 783.99, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(f, i * 0.11, 0.3, 'triangle', 0.13),
      );
    },
    note(index: number) {
      const f = PENTATONIC_HZ[Math.max(0, Math.min(PENTATONIC_HZ.length - 1, index))];
      if (f) tone(f, 0, 0.35, 'sine', 0.15);
    },
  };
}
