// Sao lưu / khôi phục dữ liệu ra file JSON (F10, SPEC mục 9). Thuần, có test.
// File chứa cả ba nhóm khóa localStorage: ntm.state, ntm.rounds.<id>, ntm.daily.<id>.
import { migrateState } from './storage';
import type { AppState, DailyAggregate, RoundRecord } from './types';
import { repairState, sanitizeDaily, sanitizeRounds } from './validate';

export const BACKUP_FORMAT = 'nhanhtay-backup';
export const BACKUP_FORMAT_VERSION = 1;
/** Nhắc sao lưu khi đã quá ngần này ngày (F10). */
export const BACKUP_REMIND_DAYS = 14;

export interface DataSnapshot {
  state: AppState;
  rounds: Record<string, RoundRecord[]>;
  daily: Record<string, DailyAggregate[]>;
}

export interface BackupFile extends DataSnapshot {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  exportedAt: string;
  appVersion: string;
}

export function createBackup(snapshot: DataSnapshot, now: Date, appVersion: string): BackupFile {
  const exportedAt = now.toISOString();
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt,
    appVersion,
    // File ghi luôn “lần sao lưu gần nhất” = chính lần này, để khôi phục xong không bị nhắc ngay.
    state: { ...snapshot.state, lastBackupAt: exportedAt },
    rounds: snapshot.rounds,
    daily: snapshot.daily,
  };
}

/** `nhanhtay-backup-YYYYMMDD.json` (ngày theo giờ máy). */
export function backupFileName(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `nhanhtay-backup-${y}${m}${d}.json`;
}

export interface BackupPreview {
  exportedAt: string;
  appVersion: string;
  profiles: { name: string; rounds: number }[];
  totalRounds: number;
  /** Ngày sớm nhất / muộn nhất có dữ liệu ('YYYY-MM-DD'), null nếu chưa có lượt nào. */
  firstDate: string | null;
  lastDate: string | null;
}

export type ParseBackupResult =
  | { ok: true; backup: BackupFile; preview: BackupPreview }
  | { ok: false; reason: 'notJson' | 'notBackup' | 'tooNew' | 'invalid' };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Danh sách theo hồ sơ; phần tử sai hình (file bị sửa tay/hỏng) bị loại bởi `sanitize`. */
function listMap<T>(
  raw: unknown,
  ids: string[],
  sanitize: (v: unknown) => T[],
): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  const src = isRecord(raw) ? raw : {};
  for (const id of ids) out[id] = sanitize(src[id]);
  return out;
}

/** Đọc + kiểm tra file sao lưu; nâng schema cũ lên hiện tại bằng migration. */
export function parseBackup(text: string): ParseBackupResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'notJson' };
  }
  if (!isRecord(raw) || raw.format !== BACKUP_FORMAT) return { ok: false, reason: 'notBackup' };
  const migrated = migrateState(raw.state);
  if (!migrated.ok) {
    return { ok: false, reason: migrated.reason === 'tooNew' ? 'tooNew' : 'invalid' };
  }
  // Trường thiếu/sai kiểu trong hồ sơ được sửa về mặc định; hồ sơ không nhận ra được (thiếu id/name, trùng id)
  // thì từ chối cả file thay vì lặng lẽ làm mất dữ liệu của bé.
  const repaired = repairState(migrated.state);
  if (repaired.dropped > 0) return { ok: false, reason: 'invalid' };
  const state = repaired.state;

  const ids = state.profiles.map((p) => p.id);
  const rounds = listMap(raw.rounds, ids, sanitizeRounds);
  const daily = listMap(raw.daily, ids, sanitizeDaily);
  const exportedAt = typeof raw.exportedAt === 'string' ? raw.exportedAt : '';
  const appVersion = typeof raw.appVersion === 'string' ? raw.appVersion : '';
  const backup: BackupFile = {
    format: BACKUP_FORMAT,
    formatVersion:
      typeof raw.formatVersion === 'number' ? raw.formatVersion : BACKUP_FORMAT_VERSION,
    exportedAt,
    appVersion,
    state,
    rounds,
    daily,
  };
  return { ok: true, backup, preview: previewOf(backup) };
}

export function previewOf(b: BackupFile): BackupPreview {
  const dates: string[] = [];
  for (const list of Object.values(b.rounds)) {
    for (const r of list) if (typeof r.startedAt === 'string') dates.push(r.startedAt.slice(0, 10));
  }
  for (const list of Object.values(b.daily)) {
    for (const a of list) if (typeof a.date === 'string') dates.push(a.date);
  }
  dates.sort();
  return {
    exportedAt: b.exportedAt,
    appVersion: b.appVersion,
    profiles: b.state.profiles.map((p) => ({ name: p.name, rounds: b.rounds[p.id]?.length ?? 0 })),
    totalRounds: Object.values(b.rounds).reduce((s, l) => s + l.length, 0),
    firstDate: dates[0] ?? null,
    lastDate: dates.at(-1) ?? null,
  };
}

/**
 * Trạng thái sẽ ghi khi khôi phục: lấy từ file, nhưng giữ `deviceId` của MÁY ĐANG KHÔI PHỤC
 * (để lượt chơi mới không bị gán nhầm cho máy cũ) và `installedVersion` của bản app đang chạy.
 */
export function stateForRestore(
  backup: BackupFile,
  current: { deviceId: string },
  appVersion: string,
): AppState {
  return {
    ...backup.state,
    deviceId: current.deviceId,
    installedVersion: appVersion,
    lastBackupAt: backup.exportedAt || backup.state.lastBackupAt,
  };
}

/** Quá hạn sao lưu (chưa từng, hoặc > 14 ngày)? `nowMs` = Date.now(). */
export function backupOverdue(lastBackupAt: string | null, nowMs: number): boolean {
  if (!lastBackupAt) return true;
  const t = Date.parse(lastBackupAt);
  if (Number.isNaN(t)) return true;
  return nowMs - t > BACKUP_REMIND_DAYS * 86_400_000;
}
