import { describe, expect, it } from 'vitest';
import { GAME_GROUPS } from '../games/registry';
import { levelsConfig } from '../games/levels';
import { createProfile, emptyDay } from './profile';
import {
  BOX_EVERY_STARS,
  DUPLICATE_STARS,
  MISSION_GROUPS,
  PITY_AFTER,
  REST_ON_TIME_STARS,
  STICKERS,
  UNLOCKS,
  activeMascot,
  activeSoundSet,
  addStars,
  applyRoundRewards,
  boxRoomToday,
  canEquip,
  claimRestReward,
  grantParentBoxes,
  missionGroupOf,
  missionsDone,
  nextUnlock,
  openBox,
  ownedStickerCount,
  rollRarity,
  starsToNextBox,
  syncUnlocks,
  unlockById,
  type Rarity,
} from './rewards';
import { mulberry32 } from './rng';
import type { Profile } from './types';

const KEY = '2026-10-10';

function profile(patch: Partial<Profile> = {}): Profile {
  return {
    ...createProfile({ name: 'An', avatarId: 'cat', grade: 2 }, 'p1', new Date()),
    ...patch,
  };
}
function day(p: Profile, key = KEY) {
  return p.days[key] ?? emptyDay();
}

describe('danh mục sticker + mốc mở khóa', () => {
  it('đúng 40 sticker stk-01…stk-40, khóa duy nhất', () => {
    expect(STICKERS).toHaveLength(40);
    expect(STICKERS[0]?.id).toBe('stk-01');
    expect(STICKERS[39]?.id).toBe('stk-40');
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(40);
  });

  it('số lượng theo độ hiếm khớp levels.json (24 / 12 / 4)', () => {
    const count = (r: Rarity) => STICKERS.filter((s) => s.rarity === r).length;
    expect(count('common')).toBe(levelsConfig.rewards.stickers.common);
    expect(count('rare')).toBe(levelsConfig.rewards.stickers.rare);
    expect(count('legendary')).toBe(levelsConfig.rewards.stickers.legendary);
    for (const theme of ['animal', 'fruit', 'space', 'vehicle'] as const) {
      expect(STICKERS.filter((s) => s.theme === theme)).toHaveLength(10);
    }
  });

  it('8 mốc mở khóa lấy từ levels.json, tăng dần', () => {
    expect(UNLOCKS).toHaveLength(levelsConfig.unlocks.length);
    expect(UNLOCKS.map((u) => u.stars)).toEqual([10, 25, 50, 80, 120, 170, 230, 300]);
    expect(UNLOCKS.map((u) => u.stars)).toEqual(
      [...UNLOCKS.map((u) => u.stars)].sort((a, b) => a - b),
    );
    expect(new Set(UNLOCKS.map((u) => u.id)).size).toBe(UNLOCKS.length);
  });

  it('nhóm nhiệm vụ của game khớp GAME_GROUPS trong registry', () => {
    for (const { group, games } of GAME_GROUPS) {
      for (const g of games) expect(missionGroupOf(g)).toBe(group);
    }
  });

  it('hằng số khớp levels.json', () => {
    expect(BOX_EVERY_STARS).toBe(15);
    expect(PITY_AFTER).toBe(5);
    expect(DUPLICATE_STARS).toBe(3);
    expect(REST_ON_TIME_STARS).toBe(2);
  });
});

