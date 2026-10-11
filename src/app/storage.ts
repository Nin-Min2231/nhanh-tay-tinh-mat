// Mọi truy cập localStorage đi qua đây (CLAUDE.md mục 5, quy tắc 11–12).
import { generateId } from './device';
import type { DataSnapshot } from './backup';
import type { AppState, DailyAggregate, RoundRecord } from './types';
import { repairState, sanitizeDaily, sanitizeRounds } from './validate';
import { APP_VERSION } from './version';

export const CURRENT_SCHEMA = 2;
export const STATE_KEY = 'ntm.state';
export const roundsKey = (profileId: string) => `ntm.rounds.${profileId}`;
export const dailyKey = (profileId: string) => `ntm.daily.${profileId}`;

export interface KeyValueBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** migrations[v] nâng dữ liệu từ phiên bản v lên v+1. */
export type MigrationFn = (state: Record<string, unknown>) => Record<string, unknown>;
export const MIGRATIONS: Record<number, MigrationFn> = {
  // 1 → 2 (TASK-07): thêm nhật ký phụ huynh thưởng `rewardLog` vào mỗi hồ sơ.
  1: (state) => {
    const profiles = Array.isArray(state.profiles)
      ? (state.profiles as Record<string, unknown>[])
      : [];
    return {
      ...state,
      profiles: profiles.map((p) => ({
        ...p,
        rewardLog: Array.isArray(p.rewardLog) ? p.rewardLog : [],
      })),
    };
  },
};

export function defaultState(): AppState {
  return {
    schemaVersion: CURRENT_SCHEMA,
    deviceId: generateId(),
    activeProfileId: null,
    profiles: [],
    settings: { sound: true, music: true, vibration: true, allowKidDifficultyChoice: true },
    lastBackupAt: null,
    installedVersion: APP_VERSION,
  };
}

export type MigrateResult =
  { ok: true; state: AppState } | { ok: false; reason: 'invalid' | 'tooNew' | 'noMigration' };

/** Đưa dữ liệu đọc được về schema hiện tại. Thuần, có test. */
export function migrateState(
  raw: unknown,
  migrations: Record<number, MigrationFn> = MIGRATIONS,
  current: number = CURRENT_SCHEMA,
): MigrateResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, reason: 'invalid' };
  }
  let obj = raw as Record<string, unknown>;
  let v = obj.schemaVersion;
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) {
    return { ok: false, reason: 'invalid' };
  }
  if (v > current) return { ok: false, reason: 'tooNew' };
  while (v < current) {
    const fn = migrations[v];
    if (!fn) return { ok: false, reason: 'noMigration' };
    obj = { ...fn(obj), schemaVersion: v + 1 };
    v += 1;
  }
  if (typeof obj.deviceId !== 'string' || !Array.isArray(obj.profiles)) {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, state: obj as unknown as AppState };
}

export function createStorage(getBackend: () => KeyValueBackend = () => window.localStorage) {
  const memory = new Map<string, string>();
  let degraded = false;
  /** Dữ liệu từ phiên bản mới hơn: chỉ ghi vào bộ nhớ tạm để không phá dữ liệu gốc. */
  let memoryOnly = false;

  function read(key: string): string | null {
    if (memory.has(key)) return memory.get(key) ?? null;
    try {
      return getBackend().getItem(key);
    } catch {
      degraded = true;
      return null;
    }
  }

  function write(key: string, value: string): void {
    if (memoryOnly) {
      degraded = true;
    } else {
      try {
        getBackend().setItem(key, value);
        memory.delete(key);
        return;
      } catch {
        degraded = true;
      }
    }
    memory.set(key, value);
  }

  function remove(key: string): void {
    memory.delete(key);
    if (memoryOnly) return;
    try {
      getBackend().removeItem(key);
    } catch {
      degraded = true;
    }
  }

  /** Đọc danh sách; phần tử sai hình/thiếu trường bị bỏ (sanitize) để dữ liệu hỏng không làm sập giao diện. */
  function loadList<T>(key: string, sanitize: (v: unknown) => T[]): T[] {
    const text = read(key);
    if (text === null) return [];
    try {
      return sanitize(JSON.parse(text));
    } catch {
      return [];
    }
  }
  const loadRounds = (profileId: string) => loadList(roundsKey(profileId), sanitizeRounds);
  const loadDaily = (profileId: string) => loadList(dailyKey(profileId), sanitizeDaily);

  function loadState(): AppState {
    const text = read(STATE_KEY);
    if (text === null) return defaultState();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* dữ liệu hỏng → xử lý bên dưới */
    }
    const res = migrateState(parsed);
    if (res.ok) {
      // sửa trường thiếu/sai kiểu; nếu phải bỏ hồ sơ nào thì giữ bản gốc để còn cứu được
      const fixed = repairState(res.state);
      if (fixed.dropped > 0) write(`${STATE_KEY}.bak`, text);
      return fixed.state;
    }
    if (res.reason === 'tooNew') {
      memoryOnly = true;
      degraded = true;
    } else {
      write(`${STATE_KEY}.bak`, text); // giữ bản hỏng để cứu dữ liệu, rồi bắt đầu mới
    }
    return defaultState();
  }

  return {
    loadState,
    saveState: (state: AppState) => write(STATE_KEY, JSON.stringify(state)),
    loadRounds,
    saveRounds: (profileId: string, rounds: RoundRecord[]) =>
      write(roundsKey(profileId), JSON.stringify(rounds)),
    appendRound(record: RoundRecord): void {
      const list = loadRounds(record.profileId);
      list.push(record);
      write(roundsKey(record.profileId), JSON.stringify(list));
    },
    loadDaily,
    saveDaily: (profileId: string, daily: DailyAggregate[]) =>
      write(dailyKey(profileId), JSON.stringify(daily)),
    removeProfileData(profileId: string): void {
      remove(roundsKey(profileId));
      remove(dailyKey(profileId));
    },
    /** Chụp toàn bộ dữ liệu (state + lượt chơi + tổng hợp theo ngày của mọi hồ sơ) để sao lưu. */
    snapshot(state: AppState): DataSnapshot {
      const rounds: Record<string, RoundRecord[]> = {};
      const daily: Record<string, DailyAggregate[]> = {};
      for (const p of state.profiles) {
        rounds[p.id] = loadRounds(p.id);
        daily[p.id] = loadDaily(p.id);
      }
      return { state, rounds, daily };
    },
    /** Ghi đè TOÀN BỘ dữ liệu bằng bản khôi phục (xóa dữ liệu của các hồ sơ hiện có trước). */
    restoreAll(data: DataSnapshot): void {
      const old = loadState();
      for (const p of old.profiles) {
        remove(roundsKey(p.id));
        remove(dailyKey(p.id));
      }
      for (const p of data.state.profiles) {
        write(roundsKey(p.id), JSON.stringify(data.rounds[p.id] ?? []));
        write(dailyKey(p.id), JSON.stringify(data.daily[p.id] ?? []));
      }
      write(STATE_KEY, JSON.stringify(data.state));
    },
    /** true nếu đang chạy bằng bộ nhớ tạm (dữ liệu sẽ mất khi đóng app). */
    isDegraded: () => degraded,
    /** Xin quyền lưu trữ bền; gọi sau khi tạo hồ sơ đầu tiên. */
    async persist(): Promise<boolean> {
      try {
        return (await navigator.storage?.persist?.()) ?? false;
      } catch {
        return false;
      }
    },
  };
}

export type AppStorage = ReturnType<typeof createStorage>;
export const storage: AppStorage = createStorage();
