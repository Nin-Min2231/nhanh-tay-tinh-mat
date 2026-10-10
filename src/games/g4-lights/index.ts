import type { GameModule } from '../common/types';
import { createG4 } from './view';

export const g4Module: GameModule = {
  id: 'G4',
  create: createG4,
};
