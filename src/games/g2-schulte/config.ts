// G2 Bảng Số Thần Kỳ (Schulte): cấu hình từ docs/data/levels.json. Nhãn tiếng Việt trong JSON được ánh xạ sang enum ở đây.
import { levelsConfig, type G2Level } from '../levels';

export type ColorMode = 'mono' | 'multi' | 'cycle';
export type GridSize = 3 | 4 | 5;

export interface G2Params {
  grid: GridSize;
  colorMode: ColorMode;
  rotate: boolean;
  /** Thứ tự ngược N → 1. */
  backward: boolean;
  targetSec: number;
  /** Số giây không tiến thì gợi ý nhấp nháy; null = tắt. */
  hintAfterSec: number | null;
}

/** Tùy chọn phụ huynh (F11): 'auto' = theo bảng cấp độ. */
export interface G2Options {
  grid: 'auto' | GridSize;
  order: 'auto' | 'forward' | 'backward';
  hint: 'auto' | 'on' | 'off';
}

export const DEFAULT_G2_OPTIONS: G2Options = { grid: 'auto', order: 'auto', hint: 'auto' };
/** Gợi ý mặc định khi phụ huynh bật cho cấp vốn không có gợi ý. */
export const HINT_DEFAULT_SEC = 6;

export function parseColorMode(label: string): ColorMode {
  if (label.includes('đổi')) return 'cycle'; // “Màu ô đổi mỗi 3s”
  if (label.startsWith('Nhiều')) return 'multi'; // “Nhiều màu”
  return 'mono'; // “1 màu”
}

export function parseBackward(label: string): boolean {
  return label.startsWith('Ngược'); // “Xuôi” / “Ngược 25→1”
}

export function readG2Options(raw: Record<string, unknown> | undefined): G2Options {
  const grid = typeof raw?.grid === 'string' ? Number(raw.grid) : raw?.grid;
  const order = raw?.order;
  const hint = raw?.hint;
  return {
    grid: grid === 3 || grid === 4 || grid === 5 ? grid : 'auto',
    order: order === 'forward' || order === 'backward' ? order : 'auto',
    hint: hint === 'on' || hint === 'off' ? hint : 'auto',
  };
}

export function g2LevelRow(level: number): G2Level {
  const levels = levelsConfig.games.G2.levels;
  const i = Math.min(levels.length, Math.max(1, Math.round(level))) - 1;
  return levels[i] as G2Level;
}

export function resolveG2Params(level: number, options: G2Options): G2Params {
  const row = g2LevelRow(level);
  const grid = (options.grid === 'auto' ? row.grid : options.grid) as GridSize;
  // đổi cỡ bảng thì thời gian mục tiêu đổi theo số ô
  const targetSec = Math.round((row.targetSec * (grid * grid)) / (row.grid * row.grid));
  const levelHint = row.hintAfterSec;
  return {
    grid,
    colorMode: parseColorMode(row.colorMode),
    rotate: row.rotate,
    backward: options.order === 'auto' ? parseBackward(row.order) : options.order === 'backward',
    targetSec,
    hintAfterSec:
      options.hint === 'off'
        ? null
        : options.hint === 'on'
          ? (levelHint ?? HINT_DEFAULT_SEC)
          : levelHint,
  };
}
