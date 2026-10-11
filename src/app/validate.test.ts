import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from './backup';
import { buildSeries, recentRounds, syncDaily } from './daily';
import { compareBenchmarks } from './benchmark';
import { createProfile } from './profile';
import { mulberry32, type Rng } from './rng';
import { createStorage, defaultState, roundsKey, STATE_KEY, type KeyValueBackend } from './storage';
import type { AppState, Profile, RoundRecord } from './types';
import {
  repairProfile,
  repairState,
  sanitizeDaily,
  sanitizeDailyEntry,
  sanitizeRound,
  sanitizeRounds,
} from './validate';
import { GAME_IDS } from '../games/levels';

const NOW = new Date('2026-10-11T09:00:00');

function memoryBackend(): KeyValueBackend & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

/** Hồ sơ “đầy đặn”: mọi nhóm dữ liệu đều có giá trị khác mặc định. */
function richProfile(id = 'pa'): Profile {
  const p = createProfile({ name: 'An', avatarId: 'cat', grade: 3 }, id, new Date('2026-09-01'));
  p.totalStars = 123;
  p.unlocked = ['frame-rainbow', 'outfit-pilot'];
  p.outfitId = 'outfit-pilot';
  p.backgroundId = 'bg-candy';
  p.stickers = { 'stk-01': 2, 'stk-30': 1 };
  p.boxes = { pending: 2, openedTotal: 9, sinceLastRare: 3 };
  p.limits = { dailyMinutes: 25, maxBoxesPerDay: 2 };
  p.games.G2 = {
    mode: 'fixed',
    level: 4,
    minLevel: 2,
    maxLevel: 8,
    recentScores: [0.6, 0.9, 0.85],
    options: { grid: 4, order: 'backward' },
    bestStars: 3,
    plays: 7,
  };
  p.math = {
    topics: ['M01', 'M05'],
    facts: { '8+7': { seen: 3, correct: 2, streak: 1, lastSeenRound: 4, mastered: false } },
  };
  p.days = {
    '2026-10-10': {
      playMs: 600_000,
      bonusMs: 300_000,
      missions: { reflex: true, focus: false, learn: true, rewarded: false },
      boxesEarned: 1,
      starsToday: 12,
      restOnTimeRewarded: true,
    },
  };
  p.lastBenchmarkAt = '2026-10-01T08:00:00.000Z';
  p.rewardLog = [{ at: '2026-10-05T10:00:00.000Z', kind: 'box', amount: 2, reason: 'chores' }];
  return p;
}

function stateOf(profiles: Profile[]): AppState {
  return {
    ...defaultState(),
    deviceId: 'dev-1',
    profiles,
    activeProfileId: profiles[0]?.id ?? null,
  };
}

function round(over: Partial<RoundRecord> = {}): RoundRecord {
  return {
    id: 'r1',
    profileId: 'pa',
    gameId: 'G1',
    startedAt: '2026-10-10T08:30:00',
    level: 3,
    mode: 'auto',
    benchmark: false,
    options: {},
    durationMs: 60_000,
    score: 0.8,
    stars: 2,
    metrics: { rtMeanMs: 600, accuracy: 0.9 },
    deviceId: 'dev-1',
    deviceClass: 'phone',
    ...over,
  };
}

describe('repairProfile / repairState – dữ liệu hợp lệ giữ nguyên (idempotent)', () => {
  it('hồ sơ đầy đặn đi qua không đổi một chữ', () => {
    const p = richProfile();
    expect(repairProfile(p, NOW)).toEqual(p);
  });

  it('hồ sơ mới tạo đi qua không đổi', () => {
    const p = createProfile({ name: 'Bình', avatarId: 'fox', grade: 1 }, 'pb', NOW);
    expect(repairProfile(p, NOW)).toEqual(p);
  });

  it('trạng thái nhiều hồ sơ giữ nguyên, không bỏ hồ sơ nào', () => {
    const s = stateOf([richProfile('pa'), richProfile('pb')]);
    const r = repairState(s, NOW);
    expect(r.dropped).toBe(0);
    expect(r.state).toEqual(s);
  });
});