describe('nhiệm vụ 3 nhóm/ngày (F13)', () => {
  it('mỗi nhóm đánh dấu một lần; xong đủ 3 nhóm → đúng 1 hộp', () => {
    let p = profile();
    const r1 = applyRoundRewards(p, 'reflex', 1, KEY);
    p = r1.profile;
    expect(r1.rewards).toMatchObject({ newMission: true, missionsDone: 1, missionBox: false });
    expect(p.boxes.pending).toBe(0);

    // chơi thêm lượt cùng nhóm: không đánh dấu lại
    const again = applyRoundRewards(p, 'reflex', 1, KEY);
    expect(again.rewards.newMission).toBe(false);
    p = again.profile;

    p = applyRoundRewards(p, 'focus', 1, KEY).profile;
    const r3 = applyRoundRewards(p, 'learn', 1, KEY);
    p = r3.profile;
    expect(r3.rewards).toMatchObject({ newMission: true, missionsDone: 3, missionBox: true });
    expect(r3.rewards.boxesGained).toBe(1);
    expect(p.boxes.pending).toBe(1);
    expect(day(p).missions).toEqual({ reflex: true, focus: true, learn: true, rewarded: true });
    expect(day(p).boxesEarned).toBe(1);

    // sau khi đã thưởng: chơi tiếp nhóm nào cũng không thêm hộp nhiệm vụ
    const more = applyRoundRewards(p, 'learn', 1, KEY);
    expect(more.rewards.missionBox).toBe(false);
    expect(more.profile.boxes.pending).toBe(1);
  });

  it('nhiệm vụ tính riêng từng ngày', () => {
    let p = profile();
    p = applyRoundRewards(p, 'reflex', 1, '2026-10-10').profile;
    p = applyRoundRewards(p, 'focus', 1, '2026-10-10').profile;
    expect(missionsDone(day(p, '2026-10-10'))).toBe(2);
    expect(missionsDone(day(p, '2026-10-11'))).toBe(0);
    const next = applyRoundRewards(p, 'learn', 1, '2026-10-11');
    expect(next.rewards.missionsDone).toBe(1);
    expect(next.rewards.missionBox).toBe(false);
  });

  it('TC-021: chơi G1 + G2 + G6 (đúng 3 nhóm) → 3 ô xong + 1 hộp', () => {
    let p = profile();
    for (const g of ['G1', 'G2', 'G6'] as const) {
      p = applyRoundRewards(p, missionGroupOf(g), 1, KEY).profile;
    }
    expect(MISSION_GROUPS.every((g) => day(p).missions[g])).toBe(true);
    expect(p.boxes.pending).toBe(1);
  });
});

describe('hộp theo sao + giới hạn hộp/ngày (F14)', () => {
  it('mỗi lần vượt bội số 15 sao → 1 hộp; sao không bao giờ giảm', () => {
    let p = profile({ totalStars: 13 });
    const a = addStars(p, 1, KEY);
    expect(a.boxesGained).toBe(0);
    p = a.profile;
    const b = addStars(p, 2, KEY); // 14 → 16: vượt 15
    expect(b.boxesGained).toBe(1);
    expect(b.profile.totalStars).toBe(16);
    expect(b.profile.boxes.pending).toBe(1);
    expect(day(b.profile).starsToday).toBe(3);
    const c = addStars(b.profile, 3, KEY); // 16 → 19: chưa tới 30
    expect(c.boxesGained).toBe(0);
    expect(c.profile.totalStars).toBeGreaterThanOrEqual(b.profile.totalStars);
  });

  it('đúng bội số 15 cũng tính (14 → 15)', () => {
    const r = addStars(profile({ totalStars: 14 }), 1, KEY);
    expect(r.boxesGained).toBe(1);
  });

  it('cộng 0 hoặc số âm không đổi gì (sao không giảm)', () => {
    const p = profile({ totalStars: 20 });
    expect(addStars(p, 0, KEY).profile).toBe(p);
    expect(addStars(p, -5, KEY).profile).toBe(p);
  });

  it('TC-022: đã nhận 3 hộp trong ngày → vượt 15 sao không nhận thêm, báo “hết giờ nhận”', () => {
    let p = profile({ totalStars: 14 });
    p = { ...p, days: { [KEY]: { ...emptyDay(), boxesEarned: 3 } } };
    const r = addStars(p, 1, KEY); // 14 → 15
    expect(r.boxesGained).toBe(0);
    expect(r.boxesBlocked).toBe(1);
    expect(r.profile.boxes.pending).toBe(0);
    expect(day(r.profile).boxesEarned).toBe(3);
    expect(r.profile.totalStars).toBe(15); // sao vẫn được cộng
  });

  it('hộp nhiệm vụ cũng tính vào giới hạn; giới hạn 0 → không có hộp nào', () => {
    let p = profile();
    p = { ...p, limits: { ...p.limits, maxBoxesPerDay: 0 } };
    for (const g of MISSION_GROUPS) p = applyRoundRewards(p, g, 1, KEY).profile;
    expect(p.boxes.pending).toBe(0);
    expect(day(p).missions.rewarded).toBe(true);

    let q = profile({ totalStars: 14 });
    q = { ...q, days: { [KEY]: { ...emptyDay(), boxesEarned: 2 } } };
    for (const g of MISSION_GROUPS.slice(0, 2)) q = applyRoundRewards(q, g, 0, KEY).profile;
    const last = applyRoundRewards(q, 'learn', 1, KEY); // hộp nhiệm vụ (3/3) rồi 14 → 15 vượt tiếp
    expect(last.rewards.boxesGained).toBe(1);
    expect(last.rewards.boxesBlocked).toBe(1);
    expect(day(last.profile).boxesEarned).toBe(3);
  });

  it('giới hạn tuỳ chỉnh 5 hộp/ngày', () => {
    let p = profile({ totalStars: 0 });
    p = { ...p, limits: { ...p.limits, maxBoxesPerDay: 5 } };
    for (let i = 0; i < 6; i++) p = addStars(p, BOX_EVERY_STARS, KEY).profile;
    expect(p.boxes.pending).toBe(5);
    expect(boxRoomToday(p, KEY)).toBe(0);
    expect(boxRoomToday(p, '2026-10-11')).toBe(5);
  });

  it('sang ngày mới được nhận hộp lại', () => {
    let p = profile({ totalStars: 14 });
    p = { ...p, days: { [KEY]: { ...emptyDay(), boxesEarned: 3 } } };
    const next = addStars(p, 1, '2026-10-11');
    expect(next.boxesGained).toBe(1);
  });

  it('hộp phụ huynh tặng không tính vào giới hạn ngày', () => {
    let p = profile();
    p = { ...p, days: { [KEY]: { ...emptyDay(), boxesEarned: 3 } } };
    const g = grantParentBoxes(p, 2);
    expect(g.boxes.pending).toBe(2);
    expect(day(g).boxesEarned).toBe(3);
    expect(grantParentBoxes(p, 0)).toBe(p);
  });

  it('starsToNextBox', () => {
    expect(starsToNextBox(profile({ totalStars: 0 }))).toBe(15);
    expect(starsToNextBox(profile({ totalStars: 14 }))).toBe(1);
    expect(starsToNextBox(profile({ totalStars: 15 }))).toBe(15);
  });
});

