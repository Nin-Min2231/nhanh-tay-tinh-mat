// Hành động của khu phụ huynh + bài đo tuần: nối các hàm thuần (parentOps, backup, benchmark) với store.
import { signal } from '@preact/signals';
import type { GameId } from '../games/levels';
import { BENCHMARK_ORDER, benchmarkQueue } from './benchmark';
import { backupFileName, createBackup, stateForRestore, type BackupFile } from './backup';
import { csvFileName, dailyCsv, roundsCsv } from './csv';
import { dateKey, type NewProfileInput } from './profile';
import {
  giveBonusTime,
  giveBoxes,
  patchGameSettings,
  sanitizeName,
  removeProfileFromState,
  setGameOption,
  setGrade,
  setLimits,
  toggleMathTopic,
  type GameSettingsPatch,
} from './parentOps';
import { navigate } from './router';
import {
  activeProfile,
  addProfile,
  appState,
  commit,
  maintainRounds,
  reconcileUnlocks,
  selectProfile,
  storageWarning,
  updateProfile,
} from './store';
import { storage } from './storage';
import type { Grade, Profile, RewardReason } from './types';
import { APP_VERSION } from './version';

/** Đã giải khóa phép nhân → được vào khu phụ huynh. Tự khóa lại khi rời khu (xem ParentArea). */
export const parentUnlocked = signal(false);

/** Đang chạy luồng bài đo tuần (Giới thiệu/Kết quả đổi giao diện; Home đặt lại về false). */
export const benchmarkMode = signal(false);

/**
 * Bắt đầu bài đo tuần cho một hồ sơ (mặc định: người đang chơi): chạy lần lượt các game CHƯA làm trong tuần;
 * đã đủ bộ thì làm lại từ G1.
 */
export function startBenchmark(profileId?: string): void {
  if (profileId && appState.value.activeProfileId !== profileId) selectProfile(profileId);
  const p = activeProfile.value;
  if (!p) return;
  const queue = benchmarkQueue(storage.loadRounds(p.id), dateKey(new Date()));
  const first: GameId = queue[0] ?? BENCHMARK_ORDER[0]!;
  benchmarkMode.value = true;
  navigate(`/play/${first}/intro`);
}

// ---------------------------------------------------------------- thưởng, giới hạn, độ khó

export function parentGiveTime(profileId: string, minutes: number, reason: RewardReason): void {
  const now = new Date();
  updateProfile(profileId, (p) => giveBonusTime(p, dateKey(now), minutes, reason, now));
}

export function parentGiveBoxes(profileId: string, count: number, reason: RewardReason): void {
  updateProfile(profileId, (p) => giveBoxes(p, count, reason, new Date()));
}

export function parentSetLimits(
  profileId: string,
  patch: Partial<{ dailyMinutes: number; maxBoxesPerDay: number }>,
): void {
  updateProfile(profileId, (p) => setLimits(p, patch));
}

export function parentPatchGame(profileId: string, gameId: GameId, patch: GameSettingsPatch): void {
  updateProfile(profileId, (p) => ({
    ...p,
    games: { ...p.games, [gameId]: patchGameSettings(p.games[gameId], patch) },
  }));
}

export function parentSetGameOption(
  profileId: string,
  gameId: GameId,
  key: string,
  value: string | number | string[] | null,
): void {
  updateProfile(profileId, (p) => ({
    ...p,
    games: { ...p.games, [gameId]: setGameOption(p.games[gameId], key, value) },
  }));
}

export function parentSetGrade(profileId: string, grade: Grade): void {
  updateProfile(profileId, (p) => setGrade(p, grade));
}

export function parentToggleTopic(profileId: string, code: string): void {
  updateProfile(profileId, (p) => toggleMathTopic(p, code));
}

// ---------------------------------------------------------------- hồ sơ

/** Thêm hồ sơ từ khu phụ huynh; giữ nguyên người đang chơi (nếu đã có). */
export function parentAddProfile(input: NewProfileInput): Profile | null {
  const before = appState.value.activeProfileId;
  const created = addProfile(input);
  if (created && before) selectProfile(before);
  return created;
}

export function parentEditProfile(
  profileId: string,
  edit: { name: string; avatarId: string; grade: Grade },
): void {
  updateProfile(profileId, (p) => ({
    ...setGrade(p, edit.grade),
    name: sanitizeName(edit.name) || p.name,
    avatarId: edit.avatarId,
  }));
}

/** Xóa hồ sơ + toàn bộ lượt chơi/tổng hợp của hồ sơ đó. */
export function parentDeleteProfile(profileId: string): void {
  storage.removeProfileData(profileId);
  commit(removeProfileFromState(appState.value, profileId));
}

// ---------------------------------------------------------------- dữ liệu

/** Tạo nội dung file sao lưu và ghi nhận “lần sao lưu gần nhất”. */
export function parentCreateBackup(): { name: string; text: string } {
  const now = new Date();
  const file = createBackup(storage.snapshot(appState.value), now, APP_VERSION);
  commit({ ...appState.value, lastBackupAt: file.exportedAt });
  return { name: backupFileName(now), text: JSON.stringify(file) };
}

/** Nội dung + tên file CSV lịch sử chơi của một bé (E1): `rounds` = từng lượt, `daily` = tổng hợp theo ngày. */
export function parentCreateCsv(
  profile: Profile,
  kind: 'rounds' | 'daily',
  now: Date = new Date(),
): { name: string; text: string } {
  const text =
    kind === 'rounds'
      ? roundsCsv(storage.loadRounds(profile.id))
      : dailyCsv(storage.loadDaily(profile.id));
  return { name: csvFileName(kind, profile.name, now), text };
}

/** Khôi phục: ghi đè toàn bộ dữ liệu bằng file sao lưu đã được kiểm tra (parseBackup). */
export function parentRestore(backup: BackupFile): void {
  const state = reconcileUnlocks(stateForRestore(backup, appState.value, APP_VERSION));
  const activeOk = state.profiles.some((p) => p.id === state.activeProfileId);
  const next = activeOk ? state : { ...state, activeProfileId: state.profiles[0]?.id ?? null };
  storage.restoreAll({ state: next, rounds: backup.rounds, daily: backup.daily });
  appState.value = next;
  storageWarning.value = storage.isDegraded();
  for (const p of next.profiles) maintainRounds(p.id);
  if (next.profiles.length > 0) void storage.persist();
}
