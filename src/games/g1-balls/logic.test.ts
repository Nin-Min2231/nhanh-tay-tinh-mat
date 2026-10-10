import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../app/rng';
import { levelsConfig } from '../levels';
import {
  DEFAULT_G1_OPTIONS,
  g1LevelRow,
  readG1Options,
  resolveG1Params,
  type BallKind,
} from './config';
import {
  ANTICIPATION_MS,
  EDGE_MARGIN,
  HIT_SLOP_PX,
  HUD_HEIGHT,
  SpawnPlanner,
  ballDiameter,
  buildMetrics,
  emptyStats,
  hitDistanceSq,
  nonGreenKinds,
  pickPositions,
  reactionStats,
  scoreFromStats,
} from './logic';

describe('cấu hình G1 từ levels.json', () => {
  it('10 cấp khớp bảng trong docs/02_GAMES.md', () => {
    const levels = levelsConfig.games.G1.levels;
    expect(levels).toHaveLength(10);
    expect(resolveG1Params(1, DEFAULT_G1_OPTIONS)).toEqual({
      displayMs: 1200,
      colors: 2,
      simultaneous: 1,
      goRatio: 0.75,
      gapMs: [900, 1300],
    });
    expect(resolveG1Params(7, DEFAULT_G1_OPTIONS)).toMatchObject({
      displayMs: 725,
      colors: 3,
      simultaneous: 2,
    });
    expect(resolveG1Params(10, DEFAULT_G1_OPTIONS)).toMatchObject({
      displayMs: 500,
      colors: 4,
      simultaneous: 2,
      goRatio: 0.6,
    });
  });

  it('độ khó tăng dần: thời gian hiện bóng giảm, số màu/bóng cùng lúc không giảm', () => {
    for (let l = 2; l <= 10; l++) {
      const a = g1LevelRow(l - 1);
      const b = g1LevelRow(l);
      expect(b.displayMs).toBeLessThan(a.displayMs);
      expect(b.colors).toBeGreaterThanOrEqual(a.colors);
      expect(b.simultaneous).toBeGreaterThanOrEqual(a.simultaneous);
    }
  });

  it('cấp ngoài khoảng được kẹp vào 1–10', () => {
    expect(g1LevelRow(0)).toEqual(g1LevelRow(1));
    expect(g1LevelRow(99)).toEqual(g1LevelRow(10));
  });

  it('tùy chọn PH ghi đè số màu và số bóng cùng lúc (TC-014)', () => {
    expect(resolveG1Params(1, { colors: 4, simultaneous: 'auto' }).colors).toBe(4);
    expect(resolveG1Params(1, { colors: 'auto', simultaneous: 2 }).simultaneous).toBe(2);
    expect(resolveG1Params(9, { colors: 2, simultaneous: 1 })).toMatchObject({
      colors: 2,
      simultaneous: 1,
    });
  });

  it('readG1Options chấp nhận số hoặc chuỗi số, bỏ giá trị lạ', () => {
    expect(readG1Options({ colors: '4', simultaneous: 2 })).toEqual({ colors: 4, simultaneous: 2 });
    expect(readG1Options({ colors: 7, simultaneous: 'abc' })).toEqual(DEFAULT_G1_OPTIONS);
    expect(readG1Options(undefined)).toEqual(DEFAULT_G1_OPTIONS);
  });
});

