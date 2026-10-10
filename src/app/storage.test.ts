import { describe, expect, it } from 'vitest';
import {
  CURRENT_SCHEMA,
  STATE_KEY,
  createStorage,
  defaultState,
  migrateState,
  type KeyValueBackend,
  type MigrationFn,
} from './storage';
import { createProfile } from './profile';
import type { RoundRecord } from './types';

function memoryBackend(): KeyValueBackend & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing: KeyValueBackend = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

function round(profileId: string, id: string): RoundRecord {
  return {
    id,
    profileId,
    gameId: 'G0',
    startedAt: '2026-01-01T00:00:00.000Z',
    level: 1,
    mode: 'auto',
    benchmark: false,
    options: {},
    durationMs: 1000,
    score: 1,
    stars: 3,
    metrics: {},
    deviceId: 'd',
    deviceClass: 'phone',
  };
}

describe('storage', () => {
  it('khứ hồi: lưu rồi đọc lại giữ nguyên dữ liệu', () => {
    const backend = memoryBackend();
    const s = createStorage(() => backend);
    const state = defaultState();
    state.profiles.push(
      createProfile({ name: 'Bé An', avatarId: 'a1', grade: 2 }, 'p1', new Date()),
    );
    state.activeProfileId = 'p1';
    s.saveState(state);
    const loaded = createStorage(() => backend).loadState();
    expect(loaded).toEqual(state);
    expect(s.isDegraded()).toBe(false);
  });

  it('chưa có dữ liệu → trạng thái mặc định, có deviceId', () => {
    const s = createStorage(() => memoryBackend());
    const st = s.loadState();
    expect(st.profiles).toHaveLength(0);
    expect(st.schemaVersion).toBe(CURRENT_SCHEMA);
    expect(st.deviceId.length).toBeGreaterThan(8);
  });

  it('localStorage ném lỗi → chạy bằng bộ nhớ tạm và báo degraded', () => {
    const s = createStorage(() => throwing);
    const st = s.loadState();
    expect(s.isDegraded()).toBe(true);
    st.activeProfileId = 'x';
    s.saveState(st); // không ném lỗi
    expect(s.loadState().activeProfileId).toBe('x'); // đọc lại từ bộ nhớ tạm
  });

  it('ghi lỗi (đầy bộ nhớ) → giữ dữ liệu trong bộ nhớ tạm', () => {
    const backend = memoryBackend();
    backend.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    const s = createStorage(() => backend);
    const st = defaultState();
    st.activeProfileId = 'p9';
    s.saveState(st);
    expect(s.isDegraded()).toBe(true);
    expect(s.loadState().activeProfileId).toBe('p9');
  });

  it('JSON hỏng → bắt đầu mới và giữ bản sao .bak', () => {
    const backend = memoryBackend();
    backend.data.set(STATE_KEY, '{khong-phai-json');
    const s = createStorage(() => backend);
    expect(s.loadState().profiles).toHaveLength(0);
    expect(backend.data.get(`${STATE_KEY}.bak`)).toBe('{khong-phai-json');
  });

  it('dữ liệu từ phiên bản mới hơn → không ghi đè dữ liệu gốc', () => {
    const backend = memoryBackend();
    const future = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA + 1,
      deviceId: 'd',
      profiles: [],
    });
    backend.data.set(STATE_KEY, future);
    const s = createStorage(() => backend);
    const st = s.loadState();
    s.saveState(st);
    expect(s.isDegraded()).toBe(true);
    expect(backend.data.get(STATE_KEY)).toBe(future);
  });

  it('appendRound thêm vào danh sách của đúng hồ sơ', () => {
    const backend = memoryBackend();
    const s = createStorage(() => backend);
    s.appendRound(round('A', '1'));
    s.appendRound(round('A', '2'));
    s.appendRound(round('B', '3'));
    expect(s.loadRounds('A').map((r) => r.id)).toEqual(['1', '2']);
    expect(s.loadRounds('B').map((r) => r.id)).toEqual(['3']);
    s.removeProfileData('A');
    expect(s.loadRounds('A')).toEqual([]);
  });
});

describe('migrateState', () => {
  const base = { deviceId: 'd', profiles: [] as unknown[] };

  it('phiên bản hiện tại → giữ nguyên', () => {
    const r = migrateState({ ...base, schemaVersion: CURRENT_SCHEMA });
    expect(r.ok).toBe(true);
  });

  it('chuỗi migration chạy lần lượt từ v1 → v3', () => {
    const migrations: Record<number, MigrationFn> = {
      1: (s) => ({ ...s, addedInV2: true }),
      2: (s) => ({ ...s, addedInV3: true }),
    };
    const r = migrateState({ ...base, schemaVersion: 1 }, migrations, 3);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.state.schemaVersion).toBe(3);
      expect((r.state as unknown as Record<string, unknown>).addedInV2).toBe(true);
      expect((r.state as unknown as Record<string, unknown>).addedInV3).toBe(true);
    }
  });

  it('thiếu hàm migration / phiên bản quá mới / sai hình dạng → báo lỗi', () => {
    expect(migrateState({ ...base, schemaVersion: 1 }, {}, 2)).toEqual({
      ok: false,
      reason: 'noMigration',
    });
    expect(migrateState({ ...base, schemaVersion: 9 }, {}, 2)).toEqual({
      ok: false,
      reason: 'tooNew',
    });
    expect(migrateState(null)).toEqual({ ok: false, reason: 'invalid' });
    expect(migrateState([])).toEqual({ ok: false, reason: 'invalid' });
    expect(migrateState({ schemaVersion: 1 })).toEqual({ ok: false, reason: 'invalid' });
    expect(migrateState({ ...base })).toEqual({ ok: false, reason: 'invalid' });
  });
});
