// State toàn cục (signals) + các hành động ghi dữ liệu.
import { computed, signal } from '@preact/signals';
import type { RoundResult } from '../games/common/types';
import { applyRound, type KidChoice, type LevelChange } from './adaptive';
import { createAudio } from './audio';
import { generateId, getDeviceClass } from './device';
import { createHaptics } from './haptics';
import { MAX_PROFILES, createProfile, dateKey, emptyDay, type NewProfileInput } from './profile';
import { starsForScore } from './scoring';
import { storage } from './storage';
import type {
  AppState,
  GameId,
  GameProgress,
  GlobalSettings,
  Profile,
  RoundMode,
  RoundRecord,
} from './types';

export const appState = signal<AppState>(storage.loadState());
/** true nếu localStorage không dùng được → đang chạy bằng bộ nhớ tạm. */
export const storageWarning = signal<boolean>(storage.isDegraded());
export const toast = signal<string | null>(null);
/** Có service worker mới (TASK-08 sẽ bật cờ này; chỉ hiện nút ở Home/khu PH). */
export const updateAvailable = signal(false);

export const activeProfile = computed<Profile | null>(
  () => appState.value.profiles.find((p) => p.id === appState.value.activeProfileId) ?? null,
);

export const deviceClass = getDeviceClass();
export const audio = createAudio(() => appState.value.settings.sound);
export const haptics = createHaptics(() => appState.value.settings.vibration, deviceClass);

function commit(next: AppState): void {
  appState.value = next;
  storage.saveState(next);
  storageWarning.value = storage.isDegraded();
}

let toastTimer = 0;
export function showToast(text: string, ms = 2000): void {
  toast.value = text;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.value = null;
  }, ms);
}

export function updateProfile(id: string, fn: (p: Profile) => Profile): void {
  const s = appState.value;
  commit({ ...s, profiles: s.profiles.map((p) => (p.id === id ? fn(p) : p)) });
}

export function setSettings(partial: Partial<GlobalSettings>): void {
  const s = appState.value;
  commit({ ...s, settings: { ...s.settings, ...partial } });
}

/** Tạo hồ sơ mới và chọn làm người chơi hiện tại. Trả về null nếu đã đủ 5 hồ sơ. */
export function addProfile(input: NewProfileInput): Profile | null {
  const s = appState.value;
  if (s.profiles.length >= MAX_PROFILES) return null;
  const profile = createProfile(input, generateId(), new Date());
  const isFirst = s.profiles.length === 0;
  commit({ ...s, profiles: [...s.profiles, profile], activeProfileId: profile.id });
  if (isFirst) void storage.persist();
  return profile;
}

export function selectProfile(id: string): void {
  const s = appState.value;
  if (s.activeProfileId === id) return;
  commit({ ...s, activeProfileId: id });
}

/** Cộng thời gian đã chơi vào giới hạn ngày (cả khi lượt bị hủy – để không lách giới hạn). */
export function addPlayTime(profileId: string, ms: number, key = dateKey(new Date())): void {
  if (ms <= 0) return;
  updateProfile(profileId, (p) => {
    const day = p.days[key] ?? emptyDay();
    return { ...p, days: { ...p.days, [key]: { ...day, playMs: day.playMs + ms } } };
  });
}

/** Sửa tiến độ/cài đặt của 1 game (dùng cho bảng gỡ lỗi ?debug=1 và khu phụ huynh ở TASK-07). */
export function setGameProgress(
  profileId: string,
  gameId: GameId,
  patch: Partial<GameProgress>,
): void {
  updateProfile(profileId, (p) => ({
    ...p,
    games: { ...p.games, [gameId]: { ...p.games[gameId], ...patch } },
  }));
}

// ---- Lượt chơi ----

export interface PendingPlay {
  gameId: GameId;
  choice: KidChoice;
}
/** Lựa chọn ở màn Giới thiệu, đọc bởi màn Chơi. */
export const pendingPlay = signal<PendingPlay | null>(null);

export interface LastResult {
  gameId: GameId;
  score: number;
  stars: 1 | 2 | 3;
  metrics: Record<string, number>;
  /** Lượt này làm tăng cấp (hiện “Lên cấp!”). Giảm cấp thì đổi lặng lẽ, không thông báo. */
  leveledUp: boolean;
  /** Cấp của game sau lượt này. */
  newLevel: number;
  /** Lượt kết thúc vì đã hết giờ trong ngày → sau đó sang màn nghỉ. */
  outOfTime: boolean;
}
export const lastResult = signal<LastResult | null>(null);

export interface RecordRoundArgs {
  profileId: string;
  gameId: GameId;
  level: number;
  mode: RoundMode;
  startedAt: Date;
  result: RoundResult;
  /** Thời gian Running thực tế do RoundClock đo (ms). */
  playedMs: number;
  /** Có tính vào độ khó thích ứng không (chỉ lượt chế độ Tự động + bé chọn “Tự động”, không phải bài đo). */
  countsForAdaptive: boolean;
  benchmark?: boolean;
  options?: Record<string, unknown>;
}

/** Lưu RoundRecord, cộng sao + thời gian chơi, cập nhật độ khó. */
export function recordRound(args: RecordRoundArgs): {
  stars: 1 | 2 | 3;
  record: RoundRecord;
  change: LevelChange;
  newLevel: number;
} {
  const stars = starsForScore(args.result.score);
  const record: RoundRecord = {
    id: generateId(),
    profileId: args.profileId,
    gameId: args.gameId,
    startedAt: args.startedAt.toISOString(),
    level: args.level,
    mode: args.mode,
    benchmark: args.benchmark ?? false,
    options: args.options ?? {},
    durationMs: Math.round(args.result.durationMs),
    score: args.result.score,
    stars,
    metrics: args.result.metrics,
    deviceId: appState.value.deviceId,
    deviceClass,
  };
  storage.appendRound(record);

  const key = dateKey(args.startedAt);
  let change: LevelChange = 'none';
  let newLevel = args.level;
  updateProfile(args.profileId, (p) => {
    const day = p.days[key] ?? emptyDay();
    const before = p.games[args.gameId];
    const applied = applyRound(before, args.result.score, args.countsForAdaptive);
    change = applied.change;
    newLevel = applied.progress.level;
    return {
      ...p,
      totalStars: p.totalStars + stars, // không bao giờ giảm
      days: {
        ...p.days,
        [key]: { ...day, playMs: day.playMs + args.playedMs, starsToday: day.starsToday + stars },
      },
      games: {
        ...p.games,
        [args.gameId]: {
          ...applied.progress,
          plays: before.plays + 1,
          bestStars: Math.max(before.bestStars, stars),
        },
      },
    };
  });
  return { stars, record, change, newLevel };
}
