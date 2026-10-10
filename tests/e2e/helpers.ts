import { expect, type Page } from '@playwright/test';
import { createProfile } from '../../src/app/profile';
import { vi } from '../../src/i18n/vi';
import type { AppState, DayUsage, GameId, Profile, RoundRecord } from '../../src/app/types';

/** Mở app ở chế độ test: lượt G1 rút còn 6 giây, seed cố định (cần build với VITE_E2E=true). */
export const E2E_URL = '/?e2e=1&seed=12345';

export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function makeProfile(
  name: string,
  patch: Partial<Profile> = {},
  today: Partial<DayUsage> = {},
): Profile {
  const p = createProfile({ name, avatarId: 'cat', grade: 2 }, `id-${name}`, new Date());
  const day = {
    playMs: 0,
    bonusMs: 0,
    missions: { reflex: false, focus: false, learn: false, rewarded: false },
    boxesEarned: 0,
    starsToday: 0,
    restOnTimeRewarded: false,
    ...today,
  };
  return { ...p, ...patch, days: { [todayKey()]: day } };
}

/** Hồ sơ có G1/G2 ở cấp/chế độ chỉ định. */
export function withGame(
  profile: Profile,
  id: GameId,
  patch: Partial<Profile['games'][GameId]>,
): Profile {
  return { ...profile, games: { ...profile.games, [id]: { ...profile.games[id], ...patch } } };
}

/** Gieo sẵn dữ liệu localStorage trước khi app tải (chỉ khi chưa có dữ liệu). */
export async function seedProfiles(
  page: Page,
  profiles: Profile[],
  activeProfileId: string | null = profiles[0]?.id ?? null,
): Promise<void> {
  const state: AppState = {
    schemaVersion: 1,
    deviceId: 'e2e-device',
    activeProfileId,
    profiles,
    settings: { sound: false, music: false, vibration: false, allowKidDifficultyChoice: true },
    lastBackupAt: null,
    installedVersion: '0.0.0',
  };
  await page.addInitScript((json) => {
    if (!localStorage.getItem('ntm.state')) localStorage.setItem('ntm.state', json);
  }, JSON.stringify(state));
}

export async function createProfileViaUi(page: Page, name: string, grade: 1 | 2 | 3 = 2) {
  await page.getByLabel(vi.profiles.nameLabel).fill(name);
  await page.getByRole('radio', { name: vi.avatars.cat, exact: true }).click();
  await page.getByRole('radio', { name: vi.profiles.grade(grade), exact: true }).click();
  await page.getByRole('button', { name: vi.profiles.submit }).click();
}

export async function openIntro(page: Page, id: GameId) {
  await page.getByTestId(`game-${id}`).click();
  await expect(page.getByTestId('start-game')).toBeVisible();
}

/** Chọn Dễ/Vừa/Tự động/Khó ở màn Giới thiệu. */
export async function chooseDifficulty(page: Page, choice: 'easy' | 'normal' | 'auto' | 'hard') {
  await page.getByRole('radio', { name: vi.intro[choice] }).click();
}

/** Bấm Bắt đầu, đợi đếm ngược 3-2-1 xong (game đang Running). */
export async function pressStart(page: Page) {
  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('countdown')).toBeVisible();
  await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
}

export async function startGame(page: Page, id: GameId) {
  await openIntro(page, id);
  await pressStart(page);
}

export async function readState(page: Page): Promise<AppState> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('ntm.state') ?? 'null'));
}

export async function readRounds(page: Page, profileId: string): Promise<RoundRecord[]> {
  return page.evaluate(
    (id) => JSON.parse(localStorage.getItem(`ntm.rounds.${id}`) ?? '[]'),
    profileId,
  );
}

export async function lastRound(page: Page, profileId: string): Promise<RoundRecord> {
  const rounds = await readRounds(page, profileId);
  const r = rounds.at(-1);
  if (!r) throw new Error('Chưa có lượt nào được lưu');
  return r;
}

