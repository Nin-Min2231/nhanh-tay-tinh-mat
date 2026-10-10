import { describe, expect, it } from 'vitest';
import { mulberry32, seedFromString, randInt } from './rng';
import { deviceClassFromScreen, generateId, isWindowTooSmall } from './device';
import { parseRoute, routePath } from './routes';
import { createGameProgress, createProfile, dateKey, isValidProfileName } from './profile';
import type { GameProgress } from './types';
import { levelForRound } from './adaptive';
import { starsForScore } from './scoring';

describe('rng', () => {
  it('cùng seed → cùng dãy; khác seed → khác dãy', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const c = mulberry32(43);
    const sa = Array.from({ length: 5 }, a);
    expect(Array.from({ length: 5 }, b)).toEqual(sa);
    expect(Array.from({ length: 5 }, c)).not.toEqual(sa);
  });

  it('giá trị nằm trong [0, 1) và phân bố tương đối đều', () => {
    const r = mulberry32(7);
    let sum = 0;
    for (let i = 0; i < 10_000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      sum += v;
    }
    expect(sum / 10_000).toBeGreaterThan(0.48);
    expect(sum / 10_000).toBeLessThan(0.52);
  });

  it('randInt nằm trong khoảng; seedFromString ổn định', () => {
    const r = mulberry32(1);
    for (let i = 0; i < 500; i++) {
      const v = randInt(r, 3, 6);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
    }
    expect(seedFromString('abc')).toBe(seedFromString('abc'));
    expect(seedFromString('abc')).not.toBe(seedFromString('abd'));
  });
});

describe('device', () => {
  it('deviceClass theo cạnh ngắn của MÀN HÌNH', () => {
    expect(deviceClassFromScreen(360, 740)).toBe('phone');
    expect(deviceClassFromScreen(740, 360)).toBe('phone');
    expect(deviceClassFromScreen(1280, 800)).toBe('tablet');
    expect(deviceClassFromScreen(800, 1280)).toBe('tablet');
    expect(deviceClassFromScreen(600, 960)).toBe('tablet');
    expect(deviceClassFromScreen(599, 960)).toBe('phone');
  });

  it('cửa sổ quá nhỏ: tablet theo SPEC 12b, điện thoại không chặn xoay ngang', () => {
    expect(isWindowTooSmall(359, 800, 'tablet')).toBe(true);
    expect(isWindowTooSmall(800, 479, 'tablet')).toBe(true);
    expect(isWindowTooSmall(1280, 800, 'tablet')).toBe(false);
    expect(isWindowTooSmall(740, 360, 'phone')).toBe(false);
    expect(isWindowTooSmall(360, 740, 'phone')).toBe(false);
    expect(isWindowTooSmall(280, 740, 'phone')).toBe(true);
  });

  it('generateId trả về chuỗi khác nhau', () => {
    expect(generateId()).not.toBe(generateId());
  });
});

describe('routes', () => {
  it('phân tích hash', () => {
    expect(parseRoute('')).toEqual({ name: 'home' });
    expect(parseRoute('#/home')).toEqual({ name: 'home' });
    expect(parseRoute('#/profiles')).toEqual({ name: 'profiles' });
    expect(parseRoute('#/profiles/new')).toEqual({ name: 'profile-new' });
    expect(parseRoute('#/play/G1/intro')).toEqual({ name: 'intro', gameId: 'G1' });
    expect(parseRoute('#/play/G0')).toEqual({ name: 'play', gameId: 'G0' });
    expect(parseRoute('#/play/G9')).toEqual({ name: 'not-found' });
    expect(parseRoute('#/parent/settings')).toEqual({ name: 'parent', tab: 'settings' });
    expect(parseRoute('#/khong-co')).toEqual({ name: 'not-found' });
  });

  it('routePath ngược với parseRoute', () => {
    for (const p of [
      '/profiles',
      '/profiles/new',
      '/home',
      '/play/G3/intro',
      '/play/G7',
      '/result',
      '/rest',
      '/album',
      '/parent-gate',
      '/parent/data',
    ]) {
      expect(routePath(parseRoute(`#${p}`))).toBe(p);
    }
  });
});

describe('profile', () => {
  it('tạo hồ sơ với mặc định theo SPEC', () => {
    const p = createProfile(
      { name: '  Bé Na  ', avatarId: 'a3', grade: 2 },
      'id1',
      new Date('2026-10-10T08:00:00Z'),
    );
    expect(p.name).toBe('Bé Na');
    expect(p.limits).toEqual({ dailyMinutes: 15, maxBoxesPerDay: 3 });
    expect(p.totalStars).toBe(0);
    expect(Object.keys(p.games)).toEqual(['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']);
    expect(p.games.G1).toMatchObject({ mode: 'auto', level: 1, minLevel: 1, maxLevel: 10 });
    expect(p.math.topics).toEqual(['M02', 'M05', 'M06', 'M07', 'M08']);
  });

  it('tên hợp lệ: 1–12 ký tự sau khi cắt khoảng trắng', () => {
    expect(isValidProfileName('')).toBe(false);
    expect(isValidProfileName('   ')).toBe(false);
    expect(isValidProfileName('An')).toBe(true);
    expect(isValidProfileName('x'.repeat(12))).toBe(true);
    expect(isValidProfileName('x'.repeat(13))).toBe(false);
  });

  it('dateKey theo giờ địa phương', () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(dateKey(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31');
  });
});

describe('levelForRound / starsForScore (bản tối thiểu của TASK-02)', () => {
  const g: GameProgress = { ...createGameProgress(), level: 5 };

  it('Dễ −2, Khó +2, Vừa/Tự động giữ nguyên, Cố định không đổi', () => {
    expect(levelForRound(g, 'easy')).toBe(3);
    expect(levelForRound(g, 'hard')).toBe(7);
    expect(levelForRound(g, 'normal')).toBe(5);
    expect(levelForRound(g, 'auto')).toBe(5);
    expect(levelForRound({ ...g, mode: 'fixed' }, 'hard')).toBe(5);
    expect(levelForRound({ ...g, level: 1 }, 'easy')).toBe(1);
    expect(levelForRound({ ...g, level: 10 }, 'hard')).toBe(10);
  });

  it('ngưỡng sao 0,70 / 0,90 và luôn ≥ 1', () => {
    expect(starsForScore(0)).toBe(1);
    expect(starsForScore(0.69)).toBe(1);
    expect(starsForScore(0.7)).toBe(2);
    expect(starsForScore(0.89)).toBe(2);
    expect(starsForScore(0.9)).toBe(3);
    expect(starsForScore(1)).toBe(3);
  });
});
