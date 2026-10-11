// Kiểm tra và sửa dữ liệu đọc từ localStorage / file sao lưu (TASK-09, quy tắc 11–12). Thuần, có test.
// Mục tiêu: dữ liệu hỏng, thiếu trường hay bị sửa tay KHÔNG làm app sập. Với dữ liệu hợp lệ, mọi hàm ở đây
// trả về đúng nội dung cũ (idempotent) – chỉ phần sai kiểu/thiếu mới bị thay bằng giá trị mặc định.
import { GAME_IDS } from '../games/levels';
import { createGameProgress, createProfile, emptyDay } from './profile';
import type {
  AppState,
  DailyAggregate,
  DayUsage,
  DeviceClass,
  GameId,
  GameProgress,
  GlobalSettings,
  Grade,
  MathFact,
  Profile,
  RewardLogEntry,
  RewardReason,
  RoundMode,
  RoundRecord,
} from './types';

type Rec = Record<string, unknown>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ROUND_MODES: readonly RoundMode[] = ['auto', 'fixed', 'easy', 'normal', 'hard'];
const REWARD_REASONS: readonly RewardReason[] = ['goodStudy', 'wellBehaved', 'chores', 'other'];

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const isFiniteNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Số hữu hạn trong [min, max]; sai kiểu → `fallback`. */
function num(v: unknown, fallback: number, min = -Infinity, max = Infinity): number {
  return isFiniteNum(v) ? Math.min(max, Math.max(min, v)) : fallback;
}
const str = (v: unknown, fallback: string): string => (typeof v === 'string' ? v : fallback);
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);
const strOrNull = (v: unknown): string | null => (typeof v === 'string' ? v : null);

function strArray(v: unknown): string[] | null {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : null;
}

function numArray(v: unknown): number[] {
  return Array.isArray(v) ? v.filter(isFiniteNum) : [];
}

/** Record<string, number> chỉ giữ các giá trị là số hữu hạn. */
function numRecord(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!isRec(v)) return out;
  for (const [k, x] of Object.entries(v)) if (isFiniteNum(x)) out[k] = x;
  return out;
}

const isPrimitive = (v: unknown): v is string | number | boolean =>
  typeof v === 'string' || typeof v === 'boolean' || isFiniteNum(v);

/** Tùy chọn game: chỉ giữ giá trị an toàn khi chuyển JSON (chuỗi, số hữu hạn, boolean, mảng của chúng). */
function cleanOptions(v: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!isRec(v)) return out;
  for (const [k, x] of Object.entries(v)) {
    if (isPrimitive(x)) out[k] = x;
    else if (Array.isArray(x)) out[k] = x.filter(isPrimitive);
  }
  return out;
}

export const isGameId = (v: unknown): v is GameId =>
  typeof v === 'string' && (GAME_IDS as readonly string[]).includes(v);

const deviceClassOf = (v: unknown): DeviceClass => (v === 'tablet' ? 'tablet' : 'phone');

// ---------------------------------------------------------------- lượt chơi & tổng hợp theo ngày

/** Một lượt chơi hợp lệ, hoặc null nếu thiếu thông tin cốt lõi (game, thời điểm, điểm). */
export function sanitizeRound(v: unknown): RoundRecord | null {
  if (!isRec(v) || !isGameId(v.gameId)) return null;
  if (typeof v.startedAt !== 'string' || Number.isNaN(Date.parse(v.startedAt))) return null;
  if (!isFiniteNum(v.score)) return null;
  const stars = v.stars === 2 || v.stars === 3 ? v.stars : 1;
  return {
    id: str(v.id, `${v.startedAt}-${v.gameId}`),
    profileId: str(v.profileId, ''),
    gameId: v.gameId,
    startedAt: v.startedAt,
    level: num(v.level, 1, 1, 10),
    mode: ROUND_MODES.find((m) => m === v.mode) ?? 'auto',
    benchmark: v.benchmark === true,
    options: cleanOptions(v.options),
    durationMs: num(v.durationMs, 0, 0),
    score: num(v.score, 0, 0, 1),
    stars,
    metrics: numRecord(v.metrics),
    deviceId: str(v.deviceId, ''),
    deviceClass: deviceClassOf(v.deviceClass),
  };
}