describe('repairProfile – trường thiếu hoặc sai kiểu', () => {
  it('thiếu hẳn days / rewardLog / games / boxes / math → dùng mặc định', () => {
    const p = richProfile() as unknown as Record<string, unknown>;
    for (const k of ['days', 'rewardLog', 'games', 'boxes', 'math', 'limits', 'stickers'])
      delete p[k];
    const fixed = repairProfile(p, NOW)!;
    const fresh = createProfile({ name: 'An', avatarId: 'cat', grade: 3 }, 'pa', NOW);
    expect(fixed.days).toEqual({});
    expect(fixed.rewardLog).toEqual([]);
    expect(fixed.games).toEqual(fresh.games);
    expect(fixed.boxes).toEqual(fresh.boxes);
    expect(fixed.math).toEqual(fresh.math);
    expect(fixed.limits).toEqual(fresh.limits);
    expect(fixed.stickers).toEqual({});
    // phần còn lại giữ nguyên
    expect(fixed.totalStars).toBe(123);
    expect(fixed.unlocked).toEqual(['frame-rainbow', 'outfit-pilot']);
  });

  it('một game thiếu → chỉ game đó về mặc định', () => {
    const p = richProfile();
    const raw = { ...p, games: { ...p.games } } as unknown as { games: Record<string, unknown> };
    delete raw.games.G4;
    const fixed = repairProfile(raw, NOW)!;
    expect(fixed.games.G4.level).toBe(1);
    expect(fixed.games.G2).toEqual(p.games.G2);
  });

  it('sai kiểu / ngoài khoảng → chuẩn hóa', () => {
    const raw = {
      ...richProfile(),
      grade: 9,
      totalStars: 'nhiều',
      unlocked: 'frame',
      stickers: { a: 2, b: 'x', c: Number.NaN },
      boxes: { pending: -4, openedTotal: null },
      limits: { dailyMinutes: 'x' },
      games: { G1: { level: 99, mode: 'lạ', recentScores: [0.5, 'x', null, 2], options: [] } },
      days: { 'không-phải-ngày': {}, '2026-10-10': 'hỏng', '2026-10-09': { playMs: 'x' } },
      rewardLog: [{ at: 1 }, null, { at: 'a', kind: 'time', amount: 5, reason: 'khác' }],
    };
    const p = repairProfile(raw, NOW)!;
    expect(p.grade).toBe(2);
    expect(p.totalStars).toBe(0);
    expect(p.unlocked).toEqual([]);
    expect(p.stickers).toEqual({ a: 2 });
    expect(p.boxes).toEqual({ pending: 0, openedTotal: 0, sinceLastRare: 0 });
    expect(p.limits.dailyMinutes).toBe(15);
    expect(p.games.G1).toMatchObject({
      level: 10,
      mode: 'auto',
      recentScores: [0.5, 2],
      options: {},
    });
    expect(Object.keys(p.days)).toEqual(['2026-10-09']);
    expect(p.days['2026-10-09']!.playMs).toBe(0);
    expect(p.rewardLog).toEqual([{ at: 'a', kind: 'time', amount: 5, reason: 'other' }]);
  });

  it('tùy chọn game chỉ giữ giá trị an toàn khi lưu JSON (NaN, object lồng nhau bị loại)', () => {
    const p = richProfile();
    const raw = {
      ...p,
      games: {
        ...p.games,
        G7: {
          ...p.games.G7,
          options: {
            timer: 'off',
            grid: Number.NaN,
            nested: { a: 1 },
            groups: ['shape', 2, { x: 1 }, null],
            on: true,
          },
        },
      },
    };
    expect(repairProfile(raw, NOW)!.games.G7.options).toEqual({
      timer: 'off',
      groups: ['shape', 2],
      on: true,
    });
  });

  it('không nhận ra hồ sơ (thiếu id hoặc name) → null', () => {
    expect(repairProfile(null)).toBeNull();
    expect(repairProfile('x')).toBeNull();
    expect(repairProfile({ name: 'An' })).toBeNull();
    expect(repairProfile({ id: 'a' })).toBeNull();
    expect(repairProfile({ id: '', name: 'An' })).toBeNull();
  });

  it('repairState: bỏ hồ sơ hỏng + trùng id, đếm số bị bỏ', () => {
    const a = richProfile('pa');
    const s = {
      ...stateOf([a]),
      profiles: [a, null, { name: 'x' }, { ...a, name: 'Trùng' }, richProfile('pb')],
    } as unknown as AppState;
    const r = repairState(s, NOW);
    expect(r.state.profiles.map((p) => p.id)).toEqual(['pa', 'pb']);
    expect(r.state.profiles[0]!.name).toBe('An'); // bản đầu thắng
    expect(r.dropped).toBe(3);
  });

  it('repairState: cài đặt chung thiếu/sai kiểu → mặc định, giữ nguyên bool hợp lệ', () => {
    const s = { ...stateOf([]), settings: { sound: false, music: 'x' } } as unknown as AppState;
    expect(repairState(s, NOW).state.settings).toEqual({
      sound: false,
      music: true,
      vibration: true,
      allowKidDifficultyChoice: true,
    });
  });
});

