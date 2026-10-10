import type { GameModule } from '../common/types';
import { createG2 } from './view';

export const g2Module: GameModule = {
  id: 'G2',
  create: createG2,
};
