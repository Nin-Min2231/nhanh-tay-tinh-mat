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
    gameId: 'G1',
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

  it('migration thật 1 → 2 (TASK-07): thêm rewardLog rỗng cho mọi hồ sơ, giữ nguyên phần còn lại', () => {
    const legacy = {
      schemaVersion: 1,
      deviceId: 'd',
      activeProfileId: 'p1',
      profiles: [
        { id: 'p1', name: 'An', totalStars: 12 },
        { id: 'p2', name: 'Bình', totalStars: 3, rewardLog: [{ at: 'x' }] },
      ],
      settings: { sound: true },
    };
    const r = migrateState(legacy);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.schemaVersion).toBe(CURRENT_SCHEMA);
    const [a, b] = r.state.profiles as unknown as Record<string, unknown>[];
    // (chuỗi migration đi tiếp 2 → 3 nên còn có mascotId/soundSetId = null)
    expect(a).toEqual({
      id: 'p1',
      name: 'An',
      totalStars: 12,
      rewardLog: [],
      mascotId: null,
      soundSetId: null,
    });
    expect(b!.rewardLog).toEqual([{ at: 'x' }]); // đã có thì không xóa
    expect(r.state.activeProfileId).toBe('p1');
  });

  it('migration thật 2 → 3 (TASK-10): thêm mascotId/soundSetId = null, giữ nguyên giá trị đã có và phần còn lại', () => {
    const legacy = {
      schemaVersion: 2,
      deviceId: 'd',
      activeProfileId: 'p1',
      profiles: [
        { id: 'p1', name: 'An', totalStars: 12, rewardLog: [] },
        { id: 'p2', name: 'Bình', mascotId: 'mascot-owl', soundSetId: 7 },
      ],
    };
    const r = migrateState(legacy);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(CURRENT_SCHEMA).toBeGreaterThanOrEqual(3);
    expect(r.state.schemaVersion).toBe(CURRENT_SCHEMA);
    const [a, b] = r.state.profiles as unknown as Record<string, unknown>[];
    expect(a).toMatchObject({ id: 'p1', totalStars: 12, mascotId: null, soundSetId: null });
    expect(b).toMatchObject({ id: 'p2', mascotId: 'mascot-owl', soundSetId: null }); // 7 không phải chuỗi → null
  });

  it('migration thật 3 → 4 (1.1.0): cấp hiện tại → sổ Tự động, 3 sổ còn lại cấp 1, điểm cũ → sao, bỏ bestStars/recentScores', () => {
    const legacy = {
      schemaVersion: 3,
      deviceId: 'd',
      activeProfileId: 'p1',
      profiles: [
        {
          id: 'p1',
          name: 'An',
          totalStars: 12,
          games: {
            G1: {
              mode: 'auto',
              level: 4,
              minLevel: 2,
              maxLevel: 9,
              recentScores: [0.95, 0.75, 0.3],
              options: { colors: 3 },
              bestStars: 3,
              plays: 11,
            },
            G2: { mode: 'fixed', level: 6, minLevel: 1, maxLevel: 10, options: {}, plays: 2 },
          },
        },
        { id: 'p2', name: 'Bình' }, // chưa có games → để nguyên (repairState dựng mặc định)
      ],
    };
    const r = migrateState(legacy);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(CURRENT_SCHEMA).toBeGreaterThanOrEqual(4);
    expect(r.state.schemaVersion).toBe(CURRENT_SCHEMA);
    const [a, b] = r.state.profiles as unknown as {
      games?: Record<string, Record<string, unknown>>;
    }[];
    // giữ nguyên các trường còn lại
    expect(a!.games!.G1).toMatchObject({
      mode: 'auto',
      level: 4,
      minLevel: 2,
      maxLevel: 9,
      options: { colors: 3 },
      plays: 11,
      lastChoice: 'auto',
    });
    // trường cũ bị bỏ
    expect(a!.games!.G1).not.toHaveProperty('recentScores');
    expect(a!.games!.G1).not.toHaveProperty('bestStars');
    // cấp hiện tại → sổ Tự động; điểm 0,95 / 0,75 / 0,3 → 3 / 2 / 1 sao; ba sổ còn lại bắt đầu ở cấp 1
    expect(a!.games!.G1!.tracks).toEqual({
      easy: { level: 1, stars: 0, recent: [] },
      normal: { level: 1, stars: 0, recent: [] },
      auto: { level: 4, stars: 3, recent: [3, 2, 1] },
      hard: { level: 1, stars: 0, recent: [] },
    });
    // chế độ Cố định: cấp cố định giữ nguyên ở `level`, sổ Tự động bắt đầu từ cấp đó (giống hành vi cũ: dùng chung một cấp)
    expect(a!.games!.G2).toMatchObject({ mode: 'fixed', level: 6 });
    expect((a!.games!.G2!.tracks as Record<string, { level: number }>).auto!.level).toBe(6);
    expect(b).toEqual({ id: 'p2', name: 'Bình' });
  });

  it('migration 3 → 4 chạy lại trên game đã có sổ cấp thì giữ nguyên (không ghi đè)', () => {
    const tracks = {
      easy: { level: 7, stars: 1, recent: [1] },
      normal: { level: 1, stars: 0, recent: [] },
      auto: { level: 2, stars: 3, recent: [3] },
      hard: { level: 1, stars: 0, recent: [] },
    };
    const r = migrateState({
      schemaVersion: 3,
      deviceId: 'd',
      profiles: [{ id: 'p1', name: 'An', games: { G1: { mode: 'auto', level: 9, tracks } } }],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const g1 = (r.state.profiles[0] as unknown as { games: Record<string, { tracks: unknown }> })
      .games.G1!;
    expect(g1.tracks).toEqual(tracks);
  });

  it('dữ liệu schema 3 đi qua loadState + repair: không mất cấp, có đủ 4 sổ cấp', () => {
    const backend = memoryBackend();
    backend.data.set(
      STATE_KEY,
      JSON.stringify({
        schemaVersion: 3,
        deviceId: 'd',
        profiles: [
          {
            id: 'p1',
            name: 'An',
            games: { G3: { mode: 'auto', level: 5, minLevel: 1, maxLevel: 10, plays: 3 } },
          },
        ],
      }),
    );
    const st = createStorage(() => backend).loadState();
    expect(st.schemaVersion).toBe(CURRENT_SCHEMA);
    const g3 = st.profiles[0]!.games.G3;
    expect(g3.tracks.auto.level).toBe(5);
    expect(g3.tracks.easy).toEqual({ level: 1, stars: 0, recent: [] });
    expect(g3.lastChoice).toBe('auto');
    expect(g3.plays).toBe(3);
  });

  it('đọc dữ liệu schema 1 từ localStorage → được nâng lên schema hiện tại', () => {
    const backend = memoryBackend();
    backend.data.set(
      STATE_KEY,
      JSON.stringify({ schemaVersion: 1, deviceId: 'd', profiles: [{ id: 'p1', name: 'An' }] }),
    );
    const st = createStorage(() => backend).loadState();
    expect(st.schemaVersion).toBe(CURRENT_SCHEMA);
    expect((st.profiles[0] as unknown as { rewardLog: unknown[] }).rewardLog).toEqual([]);
  });
});