describe('SpawnPlanner – phân bố xanh / không xanh', () => {
  const params = (over: Partial<ReturnType<typeof resolveG1Params>> = {}) => ({
    ...resolveG1Params(1, DEFAULT_G1_OPTIONS),
    ...over,
  });

  it('tỷ lệ bóng xanh ≈ goRatio (±2% trên 10.000 bóng)', () => {
    for (const ratio of [0.6, 0.7, 0.75]) {
      const planner = new SpawnPlanner(mulberry32(99), params({ goRatio: ratio, colors: 4 }));
      let green = 0;
      const N = 10_000;
      for (let i = 0; i < N; i++) if (planner.next()[0] === 'green') green++;
      expect(Math.abs(green / N - ratio)).toBeLessThan(0.02);
    }
  });

  it('cùng seed → cùng dãy bóng; khác seed → khác dãy', () => {
    const seq = (seed: number) => {
      const p = new SpawnPlanner(mulberry32(seed), params({ colors: 4 }));
      return Array.from({ length: 30 }, () => p.next().join(','));
    };
    expect(seq(5)).toEqual(seq(5));
    expect(seq(5)).not.toEqual(seq(6));
  });

  it('2 màu: chỉ có xanh và đỏ; 3 màu thêm vàng; 4 màu thêm nâu', () => {
    const kindsSeen = (colors: 2 | 3 | 4) => {
      const p = new SpawnPlanner(mulberry32(1), params({ goRatio: 0.3, colors }));
      const seen = new Set<BallKind>();
      for (let i = 0; i < 500; i++) p.next().forEach((k) => seen.add(k));
      return [...seen].sort();
    };
    expect(kindsSeen(2)).toEqual(['green', 'red']);
    expect(kindsSeen(3)).toEqual(['green', 'red', 'yellow']);
    expect(kindsSeen(4)).toEqual(['brown', 'green', 'red', 'yellow']);
    expect(nonGreenKinds(4)).toEqual(['red', 'yellow', 'brown']);
  });

  it('1 bóng/lần: số bóng mỗi nhóm = simultaneous', () => {
    const p1 = new SpawnPlanner(mulberry32(3), params({ simultaneous: 1 }));
    const p2 = new SpawnPlanner(mulberry32(3), params({ simultaneous: 2 }));
    for (let i = 0; i < 50; i++) {
      expect(p1.next()).toHaveLength(1);
      expect(p2.next()).toHaveLength(2);
    }
  });

  it('2 bóng/lần: ≥ 50% số nhóm có ít nhất 1 bóng xanh, kể cả khi tỷ lệ xanh rất thấp', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const p = new SpawnPlanner(
        mulberry32(seed),
        params({ simultaneous: 2, goRatio: 0.05, colors: 4 }),
      );
      let withGreen = 0;
      const N = 1000;
      for (let i = 0; i < N; i++) if (p.next().includes('green')) withGreen++;
      expect(withGreen / N).toBeGreaterThanOrEqual(0.5);
    }
  });
});

describe('vị trí bóng', () => {
  const areas = [
    { width: 328, height: 600 }, // điện thoại dọc
    { width: 700, height: 290 }, // điện thoại ngang
    { width: 1000, height: 700 }, // tablet
    { width: 800, height: 1100 },
  ];

  it('đường kính ≈ 18% cạnh ngắn, tối thiểu 64px', () => {
    expect(ballDiameter(1000, 700)).toBe(126);
    expect(ballDiameter(328, 600)).toBe(64);
    expect(ballDiameter(100, 100)).toBe(64);
  });

  it('bóng nằm trong khung, cách mép ≥ 16px, không chồng HUD (1.000 lần mỗi vùng)', () => {
    for (const area of areas) {
      const d = ballDiameter(area.width, area.height);
      const r = d / 2;
      const rng = mulberry32(11);
      for (let i = 0; i < 1000; i++) {
        for (const p of pickPositions(rng, area, d, 2)) {
          expect(p.x - r).toBeGreaterThanOrEqual(EDGE_MARGIN - 1e-9);
          expect(p.x + r).toBeLessThanOrEqual(area.width - EDGE_MARGIN + 1e-9);
          expect(p.y - r).toBeGreaterThanOrEqual(HUD_HEIGHT + EDGE_MARGIN - 1e-9);
          expect(p.y + r).toBeLessThanOrEqual(area.height - EDGE_MARGIN + 1e-9);
        }
      }
    }
  });

  it('2 bóng cùng lúc không chồng nhau', () => {
    for (const area of areas) {
      const d = ballDiameter(area.width, area.height);
      const rng = mulberry32(21);
      for (let i = 0; i < 1000; i++) {
        const [a, b] = pickPositions(rng, area, d, 2) as [
          { x: number; y: number },
          { x: number; y: number },
        ];
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(d);
      }
    }
  });

  it('vùng chơi quá nhỏ vẫn trả về vị trí hợp lệ, không ném lỗi', () => {
    const pts = pickPositions(mulberry32(1), { width: 100, height: 120 }, 64, 2);
    expect(pts).toHaveLength(2);
    pts.forEach((p) => {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    });
  });
});