export function sanitizeRounds(list: unknown): RoundRecord[] {
  if (!Array.isArray(list)) return [];
  const out: RoundRecord[] = [];
  for (const item of list) {
    const r = sanitizeRound(item);
    if (r) out.push(r);
  }
  return out;
}

export function sanitizeDailyEntry(v: unknown): DailyAggregate | null {
  if (!isRec(v) || !isGameId(v.gameId)) return null;
  if (typeof v.date !== 'string' || !DATE_RE.test(v.date)) return null;
  return {
    date: v.date,
    gameId: v.gameId,
    deviceClass: deviceClassOf(v.deviceClass),
    rounds: num(v.rounds, 0, 0),
    avgScore: num(v.avgScore, 0, 0, 1),
    avgLevel: num(v.avgLevel, 1, 1, 10),
    metrics: numRecord(v.metrics),
  };
}

export function sanitizeDaily(list: unknown): DailyAggregate[] {
  if (!Array.isArray(list)) return [];
  const out: DailyAggregate[] = [];
  for (const item of list) {
    const d = sanitizeDailyEntry(item);
    if (d) out.push(d);
  }
  return out;
}

// ---------------------------------------------------------------- hồ sơ

function repairGame(v: unknown): GameProgress {
  const base = createGameProgress();
  if (!isRec(v)) return base;
  const minLevel = num(v.minLevel, base.minLevel, 1, base.maxLevel);
  return {
    mode: v.mode === 'fixed' ? 'fixed' : 'auto',
    level: num(v.level, base.level, 1, base.maxLevel),
    minLevel,
    maxLevel: num(v.maxLevel, base.maxLevel, minLevel, base.maxLevel),
    recentScores: numArray(v.recentScores),
    options: cleanOptions(v.options),
    bestStars: num(v.bestStars, 0, 0, 3),
    plays: num(v.plays, 0, 0),
  };
}

function repairFacts(v: unknown): Record<string, MathFact> {
  const out: Record<string, MathFact> = {};
  if (!isRec(v)) return out;
  for (const [k, f] of Object.entries(v)) {
    if (!isRec(f)) continue;
    out[k] = {
      seen: num(f.seen, 0, 0),
      correct: num(f.correct, 0, 0),
      streak: num(f.streak, 0, 0),
      lastSeenRound: num(f.lastSeenRound, 0, 0),
      mastered: bool(f.mastered, false),
    };
  }
  return out;
}

function repairDay(v: unknown): DayUsage | null {
  if (!isRec(v)) return null;
  const base = emptyDay();
  const m = isRec(v.missions) ? v.missions : {};
  return {
    playMs: num(v.playMs, 0, 0),
    bonusMs: num(v.bonusMs, 0, 0),
    missions: {
      reflex: bool(m.reflex, base.missions.reflex),
      focus: bool(m.focus, base.missions.focus),
      learn: bool(m.learn, base.missions.learn),
      rewarded: bool(m.rewarded, base.missions.rewarded),
    },
    boxesEarned: num(v.boxesEarned, 0, 0),
    starsToday: num(v.starsToday, 0, 0),
    restOnTimeRewarded: bool(v.restOnTimeRewarded, false),
  };
}

function repairDays(v: unknown): Record<string, DayUsage> {
  const out: Record<string, DayUsage> = {};
  if (!isRec(v)) return out;
  for (const [k, d] of Object.entries(v)) {
    if (!DATE_RE.test(k)) continue;
    const day = repairDay(d);
    if (day) out[k] = day;
  }
  return out;
}

function repairRewardLog(v: unknown): RewardLogEntry[] {
  if (!Array.isArray(v)) return [];
  const out: RewardLogEntry[] = [];
  for (const e of v) {
    if (!isRec(e) || typeof e.at !== 'string' || (e.kind !== 'time' && e.kind !== 'box')) continue;
    if (!isFiniteNum(e.amount)) continue;
    const reason = REWARD_REASONS.find((r) => r === e.reason) ?? 'other';
    out.push({ at: e.at, kind: e.kind, amount: e.amount, reason });
  }
  return out;
}

