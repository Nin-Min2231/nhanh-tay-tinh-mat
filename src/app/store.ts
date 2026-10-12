// State toàn cục (signals) + các hành động ghi dữ liệu.
import { computed, signal } from '@preact/signals';
import type { RoundResult } from '../games/common/types';
import { applyRound, type KidChoice, type LevelChange } from './adaptive';
import { benchmarkComplete, benchmarkQueue } from './benchmark';
import { pruneRounds, syncDaily } from './daily';
import { createAudio } from './audio';
import { generateId, getDeviceClass } from './device';
import { E2E, TIME_SCALE } from './e2e';
import { createHaptics } from './haptics';
import { applyRoundToMath } from './mathFacts';
import { MAX_PROFILES, createProfile, dateKey, emptyDay, type NewProfileInput } from './profile';
import {
  activeSoundSet,
  addStars,
  applyRoundRewards,
  canEquip,
  claimRestReward,
  grantParentBoxes,
  missionGroupOf,
  openBox,
  syncUnlocks,
  type BoxOpening,
  type EquipKind,
  type RoundRewards,
  type StarGrant,
} from './rewards';
import { freshSeed, mulberry32 } from './rng';
import { starsForScore } from './scoring';
import { isOutOfTime } from './session';
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

/** Đối chiếu mốc mở khóa theo tổng sao (hồ sơ có sẵn từ trước TASK-06 cũng được mở phần thưởng đã đủ sao). */
export function reconcileUnlocks(state: AppState): AppState {
  let changed = false;
  const profiles = state.profiles.map((p) => {
    const r = syncUnlocks(p);
    if (r.unlocked.length > 0) changed = true;
    return r.profile;
  });
  return changed ? { ...state, profiles } : state;
}

/**
 * Cập nhật tổng hợp theo ngày (DailyAggregate) từ các lượt chi tiết rồi dọn lượt cũ hơn 120 ngày (NF09).
 * Trả về danh sách lượt còn giữ. Gọi khi mở app (dựng tổng hợp cho dữ liệu cũ) và sau mỗi lượt chơi.
 */
export function maintainRounds(profileId: string, now: Date = new Date()): RoundRecord[] {
  const rounds = storage.loadRounds(profileId);
  if (rounds.length === 0) return rounds;
  const before = storage.loadDaily(profileId);
  const daily = syncDaily(before, rounds);
  if (JSON.stringify(daily) !== JSON.stringify(before)) storage.saveDaily(profileId, daily);
  const kept = pruneRounds(rounds, now);
  if (kept.length !== rounds.length) storage.saveRounds(profileId, kept);
  return kept;
}

const loadedState = storage.loadState();
const startState = reconcileUnlocks(loadedState);
if (startState !== loadedState) storage.saveState(startState);
for (const p of startState.profiles) maintainRounds(p.id);

export const appState = signal<AppState>(startState);
/** true nếu localStorage không dùng được → đang chạy bằng bộ nhớ tạm. */
export const storageWarning = signal<boolean>(storage.isDegraded());
export const toast = signal<string | null>(null);
/** Có service worker mới (do app/pwa.ts bật; nút “Cập nhật” chỉ hiện ở Home, không bao giờ giữa lượt). */
export const updateAvailable = signal(false);

export const activeProfile = computed<Profile | null>(
  () => appState.value.profiles.find((p) => p.id === appState.value.activeProfileId) ?? null,
);

export const deviceClass = getDeviceClass();
export const audio = createAudio(
  () => appState.value.settings.sound,
  () => activeSoundSet(activeProfile.value),
);
export const haptics = createHaptics(() => appState.value.settings.vibration, deviceClass);

export function commit(next: AppState): void {
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
  /** Bài đo tuần (F16): cấp cố định theo levels.json, tùy chọn mặc định, không tính độ khó thích ứng. */
  benchmark?: boolean;
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
  /** Nhiệm vụ, hộp quà, mở khóa phát sinh từ lượt này. */
  rewards: RoundRewards;
  /** Lượt này là bài đo tuần. */
  benchmark: boolean;
  /** Bài đo tuần: game kế tiếp còn phải làm (null = đã đủ bộ 7 game). */
  benchmarkNext: GameId | null;
  /** Bài đo tuần: số game còn phải làm trong tuần này. */
  benchmarkLeft: number;
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
  rewards: RoundRewards;
  benchmarkNext: GameId | null;
  benchmarkLeft: number;
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
  const rounds = maintainRounds(args.profileId, args.startedAt);
  // Bài đo tuần: đủ 7 game trong tuần → ghi nhận lần đo (tắt banner “Thử thách tuần”)
  const queue = args.benchmark ? benchmarkQueue(rounds, key) : [];
  const benchDone = args.benchmark === true && benchmarkComplete(rounds, key);

  let change: LevelChange = 'none';
  let newLevel = args.level;
  let rewards!: RoundRewards;
  updateProfile(args.profileId, (p) => {
    const day = p.days[key] ?? emptyDay();
    const before = p.games[args.gameId];
    const applied = applyRound(before, args.result.score, args.countsForAdaptive);
    change = applied.change;
    newLevel = applied.progress.level;
    const played: Profile = {
      ...p,
      // G6: cập nhật sổ lỗi (F19); lastSeenRound = số thứ tự lượt G6
      math:
        args.gameId === 'G6'
          ? applyRoundToMath(p.math, args.result.extra, before.plays + 1)
          : p.math,
      days: { ...p.days, [key]: { ...day, playMs: day.playMs + args.playedMs } },
      lastBenchmarkAt: benchDone ? new Date().toISOString() : p.lastBenchmarkAt,
      games: {
        ...p.games,
        [args.gameId]: {
          ...applied.progress,
          plays: before.plays + 1,
          bestStars: Math.max(before.bestStars, stars),
        },
      },
    };
    // Nhiệm vụ nhóm, cộng sao (không bao giờ giảm), hộp quà, mở khóa – TASK-06
    const granted = applyRoundRewards(played, missionGroupOf(args.gameId), stars, key);
    rewards = granted.rewards;
    return granted.profile;
  });
  return {
    stars,
    record,
    change,
    newLevel,
    rewards,
    benchmarkNext: queue[0] ?? null,
    benchmarkLeft: queue.length,
  };
}

