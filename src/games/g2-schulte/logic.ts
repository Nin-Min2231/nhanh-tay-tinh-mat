// G2 – logic thuần (sinh bảng, thứ tự, chấm điểm). Xem docs/02_GAMES.md mục G2.
import type { Rng } from '../../app/rng';
import { clamp01 } from '../../app/scoring';
import type { G2Params } from './config';

export const COLOR_COUNT = 5;
/** Cấp “Màu ô đổi mỗi 3s”. */
export const CYCLE_MS = 3000;
export const ERROR_PENALTY = 0.05;

export type Rotation = 0 | 90 | 180 | 270;
const ROTATIONS: readonly Rotation[] = [0, 90, 180, 270];

export interface Board {
  /** Số ở từng ô (theo thứ tự trái → phải, trên → dưới): hoán vị của 1..N. */
  numbers: number[];
  /** Chỉ số màu nền của từng ô (0 nếu 1 màu). */
  colors: number[];
  rotations: Rotation[];
}

export function cellCount(grid: number): number {
  return grid * grid;
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/** Gán màu nền ngẫu nhiên cho `count` ô (dùng cho “Nhiều màu” và khi đổi màu mỗi 3 giây). Không đổi vị trí số. */
export function randomColors(rng: Rng, count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(rng() * COLOR_COUNT));
}

export function generateBoard(
  rng: Rng,
  params: Pick<G2Params, 'grid' | 'colorMode' | 'rotate'>,
): Board {
  const n = cellCount(params.grid);
  const numbers = shuffle(
    rng,
    Array.from({ length: n }, (_, i) => i + 1),
  );
  const colors = params.colorMode === 'mono' ? new Array<number>(n).fill(0) : randomColors(rng, n);
  const rotations = Array.from({ length: n }, () =>
    params.rotate ? (ROTATIONS[Math.floor(rng() * ROTATIONS.length)] as Rotation) : (0 as Rotation),
  );
  return { numbers, colors, rotations };
}

/** Dãy số cần chạm theo thứ tự: 1 → N (xuôi) hoặc N → 1 (ngược). */
export function targetSequence(params: Pick<G2Params, 'grid' | 'backward'>): number[] {
  const n = cellCount(params.grid);
  const asc = Array.from({ length: n }, (_, i) => i + 1);
  return params.backward ? asc.reverse() : asc;
}

/** Khi số xoay, mọi số có chữ số 6 hoặc 9 (6, 9, 16, 19…) luôn gạch chân để không nhầm khi lật. */
export function needsUnderline(n: number, rotate: boolean): boolean {
  return rotate && /[69]/.test(String(n));
}

/** score = clamp(targetSec / timeSec, 0, 1) × max(0, 1 − 0,05 × errors) */
export function scoreFromRound(targetSec: number, timeSec: number, errors: number): number {
  const speed = clamp01(targetSec / Math.max(timeSec, 0.001));
  return speed * Math.max(0, 1 - ERROR_PENALTY * errors);
}

/** Lượt bị buộc kết thúc khi hết giờ giữa chừng: điểm nhân thêm tỷ lệ số đã tìm được. */
export function partialScore(score: number, found: number, total: number): number {
  return total <= 0 ? 0 : score * clamp01(found / total);
}