describe('chấm điểm', () => {
  it('score = (hits + correctRejections) / (tổng số bóng + emptyTaps)', () => {
    const s = { hits: 6, misses: 1, falseAlarms: 1, correctRejections: 2, emptyTaps: 2 };
    // (6 + 2) / (10 + 2)
    expect(scoreFromStats(s)).toBeCloseTo(8 / 12, 10);
  });

  it('chơi hoàn hảo = 1; chưa có bóng nào = 0', () => {
    expect(scoreFromStats({ ...emptyStats(), hits: 12, correctRejections: 5 })).toBe(1);
    expect(scoreFromStats(emptyStats())).toBe(0);
  });

  it('bấm bừa (chạm chỗ trống) làm giảm điểm (TC-004)', () => {
    const base = { ...emptyStats(), hits: 8, correctRejections: 2 };
    expect(scoreFromStats({ ...base, emptyTaps: 10 })).toBeLessThan(scoreFromStats(base));
    expect(scoreFromStats({ ...base, emptyTaps: 10 })).toBe(0.5);
  });

  it('không chạm gì cả lượt: điểm ≈ tỷ lệ bóng không xanh (vẫn ≥ 0)', () => {
    const s = { ...emptyStats(), misses: 7, correctRejections: 3 };
    expect(scoreFromStats(s)).toBeCloseTo(0.3, 10);
  });

  it('chạm bóng đỏ (falseAlarm) không được điểm', () => {
    expect(scoreFromStats({ ...emptyStats(), falseAlarms: 4, hits: 4 })).toBe(0.5);
  });
});

describe('thời gian phản ứng', () => {
  it('bỏ RT < 120ms (đoán trước) khỏi trung bình', () => {
    const r = reactionStats([100, 119, 300, 500]);
    expect(r.used).toBe(2);
    expect(r.mean).toBe(400);
    expect(r.median).toBe(400);
    expect(reactionStats([ANTICIPATION_MS]).used).toBe(1);
  });

  it('trung vị với số phần tử lẻ/chẵn; rỗng → 0', () => {
    expect(reactionStats([500, 200, 300]).median).toBe(300);
    expect(reactionStats([200, 400, 600, 800]).median).toBe(500);
    expect(reactionStats([])).toEqual({ mean: 0, median: 0, used: 0 });
    expect(reactionStats([50, 60])).toEqual({ mean: 0, median: 0, used: 0 });
  });

  it('buildMetrics có đủ khóa theo docs/02_GAMES.md', () => {
    const m = buildMetrics(
      { hits: 3, misses: 1, falseAlarms: 0, correctRejections: 2, emptyTaps: 1 },
      [250, 350, 80],
    );
    expect(Object.keys(m).sort()).toEqual(
      [
        'accuracy',
        'correctRejections',
        'emptyTaps',
        'falseAlarms',
        'hits',
        'misses',
        'rtMeanMs',
        'rtMedianMs',
      ].sort(),
    );
    expect(m.rtMeanMs).toBe(300);
    expect(m.accuracy).toBeCloseTo(5 / 6, 3);
  });
});

describe('vùng trúng', () => {
  it('trúng nếu cách tâm ≤ bán kính + 8px', () => {
    expect(hitDistanceSq(100, 100, 32, 100, 100)).toBe(0);
    expect(hitDistanceSq(100, 100, 32, 100 + 32 + HIT_SLOP_PX, 100)).toBeGreaterThanOrEqual(0);
    expect(hitDistanceSq(100, 100, 32, 100 + 32 + HIT_SLOP_PX + 1, 100)).toBe(-1);
  });
});
