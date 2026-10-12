// Nhiệm vụ hằng ngày, hộp quà, sticker, mở khóa theo mốc sao – thuần + RNG có seed (docs/01_SPEC.md mục 7).
// Không đụng DOM/localStorage: store.ts gọi các hàm này rồi ghi kết quả.
import { levelsConfig, type GameId } from '../games/levels';
import { emptyDay } from './profile';
import { pick, type Rng } from './rng';
import type { DayUsage, Profile } from './types';

const cfg = levelsConfig.rewards;
/** Mỗi lần `totalStars` vượt bội số này → 1 hộp quà. */
export const BOX_EVERY_STARS: number = cfg.boxEveryStars;
/** Sau ngần ấy hộp liên tiếp không có sticker Hiếm → hộp kế tiếp tối thiểu Hiếm. */
export const PITY_AFTER: number = cfg.pityAfter;
export const DUPLICATE_STARS: number = cfg.duplicateStars;
export const REST_ON_TIME_STARS: number = cfg.restOnTimeStars;
/** Phụ huynh chỉnh được trong khoảng này (SPEC mục 7). */
export const MAX_BOXES_PER_DAY_RANGE = [0, 5] as const;

// ---------------------------------------------------------------- nhiệm vụ

export const MISSION_GROUPS = ['reflex', 'focus', 'learn'] as const;
export type MissionGroup = (typeof MISSION_GROUPS)[number];

const GROUP_OF: Record<GameId, MissionGroup> = {
  G1: 'reflex',
  G3: 'reflex',
  G5: 'reflex',
  G2: 'focus',
  G4: 'focus',
  G6: 'learn',
  G7: 'learn',
};

/** Nhóm nhiệm vụ của game (khớp GAME_GROUPS trong games/registry.ts – có test). */
export function missionGroupOf(id: GameId): MissionGroup {
  return GROUP_OF[id];
}

/** Số nhóm nhiệm vụ đã xong hôm nay (0–3). */
export function missionsDone(day: DayUsage): number {
  return MISSION_GROUPS.filter((g) => day.missions[g]).length;
}

// ---------------------------------------------------------------- sticker

export type Rarity = 'common' | 'rare' | 'legendary';
export const RARITIES: readonly Rarity[] = ['common', 'rare', 'legendary'];
export type StickerTheme = 'animal' | 'fruit' | 'space' | 'vehicle';
export const STICKER_THEMES: readonly StickerTheme[] = ['animal', 'fruit', 'space', 'vehicle'];

export interface StickerDef {
  /** 'stk-01' … 'stk-40' */
  id: string;
  theme: StickerTheme;
  rarity: Rarity;
}

/** Mỗi chủ đề 10 hình: 6 Thường, 3 Hiếm, 1 Siêu hiếm → tổng 24 / 12 / 4 (khớp levels.json). */
const THEME_RARITIES: readonly Rarity[] = [
  'common',
  'common',
  'common',
  'common',
  'common',
  'common',
  'rare',
  'rare',
  'rare',
  'legendary',
];

export const STICKERS: readonly StickerDef[] = STICKER_THEMES.flatMap((theme, t) =>
  THEME_RARITIES.map((rarity, i): StickerDef => ({
    id: `stk-${String(t * THEME_RARITIES.length + i + 1).padStart(2, '0')}`,
    theme,
    rarity,
  })),
);

const STICKERS_BY_RARITY: Record<Rarity, StickerDef[]> = {
  common: STICKERS.filter((s) => s.rarity === 'common'),
  rare: STICKERS.filter((s) => s.rarity === 'rare'),
  legendary: STICKERS.filter((s) => s.rarity === 'legendary'),
};

export function stickerById(id: string): StickerDef | undefined {
  return STICKERS.find((s) => s.id === id);
}

/** Số loại sticker đã có (không tính số lượng trùng). */
export function ownedStickerCount(p: Profile): number {
  return STICKERS.filter((s) => (p.stickers[s.id] ?? 0) > 0).length;
}

/**
 * Tung độ hiếm. `guaranteed` (đã đủ PITY_AFTER hộp không có Hiếm) → chỉ còn Hiếm / Siêu hiếm,
 * giữ nguyên tỷ lệ giữa hai loại này (25 : 5).
 */
