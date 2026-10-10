import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../app/rng';
import { levelsConfig } from '../levels';
import {
  DEFAULT_G5_OPTIONS,
  bpmForLevel,
  g5LevelRow,
  readG5Options,
  resolveG5Params,
} from './config';
import {
  ComboTracker,
  GOOD,
  LANES,
  MISS,
  PENDING,
  PERFECT,
  ROUND_MS,
  buildMetrics,
  fallProgress,
  firstHitTime,
  generateSchedule,
  judge,
  laneFromX,
  laneOfPitch,
  matchTap,
  pitchForLane,
  scoreFromCounts,
  type Note,
} from './logic';

describe('cấu hình G5 từ levels.json', () => {
  it('10 cấp khớp bảng trong docs/02_GAMES.md', () => {
    expect(levelsConfig.games.G5.levels).toHaveLength(10);
    expect(resolveG5Params(1, DEFAULT_G5_OPTIONS)).toEqual({
      fallMs: 2600,
      density: 0.8,
      doubleRatio: 0,
      perfectMs: 120,
      goodMs: 220,
      bpm: 90,
    });
    expect(resolveG5Params(10, DEFAULT_G5_OPTIONS)).toMatchObject({
      fallMs: 1200,
      density: 3,
      doubleRatio: 0.2,
      perfectMs: 80,
      goodMs: 150,
      bpm: 140,
    });
  });

  it('BPM 90 → 140 tăng dần theo cấp', () => {
    expect(bpmForLevel(1)).toBe(90);
    expect(bpmForLevel(10)).toBe(140);
    for (let l = 2; l <= 10; l++) expect(bpmForLevel(l)).toBeGreaterThan(bpmForLevel(l - 1));
  });

  it('độ khó tăng dần: nốt rơi nhanh hơn, dày hơn, cửa sổ chấm hẹp hơn', () => {
    for (let l = 2; l <= 10; l++) {
      const a = g5LevelRow(l - 1);
      const b = g5LevelRow(l);
      expect(b.fallMs).toBeLessThan(a.fallMs);
      expect(b.density).toBeGreaterThanOrEqual(a.density);
      expect(b.perfectMs).toBeLessThanOrEqual(a.perfectMs);
      expect(b.goodMs).toBeLessThanOrEqual(a.goodMs);
    }
  });

  it('tùy chọn PH: chỉ ghi đè thời gian rơi (cấp 2/5/8) và nốt đôi', () => {
    expect(resolveG5Params(9, { ...DEFAULT_G5_OPTIONS, fall: 'slow' }).fallMs).toBe(2400);
    expect(resolveG5Params(9, { ...DEFAULT_G5_OPTIONS, fall: 'medium' }).fallMs).toBe(1900);
    expect(resolveG5Params(1, { ...DEFAULT_G5_OPTIONS, fall: 'fast' }).fallMs).toBe(1500);
    expect(resolveG5Params(1, { ...DEFAULT_G5_OPTIONS, fall: 'fast' }).density).toBe(0.8); // không đổi
    expect(resolveG5Params(9, { ...DEFAULT_G5_OPTIONS, doubles: 'off' }).doubleRatio).toBe(0);
  });

  it('readG5Options bỏ giá trị lạ', () => {
    expect(readG5Options({ fall: 'fast', doubles: 'off' })).toEqual({
      fall: 'fast',
      doubles: 'off',
    });
    expect(readG5Options({ fall: 'x', doubles: 1 })).toEqual(DEFAULT_G5_OPTIONS);
  });
});

