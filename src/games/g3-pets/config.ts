// G3 Đuổi Bắt Thú Cưng: cấu hình từ docs/data/levels.json.
import { levelsConfig, type G3Level } from '../levels';

export type PetKind = 'rabbit' | 'cat' | 'dog' | 'chick';
export const PET_KINDS: readonly PetKind[] = ['rabbit', 'cat', 'dog', 'chick'];

export interface G3Params {
  /** Tốc độ, % chiều rộng vùng chơi mỗi giây. */
  speedPctW: number;
  /** Kích thước, % cạnh ngắn vùng chơi. */
  sizePct: number;
  /** Số thú cần bắt chạy cùng lúc. */
  count: number;
  /** Số Nhím ngủ (không được chạm). */
  decoys: number;
  /** Đổi hướng bất ngờ mỗi 1–2,5 giây. */
  erratic: boolean;
  /** Cấp 10: thêm cú tăng tốc ×1,5 trong 0,5 giây. */
  burst: boolean;
}

/** Tùy chọn phụ huynh (F11): chỉ ghi đè tốc độ / Nhím. */
export interface G3Options {
  speed: 'auto' | 'slow' | 'medium' | 'fast';
  decoys: 'auto' | 'off' | 'on';
}

export const DEFAULT_G3_OPTIONS: G3Options = { speed: 'auto', decoys: 'auto' };

/** Tốc độ lấy theo cấp 2 / 5 / 8 của bảng. */
const SPEED_LEVEL = { slow: 2, medium: 5, fast: 8 } as const;

export function readG3Options(raw: Record<string, unknown> | undefined): G3Options {
  const speed = raw?.speed;
  const decoys = raw?.decoys;
  return {
    speed: speed === 'slow' || speed === 'medium' || speed === 'fast' ? speed : 'auto',
    decoys: decoys === 'off' || decoys === 'on' ? decoys : 'auto',
  };
}

export function g3LevelRow(level: number): G3Level {
  const levels = levelsConfig.games.G3.levels;
  const i = Math.min(levels.length, Math.max(1, Math.round(level))) - 1;
  return levels[i] as G3Level;
}

export function resolveG3Params(level: number, options: G3Options): G3Params {
  const row = g3LevelRow(level);
  const speedRow = options.speed === 'auto' ? row : g3LevelRow(SPEED_LEVEL[options.speed]);
  const label = row.erratic;
  return {
    speedPctW: speedRow.speedPctW,
    sizePct: row.sizePct,
    count: row.count,
    decoys:
      options.decoys === 'off' ? 0 : options.decoys === 'on' ? Math.max(1, row.decoys) : row.decoys,
    erratic: label === true || typeof label === 'string',
    burst: typeof label === 'string' && label.includes('tăng tốc'),
  };
}