export function rollRarity(rng: Rng, guaranteed: boolean): Rarity {
  const { common, rare, legendary } = cfg.rarity;
  const r = rng();
  if (guaranteed) return r * (rare + legendary) < rare ? 'rare' : 'legendary';
  if (r < common) return 'common';
  return r < common + rare ? 'rare' : 'legendary';
}

// ---------------------------------------------------------------- mở khóa theo mốc sao

export type UnlockKind = 'avatarFrame' | 'outfit' | 'background' | 'soundSet' | 'mascot' | 'badge';

export interface UnlockDef {
  id: string;
  kind: UnlockKind;
  /** Mốc tổng sao (đọc từ levels.json, cùng thứ tự). */
  stars: number;
}

const UNLOCK_SLOTS: readonly { id: string; kind: UnlockKind }[] = [
  { id: 'frame-rainbow', kind: 'avatarFrame' }, // 10 sao – Khung avatar Cầu Vồng
  { id: 'outfit-pilot', kind: 'outfit' }, // 25 – Mũ Phi Công
  { id: 'bg-candy', kind: 'background' }, // 50 – Hình nền Rừng Kẹo
  { id: 'sound-percussion', kind: 'soundSet' }, // 80 – Bộ âm thanh Nhạc Cụ Gõ
  { id: 'outfit-hero', kind: 'outfit' }, // 120 – Áo Siêu Nhân Sóc
  { id: 'bg-sea', kind: 'background' }, // 170 – Hình nền Đáy Biển
  { id: 'mascot-owl', kind: 'mascot' }, // 230 – Linh vật Cú Mèo Thông Thái
  { id: 'badge-gold', kind: 'badge' }, // 300 – Huy hiệu Vàng
];

export const UNLOCKS: readonly UnlockDef[] = UNLOCK_SLOTS.map((slot, i) => ({
  ...slot,
  stars: levelsConfig.unlocks[i]?.stars ?? Number.POSITIVE_INFINITY,
}));

export function unlockById(id: string): UnlockDef | undefined {
  return UNLOCKS.find((u) => u.id === id);
}

export function unlocksOfKind(kind: UnlockKind): UnlockDef[] {
  return UNLOCKS.filter((u) => u.kind === kind);
}

/** Phần thưởng kế tiếp chưa mở (theo tổng sao hiện tại), hoặc undefined nếu đã mở hết. */
export function nextUnlock(p: Profile): UnlockDef | undefined {
  return UNLOCKS.find((u) => u.stars > p.totalStars);
}

/**
 * Mở các phần thưởng đã đủ sao mà hồ sơ chưa có (idempotent). Ô trang phục / hình nền đang trống
 * thì tự mặc phần thưởng mới để bé thấy ngay. **Bộ âm thanh và linh vật thứ 2 KHÔNG tự áp dụng** (đổi cả
 * giọng nói âm thanh / nhân vật chính là thay đổi lớn: bé tự bấm “Dùng” ở Album → Đặc biệt).
 * Trả về hồ sơ mới + id vừa mở.
 */
export function syncUnlocks(p: Profile): { profile: Profile; unlocked: string[] } {
  const fresh = UNLOCKS.filter((u) => u.stars <= p.totalStars && !p.unlocked.includes(u.id));
  if (fresh.length === 0) return { profile: p, unlocked: [] };
  let { outfitId, backgroundId } = p;
  for (const u of fresh) {
    if (u.kind === 'outfit' && outfitId === null) outfitId = u.id;
    if (u.kind === 'background' && backgroundId === null) backgroundId = u.id;
  }
  const ids = fresh.map((u) => u.id);
  return {
    profile: { ...p, unlocked: [...p.unlocked, ...ids], outfitId, backgroundId },
    unlocked: ids,
  };
}

/** Loại phần thưởng bé chọn dùng được (khung avatar và huy hiệu tự áp dụng nên không nằm ở đây). */
export type EquipKind = 'outfit' | 'background' | 'soundSet' | 'mascot';

/** Chỉ cho mặc/đặt/dùng phần thưởng đúng loại và đã mở khóa. `null` = bỏ (về mặc định). */
export function canEquip(p: Profile, kind: EquipKind, id: string | null): boolean {
  if (id === null) return true;
  return p.unlocked.includes(id) && unlockById(id)?.kind === kind;
}