/** Giả lập app bị ẩn (bấm Home / chuyển tab). */
export async function hidePage(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

// ---------------------------------------------------------------- G2

interface CellMap {
  [n: string]: { x: number; y: number };
}

/** Tâm từng ô (toạ độ trang) theo số – lưới không đổi vị trí trong lượt. */
export async function g2Cells(page: Page): Promise<CellMap> {
  return page.evaluate(() => {
    const out: Record<string, { x: number; y: number }> = {};
    document.querySelectorAll<HTMLElement>('.g2-cell').forEach((c) => {
      const r = c.getBoundingClientRect();
      out[c.dataset.n as string] = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    return out;
  });
}

export async function g2Params(page: Page): Promise<{ grid: number; backward: boolean }> {
  const raw = await page.getByTestId('game-host').getAttribute('data-g2');
  return JSON.parse(raw ?? '{}');
}

export async function g2Tap(page: Page, cells: CellMap, n: number) {
  const c = cells[String(n)];
  if (!c) throw new Error(`Không có ô số ${n}`);
  await page.touchscreen.tap(c.x, c.y);
}

/** Chơi hết bảng G2 theo đúng thứ tự; `errors` lần chạm sai trước khi bắt đầu tìm. */
export async function playG2(page: Page, opts: { errors?: number } = {}) {
  const cells = await g2Cells(page);
  const { grid, backward } = await g2Params(page);
  const total = grid * grid;
  const seq = Array.from({ length: total }, (_, i) => (backward ? total - i : i + 1));
  for (let i = 0; i < (opts.errors ?? 0); i++) {
    await g2Tap(page, cells, seq[total - 1] as number); // số cuối dãy, chắc chắn chưa phải số cần tìm
  }
  for (const n of seq) await g2Tap(page, cells, n);
}

// ---------------------------------------------------------------- G1

export interface G1Ball {
  id: number;
  kind: 'green' | 'red' | 'yellow' | 'brown';
  x: number;
  y: number;
}

export async function g1Snapshot(page: Page): Promise<{
  balls: G1Ball[];
  stats: Record<string, number>;
  x: number;
  y: number;
  w: number;
  h: number;
} | null> {
  return page.evaluate(() => {
    const h = document.querySelector<HTMLElement>('[data-testid="game-host"]');
    if (!h) return null;
    const r = h.getBoundingClientRect();
    return {
      balls: JSON.parse(h.dataset.balls ?? '[]'),
      stats: JSON.parse(h.dataset.stats ?? '{}'),
      x: r.left,
      y: r.top,
      w: r.width,
      h: r.height,
    };
  });
}

/** Chạm góc dưới-trái vùng chơi: luôn là chỗ trống (bóng cách mép ≥ 16px). */
export async function tapEmptySpot(page: Page) {
  const s = await g1Snapshot(page);
  if (!s) throw new Error('Không thấy vùng chơi');
  await page.touchscreen.tap(s.x + 5, s.y + s.h - 5);
}

/**
 * Bot chơi G1 đến khi lượt kết thúc.
 * - chạm mọi bóng xanh nếu `tapGreen`;
 * - chạm `falseAlarms` bóng không xanh đầu tiên;
 * - chạm `emptyTaps` lần vào chỗ trống ngay đầu lượt.
 * Bóng không xanh còn lại được để tự biến mất.
 */
export async function playG1(
  page: Page,
  opts: { tapGreen?: boolean; falseAlarms?: number; emptyTaps?: number } = {},
) {
  const tapGreen = opts.tapGreen ?? true;
  let falseAlarms = opts.falseAlarms ?? 0;
  for (let i = 0; i < (opts.emptyTaps ?? 0); i++) {
    await tapEmptySpot(page);
    await page.waitForTimeout(40);
  }
  const handled = new Set<number>();
  const deadline = Date.now() + 40_000;
  while (Date.now() < deadline) {
    const s = await g1Snapshot(page);
    if (!s) return; // vùng chơi đã biến mất → sang màn Kết quả
    for (const b of s.balls) {
      if (handled.has(b.id)) continue;
      if (b.kind === 'green' && tapGreen) {
        handled.add(b.id);
        await page.touchscreen.tap(s.x + b.x, s.y + b.y);
      } else if (b.kind !== 'green' && falseAlarms > 0) {
        handled.add(b.id);
        falseAlarms -= 1;
        await page.touchscreen.tap(s.x + b.x, s.y + b.y);
      }
    }
    await page.waitForTimeout(20);
  }
  throw new Error('Lượt G1 không kết thúc trong thời gian chờ');
}
