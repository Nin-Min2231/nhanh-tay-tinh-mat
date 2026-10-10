import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../app/rng';
import { levelsConfig } from '../levels';
import { DEFAULT_G3_OPTIONS, g3LevelRow, readG3Options, resolveG3Params } from './config';
import {
  HIT_SLOP_PX,
  MIN_BOUNCE_DEG,
  MIN_SIZE_PX,
  accuracyOf,
  buildMetrics,
  pickTarget,
  petSize,
  scoreFromStats,
  setHeading,
  spawnPosition,
  speedOf,
  speedPx,
  stepMover,
  targetHits,
  turnRandomly,
  type Bounds,
  type Mover,
  type Target,
} from './logic';

describe('cấu hình G3 từ levels.json', () => {
  it('10 cấp khớp bảng trong docs/02_GAMES.md', () => {
    expect(levelsConfig.games.G3.levels).toHaveLength(10);
    expect(resolveG3Params(1, DEFAULT_G3_OPTIONS)).toEqual({
      speedPctW: 15,
      sizePct: 22,
      count: 1,
      decoys: 0,
      erratic: false,
      burst: false,
    });
    expect(resolveG3Params(5, DEFAULT_G3_OPTIONS)).toMatchObject({
      speedPctW: 35,
      count: 2,
      decoys: 1,
      erratic: false,
    });
    expect(resolveG3Params(8, DEFAULT_G3_OPTIONS)).toMatchObject({
      decoys: 2,
      erratic: true,
      burst: false,
    });
    expect(resolveG3Params(10, DEFAULT_G3_OPTIONS)).toMatchObject({
      speedPctW: 60,
      sizePct: 11,
      count: 4,
      decoys: 2,
      erratic: true,
      burst: true,
    });
  });

  it('Nhím chỉ xuất hiện từ cấp 5; độ khó tăng dần', () => {
    for (let l = 1; l <= 4; l++) expect(g3LevelRow(l).decoys).toBe(0);
    for (let l = 5; l <= 10; l++) expect(g3LevelRow(l).decoys).toBeGreaterThanOrEqual(1);
    for (let l = 2; l <= 10; l++) {
      expect(g3LevelRow(l).speedPctW).toBeGreaterThan(g3LevelRow(l - 1).speedPctW);
      expect(g3LevelRow(l).sizePct).toBeLessThan(g3LevelRow(l - 1).sizePct);
    }
  });

  it('tùy chọn tốc độ chỉ ghi đè tốc độ (cấp 2 / 5 / 8)', () => {
    const base = resolveG3Params(9, DEFAULT_G3_OPTIONS);
    const slow = resolveG3Params(9, { ...DEFAULT_G3_OPTIONS, speed: 'slow' });
    expect(slow.speedPctW).toBe(20);
    expect(resolveG3Params(9, { ...DEFAULT_G3_OPTIONS, speed: 'medium' }).speedPctW).toBe(35);
    expect(resolveG3Params(1, { ...DEFAULT_G3_OPTIONS, speed: 'fast' }).speedPctW).toBe(50);
    expect({ ...slow, speedPctW: 0 }).toEqual({ ...base, speedPctW: 0 });
  });

  it('tùy chọn Nhím: off = 0, on = ít nhất 1', () => {
    expect(resolveG3Params(9, { ...DEFAULT_G3_OPTIONS, decoys: 'off' }).decoys).toBe(0);
    expect(resolveG3Params(1, { ...DEFAULT_G3_OPTIONS, decoys: 'on' }).decoys).toBe(1);
    expect(resolveG3Params(9, { ...DEFAULT_G3_OPTIONS, decoys: 'on' }).decoys).toBe(2);
  });

  it('readG3Options bỏ giá trị lạ', () => {
    expect(readG3Options({ speed: 'fast', decoys: 'off' })).toEqual({
      speed: 'fast',
      decoys: 'off',
    });
    expect(readG3Options({ speed: 'x', decoys: 3 })).toEqual(DEFAULT_G3_OPTIONS);
    expect(readG3Options(undefined)).toEqual(DEFAULT_G3_OPTIONS);
  });
});

describe('kích thước và tốc độ', () => {
  it('kích thước theo % cạnh ngắn, tối thiểu 48px', () => {
    expect(petSize(1000, 700, 22)).toBe(154);
    expect(petSize(328, 600, 22)).toBe(72);
    expect(petSize(328, 600, 11)).toBe(MIN_SIZE_PX); // 36 → nâng lên 48
    expect(petSize(200, 200, 5)).toBe(MIN_SIZE_PX);
  });

  it('tốc độ = % chiều rộng mỗi giây', () => {
    expect(speedPx(1000, 15)).toBe(150);
    expect(speedPx(360, 60)).toBeCloseTo(216, 10);
  });
});