export const MASCOT_OWL_ID = 'mascot-owl';
export const SOUND_PERCUSSION_ID = 'sound-percussion';

/** Linh vật đang dùng. Id lạ hoặc chưa mở khóa (dữ liệu sửa tay) → Sóc Bo. */
export function activeMascot(p: Profile | null | undefined): 'squirrel' | 'owl' {
  return p?.mascotId === MASCOT_OWL_ID && p.unlocked.includes(MASCOT_OWL_ID) ? 'owl' : 'squirrel';
}

/** Bộ âm thanh đang dùng. Id lạ hoặc chưa mở khóa → âm gốc. */
export function activeSoundSet(p: Profile | null | undefined): 'default' | 'percussion' {
  return p?.soundSetId === SOUND_PERCUSSION_ID && p.unlocked.includes(SOUND_PERCUSSION_ID)
    ? 'percussion'
    : 'default';
}

// ---------------------------------------------------------------- sao + hộp quà

function withDay(p: Profile, key: string, fn: (d: DayUsage) => DayUsage): Profile {
  const day = p.days[key] ?? emptyDay();
  return { ...p, days: { ...p.days, [key]: fn(day) } };
}

/** Thêm tối đa `count` hộp theo giới hạn hộp/ngày (hộp vượt giới hạn bị bỏ, không để dành). */
function earnBoxes(
  p: Profile,
  key: string,
  count: number,
): { profile: Profile; gained: number; blocked: number } {
  if (count <= 0) return { profile: p, gained: 0, blocked: 0 };
  const day = p.days[key] ?? emptyDay();
  const room = Math.max(0, p.limits.maxBoxesPerDay - day.boxesEarned);
  const gained = Math.min(count, room);
  if (gained === 0) return { profile: p, gained: 0, blocked: count };
  const profile = withDay(p, key, (d) => ({ ...d, boxesEarned: d.boxesEarned + gained }));
  return {
    profile: { ...profile, boxes: { ...profile.boxes, pending: profile.boxes.pending + gained } },
    gained,
    blocked: count - gained,
  };
}

export interface StarGrant {
  profile: Profile;
  boxesGained: number;
  boxesBlocked: number;
  /** Phần thưởng mốc sao vừa mở. */
  unlocked: string[];
}

/** Cộng sao (chỉ tăng): tính hộp mỗi bội số BOX_EVERY_STARS và mở khóa theo mốc. */
export function addStars(p: Profile, n: number, key: string): StarGrant {
  if (n <= 0) return { profile: p, boxesGained: 0, boxesBlocked: 0, unlocked: [] };
  const before = p.totalStars;
  const after = before + n;
  const crossed = Math.floor(after / BOX_EVERY_STARS) - Math.floor(before / BOX_EVERY_STARS);
  const withStars = withDay({ ...p, totalStars: after }, key, (d) => ({
    ...d,
    starsToday: d.starsToday + n,
  }));
  const boxes = earnBoxes(withStars, key, crossed);
  const synced = syncUnlocks(boxes.profile);
  return {
    profile: synced.profile,
    boxesGained: boxes.gained,
    boxesBlocked: boxes.blocked,
    unlocked: synced.unlocked,
  };
}

export interface RoundRewards {
  stars: number;
  group: MissionGroup;
  /** Nhóm này vừa được đánh dấu xong (lượt đầu của nhóm trong ngày). */
  newMission: boolean;
  /** Số nhóm đã xong hôm nay sau lượt này (0–3). */
  missionsDone: number;
  /** Hoàn thành đủ 3 nhóm lần đầu trong ngày → đủ điều kiện 1 hộp (nếu chưa vượt giới hạn). */
  missionBox: boolean;
  boxesGained: number;
  /** Hộp đủ điều kiện nhưng vượt giới hạn hộp/ngày → hiện “Mai con nhận tiếp nhé!”. */
  boxesBlocked: number;
  unlocked: string[];
}

