// Danh sách game hiển thị trên Home + nơi nạp GameModule.
import type { PlayableId } from '../app/routes';
import { g0Module } from './g0-demo';
import type { GameModule } from './common/types';
import { GAME_IDS, type GameId } from './levels';

export type GameGroup = 'reflex' | 'focus' | 'learn';

export interface GameMeta {
  id: GameId;
  group: GameGroup;
}

/** Thứ tự và nhóm theo SPEC: Phản xạ (G1, G3, G5) · Tập trung & Trí nhớ (G2, G4) · Học mà chơi (G6, G7). */
export const GAME_GROUPS: { group: GameGroup; games: GameId[] }[] = [
  { group: 'reflex', games: ['G1', 'G3', 'G5'] },
  { group: 'focus', games: ['G2', 'G4'] },
  { group: 'learn', games: ['G6', 'G7'] },
];

export const GAME_META: Record<GameId, GameMeta> = Object.fromEntries(
  GAME_GROUPS.flatMap(({ group, games }) => games.map((id) => [id, { id, group }] as const)),
) as Record<GameId, GameMeta>;

// Sanity: mọi game đều thuộc đúng 1 nhóm
if (GAME_IDS.some((id) => !GAME_META[id])) throw new Error('GAME_GROUPS thiếu game');

/** Game đã làm xong. TASK-03+ thêm dần vào đây; G0 là game thử tạm. */
const MODULES: Partial<Record<PlayableId, GameModule>> = {
  G0: g0Module,
};

export function getGameModule(id: PlayableId): GameModule | undefined {
  return MODULES[id];
}

export function isGameAvailable(id: PlayableId): boolean {
  return id in MODULES;
}