describe('mở hộp: độ hiếm, bảo đảm, trùng', () => {
  it('mở hộp: pending −1, openedTotal +1, sticker được lưu', () => {
    const p = profile({ boxes: { pending: 2, openedTotal: 0, sinceLastRare: 0 } });
    const r = openBox(p, mulberry32(1), KEY)!;
    expect(r.profile.boxes.pending).toBe(1);
    expect(r.profile.boxes.openedTotal).toBe(1);
    expect(r.profile.stickers[r.sticker.id]).toBe(1);
    expect(r.isNew).toBe(true);
    expect(r.count).toBe(1);
    expect(r.duplicateStars).toBe(0);
    expect(r.profile.totalStars).toBe(0);
  });

  it('không có hộp → null', () => {
    expect(openBox(profile(), mulberry32(1), KEY)).toBeNull();
  });

  it('cùng seed → cùng kết quả (RNG có seed)', () => {
    const p = profile({ boxes: { pending: 5, openedTotal: 0, sinceLastRare: 0 } });
    const seq = (seed: number) => {
      const rng = mulberry32(seed);
      let cur = p;
      const ids: string[] = [];
      for (let i = 0; i < 5; i++) {
        const o = openBox(cur, rng, KEY)!;
        ids.push(o.sticker.id);
        cur = o.profile;
      }
      return ids;
    };
    expect(seq(9)).toEqual(seq(9));
    expect(seq(9)).not.toEqual(seq(10));
  });

  it('trùng sticker: +3 sao, tăng số lượng “×2”, không phải mới', () => {
    const first = openBox(
      profile({ boxes: { pending: 1, openedTotal: 0, sinceLastRare: 0 } }),
      mulberry32(5),
      KEY,
    )!;
    // mở lại bằng cùng seed → cùng sticker; hồ sơ đã có 1 cái
    const again = openBox(
      { ...first.profile, boxes: { ...first.profile.boxes, pending: 1 } },
      mulberry32(5),
      KEY,
    )!;
    expect(again.sticker.id).toBe(first.sticker.id);
    expect(again.isNew).toBe(false);
    expect(again.count).toBe(2);
    expect(again.duplicateStars).toBe(3);
    expect(again.profile.stickers[first.sticker.id]).toBe(2);
    expect(again.profile.totalStars).toBe(3);
    expect(day(again.profile).starsToday).toBe(3);
  });

  it('sao trùng vượt bội số 15 → có thể sinh thêm hộp (theo giới hạn ngày)', () => {
    const all = Object.fromEntries(STICKERS.map((s) => [s.id, 1]));
    let p = profile({
      totalStars: 13,
      stickers: all,
      boxes: { pending: 1, openedTotal: 0, sinceLastRare: 0 },
    });
    const r = openBox(p, mulberry32(3), KEY)!; // chắc chắn trùng → 13 + 3 = 16
    expect(r.profile.totalStars).toBe(16);
    expect(r.boxesGained).toBe(1);
    expect(r.profile.boxes.pending).toBe(1); // 1 − 1 + 1

    p = {
      ...p,
      days: { [KEY]: { ...emptyDay(), boxesEarned: 3 } },
    };
    const blocked = openBox(p, mulberry32(3), KEY)!;
    expect(blocked.boxesGained).toBe(0);
    expect(blocked.boxesBlocked).toBe(1);
  });

  it('bảo đảm: sau 5 hộp không có Hiếm, hộp kế tiếp tối thiểu Hiếm', () => {
    for (let seed = 1; seed <= 400; seed++) {
      const p = profile({ boxes: { pending: 1, openedTotal: 5, sinceLastRare: PITY_AFTER } });
      const o = openBox(p, mulberry32(seed), KEY)!;
      expect(o.sticker.rarity).not.toBe('common');
      expect(o.profile.boxes.sinceLastRare).toBe(0);
    }
  });

  it('sinceLastRare tăng khi ra Thường, về 0 khi ra Hiếm/Siêu hiếm', () => {
    let p = profile({ boxes: { pending: 200, openedTotal: 0, sinceLastRare: 0 } });
    const rng = mulberry32(77);
    let prev = 0;
    for (let i = 0; i < 200; i++) {
      const o = openBox(p, rng, KEY)!;
      const s = o.profile.boxes.sinceLastRare;
      expect(s).toBe(o.sticker.rarity === 'common' ? prev + 1 : 0);
      expect(s).toBeLessThanOrEqual(PITY_AFTER); // luôn bị cắt ở ngưỡng bảo đảm
      prev = s;
      p = o.profile;
    }
  });

  it('chuỗi Thường liên tiếp không bao giờ vượt 5 (mô phỏng 10.000 hộp)', () => {
    let p = profile({ boxes: { pending: 10_000, openedTotal: 0, sinceLastRare: 0 } });
    const rng = mulberry32(2026);
    let run = 0;
    let maxRun = 0;
    for (let i = 0; i < 10_000; i++) {
      const o = openBox(p, rng, KEY)!;
      run = o.sticker.rarity === 'common' ? run + 1 : 0;
      maxRun = Math.max(maxRun, run);
      p = o.profile;
    }
    expect(maxRun).toBeLessThanOrEqual(PITY_AFTER);
  });

  it('lần tung gốc đúng 70/25/5 (±2%) trên 10.000 hộp', () => {
    const rng = mulberry32(12345);
    const n = 10_000;
    const c: Record<Rarity, number> = { common: 0, rare: 0, legendary: 0 };
    for (let i = 0; i < n; i++) c[rollRarity(rng, false)] += 1;
    expect(Math.abs(c.common / n - 0.7)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(c.rare / n - 0.25)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(c.legendary / n - 0.05)).toBeLessThanOrEqual(0.02);
  });

  it('tỷ lệ thật sau “bảo đảm Hiếm” khớp phân tích Markov (±2%) trên 10.000 hộp', () => {
    // Trạng thái k = số hộp Thường liên tiếp (0…PITY_AFTER). Từ k < PITY: Thường 0,7 → k+1; còn lại về 0.
    // Ở k = PITY: chắc chắn Hiếm/Siêu hiếm theo tỷ lệ 25 : 5.
    const { common, rare, legendary } = levelsConfig.rewards.rarity;
    const pi = [1];
    for (let k = 1; k <= PITY_AFTER; k++) pi.push((pi[k - 1] ?? 0) * common);
    const total = pi.reduce((a, b) => a + b, 0);
    const free = pi.slice(0, PITY_AFTER).reduce((a, b) => a + b, 0) / total; // xác suất ở trạng thái thường
    const atCap = (pi[PITY_AFTER] ?? 0) / total;
    const expected = {
      common: free * common,
      rare: free * rare + (atCap * rare) / (rare + legendary),
      legendary: free * legendary + (atCap * legendary) / (rare + legendary),
    };
    expect(expected.common + expected.rare + expected.legendary).toBeCloseTo(1, 6);

    let p = profile({ boxes: { pending: 10_000, openedTotal: 0, sinceLastRare: 0 } });
    const rng = mulberry32(20261010);
    const n = 10_000;
    const c: Record<Rarity, number> = { common: 0, rare: 0, legendary: 0 };
    for (let i = 0; i < n; i++) {
      const o = openBox(p, rng, KEY)!;
      c[o.sticker.rarity] += 1;
      p = o.profile;
    }
    for (const r of ['common', 'rare', 'legendary'] as const) {
      expect(Math.abs(c[r] / n - expected[r])).toBeLessThanOrEqual(0.02);
    }
    // “Bảo đảm” kéo tỷ lệ Thường xuống dưới 70% một chút (ghi nhận ở PROGRESS)
    expect(expected.common).toBeLessThan(0.7);
    expect(expected.common).toBeGreaterThan(0.6);
  });

  it('trong cùng độ hiếm, mọi sticker đều có cơ hội ra (chọn đều)', () => {
    let p = profile({ boxes: { pending: 10_000, openedTotal: 0, sinceLastRare: 0 } });
    const rng = mulberry32(99);
    for (let i = 0; i < 10_000; i++) p = openBox(p, rng, KEY)!.profile;
    expect(ownedStickerCount(p)).toBe(40);
    for (const s of STICKERS) expect(p.stickers[s.id]).toBeGreaterThan(0);
  });
});