describe('sinh nốt', () => {
  const durations = [ROUND_MS, ROUND_MS / 10];

  it('mật độ nốt/giây đúng ±10% ở mọi cấp (nhiều seed)', () => {
    for (let level = 1; level <= 10; level++) {
      const params = resolveG5Params(level, DEFAULT_G5_OPTIONS);
      for (let seed = 1; seed <= 12; seed++) {
        const notes = generateSchedule(mulberry32(seed * 101 + level), params, ROUND_MS);
        const spanSec = (ROUND_MS - firstHitTime(params)) / 1000;
        const perSec = notes.length / spanSec;
        expect(Math.abs(perSec - params.density) / params.density).toBeLessThan(0.1);
      }
    }
  });

  it('tỷ lệ nốt đôi ≈ doubleRatio (±4% trên cấp 10, 30 seed)', () => {
    const params = resolveG5Params(10, DEFAULT_G5_OPTIONS);
    let doubles = 0;
    let events = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const notes = generateSchedule(mulberry32(seed), params, ROUND_MS);
      const byTime = new Map<number, number>();
      notes.forEach((n) => byTime.set(n.hitTime, (byTime.get(n.hitTime) ?? 0) + 1));
      events += byTime.size;
      doubles += [...byTime.values()].filter((c) => c === 2).length;
    }
    expect(Math.abs(doubles / events - params.doubleRatio)).toBeLessThan(0.04);
  });

  it('cấp 1–3 không có nốt đôi; nốt đôi luôn ở 2 làn khác nhau', () => {
    for (let level = 1; level <= 3; level++) {
      const notes = generateSchedule(
        mulberry32(5),
        resolveG5Params(level, DEFAULT_G5_OPTIONS),
        ROUND_MS,
      );
      expect(new Set(notes.map((n) => n.hitTime)).size).toBe(notes.length);
    }
    const notes = generateSchedule(
      mulberry32(5),
      resolveG5Params(10, DEFAULT_G5_OPTIONS),
      ROUND_MS,
    );
    const byTime = new Map<number, Note[]>();
    notes.forEach((n) => byTime.set(n.hitTime, [...(byTime.get(n.hitTime) ?? []), n]));
    for (const group of byTime.values()) {
      expect(group.length).toBeLessThanOrEqual(2);
      if (group.length === 2) expect(group[0]?.lane).not.toBe(group[1]?.lane);
    }
  });

  it('nốt sắp theo thời gian, nằm trong lượt, đúng làn, đúng lưới nhịp', () => {
    for (const level of [1, 5, 10]) {
      const params = resolveG5Params(level, DEFAULT_G5_OPTIONS);
      const slot = 60_000 / params.bpm / 2;
      for (const duration of durations) {
        const notes = generateSchedule(mulberry32(level), params, duration);
        let prev = -1;
        for (const n of notes) {
          expect(n.hitTime).toBeGreaterThanOrEqual(prev);
          expect(n.hitTime).toBeGreaterThanOrEqual(firstHitTime(params));
          expect(n.hitTime).toBeLessThanOrEqual(duration);
          expect(n.lane).toBeGreaterThanOrEqual(0);
          expect(n.lane).toBeLessThan(LANES);
          const k = (n.hitTime - firstHitTime(params)) / slot;
          expect(Math.abs(k - Math.round(k))).toBeLessThan(0.01);
          prev = n.hitTime;
        }
      }
    }
  });

  it('không có 3 nốt liên tiếp cùng làn; cao độ nằm trong thang 10 nốt và khớp làn', () => {
    const params = resolveG5Params(8, DEFAULT_G5_OPTIONS);
    for (let seed = 1; seed <= 20; seed++) {
      const notes = generateSchedule(mulberry32(seed), params, ROUND_MS);
      for (const n of notes) {
        expect(n.pitch).toBeGreaterThanOrEqual(0);
        expect(n.pitch).toBeLessThan(10);
        expect(laneOfPitch(n.pitch)).toBe(n.lane);
      }
      const events = notes.filter(
        (n, i) => i === 0 || n.hitTime !== (notes[i - 1] as Note).hitTime,
      );
      for (let i = 2; i < events.length; i++) {
        const a = (events[i - 2] as Note).lane;
        const b = (events[i - 1] as Note).lane;
        const c = (events[i] as Note).lane;
        expect(a === b && b === c).toBe(false);
      }
    }
  });

  it('cùng seed → cùng giai điệu; khác seed → khác', () => {
    const p = resolveG5Params(5, DEFAULT_G5_OPTIONS);
    expect(generateSchedule(mulberry32(1), p, ROUND_MS)).toEqual(
      generateSchedule(mulberry32(1), p, ROUND_MS),
    );
    expect(generateSchedule(mulberry32(1), p, ROUND_MS)).not.toEqual(
      generateSchedule(mulberry32(2), p, ROUND_MS),
    );
  });

  it('pitchForLane luôn rơi đúng làn', () => {
    const rng = mulberry32(9);
    for (let i = 0; i < 400; i++) {
      const lane = i % LANES;
      expect(laneOfPitch(pitchForLane(lane, rng))).toBe(lane);
    }
  });
});

