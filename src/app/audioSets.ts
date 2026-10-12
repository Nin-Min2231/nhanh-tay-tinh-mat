// Các bộ âm thanh tổng hợp bằng Web Audio, mô tả bằng DỮ LIỆU thuần (không đụng AudioContext) để test được.
// `audio.ts` đọc bộ đang chọn rồi phát từng `ToneSpec`. Mọi bộ đều nhẹ nhàng: không âm “chê”, không sóng gắt
// (chỉ sine/triangle), âm sai (`bup`) ngắn, trầm, nhỏ. Không dùng file nhạc, không giai điệu có bản quyền.

export type SoundSetId = 'default' | 'percussion';

export interface ToneSpec {
  /** Tần số bắt đầu (Hz). */
  freq: number;
  /** Trễ so với lúc gọi (giây). */
  delay: number;
  /** Thời lượng (giây). */
  dur: number;
  type?: OscillatorType;
  /** Độ to đỉnh (0–1). */
  peak?: number;
  /** Tần số cuối (trượt tới đó trong `dur`). */
  endFreq?: number;
  /** Thời gian lên đỉnh (giây): âm gõ cần rất ngắn. Mặc định 0,012. */
  attack?: number;
}

export interface SoundSet {
  id: SoundSetId;
  /** Chạm đúng. */
  ding: readonly ToneSpec[];
  /** Sai: bụp nhỏ, trầm nhẹ – không chê. */
  bup: readonly ToneSpec[];
  /** Nhận sao. */
  star: readonly ToneSpec[];
  /** Lên cấp. */
  levelUp: readonly ToneSpec[];
  /** Một nốt của thang ngũ cung (G4, G5): `index` 0–9. */
  note(index: number): readonly ToneSpec[];
}

/** Nốt ngũ cung C D E G A (2 quãng tám = 10 nốt, dùng 9 nốt đầu cho G4/G5). */
export const PENTATONIC_HZ = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0,
] as const;

export function noteHz(index: number): number {
  const i = Math.max(0, Math.min(PENTATONIC_HZ.length - 1, Math.round(index) || 0));
  return PENTATONIC_HZ[i] ?? PENTATONIC_HZ[0];
}

// ------------------------------------------------------------------ âm gốc (giữ nguyên như trước TASK-10)

const DEFAULT_SET: SoundSet = {
  id: 'default',
  ding: [
    { freq: 880, delay: 0, dur: 0.16 },
    { freq: 1320, delay: 0.05, dur: 0.22, type: 'sine', peak: 0.12 },
  ],
  bup: [{ freq: 190, delay: 0, dur: 0.16, type: 'triangle', peak: 0.1, endFreq: 140 }],
  star: [523.25, 659.25, 783.99, 1046.5].map((f, i) => ({
    freq: f,
    delay: i * 0.09,
    dur: 0.28,
    type: 'sine' as const,
    peak: 0.13,
  })),
  levelUp: [523.25, 659.25, 783.99, 659.25, 783.99, 1046.5].map((f, i) => ({
    freq: f,
    delay: i * 0.11,
    dur: 0.3,
    type: 'triangle' as const,
    peak: 0.13,
  })),
  note: (index) => [{ freq: noteHz(index), delay: 0, dur: 0.35, type: 'sine', peak: 0.15 }],
};

// ------------------------------------------------------------------ Nhạc Cụ Gõ (mốc 80 sao)
// Mộc cầm / đàn gõ: đánh búa → lên đỉnh gần như tức thì rồi tắt dần; mỗi nốt có thêm một họa âm ngắn
// (mộc cầm ≈ ×4, đàn gõ ≈ ×3) cho tiếng “cộc” gỗ; tam giác (triangle) làm tiếng leng keng nhẹ.

const HIT = 0.003;

/** Một nốt đàn gõ: nốt chính + họa âm ngắn (bỏ họa âm nếu quá cao để khỏi chói). */
function bar(freq: number, delay: number, dur: number, peak: number, overtone = 4): ToneSpec[] {
  const out: ToneSpec[] = [{ freq, delay, dur, type: 'sine', peak, attack: HIT }];
  if (freq * overtone <= 3600) {
    out.push({
      freq: freq * overtone,
      delay,
      dur: Math.min(0.12, dur / 2),
      type: 'sine',
      peak: peak * 0.3,
      attack: 0.002,
    });
  }
  return out;
}

const PERCUSSION_SET: SoundSet = {
  id: 'percussion',
  // hai cú gõ sáng: C6 rồi G6
  ding: [...bar(1046.5, 0, 0.22, 0.15, 3), ...bar(1568, 0.07, 0.28, 0.12)],
  // tiếng “cộc” gỗ nhỏ, trầm, rất ngắn – không chê
  bup: [
    { freq: 330, delay: 0, dur: 0.12, type: 'sine', peak: 0.11, endFreq: 220, attack: HIT },
    { freq: 160, delay: 0, dur: 0.14, type: 'sine', peak: 0.08, endFreq: 120, attack: HIT },
  ],
  // mộc cầm đi lên C E G C + tiếng triangle leng keng
  star: [
    ...[523.25, 659.25, 783.99, 1046.5].flatMap((f, i) => bar(f, i * 0.085, 0.32, 0.14)),
    { freq: 2093, delay: 0.34, dur: 0.35, type: 'triangle', peak: 0.05, attack: 0.004 },
  ],
  // chạy gam lên bằng đàn gõ rồi một hợp âm sáng
  levelUp: [
    ...[523.25, 587.33, 659.25, 783.99, 880, 1046.5].flatMap((f, i) =>
      bar(f, i * 0.07, 0.22, 0.13, 3),
    ),
    ...[1046.5, 1318.5, 1568].map((f): ToneSpec => ({
      freq: f,
      delay: 0.5,
      dur: 0.45,
      type: 'sine',
      peak: 0.09,
      attack: HIT,
    })),
    { freq: 2093, delay: 0.5, dur: 0.5, type: 'triangle', peak: 0.04, attack: 0.004 },
  ],
  note: (index) => bar(noteHz(index), 0, 0.5, 0.17),
};

export const SOUND_SETS: Record<SoundSetId, SoundSet> = {
  default: DEFAULT_SET,
  percussion: PERCUSSION_SET,
};

export function soundSet(id: SoundSetId): SoundSet {
  return SOUND_SETS[id] ?? DEFAULT_SET;
}

/** Thời điểm kết thúc của chuỗi âm (giây) – để kiểm “không kéo dài quá lâu”. */
export function soundLength(specs: readonly ToneSpec[]): number {
  return specs.reduce((m, s) => Math.max(m, s.delay + s.dur), 0);
}