/**
 * Đưa một hồ sơ đọc từ bộ nhớ/file về đúng kiểu: trường thiếu hoặc sai kiểu được thay bằng giá trị mặc định của
 * hồ sơ mới. Trả về null nếu không có `id`/`name` (không thể nhận ra hồ sơ).
 */
export function repairProfile(raw: unknown, now: Date = new Date()): Profile | null {
  if (!isRec(raw) || typeof raw.id !== 'string' || raw.id === '' || typeof raw.name !== 'string') {
    return null;
  }
  const grade: Grade = raw.grade === 1 || raw.grade === 3 ? raw.grade : 2;
  const base = createProfile({ name: raw.name, avatarId: 'cat', grade }, raw.id, now);
  const limits = isRec(raw.limits) ? raw.limits : {};
  const boxes = isRec(raw.boxes) ? raw.boxes : {};
  const math = isRec(raw.math) ? raw.math : {};
  const games = isRec(raw.games) ? raw.games : {};
  const repairedGames = {} as Record<GameId, GameProgress>;
  for (const g of GAME_IDS) repairedGames[g] = repairGame(games[g]);
  return {
    id: raw.id,
    name: raw.name,
    avatarId: str(raw.avatarId, base.avatarId),
    grade,
    createdAt: str(raw.createdAt, base.createdAt),
    limits: {
      dailyMinutes: num(limits.dailyMinutes, base.limits.dailyMinutes, 0),
      maxBoxesPerDay: num(limits.maxBoxesPerDay, base.limits.maxBoxesPerDay, 0),
    },
    totalStars: num(raw.totalStars, 0, 0),
    unlocked: strArray(raw.unlocked) ?? [],
    outfitId: strOrNull(raw.outfitId),
    backgroundId: strOrNull(raw.backgroundId),
    stickers: numRecord(raw.stickers),
    boxes: {
      pending: num(boxes.pending, 0, 0),
      openedTotal: num(boxes.openedTotal, 0, 0),
      sinceLastRare: num(boxes.sinceLastRare, 0, 0),
    },
    games: repairedGames,
    math: { topics: strArray(math.topics) ?? base.math.topics, facts: repairFacts(math.facts) },
    days: repairDays(raw.days),
    lastBenchmarkAt: strOrNull(raw.lastBenchmarkAt),
    rewardLog: repairRewardLog(raw.rewardLog),
  };
}

export interface RepairedState {
  state: AppState;
  /** Số hồ sơ không cứu được (thiếu id/name hoặc trùng id) nên bị bỏ. */
  dropped: number;
}

function repairSettings(v: unknown): GlobalSettings {
  const s = isRec(v) ? v : {};
  return {
    sound: bool(s.sound, true),
    music: bool(s.music, true),
    vibration: bool(s.vibration, true),
    allowKidDifficultyChoice: bool(s.allowKidDifficultyChoice, true),
  };
}

/** Sửa toàn bộ trạng thái (sau migration): hồ sơ và cài đặt chung. */
export function repairState(state: AppState, now: Date = new Date()): RepairedState {
  const rawProfiles: unknown[] = Array.isArray(state.profiles) ? state.profiles : [];
  const seen = new Set<string>();
  const profiles: Profile[] = [];
  for (const raw of rawProfiles) {
    const p = repairProfile(raw, now);
    if (!p || seen.has(p.id)) continue;
    seen.add(p.id);
    profiles.push(p);
  }
  const active = typeof state.activeProfileId === 'string' ? state.activeProfileId : null;
  return {
    state: {
      schemaVersion: state.schemaVersion,
      deviceId: state.deviceId,
      // trỏ vào hồ sơ không tồn tại thì giữ nguyên: store.activeProfile đã coi đó là “chưa chọn” (null)
      activeProfileId: active,
      profiles,
      settings: repairSettings(state.settings),
      lastBackupAt: strOrNull(state.lastBackupAt),
      installedVersion: str(state.installedVersion, '0.0.0'),
    },
    dropped: rawProfiles.length - profiles.length,
  };
}