describe('cửa sổ chấm điểm', () => {
  it('Tuyệt ≤ perfectMs; Tốt ≤ goodMs; gần nốt (≤ 1,5 × goodMs) nhưng lệch → near', () => {
    expect(judge(0, 100, 180)).toBe('perfect');
    expect(judge(100, 100, 180)).toBe('perfect');
    expect(judge(101, 100, 180)).toBe('good');
    expect(judge(180, 100, 180)).toBe('good');
    expect(judge(181, 100, 180)).toBe('near');
    expect(judge(270, 100, 180)).toBe('near');
    expect(judge(271, 100, 180)).toBe('none');
  });

  const notes: Note[] = [
    { hitTime: 1000, lane: 0, pitch: 0 },
    { hitTime: 1000, lane: 2, pitch: 5 },
    { hitTime: 1300, lane: 0, pitch: 1 },
    { hitTime: 2000, lane: 1, pitch: 3 },
  ];

  it('matchTap chọn nốt cùng làn gần nhất; chạm sớm/trễ đều tính', () => {
    const state = new Uint8Array(4);
    expect(matchTap(notes, state, 0, 0, 1050, 100, 180)).toEqual({
      index: 0,
      judgement: 'perfect',
    });
    expect(matchTap(notes, state, 0, 0, 940, 100, 180)).toEqual({ index: 0, judgement: 'perfect' });
    expect(matchTap(notes, state, 0, 0, 1130, 100, 180)).toEqual({ index: 0, judgement: 'good' });
  });

  it('matchTap: 2 nốt cùng làn gần nhau chọn nốt có độ lệch nhỏ hơn', () => {
    const state = new Uint8Array(4);
    expect(matchTap(notes, state, 0, 0, 1200, 100, 180)).toMatchObject({ index: 2 }); // |1200−1300|=100 < 200
    expect(matchTap(notes, state, 0, 0, 1100, 100, 180)).toMatchObject({ index: 0 });
  });

  it('matchTap: nốt đã xử lý bị bỏ qua; làn khác không ảnh hưởng', () => {
    const state = new Uint8Array(4);
    state[0] = PERFECT;
    expect(matchTap(notes, state, 0, 0, 1000, 100, 180)).toEqual({ index: -1, judgement: 'none' }); // nốt 1000 đã xử lý, nốt 1300 còn xa
    expect(matchTap(notes, state, 0, 0, 1200, 100, 180)).toEqual({
      index: 2,
      judgement: 'perfect',
    });
    expect(matchTap(notes, state, 0, 1, 1000, 100, 180)).toEqual({ index: -1, judgement: 'none' });
    expect(matchTap(notes, state, 0, 2, 1000, 100, 180)).toEqual({
      index: 1,
      judgement: 'perfect',
    });
  });

  it('chạm làn không có nốt trong ±1,5 × goodMs → none (extraTaps)', () => {
    const state = new Uint8Array(4);
    expect(matchTap(notes, state, 0, 3, 1000, 100, 180)).toEqual({ index: -1, judgement: 'none' });
    expect(matchTap(notes, state, 0, 1, 1000, 100, 180)).toEqual({ index: -1, judgement: 'none' }); // nốt làn 1 ở 2000
    expect(matchTap(notes, state, 0, 1, 1750, 100, 180)).toEqual({ index: 3, judgement: 'near' }); // lệch 250ms: gần nốt nhưng quá cửa sổ Tốt → không điểm, không phạt
  });

  it('hằng số trạng thái nốt khác nhau', () => {
    expect(new Set([PENDING, PERFECT, GOOD, MISS]).size).toBe(4);
  });
});

