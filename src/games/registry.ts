// Danh sách game hiển thị trên Home + nơi nạp GameModule.
import { g1Module } from './g1-balls';
import { g2Module } from './g2-schulte';
import { g3Module } from './g3-pets';
import { g4Module } from './g4-lights';
import { g5Module } from './g5-notes';
import type { GameModule } from './common/types';
import type { GameId } from './levels';

export type GameGroup = 'reflex' | 'focus' | 'learn';

/** Thứ tự và nhóm theo SPEC: Phản xạ (G1, G3, G5) · Tập trung & Trí nhớ (G2, G4) · Học mà chơi (G6, G7). */
export const GAME_GROUPS: { group: GameGroup; games: GameId[] }[] = [
  { group: 'reflex', games: ['G1', 'G3', 'G5'] },
  { group: 'focus', games: ['G2', 'G4'] },
  { group: 'learn', games: ['G6', 'G7'] },
];

/** Nhóm nhiệm vụ của từng game. */
export function groupOf(id: GameId): GameGroup {
  return (GAME_GROUPS.find((g) => g.games.includes(id)) as { group: GameGroup }).group;
}

/** Game đã làm xong. Các TASK sau thêm dần vào đây. */
const MODULES: Partial<Record<GameId, GameModule>> = {
  G1: g1Module,
  G2: g2Module,
  G3: g3Module,
  G4: g4Module,
  G5: g5Module,
};

export function getGameModule(id: GameId): GameModule | undefined {
  return MODULES[id];
}

export function isGameAvailable(id: GameId): boolean {
  return id in MODULES;
}