describe('chuyển động và va chạm mép', () => {
  const bounds: Bounds = { left: 0, top: 44, right: 400, bottom: 500 };
  const mk = (over: Partial<Mover> = {}): Mover => ({
    x: 200,
    y: 250,
    vx: 100,
    vy: 0,
    r: 30,
    ...over,
  });

  it('di chuyển đều theo thời gian', () => {
    const m = mk({ vx: 100, vy: 50 });
    const bounced = stepMover(m, 500, bounds, mulberry32(1));
    expect(bounced).toBe(false);
    expect(m.x).toBeCloseTo(250, 10);
    expect(m.y).toBeCloseTo(275, 10);
  });

  it('nảy khi chạm mép phải: kẹp vào khung và đổi chiều ra xa mép', () => {
    const m = mk({ x: 365, vx: 200, vy: 40 });
    expect(stepMover(m, 100, bounds, mulberry32(2))).toBe(true);
    expect(m.x).toBe(400 - 30);
    expect(m.vx).toBeLessThan(0);
  });

  it('nảy ở cả 4 mép và không bao giờ ra ngoài khung', () => {
    const rng = mulberry32(3);
    const m = mk({ x: 100, y: 100, vx: 230, vy: 170 });
    for (let i = 0; i < 20_000; i++) {
      stepMover(m, 16, bounds, rng);
      expect(m.x).toBeGreaterThanOrEqual(bounds.left + m.r - 1e-6);
      expect(m.x).toBeLessThanOrEqual(bounds.right - m.r + 1e-6);
      expect(m.y).toBeGreaterThanOrEqual(bounds.top + m.r - 1e-6);
      expect(m.y).toBeLessThanOrEqual(bounds.bottom - m.r + 1e-6);
    }
  });

  it('bảo toàn tốc độ sau khi nảy', () => {
    const rng = mulberry32(4);
    const m = mk({ x: 372, y: 250, vx: 180, vy: 90 });
    const before = speedOf(m);
    stepMover(m, 100, bounds, rng);
    expect(speedOf(m)).toBeCloseTo(before, 6);
  });

  it('bật khỏi mép với góc so với mép ≥ 20° (thú không kẹt ở góc hay trượt dọc mép)', () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 2000; i++) {
      // bay gần như song song mép phải rồi chạm mép
      const m = mk({ x: 369, y: 250, vx: 50, vy: 200 });
      stepMover(m, 100, bounds, rng);
      const s = speedOf(m);
      const angleFromWall = (Math.asin(Math.abs(m.vx) / s) * 180) / Math.PI;
      expect(angleFromWall).toBeGreaterThanOrEqual(MIN_BOUNCE_DEG - 1e-6);
    }
  });

  it('thú kẹt ở góc luôn thoát ra (cả 2 thành phần hướng vào trong)', () => {
    const rng = mulberry32(6);
    const m = mk({ x: 372, y: 468, vx: 150, vy: 150 }); // sát góc dưới-phải
    stepMover(m, 100, bounds, rng);
    expect(m.vx).toBeLessThan(0);
    expect(m.vy).toBeLessThan(0);
  });

  it('khung nhỏ hơn thú không gây lỗi', () => {
    const m = mk({ x: 50, y: 60, r: 80 });
    expect(() =>
      stepMover(m, 16, { left: 0, top: 0, right: 100, bottom: 100 }, mulberry32(1)),
    ).not.toThrow();
    expect(Number.isFinite(m.x)).toBe(true);
  });

  it('đổi hướng ngẫu nhiên giữ nguyên tốc độ', () => {
    const rng = mulberry32(7);
    const m = mk();
    setHeading(m, 0.5, 123);
    const headings = new Set<number>();
    for (let i = 0; i < 50; i++) {
      turnRandomly(m, rng);
      expect(speedOf(m)).toBeCloseTo(123, 6);
      headings.add(Math.round(Math.atan2(m.vy, m.vx) * 100));
    }
    expect(headings.size).toBeGreaterThan(30);
  });
});

describe('hit-test', () => {
  const t = (x: number, y: number, r = 30, active = true): Target => ({ x, y, r, active });

  it('trúng nếu cách tâm ≤ bán kính + 8px', () => {
    const ts = [t(100, 100)];
    expect(pickTarget(ts, 100, 100)).toBe(0);
    expect(pickTarget(ts, 100 + 30 + HIT_SLOP_PX, 100)).toBe(0);
    expect(pickTarget(ts, 100 + 30 + HIT_SLOP_PX + 1, 100)).toBe(-1);
  });

  it('nhiều vật cùng trúng → chọn vật gần tâm nhất', () => {
    const ts = [t(100, 100), t(130, 100)];
    expect(pickTarget(ts, 112, 100)).toBe(0);
    expect(pickTarget(ts, 120, 100)).toBe(1);
  });

  it('bỏ qua vật không còn nhận chạm', () => {
    expect(pickTarget([t(100, 100, 30, false), t(110, 100)], 100, 100)).toBe(1);
    expect(pickTarget([t(100, 100, 30, false)], 100, 100)).toBe(-1);
  });
});