// ---- Hộp quà, trang phục, nghỉ đúng giờ (TASK-06) ----

/** Cửa sổ hộp quà đang mở (modal dùng chung cho Home / Kết quả / Nghỉ / Album). */
export const giftModalOpen = signal(false);

export function openGiftModal(): void {
  const p = activeProfile.value;
  if (p && p.boxes.pending > 0) giftModalOpen.value = true;
}

export function closeGiftModal(): void {
  giftModalOpen.value = false;
}

/** Mở 1 hộp quà đang chờ của người chơi hiện tại và lưu ngay (bé tắt app giữa chừng vẫn giữ sticker). */
export function openGift(): BoxOpening | null {
  const p = activeProfile.value;
  if (!p) return null;
  // Chạy e2e: dãy hộp tái lập được; chơi thật: seed ngẫu nhiên.
  const seed = E2E.enabled ? (E2E.seed + p.boxes.openedTotal * 7919) >>> 0 : freshSeed();
  const res = openBox(p, mulberry32(seed), dateKey(new Date()));
  if (!res) return null;
  updateProfile(p.id, () => res.profile);
  return res;
}

/** Chọn trang phục / hình nền / bộ âm thanh / linh vật (chỉ món đã mở khóa, đúng loại). `null` = về mặc định. */
export function equipReward(kind: EquipKind, id: string | null): void {
  const p = activeProfile.value;
  if (!p || !canEquip(p, kind, id)) return;
  updateProfile(p.id, (q) => {
    switch (kind) {
      case 'outfit':
        return { ...q, outfitId: id };
      case 'background':
        return { ...q, backgroundId: id };
      case 'soundSet':
        return { ...q, soundSetId: id };
      case 'mascot':
        return { ...q, mascotId: id };
    }
  });
}

/** Cửa sổ 30 giây của “Con nghỉ đây” (F20): chỉ mở khi vừa hết giờ và bé vào màn Nghỉ. */
/** 30 giây (chạy e2e ?e2e=1 thì rút ×10 để test không phải chờ). */
export const REST_WINDOW_MS = 30_000 / TIME_SCALE;
/** Vừa chơi hết giờ → lần mở màn Nghỉ kế tiếp được tính là “nghỉ đúng giờ”. */
export const restPending = signal(false);
export const restWindowEndsAt = signal<number | null>(null);

/** Gọi khi màn Nghỉ hiện ra. */
export function startRestWindow(now = Date.now()): void {
  if (!restPending.value) return;
  restPending.value = false;
  restWindowEndsAt.value = now + REST_WINDOW_MS;
}

export function restWindowOpen(now = Date.now()): boolean {
  const end = restWindowEndsAt.value;
  return end !== null && now <= end;
}

/** “Con nghỉ đây”: +2 sao, 1 lần/ngày, chỉ trong cửa sổ 30 giây và khi đã hết giờ chơi. */
export function claimRest(): StarGrant | null {
  const p = activeProfile.value;
  if (!p) return null;
  const key = dateKey(new Date());
  if (!restWindowOpen() || !isOutOfTime(p, key)) return null;
  const res = claimRestReward(p, key);
  if (!res) return null;
  updateProfile(p.id, () => res.profile);
  restWindowEndsAt.value = null;
  return res;
}

// ---- Công cụ thử cho ?debug=1 (chỉ gọi từ DebugRewards, không có trong bản deploy) ----

export function debugAddStars(n: number): void {
  const p = activeProfile.value;
  if (p) updateProfile(p.id, (q) => addStars(q, n, dateKey(new Date())).profile);
}

export function debugAddBox(): void {
  const p = activeProfile.value;
  if (p) updateProfile(p.id, (q) => grantParentBoxes(q, 1));
}

/** Làm mới ngày hôm nay: nhiệm vụ, số hộp đã nhận, thưởng nghỉ đúng giờ. */
export function debugResetDay(): void {
  const p = activeProfile.value;
  if (!p) return;
  const key = dateKey(new Date());
  updateProfile(p.id, (q) => {
    const day = q.days[key] ?? emptyDay();
    const fresh = emptyDay();
    return {
      ...q,
      days: {
        ...q.days,
        [key]: { ...day, missions: fresh.missions, boxesEarned: 0, restOnTimeRewarded: false },
      },
    };
  });
}
