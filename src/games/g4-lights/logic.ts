// G4 – logic thuần: sinh chuỗi, luật “sai 2 lần”, chấm điểm. Xem docs/02_GAMES.md mục G4.
import type { Rng } from '../../app/rng';
import { clamp01 } from '../../app/scoring';
import type { PadCount } from './config';

/** Chuỗi dài tối đa của 1 lượt (tránh lượt kéo dài vô hạn). */
export const MAX_LEN = 12;
/** Sai lần thứ 2 trong lượt → kết thúc. */
export const MAX_MISTAKES = 2;
/** Không chạm trong 8 giây → linh vật nhắc nhẹ (không tính sai). */
export const NUDGE_MS = 8000;
/** Ô sáng 200ms khi bé chạm. */
export const TOUCH_LIT_MS = 200;
/** Cấp 1–3 không lặp 1 ô 2 lần liên tiếp. */
export const NO_REPEAT_MAX_LEVEL = 3;

export function noRepeatForLevel(level: number): boolean {
  return level <= NO_REPEAT_MAX_LEVEL;
}

/** Sinh chuỗi `length` ô trong `pads` ô; `noRepeat` = không có 2 ô liền kề giống nhau. */
export function generateSequence(
  rng: Rng,
  pads: number,
  length: number,
  noRepeat: boolean,
): number[] {
  const seq: number[] = [];
  for (let i = 0; i < length; i++) {
    let p = Math.floor(rng() * pads);
    if (noRepeat && i > 0 && pads > 1 && p === seq[i - 1]) {
      // chọn ngẫu nhiên trong các ô còn lại (không dồn về 1 phía)
      p = (p + 1 + Math.floor(rng() * (pads - 1))) % pads;
    }
    seq.push(p);
  }
  return seq;
}

/** score = clamp((maxSpan − (startLen − 1)) / 4, 0, 1) */
export function scoreFromSpan(maxSpan: number, startLen: number): number {
  return clamp01((maxSpan - (startLen - 1)) / 4);
}

export type TapOutcome =
  /** Đúng ô này, còn ô tiếp theo. */
  | 'progress'
  /** Lặp đúng cả chuỗi → sang chuỗi mới dài hơn 1. */
  | 'sequence-complete'
  /** Sai lần đầu: phát lại cùng chuỗi. */
  | 'retry'
  /** Sai lần thứ 2: kết thúc lượt. */
  | 'game-over'
  /** Lặp đúng chuỗi dài nhất cho phép: kết thúc lượt. */
  | 'max-reached';

/** Luật của 1 lượt (thuần, có test). View chỉ lo hiển thị và nhịp thời gian. */
export class G4Rules {
  sequence: number[] = [];
  /** Vị trí ô cần chạm tiếp theo trong `sequence`. */
  pos = 0;
  mistakes = 0;
  maxSpan = 0;
  correctSequences = 0;

  constructor(
    private readonly rng: Rng,
    readonly pads: PadCount,
    readonly startLen: number,
    private readonly noRepeat: boolean,
  ) {
    this.sequence = generateSequence(rng, pads, startLen, noRepeat);
  }

  get length(): number {
    return this.sequence.length;
  }

  get expected(): number {
    return this.sequence[this.pos] as number;
  }

  /** Bé chạm vào ô `pad`. */
  tap(pad: number): TapOutcome {
    if (pad === this.expected) {
      this.pos += 1;
      if (this.pos < this.sequence.length) return 'progress';
      this.correctSequences += 1;
      this.maxSpan = Math.max(this.maxSpan, this.sequence.length);
      if (this.sequence.length >= MAX_LEN) return 'max-reached';
      this.sequence = generateSequence(
        this.rng,
        this.pads,
        this.sequence.length + 1,
        this.noRepeat,
      );
      this.pos = 0;
      return 'sequence-complete';
    }
    this.mistakes += 1;
    this.pos = 0; // phát lại cùng chuỗi, bé nhập lại từ đầu
    return this.mistakes >= MAX_MISTAKES ? 'game-over' : 'retry';
  }

  get score(): number {
    return scoreFromSpan(this.maxSpan, this.startLen);
  }

  metrics(): Record<string, number> {
    return { maxSpan: this.maxSpan, correctSequences: this.correctSequences, pads: this.pads };
  }
}

/** Bố cục lưới: số cột × hàng. 6 ô: 2×3 khi màn dọc, 3×2 khi màn ngang. */
export function gridLayout(
  pads: PadCount,
  width: number,
  height: number,
): { cols: number; rows: number } {
  if (pads === 4) return { cols: 2, rows: 2 };
  if (pads === 9) return { cols: 3, rows: 3 };
  return height >= width ? { cols: 2, rows: 3 } : { cols: 3, rows: 2 };
}

/** Nốt (chỉ số trong thang ngũ cung 10 nốt) của từng ô: trải đều theo số ô. */
export function noteForPad(pad: number, pads: number): number {
  if (pads <= 1) return 0;
  return Math.round((pad * 9) / (pads - 1));
}