describe('vị trí xuất hiện', () => {
  const b: Bounds = { left: 0, top: 44, right: 400, bottom: 600 };

  it('luôn nằm trong khung và tái lập theo seed', () => {
    const a = mulberry32(8);
    const c = mulberry32(8);
    for (let i = 0; i < 300; i++) {
      const p = spawnPosition(a, b, 30, [{ x: 200, y: 300 }], 90);
      expect(p).toEqual(spawnPosition(c, b, 30, [{ x: 200, y: 300 }], 90));
      expect(p.x).toBeGreaterThanOrEqual(30);
      expect(p.x).toBeLessThanOrEqual(370);
      expect(p.y).toBeGreaterThanOrEqual(74);
      expect(p.y).toBeLessThanOrEqual(570);
    }
  });

  it('tránh vị trí các vật khác khi còn chỗ', () => {
    const rng = mulberry32(9);
    let close = 0;
    for (let i = 0; i < 300; i++) {
      const p = spawnPosition(rng, b, 30, [{ x: 200, y: 300 }], 100);
      if (Math.hypot(p.x - 200, p.y - 300) < 100) close++;
    }
    expect(close).toBe(0);
  });
});

describe('chấm điểm', () => {
  it('targetHits = 20 + 2 × cấp', () => {
    expect(targetHits(1)).toBe(22);
    expect(targetHits(10)).toBe(40);
  });

  it('score = 0,6 × accuracy + 0,4 × min(1, hits/targetHits)', () => {
    const s = { hits: 20, emptyTaps: 3, decoyTaps: 2 };
    const acc = 20 / 25;
    expect(accuracyOf(s)).toBeCloseTo(acc, 10);
    expect(scoreFromStats(s, 5)).toBeCloseTo(0.6 * acc + 0.4 * Math.min(1, 20 / 30), 10);
  });

  it('chơi hoàn hảo = 1; không chạm gì = 0', () => {
    expect(scoreFromStats({ hits: 22, emptyTaps: 0, decoyTaps: 0 }, 1)).toBe(1);
    expect(scoreFromStats({ hits: 99, emptyTaps: 0, decoyTaps: 0 }, 1)).toBe(1);
    expect(scoreFromStats({ hits: 0, emptyTaps: 0, decoyTaps: 0 }, 3)).toBe(0);
  });

  it('chạm Nhím giống chạm trượt: làm giảm accuracy (TC-013)', () => {
    const a = scoreFromStats({ hits: 10, emptyTaps: 0, decoyTaps: 0 }, 5);
    const b = scoreFromStats({ hits: 10, emptyTaps: 0, decoyTaps: 5 }, 5);
    expect(b).toBeLessThan(a);
  });

  it('bấm bừa 100 lần không cho score > 0,5 (R04)', () => {
    // Mô phỏng: 3 thú, mỗi thú diện tích trúng ≈ π(r+8)² trong khung 328×556 → xác suất trúng ≈ 5%
    const rng = mulberry32(10);
    const w = 328;
    const h = 556;
    const pets: Target[] = [
      { x: 90, y: 150, r: 28, active: true },
      { x: 240, y: 300, r: 28, active: true },
      { x: 150, y: 480, r: 28, active: true },
    ];
    for (const level of [1, 5, 10]) {
      for (let run = 0; run < 50; run++) {
        const stats = { hits: 0, emptyTaps: 0, decoyTaps: 0 };
        for (let i = 0; i < 100; i++) {
          if (pickTarget(pets, rng() * w, 44 + rng() * h) >= 0) stats.hits++;
          else stats.emptyTaps++;
        }
        expect(scoreFromStats(stats, level)).toBeLessThan(0.5);
      }
    }
  });

  it('metrics có đủ khóa và hitsPerMin đúng', () => {
    const m = buildMetrics({ hits: 30, emptyTaps: 5, decoyTaps: 5 }, 60_000);
    expect(Object.keys(m).sort()).toEqual([
      'accuracy',
      'decoyTaps',
      'emptyTaps',
      'hits',
      'hitsPerMin',
    ]);
    expect(m.hitsPerMin).toBe(30);
    expect(m.accuracy).toBe(0.75);
    expect(buildMetrics({ hits: 0, emptyTaps: 0, decoyTaps: 0 }, 0).hitsPerMin).toBe(0);
  });
});
