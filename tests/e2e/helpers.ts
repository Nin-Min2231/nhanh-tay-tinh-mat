import { expect, type Locator, type Page } from '@playwright/test';
import { createProfile } from '../../src/app/profile';
import { vi } from '../../src/i18n/vi';
import type { AppState, DayUsage, Profile } from '../../src/app/types';

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

export async function openG0Intro(page: Page) {
  await page.getByTestId('game-G0').click();
  await expect(page.getByTestId('start-game')).toBeVisible();
}

/** Bấm Bắt đầu, đợi đếm ngược 3-2-1 xong (game đang Running). */
export async function startG0(page: Page) {
  await openG0Intro(page);
  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('countdown')).toBeVisible();
  await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
  await expect(host(page)).toHaveAttribute('data-target', /\d+,\d+/);
}

export function host(page: Page): Locator {
  return page.getByTestId('game-host');
}

export async function targetPoint(page: Page): Promise<{ x: number; y: number }> {
  const t = await host(page).getAttribute('data-target');
  const [x, y] = (t ?? '0,0').split(',').map(Number);
  return { x: x as number, y: y as number };
}

/** Chạm trúng vòng tròn hiện tại và đợi vòng mới (hoặc kết thúc). */
export async function hitTarget(page: Page, nth: number) {
  const { x, y } = await targetPoint(page);
  await host(page).tap({ position: { x, y } });
  if (nth < 10) await expect(host(page)).toHaveAttribute('data-hits', String(nth));
}

export async function playG0ToEnd(page: Page) {
  for (let i = 1; i <= 10; i++) await hitTarget(page, i);
}

export async function readState(page: Page): Promise<AppState> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('ntm.state') ?? 'null'));
}

export async function readRounds(page: Page, profileId: string): Promise<unknown[]> {
  return page.evaluate(
    (id) => JSON.parse(localStorage.getItem(`ntm.rounds.${id}`) ?? '[]'),
    profileId,
  );
}

/** Giả lập app bị ẩn (bấm Home / chuyển tab). */
export async function hidePage(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}
