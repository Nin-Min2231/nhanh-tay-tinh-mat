import { GAME_IDS, levelsConfig } from '../games/levels';
import type { DayUsage, GameId, GameProgress, Grade, Profile } from './types';

export const MAX_PROFILES = 5;
export const NAME_MAX_LENGTH = 12;

/** Khóa ngày 'YYYY-MM-DD' theo giờ địa phương của máy. */
export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function emptyDay(): DayUsage {
  return {
    playMs: 0,
    bonusMs: 0,
    missions: { reflex: false, focus: false, learn: false, rewarded: false },
    boxesEarned: 0,
    starsToday: 0,
    restOnTimeRewarded: false,
  };
}

export function getDay(profile: Profile, key: string): DayUsage {
  return profile.days[key] ?? emptyDay();
}

export function createGameProgress(): GameProgress {
  return {
    mode: 'auto',
    level: 1,
    minLevel: 1,
    maxLevel: 10,
    recentScores: [],
    options: {},
    bestStars: 0,
    plays: 0,
  };
}

export interface NewProfileInput {
  name: string;
  avatarId: string;
  grade: Grade;
}

export function createProfile(input: NewProfileInput, id: string, now: Date): Profile {
  const games = {} as Record<GameId, GameProgress>;
  for (const g of GAME_IDS) games[g] = createGameProgress();
  const topics = levelsConfig.mathDefaultByGrade[String(input.grade) as '1' | '2' | '3'] ?? [];
  return {
    id,
    name: input.name.trim().slice(0, NAME_MAX_LENGTH),
    avatarId: input.avatarId,
    grade: input.grade,
    createdAt: now.toISOString(),
    limits: {
      dailyMinutes: levelsConfig.session.dailyMinutesDefault,
      maxBoxesPerDay: levelsConfig.rewards.maxBoxesPerDayDefault,
    },
    totalStars: 0,
    unlocked: [],
    outfitId: null,
    backgroundId: null,
    stickers: {},
    boxes: { pending: 0, openedTotal: 0, sinceLastRare: 0 },
    games,
    math: { topics: [...topics], facts: {} },
    days: {},
    lastBenchmarkAt: null,
    rewardLog: [],
  };
}

export function isValidProfileName(name: string): boolean {
  const n = name.trim();
  return n.length > 0 && n.length <= NAME_MAX_LENGTH;
}
