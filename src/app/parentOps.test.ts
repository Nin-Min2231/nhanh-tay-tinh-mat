import { describe, expect, it } from 'vitest';
import { levelsConfig } from '../games/levels';
import { dayAllowanceMs, dayRemainingMs, isOutOfTime } from './session';
import {
  BONUS_MINUTES,
  REWARD_LOG_MAX,
  clampDailyMinutes,
  clampMaxBoxes,
  deleteConfirmed,
  giveBonusTime,
  giveBoxes,
  patchGameSettings,
  removeProfileFromState,
  setGameOption,
  setGrade,
  setLimits,
  toggleMathTopic,
} from './parentOps';
import { createGameProgress, createProfile } from './profile';
import { defaultState } from './storage';

const now = new Date('2026-10-11T08:00:00');
const KEY = '2026-10-11';
const mk = (name = 'An', grade: 1 | 2 | 3 = 2) =>
  createProfile({ name, avatarId: 'cat', grade }, `id-${name}`, now);

describe('thưởng: thêm giờ (TC-023)', () => {
  it('hết giờ → +10 phút → còn đúng 10 phút và được chơi lại', () => {
    let p = mk();
    p = { ...p, days: { [KEY]: { ...(p.days[KEY] ?? emptyDay()), playMs: 15 * 60_000 } } };
    expect(isOutOfTime(p, KEY)).toBe(true);
    p = giveBonusTime(p, KEY, 10, 'goodStudy', now);
    expect(isOutOfTime(p, KEY)).toBe(false);
    expect(dayRemainingMs(p, KEY)).toBe(10 * 60_000);
    expect(dayAllowanceMs(p, KEY)).toBe(25 * 60_000);
  });

  it('+5 +10 +15 cộng dồn; mỗi lần ghi vào nhật ký kèm lý do', () => {
    let p = mk();
    for (const m of BONUS_MINUTES) p = giveBonusTime(p, KEY, m, 'chores', now);
    expect(p.days[KEY]!.bonusMs).toBe(30 * 60_000);
    expect(p.rewardLog.map((e) => [e.kind, e.amount, e.reason])).toEqual([
      ['time', 5, 'chores'],
      ['time', 10, 'chores'],
      ['time', 15, 'chores'],
    ]);
  });

  it('số phút không hợp lệ → không đổi gì', () => {
    const p = mk();
    expect(giveBonusTime(p, KEY, 0, 'other', now)).toBe(p);
    expect(giveBonusTime(p, KEY, -5, 'other', now)).toBe(p);
  });

  it('nhật ký giữ tối đa 50 mục mới nhất', () => {
    let p = mk();
    for (let i = 0; i < REWARD_LOG_MAX + 7; i++)
      p = giveBonusTime(p, KEY, 5, 'other', new Date(2026, 9, 11, 8, i));
    expect(p.rewardLog).toHaveLength(REWARD_LOG_MAX);
    expect(p.rewardLog.at(-1)!.at).toBe(new Date(2026, 9, 11, 8, REWARD_LOG_MAX + 6).toISOString());
  });
});

describe('thưởng: tặng hộp quà', () => {
  it('thêm hộp đang chờ, không tính vào giới hạn hộp/ngày, ghi lý do', () => {
    let p = mk();
    p = giveBoxes(p, 2, 'wellBehaved', now);
    expect(p.boxes.pending).toBe(2);
    expect(p.days[KEY]?.boxesEarned ?? 0).toBe(0);
    expect(p.rewardLog[0]).toMatchObject({ kind: 'box', amount: 2, reason: 'wellBehaved' });
    expect(giveBoxes(p, 0, 'other', now)).toBe(p);
  });
});

describe('giới hạn (F07)', () => {
  it('thời gian/ngày kẹp trong 5–60 phút, hộp/ngày trong 0–5', () => {
    const [lo, hi] = levelsConfig.session.dailyMinutesRange;
    expect(clampDailyMinutes(1)).toBe(lo);
    expect(clampDailyMinutes(999)).toBe(hi);
    expect(clampDailyMinutes(22.6)).toBe(23);
    expect(clampMaxBoxes(-3)).toBe(0);
    expect(clampMaxBoxes(9)).toBe(5);
    const p = setLimits(mk(), { dailyMinutes: 45, maxBoxesPerDay: 0 });
    expect(p.limits).toEqual({ dailyMinutes: 45, maxBoxesPerDay: 0 });
    expect(setLimits(p, { maxBoxesPerDay: 4 }).limits.dailyMinutes).toBe(45);
  });
});

