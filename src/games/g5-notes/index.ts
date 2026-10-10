import type { GameModule } from '../common/types';
import { createG5 } from './view';

export const g5Module: GameModule = {
  id: 'G5',
  create: createG5,
};
