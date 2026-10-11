// Thao tác của khu phụ huynh lên dữ liệu hồ sơ – thuần, có test (SPEC mục 9; F02, F07, F11, F15, F17).
import { levelsConfig } from '../games/levels';
import { MAX_PROFILES, NAME_MAX_LENGTH, emptyDay } from './profile';
import { MAX_BOXES_PER_DAY_RANGE, grantParentBoxes } from './rewards';
import type { AppState, GameProgress, Grade, Profile, RewardLogEntry, RewardReason } from './types';

export const BONUS_MINUTES = [5, 10, 15] as const;
export const REWARD_LOG_MAX = 50;
export const REWARD_REASONS: readonly RewardReason[] = [
  'goodStudy',
  'wellBehaved',
  'chores',
  'other',
];
/** Bước chỉnh thời gian chơi mỗi ngày (phút). */
export const DAILY_MINUTES_STEP = 5;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// ---------------------------------------------------------------- thưởng (F15)

function appendLog(p: Profile, entry: RewardLogEntry): Profile {
  return { ...p, rewardLog: [...p.rewardLog, entry].slice(-REWARD_LOG_MAX) };
}

/** Tặng thêm giờ chơi cho HÔM NAY (`key` = khóa ngày). */
export function giveBonusTime(
  p: Profile,
  key: string,
  minutes: number,
  reason: RewardReason,
  now: Date,
): Profile {
  if (!(minutes > 0)) return p;
  const day = p.days[key] ?? emptyDay();
  const next = {
    ...p,
    days: { ...p.days, [key]: { ...day, bonusMs: day.bonusMs + minutes * 60_000 } },
  };
  return appendLog(next, { at: now.toISOString(), kind: 'time', amount: minutes, reason });
}

/** Tặng hộp quà (không tính vào giới hạn hộp/ngày). */
export function giveBoxes(p: Profile, count: number, reason: RewardReason, now: Date): Profile {
  if (!(count > 0)) return p;
  return appendLog(grantParentBoxes(p, count), {
    at: now.toISOString(),
    kind: 'box',
    amount: count,
    reason,
  });
}

// ---------------------------------------------------------------- giới hạn (F07)

export function clampDailyMinutes(n: number): number {
  const [lo, hi] = levelsConfig.session.dailyMinutesRange;
  return clamp(Math.round(n), lo, hi);
}

export function clampMaxBoxes(n: number): number {
  return clamp(Math.round(n), MAX_BOXES_PER_DAY_RANGE[0], MAX_BOXES_PER_DAY_RANGE[1]);
}

export function setLimits(
  p: Profile,
  patch: Partial<{ dailyMinutes: number; maxBoxesPerDay: number }>,
): Profile {
  return {
    ...p,
    limits: {
      dailyMinutes: clampDailyMinutes(patch.dailyMinutes ?? p.limits.dailyMinutes),
      maxBoxesPerDay: clampMaxBoxes(patch.maxBoxesPerDay ?? p.limits.maxBoxesPerDay),
    },
  };
}

// ---------------------------------------------------------------- độ khó từng game (F11)

export interface GameSettingsPatch {
  mode?: GameProgress['mode'];
  /** Chế độ Cố định: cấp cố định; Tự động: cấp hiện tại. */
  level?: number;
  minLevel?: number;
  maxLevel?: number;
}

/**
 * Áp dụng cài đặt độ khó của phụ huynh. Giữ min ≤ max (đổi một đầu thì kéo đầu kia theo),
 * cấp nằm trong [1, 10] (Tự động: trong [min, max]); đổi chế độ/cấp/khoảng thì xóa điểm gần đây để thích ứng bắt đầu lại.
 */
export function patchGameSettings(g: GameProgress, patch: GameSettingsPatch): GameProgress {
  let min = clamp(Math.round(patch.minLevel ?? g.minLevel), 1, 10);
  let max = clamp(Math.round(patch.maxLevel ?? g.maxLevel), 1, 10);
  if (min > max) {
    if (patch.minLevel !== undefined) max = min;
    else min = max;
  }
  const mode = patch.mode ?? g.mode;
  let level = clamp(Math.round(patch.level ?? g.level), 1, 10);
  if (mode === 'auto') level = clamp(level, min, max);
  const changed = mode !== g.mode || level !== g.level || min !== g.minLevel || max !== g.maxLevel;
  return {
    ...g,
    mode,
    level,
    minLevel: min,
    maxLevel: max,
    recentScores: changed ? [] : g.recentScores,
  };
}

/** Đặt/bỏ một tùy chọn riêng của game; 'auto' (hoặc null) = theo bảng cấp độ → xóa khóa. */
export function setGameOption(
  g: GameProgress,
  key: string,
  value: string | number | string[] | null,
): GameProgress {
  const options = { ...g.options };
  if (value === null || value === 'auto' || (Array.isArray(value) && value.length === 0)) {
    delete options[key];
  } else {
    options[key] = value;
  }
  return { ...g, options };
}

// ---------------------------------------------------------------- toán G6 (F17)

/** Đổi lớp → chủ đề toán về mặc định của lớp mới. */
export function setGrade(p: Profile, grade: Grade): Profile {
  if (p.grade === grade) return p;
  const topics = [...levelsConfig.mathDefaultByGrade[`${grade}`]];
  return { ...p, grade, math: { ...p.math, topics } };
}

/** Bật/tắt một chủ đề toán; luôn còn ít nhất 1 chủ đề (nếu tắt hết thì trả về mặc định của lớp). */
export function toggleMathTopic(p: Profile, code: string): Profile {
  const has = p.math.topics.includes(code);
  const next = has ? p.math.topics.filter((t) => t !== code) : [...p.math.topics, code];
  const ordered = levelsConfig.mathTopics.map((t) => t.code).filter((c) => next.includes(c));
  const topics = ordered.length > 0 ? ordered : [...levelsConfig.mathDefaultByGrade[`${p.grade}`]];
  return { ...p, math: { ...p.math, topics } };
}

// ---------------------------------------------------------------- hồ sơ (F02)

export function canAddProfile(state: AppState): boolean {
  return state.profiles.length < MAX_PROFILES;
}

export function sanitizeName(name: string): string {
  return name.trim().slice(0, NAME_MAX_LENGTH);
}

/** Xóa hồ sơ khỏi trạng thái; nếu đó là người đang chơi thì chọn hồ sơ đầu tiên còn lại (hoặc không ai). */
export function removeProfileFromState(state: AppState, id: string): AppState {
  const profiles = state.profiles.filter((p) => p.id !== id);
  const activeProfileId =
    state.activeProfileId === id ? (profiles[0]?.id ?? null) : state.activeProfileId;
  return { ...state, profiles, activeProfileId };
}

/** Xóa hồ sơ chỉ được phép khi người dùng gõ đúng tên hồ sơ (xác nhận 2 bước). */
export function deleteConfirmed(profile: Profile, typed: string): boolean {
  return typed.trim().toLowerCase() === profile.name.trim().toLowerCase() && typed.trim() !== '';
}