/** Phá hỏng ngẫu nhiên một giá trị bất kỳ bên trong cây dữ liệu. */
function corrupt(value: unknown, rng: Rng, depth = 0): unknown {
  const junk: unknown[] = [null, undefined, 'x', '', -1, 1e9, Number.NaN, [], {}, true, [1, 'a']];
  if (depth > 0 && rng() < 0.12) return junk[Math.floor(rng() * junk.length)];
  if (Array.isArray(value)) return value.map((v) => corrupt(v, rng, depth + 1));
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (rng() < 0.06) continue; // mất trường
      out[k] = corrupt(v, rng, depth + 1);
    }
    return out;
  }
  return value;
}

/** Kiểm hình dạng của một hồ sơ đã sửa: mọi trường đúng kiểu, mọi số hữu hạn. */
function expectProfileShape(p: Profile) {
  expect(typeof p.id).toBe('string');
  expect(typeof p.name).toBe('string');
  expect([1, 2, 3]).toContain(p.grade);
  expect(Number.isFinite(p.totalStars)).toBe(true);
  expect(Array.isArray(p.unlocked)).toBe(true);
  for (const n of Object.values(p.stickers)) expect(Number.isFinite(n)).toBe(true);
  expect(Object.keys(p.games).sort()).toEqual([...GAME_IDS].sort());
  for (const g of Object.values(p.games)) {
    expect(g.level).toBeGreaterThanOrEqual(1);
    expect(g.level).toBeLessThanOrEqual(10);
    expect(g.minLevel).toBeLessThanOrEqual(g.maxLevel);
    expect(g.recentScores.every(Number.isFinite)).toBe(true);
  }
  for (const [k, d] of Object.entries(p.days)) {
    expect(k).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isFinite(d.playMs + d.bonusMs + d.boxesEarned + d.starsToday)).toBe(true);
    expect(typeof d.missions.reflex).toBe('boolean');
  }
  for (const e of p.rewardLog) expect(['time', 'box']).toContain(e.kind);
}

describe('repairProfile – phá hỏng ngẫu nhiên (fuzz, seed cố định)', () => {
  it('500 hồ sơ bị phá hỏng: luôn ra hồ sơ đúng hình, sửa lần 2 không đổi (idempotent)', () => {
    const rng = mulberry32(20261011);
    let repaired = 0;
    for (let i = 0; i < 500; i++) {
      const broken = corrupt(JSON.parse(JSON.stringify(richProfile())), rng);
      const p = repairProfile(broken, NOW);
      if (!p) continue; // chỉ khi mất id/name
      repaired++;
      expectProfileShape(p);
      expect(repairProfile(p, NOW)).toEqual(p);
      // JSON hóa được (không có NaN/undefined âm thầm)
      expect(JSON.parse(JSON.stringify(p))).toEqual(p);
    }
    expect(repaired).toBeGreaterThan(300); // đa số vẫn cứu được
  });
});