describe('độ khó từng game (F11, TC-015)', () => {
  it('chế độ Cố định giữ nguyên cấp chọn', () => {
    const g = patchGameSettings(createGameProgress(), { mode: 'fixed', level: 5 });
    expect(g).toMatchObject({ mode: 'fixed', level: 5 });
  });

  it('chế độ Tự động: cả 4 sổ cấp bị kẹp trong [min, max] (sổ bị kẹp thì sao về 0)', () => {
    const start = createGameProgress();
    start.tracks.easy = { level: 2, stars: 3, recent: [3] };
    start.tracks.hard = { level: 9, stars: 2, recent: [2] };
    const g = patchGameSettings(start, { minLevel: 3, maxLevel: 6 });
    expect(g.tracks.auto).toEqual({ level: 3, stars: 0, recent: [] }); // cấp 1 < min → nâng lên 3
    expect(g.tracks.normal.level).toBe(3);
    expect(g.tracks.easy).toEqual({ level: 3, stars: 0, recent: [] }); // cấp 2 < min
    expect(g.tracks.hard).toEqual({ level: 6, stars: 0, recent: [] }); // cấp 9 > max
  });

  it('sổ cấp nằm trong khoảng thì giữ nguyên cấp và sao; đổi khoảng chỉ xóa lịch sử lượt gần đây', () => {
    const start = createGameProgress();
    start.tracks.auto = { level: 5, stars: 2, recent: [2, 3] };
    const g = patchGameSettings(start, { minLevel: 2, maxLevel: 8 });
    expect(g.tracks.auto).toEqual({ level: 5, stars: 2, recent: [] });
  });

  it('đổi Tự động → Cố định mà chưa chọn cấp: bắt đầu từ cấp của sổ “Tự động”, các sổ cấp vẫn giữ', () => {
    const start = createGameProgress();
    start.tracks.auto = { level: 4, stars: 1, recent: [1] };
    start.tracks.easy = { level: 3, stars: 0, recent: [] };
    const g = patchGameSettings(start, { mode: 'fixed' });
    expect(g).toMatchObject({ mode: 'fixed', level: 4 });
    expect(g.tracks.easy.level).toBe(3); // không mất tiến độ khi quay lại Tự động
    expect(g.tracks.auto.level).toBe(4);
    // chọn cấp cố định rõ ràng thì dùng cấp đó
    expect(patchGameSettings(start, { mode: 'fixed', level: 7 }).level).toBe(7);
  });

  it('min > max → kéo đầu còn lại theo đầu vừa đổi', () => {
    const base = patchGameSettings(createGameProgress(), { minLevel: 2, maxLevel: 5 });
    const raiseMin = patchGameSettings(base, { minLevel: 8 });
    expect([raiseMin.minLevel, raiseMin.maxLevel]).toEqual([8, 8]);
    const lowerMax = patchGameSettings(base, { maxLevel: 1 });
    expect([lowerMax.minLevel, lowerMax.maxLevel]).toEqual([1, 1]);
  });

  it('giá trị ngoài 1–10 bị kẹp; đổi chế độ/cấp thì xóa lịch sử lượt gần đây của mọi sổ', () => {
    const g0 = createGameProgress();
    g0.tracks.auto = { level: 1, stars: 3, recent: [3] };
    g0.tracks.easy = { level: 1, stars: 1, recent: [1, 1] };
    expect(patchGameSettings(g0, { mode: 'fixed', level: 99 }).level).toBe(10);
    const changed = patchGameSettings(g0, { mode: 'fixed' });
    expect(changed.tracks.auto.recent).toEqual([]);
    expect(changed.tracks.easy.recent).toEqual([]);
    const same = patchGameSettings(g0, {}); // không đổi gì → giữ
    expect(same.tracks.auto.recent).toEqual([3]);
    expect(same.tracks.easy.recent).toEqual([1, 1]);
  });

  it('tùy chọn riêng: “tự động” xóa khóa; mảng rỗng xóa khóa', () => {
    let g = setGameOption(createGameProgress(), 'colors', 4);
    expect(g.options).toEqual({ colors: 4 });
    g = setGameOption(g, 'timer', 'off');
    g = setGameOption(g, 'colors', 'auto');
    expect(g.options).toEqual({ timer: 'off' });
    g = setGameOption(g, 'groups', ['shapes']);
    expect(g.options.groups).toEqual(['shapes']);
    g = setGameOption(g, 'groups', []);
    expect(g.options).toEqual({ timer: 'off' });
  });
});

describe('toán G6 (F17)', () => {
  it('đổi lớp → chủ đề về mặc định của lớp mới', () => {
    const p = setGrade(mk('An', 2), 3);
    expect(p.grade).toBe(3);
    expect(p.math.topics).toEqual(levelsConfig.mathDefaultByGrade['3']);
    const same = mk('An', 2);
    expect(setGrade(same, 2)).toBe(same);
  });

  it('bật/tắt chủ đề, giữ thứ tự M01…M14; không cho tắt hết', () => {
    let p = mk('An', 2); // M02 M05 M06 M07 M08
    p = toggleMathTopic(p, 'M01');
    expect(p.math.topics[0]).toBe('M01');
    p = toggleMathTopic(p, 'M05');
    expect(p.math.topics).not.toContain('M05');
    for (const t of [...p.math.topics]) p = toggleMathTopic(p, t);
    expect(p.math.topics).toEqual(levelsConfig.mathDefaultByGrade['2']);
  });
});

describe('hồ sơ (F02)', () => {
  it('xóa hồ sơ đang chơi → chuyển sang hồ sơ còn lại; xóa hết → null', () => {
    const s = defaultState();
    s.profiles = [mk('An'), mk('Bình')];
    s.activeProfileId = 'id-An';
    const s1 = removeProfileFromState(s, 'id-An');
    expect(s1.profiles.map((p) => p.name)).toEqual(['Bình']);
    expect(s1.activeProfileId).toBe('id-Bình');
    const s2 = removeProfileFromState(s1, 'id-Bình');
    expect(s2.activeProfileId).toBeNull();
    // xóa hồ sơ khác không đổi người đang chơi
    expect(removeProfileFromState(s, 'id-Bình').activeProfileId).toBe('id-An');
  });

  it('xác nhận 2 bước: phải gõ đúng tên (không phân biệt hoa/thường, bỏ khoảng trắng đầu cuối)', () => {
    const p = mk('Bình');
    expect(deleteConfirmed(p, ' bình ')).toBe(true);
    expect(deleteConfirmed(p, 'Bìn')).toBe(false);
    expect(deleteConfirmed(p, '')).toBe(false);
  });
});

function emptyDay() {
  return {
    playMs: 0,
    bonusMs: 0,
    missions: { reflex: false, focus: false, learn: false, rewarded: false },
    boxesEarned: 0,
    starsToday: 0,
    restOnTimeRewarded: false,
  };
}
