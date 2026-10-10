import type { GameModule } from '../common/types';
import { createG6 } from './view';

export const g6Module: GameModule = {
  id: 'G6',
  create: createG6,
};