describe('sanitizeRound / sanitizeDaily', () => {
  it('lượt hợp lệ giữ nguyên', () => {
    const r = round({ benchmark: true, mode: 'fixed', level: 7, stars: 3, deviceClass: 'tablet' });
    expect(sanitizeRound(r)).toEqual(r);
  });

  it('thiếu thông tin cốt lõi → bỏ', () => {
    for (const bad of [
      null,
      'x',
      [],
      round({ gameId: 'G9' as never }),
      round({ startedAt: 'không-phải-ngày' }),
      round({ startedAt: undefined as never }),
      round({ score: Number.NaN }),
      round({ score: 'cao' as never }),
    ]) {
      expect(sanitizeRound(bad)).toBeNull();
    }
  });

  it('trường phụ sai → chuẩn hóa thay vì làm sập', () => {
    const r = sanitizeRound({
      ...round(),
      metrics: null,
      level: 'x',
      options: 5,
      stars: 7,
      mode: '?',
      deviceClass: 'tv',
      score: 3,
      benchmark: 'yes',
      durationMs: -5,
    })!;
    expect(r).toMatchObject({
      metrics: {},
      level: 1,
      options: {},
      stars: 1,
      mode: 'auto',
      deviceClass: 'phone',
      score: 1,
      benchmark: false,
      durationMs: 0,
    });
    expect(
      sanitizeRound({ ...round(), metrics: { a: 1, b: 'x', c: null, d: Number.NaN } })!.metrics,
    ).toEqual({ a: 1 });
  });

  it('danh sách: loại phần tử hỏng, không phải mảng → rỗng', () => {
    const good = round();
    expect(sanitizeRounds([good, null, 3, { x: 1 }, good])).toEqual([good, good]);
    expect(sanitizeRounds('x')).toEqual([]);
    expect(sanitizeRounds(null)).toEqual([]);
    expect(sanitizeRounds({})).toEqual([]);
  });

  it('tổng hợp ngày: hợp lệ giữ nguyên, ngày/game sai bị bỏ', () => {
    const d = {
      date: '2026-10-10',
      gameId: 'G2' as const,
      deviceClass: 'tablet' as const,
      rounds: 3,
      avgScore: 0.7,
      avgLevel: 2.5,
      metrics: { timeSec: 30 },
    };
    expect(sanitizeDailyEntry(d)).toEqual(d);
    expect(
      sanitizeDaily([
        d,
        { ...d, date: '10/10/2026' },
        { ...d, gameId: 'G0' },
        null,
        { ...d, metrics: null },
      ]),
    ).toEqual([d, { ...d, metrics: {} }]);
    expect(sanitizeDaily(undefined)).toEqual([]);
  });
});

