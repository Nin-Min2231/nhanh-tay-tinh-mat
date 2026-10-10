// G4 Chuỗi Ánh Sáng (Simon/Corsi): cấu hình từ docs/data/levels.json.
import { levelsConfig, type G4Level } from '../levels';

export type PadCount = 4 | 6 | 9;

export interface G4Params {
  pads: PadCount;
  startLen: number;
  /** Thời gian ô sáng khi phát chuỗi (ms). */
  flashMs: number;
  /** Nghỉ giữa 2 ô (ms). */
  gapMs: number;
}

/** Tùy chọn phụ huynh (F11): 'auto' = theo bảng cấp độ. */
export interface G4Options {
  pads: 'auto' | PadCount;
  /** slow ×1,3 thời gian · medium ×1 · fast ×0,8 */
  speed: 'auto' | 'slow' | 'medium' | 'fast';
  startLen: 'auto' | 2 | 3 | 4 | 5;
}

export const DEFAULT_G4_OPTIONS: G4Options = { pads: 'auto', speed: 'auto', startLen: 'auto' };

const SPEED_FACTOR = { auto: 1, slow: 1.3, medium: 1, fast: 0.8 } as const;

export function readG4Options(raw: Record<string, unknown> | undefined): G4Options {
  const pads = typeof raw?.pads === 'string' ? Number(raw.pads) : raw?.pads;
  const startLen = typeof raw?.startLen === 'string' ? Number(raw.startLen) : raw?.startLen;
  const speed = raw?.speed;
  return {
    pads: pads === 4 || pads === 6 || pads === 9 ? pads : 'auto',
    speed: speed === 'slow' || speed === 'medium' || speed === 'fast' ? speed : 'auto',
    startLen:
      startLen === 2 || startLen === 3 || startLen === 4 || startLen === 5 ? startLen : 'auto',
  };
}

export function g4LevelRow(level: number): G4Level {
  const levels = levelsConfig.games.G4.levels;
  const i = Math.min(levels.length, Math.max(1, Math.round(level))) - 1;
  return levels[i] as G4Level;
}

export function resolveG4Params(level: number, options: G4Options): G4Params {
  const row = g4LevelRow(level);
  const f = SPEED_FACTOR[options.speed];
  return {
    pads: options.pads === 'auto' ? (row.pads as PadCount) : options.pads,
    startLen: options.startLen === 'auto' ? row.startLen : options.startLen,
    flashMs: Math.round(row.flashMs * f),
    gapMs: Math.round(row.gapMs * f),
  };
}