/** Áp dụng một lượt chơi đã hoàn thành: đánh dấu nhiệm vụ nhóm, hộp nhiệm vụ, cộng sao, hộp theo sao. */
export function applyRoundRewards(
  p: Profile,
  group: MissionGroup,
  stars: number,
  key: string,
): { profile: Profile; rewards: RoundRewards } {
  const day = p.days[key] ?? emptyDay();
  const newMission = !day.missions[group];
  let cur = p;
  if (newMission) {
    cur = withDay(cur, key, (d) => ({ ...d, missions: { ...d.missions, [group]: true } }));
  }
  const afterMissions = cur.days[key] ?? emptyDay();
  let missionBox = false;
  let gained = 0;
  let blocked = 0;
  if (missionsDone(afterMissions) === MISSION_GROUPS.length && !afterMissions.missions.rewarded) {
    missionBox = true;
    cur = withDay(cur, key, (d) => ({ ...d, missions: { ...d.missions, rewarded: true } }));
    const e = earnBoxes(cur, key, 1);
    cur = e.profile;
    gained += e.gained;
    blocked += e.blocked;
  }
  const s = addStars(cur, stars, key);
  return {
    profile: s.profile,
    rewards: {
      stars,
      group,
      newMission,
      missionsDone: missionsDone(s.profile.days[key] ?? emptyDay()),
      missionBox,
      boxesGained: gained + s.boxesGained,
      boxesBlocked: blocked + s.boxesBlocked,
      unlocked: s.unlocked,
    },
  };
}

export interface BoxOpening {
  profile: Profile;
  sticker: StickerDef;
  /** Lần đầu có sticker này. */
  isNew: boolean;
  /** Số lượng sau khi mở (≥ 2 → hiện “×2”). */
  count: number;
  /** Sao nhận được vì trùng (0 nếu sticker mới). */
  duplicateStars: number;
  /** Hộp phát sinh thêm do sao trùng vượt bội số 15 (vẫn theo giới hạn ngày). */
  boxesGained: number;
  boxesBlocked: number;
  unlocked: string[];
}

/** Mở 1 hộp đang chờ. Trả về null nếu không có hộp. */
export function openBox(p: Profile, rng: Rng, key: string): BoxOpening | null {
  if (p.boxes.pending <= 0) return null;
  const rarity = rollRarity(rng, p.boxes.sinceLastRare >= PITY_AFTER);
  const sticker = pick(rng, STICKERS_BY_RARITY[rarity]);
  const had = p.stickers[sticker.id] ?? 0;
  const isNew = had === 0;
  const opened: Profile = {
    ...p,
    stickers: { ...p.stickers, [sticker.id]: had + 1 },
    boxes: {
      pending: p.boxes.pending - 1,
      openedTotal: p.boxes.openedTotal + 1,
      sinceLastRare: rarity === 'common' ? p.boxes.sinceLastRare + 1 : 0,
    },
  };
  const dupStars = isNew ? 0 : DUPLICATE_STARS;
  const s = addStars(opened, dupStars, key);
  return {
    profile: s.profile,
    sticker,
    isNew,
    count: had + 1,
    duplicateStars: dupStars,
    boxesGained: s.boxesGained,
    boxesBlocked: s.boxesBlocked,
    unlocked: s.unlocked,
  };
}

/** Thưởng “Nghỉ đúng giờ”: +2 sao, 1 lần/ngày. Trả về null nếu hôm nay đã nhận. */
export function claimRestReward(p: Profile, key: string): StarGrant | null {
  const day = p.days[key] ?? emptyDay();
  if (day.restOnTimeRewarded) return null;
  const marked = withDay(p, key, (d) => ({ ...d, restOnTimeRewarded: true }));
  return addStars(marked, REST_ON_TIME_STARS, key);
}

/** Phụ huynh tặng hộp (TASK-07): không tính vào giới hạn hộp/ngày. */
export function grantParentBoxes(p: Profile, count: number): Profile {
  if (count <= 0) return p;
  return { ...p, boxes: { ...p.boxes, pending: p.boxes.pending + count } };
}

/** Số sao còn thiếu để được hộp theo sao kế tiếp (1–15). */
export function starsToNextBox(p: Profile): number {
  return BOX_EVERY_STARS - (p.totalStars % BOX_EVERY_STARS);
}

/** Hôm nay còn nhận thêm được hộp nào nữa không (theo giới hạn ngày)? */
export function boxRoomToday(p: Profile, key: string): number {
  return Math.max(0, p.limits.maxBoxesPerDay - (p.days[key] ?? emptyDay()).boxesEarned);
}