describe('mốc mở khóa theo tổng sao', () => {
  it('đủ sao → mở đúng phần thưởng, tự mặc trang phục/hình nền đầu tiên', () => {
    const r = addStars(profile({ totalStars: 8 }), 3, KEY); // 8 → 11
    expect(r.unlocked).toEqual(['frame-rainbow']);
    expect(r.profile.unlocked).toEqual(['frame-rainbow']);
    expect(r.profile.outfitId).toBeNull();

    const r2 = addStars(r.profile, 14, KEY); // 11 → 25
    expect(r2.unlocked).toEqual(['outfit-pilot']);
    expect(r2.profile.outfitId).toBe('outfit-pilot');

    const r3 = addStars(r2.profile, 25, KEY); // 25 → 50
    expect(r3.unlocked).toEqual(['bg-candy']);
    expect(r3.profile.backgroundId).toBe('bg-candy');
  });

  it('không tự đè lên thứ bé đã chọn', () => {
    const p = profile({ totalStars: 24, unlocked: ['frame-rainbow'], outfitId: null });
    const r = addStars(p, 100, KEY); // vượt nhiều mốc cùng lúc
    expect(r.unlocked).toEqual(['outfit-pilot', 'bg-candy', 'sound-percussion', 'outfit-hero']);
    expect(r.profile.outfitId).toBe('outfit-pilot'); // chỉ ô trống mới tự mặc
    const q = profile({ totalStars: 24, outfitId: 'outfit-hero', unlocked: ['outfit-hero'] });
    expect(addStars(q, 1, KEY).profile.outfitId).toBe('outfit-hero');
  });

  it('syncUnlocks idempotent; hồ sơ cũ đã có nhiều sao được đối chiếu', () => {
    const old = profile({ totalStars: 130 });
    const a = syncUnlocks(old);
    expect(a.unlocked).toEqual([
      'frame-rainbow',
      'outfit-pilot',
      'bg-candy',
      'sound-percussion',
      'outfit-hero',
    ]);
    const b = syncUnlocks(a.profile);
    expect(b.unlocked).toEqual([]);
    expect(b.profile).toBe(a.profile);
  });

  it('300 sao mở hết; nextUnlock → undefined', () => {
    const p = syncUnlocks(profile({ totalStars: 300 })).profile;
    expect(p.unlocked).toHaveLength(UNLOCKS.length);
    expect(nextUnlock(p)).toBeUndefined();
    expect(nextUnlock(profile({ totalStars: 0 }))?.id).toBe('frame-rainbow');
    expect(nextUnlock(profile({ totalStars: 10 }))?.id).toBe('outfit-pilot');
  });

  it('canEquip: chỉ phần thưởng đúng loại và đã mở khóa', () => {
    const p = syncUnlocks(profile({ totalStars: 60 })).profile;
    expect(canEquip(p, 'outfit', 'outfit-pilot')).toBe(true);
    expect(canEquip(p, 'outfit', 'outfit-hero')).toBe(false); // chưa đủ 120 sao
    expect(canEquip(p, 'background', 'outfit-pilot')).toBe(false); // sai loại
    expect(canEquip(p, 'background', 'bg-candy')).toBe(true);
    expect(canEquip(p, 'background', 'bg-sea')).toBe(false);
    expect(canEquip(p, 'outfit', null)).toBe(true);
    expect(canEquip(p, 'outfit', 'khong-co')).toBe(false);
    expect(unlockById('badge-gold')?.stars).toBe(300);
  });

  it('canEquip cho bộ âm thanh và linh vật (TASK-10): đúng loại + đã mở khóa', () => {
    const at80 = syncUnlocks(profile({ totalStars: 80 })).profile; // có Nhạc Cụ Gõ, chưa có Cú Mèo
    expect(canEquip(at80, 'soundSet', 'sound-percussion')).toBe(true);
    expect(canEquip(at80, 'soundSet', 'outfit-pilot')).toBe(false); // sai loại
    expect(canEquip(at80, 'mascot', 'mascot-owl')).toBe(false); // chưa đủ 230 sao
    expect(canEquip(at80, 'mascot', null)).toBe(true); // về Sóc Bo luôn được
    const at230 = syncUnlocks(profile({ totalStars: 230 })).profile;
    expect(canEquip(at230, 'mascot', 'mascot-owl')).toBe(true);
    expect(canEquip(at230, 'soundSet', 'mascot-owl')).toBe(false);
  });

  it('mở khóa bộ âm / linh vật KHÔNG tự áp dụng (khác trang phục, hình nền)', () => {
    const r = syncUnlocks(profile({ totalStars: 230 }));
    expect(r.profile.unlocked).toEqual(expect.arrayContaining(['sound-percussion', 'mascot-owl']));
    expect(r.profile.soundSetId).toBeNull();
    expect(r.profile.mascotId).toBeNull();
  });

  it('activeMascot / activeSoundSet: chỉ dùng khi đúng id và đã mở khóa, còn lại về mặc định', () => {
    const base = profile({ totalStars: 230 });
    const open = syncUnlocks(base).profile;
    expect(activeMascot(null)).toBe('squirrel');
    expect(activeMascot(open)).toBe('squirrel');
    expect(activeMascot({ ...open, mascotId: 'mascot-owl' })).toBe('owl');
    expect(activeMascot({ ...open, mascotId: 'khong-co' })).toBe('squirrel');
    // chưa mở khóa (dữ liệu sửa tay) → vẫn Sóc Bo
    expect(activeMascot({ ...base, unlocked: [], mascotId: 'mascot-owl' })).toBe('squirrel');

    expect(activeSoundSet(undefined)).toBe('default');
    expect(activeSoundSet(open)).toBe('default');
    expect(activeSoundSet({ ...open, soundSetId: 'sound-percussion' })).toBe('percussion');
    expect(activeSoundSet({ ...open, soundSetId: 'mascot-owl' })).toBe('default');
    expect(activeSoundSet({ ...base, unlocked: [], soundSetId: 'sound-percussion' })).toBe(
      'default',
    );
  });

  it('sao từ lượt chơi cũng mở khóa và báo ra màn Kết quả', () => {
    const r = applyRoundRewards(profile({ totalStars: 9 }), 'reflex', 1, KEY); // 9 → 10
    expect(r.rewards.unlocked).toEqual(['frame-rainbow']);
    expect(r.profile.totalStars).toBe(10);
  });
});

describe('nghỉ đúng giờ (F20)', () => {
  it('TC-030: +2 sao một lần/ngày', () => {
    const p = profile({ totalStars: 3 });
    const a = claimRestReward(p, KEY)!;
    expect(a.profile.totalStars).toBe(3 + REST_ON_TIME_STARS);
    expect(day(a.profile).restOnTimeRewarded).toBe(true);
    expect(claimRestReward(a.profile, KEY)).toBeNull(); // lần 2 trong ngày: không nhận
    const next = claimRestReward(a.profile, '2026-10-11')!; // ngày mới: nhận lại
    expect(next.profile.totalStars).toBe(3 + 2 * REST_ON_TIME_STARS);
  });

  it('+2 sao có thể vượt bội số 15 → có hộp', () => {
    const r = claimRestReward(profile({ totalStars: 14 }), KEY)!;
    expect(r.boxesGained).toBe(1);
    expect(r.profile.boxes.pending).toBe(1);
  });
});
