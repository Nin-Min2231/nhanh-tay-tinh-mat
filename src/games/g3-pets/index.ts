import type { GameModule } from '../common/types';
import { createG3 } from './view';

export const g3Module: GameModule = {
  id: 'G3',
  create: createG3,
};
