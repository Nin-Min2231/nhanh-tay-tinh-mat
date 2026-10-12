// Âm thanh tổng hợp bằng Web Audio – không dùng file nhạc, không giai điệu có bản quyền.
// Các bộ âm (âm gốc, Nhạc Cụ Gõ…) là dữ liệu thuần ở `audioSets.ts`; file này chỉ phát chúng.
import { soundSet, type SoundSetId, type ToneSpec } from './audioSets';

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
  /** Nghe thử một bộ âm bất kỳ (Album → Đặc biệt): phát tiếng “nhận sao” của bộ đó. */
  preview(id: SoundSetId): void;
}

type WindowWithWebkitAudio = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

/**
 * `isEnabled`: âm thanh đang bật (cài đặt chung của phụ huynh).
 * `getSoundSet`: bộ âm bé đang dùng, đọc mỗi lần phát nên đổi bộ có tác dụng ngay.
 */
export function createAudio(
  isEnabled: () => boolean,
  getSoundSet: () => SoundSetId = () => 'default',
): AudioApi {
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

  function tone(spec: ToneSpec): void {
    if (!isEnabled()) return;
    const c = ensure();
    if (!c) return;
    const { freq, delay, dur, type = 'sine', peak = 0.16, endFreq, attack = 0.012 } = spec;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(attack, dur / 2));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const play = (specs: readonly ToneSpec[]): void => specs.forEach(tone);

  return {
    unlock() {
      const c = ensure();
      if (c && c.state === 'suspended') void c.resume();
    },
    ding: () => play(soundSet(getSoundSet()).ding),
    bup: () => play(soundSet(getSoundSet()).bup),
    star: () => play(soundSet(getSoundSet()).star),
    levelUp: () => play(soundSet(getSoundSet()).levelUp),
    note: (index: number) => play(soundSet(getSoundSet()).note(index)),
    preview: (id: SoundSetId) => play(soundSet(id).star),
  };
}
