import type { GameModule } from '../common/types';
import { createG1 } from './view';

export const g1Module: GameModule = {
  id: 'G1',
  create: createG1,
};