describe('storage: dữ liệu hỏng trong localStorage không làm sập app', () => {
  it('loadRounds / loadDaily bỏ phần tử hỏng và vẫn đọc được phần còn lại', () => {
    const backend = memoryBackend();
    const st = createStorage(() => backend);
    const good = round();
    backend.data.set(roundsKey('pa'), JSON.stringify([good, null, { gameId: 'G1' }, 'x', good]));
    expect(st.loadRounds('pa')).toEqual([good, good]);
    backend.data.set('ntm.daily.pa', '{không-phải-json');
    expect(st.loadDaily('pa')).toEqual([]);
    backend.data.set('ntm.daily.pa', JSON.stringify({ a: 1 }));
    expect(st.loadDaily('pa')).toEqual([]);
  });

  it('appendRound không làm hỏng danh sách có phần tử lỗi', () => {
    const backend = memoryBackend();
    const st = createStorage(() => backend);
    backend.data.set(roundsKey('pa'), JSON.stringify([null, round({ id: 'a' })]));
    st.appendRound(round({ id: 'b' }));
    expect(st.loadRounds('pa').map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('loadState sửa hồ sơ thiếu trường; hồ sơ hỏng nặng bị bỏ nhưng giữ bản .bak', () => {
    const backend = memoryBackend();
    const st = createStorage(() => backend);
    const p = richProfile() as unknown as Record<string, unknown>;
    delete p.days;
    delete p.rewardLog;
    const text = JSON.stringify({ ...stateOf([]), profiles: [p, { oops: true }] });
    backend.data.set(STATE_KEY, text);
    const s = st.loadState();
    expect(s.profiles).toHaveLength(1);
    expect(s.profiles[0]!.days).toEqual({});
    expect(s.profiles[0]!.rewardLog).toEqual([]);
    expect(backend.data.get(`${STATE_KEY}.bak`)).toBe(text);
  });

  it('loadState: không bỏ hồ sơ nào thì không tạo .bak', () => {
    const backend = memoryBackend();
    const st = createStorage(() => backend);
    st.saveState(stateOf([richProfile()]));
    st.loadState();
    expect(backend.data.has(`${STATE_KEY}.bak`)).toBe(false);
  });
});

describe('file sao lưu bị sửa tay: khôi phục không làm sập biểu đồ / bài đo', () => {
  function handEditedBackup() {
    const a = richProfile('pa');
    const good = round({ id: 'g1', profileId: 'pa' });
    const daily = syncDaily([], [good]);
    const file = createBackup(
      { state: stateOf([a]), rounds: { pa: [good] }, daily: { pa: daily } },
      NOW,
      '0.9.0',
    );
    const raw = JSON.parse(JSON.stringify(file));
    raw.rounds.pa.push(
      null,
      { ...good, id: 'x1', metrics: null },
      { ...good, id: 'x2', startedAt: undefined },
      { ...good, id: 'x3', gameId: 'G42' },
      { ...good, id: 'x4', metrics: { rtMeanMs: 'nhanh' }, score: 0.5 },
    );
    raw.daily.pa.push({ date: undefined, gameId: 'G1' }, { ...daily[0], metrics: null }, 7, null);
    delete raw.state.profiles[0].days;
    return { raw, good };
  }

  it('đọc được, loại phần tử hỏng, sửa hồ sơ thiếu trường', () => {
    const { raw } = handEditedBackup();
    const res = parseBackup(JSON.stringify(raw));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const ids = res.backup.rounds.pa!.map((r) => r.id);
    expect(ids).toEqual(['g1', 'x1', 'x4']); // x2 (thiếu ngày) và x3 (game lạ) bị loại; x1/x4 được chuẩn hóa
    expect(
      res.backup.rounds.pa!.every((r) => typeof r.metrics === 'object' && r.metrics !== null),
    ).toBe(true);
    expect(res.backup.daily.pa).toHaveLength(2);
    expect(res.backup.state.profiles[0]!.days).toEqual({});
    expect(res.preview.totalRounds).toBe(3);
    expect(res.preview.firstDate).toBe('2026-10-10');
  });

  it('dữ liệu sau khi đọc dùng được ở các hàm vẽ biểu đồ / so sánh bài đo (không ném lỗi)', () => {
    const { raw } = handEditedBackup();
    const res = parseBackup(JSON.stringify(raw));
    if (!res.ok) throw new Error('phải đọc được');
    const { rounds, daily } = res.backup;
    for (const g of GAME_IDS) {
      expect(() =>
        buildSeries(daily.pa!, {
          gameId: g,
          metric: 'score',
          device: 'all',
          range: 'all',
          today: '2026-10-11',
        }),
      ).not.toThrow();
    }
    expect(() => recentRounds(rounds.pa!, { limit: 10 })).not.toThrow();
    expect(() => compareBenchmarks(rounds.pa!)).not.toThrow();
  });

  it('hồ sơ trong file không nhận ra được → từ chối cả file (không lặng lẽ mất dữ liệu)', () => {
    const { raw } = handEditedBackup();
    raw.state.profiles.push({ oops: true });
    expect(parseBackup(JSON.stringify(raw))).toEqual({ ok: false, reason: 'invalid' });
  });

  it('file sao lưu bình thường vẫn khứ hồi giữ nguyên dữ liệu', () => {
    const a = richProfile('pa');
    const rs = [
      round({ id: 'a', profileId: 'pa' }),
      round({ id: 'b', profileId: 'pa', gameId: 'G2', metrics: { timeSec: 20 } }),
    ];
    const snap = { state: stateOf([a]), rounds: { pa: rs }, daily: { pa: syncDaily([], rs) } };
    const res = parseBackup(JSON.stringify(createBackup(snap, NOW, '0.9.0')));
    if (!res.ok) throw new Error('phải đọc được');
    expect(res.backup.rounds).toEqual(snap.rounds);
    expect(res.backup.daily).toEqual(snap.daily);
    expect(res.backup.state.profiles).toEqual(snap.state.profiles);
  });
});
