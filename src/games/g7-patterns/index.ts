import type { GameModule } from '../common/types';
import { createG7 } from './view';

export const g7Module: GameModule = {
  id: 'G7',
  create: createG7,
};