describe('combo', () => {
  it('+1 khi Tuyệt/Tốt, về 0 khi Trượt, nhớ combo cao nhất', () => {
    const c = new ComboTracker();
    c.hit();
    c.hit();
    c.hit();
    expect(c.combo).toBe(3);
    c.miss();
    expect(c.combo).toBe(0);
    c.hit();
    expect(c.combo).toBe(1);
    expect(c.max).toBe(3);
  });
});

describe('chấm điểm', () => {
  it('score = (perfect + 0,6 × good) / (totalNotes + 0,5 × extraTaps)', () => {
    const c = { perfect: 10, good: 5, miss: 5, extraTaps: 4 };
    expect(scoreFromCounts(c)).toBeCloseTo((10 + 0.6 * 5) / (20 + 0.5 * 4), 10);
  });

  it('toàn Tuyệt = 1; toàn Trượt = 0; chưa có nốt = 0', () => {
    expect(scoreFromCounts({ perfect: 30, good: 0, miss: 0, extraTaps: 0 })).toBe(1);
    expect(scoreFromCounts({ perfect: 0, good: 0, miss: 30, extraTaps: 0 })).toBe(0);
    expect(scoreFromCounts({ perfect: 0, good: 0, miss: 0, extraTaps: 0 })).toBe(0);
  });

  it('chạm bừa (extraTaps) làm giảm điểm (chống bấm bừa)', () => {
    const base = { perfect: 20, good: 0, miss: 0, extraTaps: 0 };
    expect(scoreFromCounts({ ...base, extraTaps: 20 })).toBeCloseTo(20 / 30, 10);
    expect(scoreFromCounts({ ...base, extraTaps: 20 })).toBeLessThan(scoreFromCounts(base));
  });

  it('dùng tổng số nốt của cả lượt khi nốt chưa kịp xử lý hết', () => {
    expect(scoreFromCounts({ perfect: 5, good: 0, miss: 0, extraTaps: 0 }, 10)).toBe(0.5);
  });

  it('metrics: phần trăm + combo + extraTaps', () => {
    const m = buildMetrics({ perfect: 12, good: 6, miss: 2, extraTaps: 3 }, 9);
    expect(m).toEqual({ perfectPct: 60, goodPct: 30, missPct: 10, maxCombo: 9, extraTaps: 3 });
    expect(buildMetrics({ perfect: 0, good: 0, miss: 0, extraTaps: 0 }, 0).perfectPct).toBe(0);
  });
});

describe('làn và vị trí theo thời gian', () => {
  it('làn theo toạ độ x; mỗi làn của điện thoại 360px ≥ 48px (TC-032)', () => {
    expect(laneFromX(0, 360)).toBe(0);
    expect(laneFromX(89, 360)).toBe(0);
    expect(laneFromX(90, 360)).toBe(1);
    expect(laneFromX(359, 360)).toBe(3);
    expect(laneFromX(999, 360)).toBe(3);
    expect(laneFromX(-5, 360)).toBe(0);
    expect(360 / LANES).toBeGreaterThanOrEqual(48);
    expect(laneFromX(10, 0)).toBe(0);
  });

  it('vị trí nốt tính theo thời gian: 0 ở đỉnh, 1 ở vạch đích, độc lập với số khung hình', () => {
    expect(fallProgress(3000, 400, 2600)).toBeCloseTo(0, 10);
    expect(fallProgress(3000, 1700, 2600)).toBeCloseTo(0.5, 10);
    expect(fallProgress(3000, 3000, 2600)).toBeCloseTo(1, 10);
    expect(fallProgress(3000, 3200, 2600)).toBeGreaterThan(1);
    // rớt khung hình (nhảy 500ms) cho đúng vị trí theo thời gian
    expect(fallProgress(3000, 2500, 2600) - fallProgress(3000, 2000, 2600)).toBeCloseTo(
      500 / 2600,
      10,
    );
  });
});
