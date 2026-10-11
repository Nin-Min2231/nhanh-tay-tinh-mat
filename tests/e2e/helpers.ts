import { expect, type Page } from '@playwright/test';
import { createProfile } from '../../src/app/profile';
import { mulberry32 } from '../../src/app/rng';
import { DEFAULT_G5_OPTIONS, resolveG5Params } from '../../src/games/g5-notes/config';
import {
  ROUND_MS,
  firstHitTime,
  generateSchedule,
  type Note,
} from '../../src/games/g5-notes/logic';
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
  settings: Partial<AppState['settings']> = {},
): Promise<void> {
  const state: AppState = {
    schemaVersion: 1,
    deviceId: 'e2e-device',
    activeProfileId,
    profiles,
    settings: {
      sound: false,
      music: false,
      vibration: false,
      allowKidDifficultyChoice: true,
      ...settings,
    },
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

/**
 * Khoảng cách từ mép vùng chơi tới điểm “chỗ trống” (góc dưới-trái). Phải lớn hơn biên độ lắc của
 * `.shake` (±6px) – nếu chạm sát mép (vd 5px) lúc khung đang lắc thì điểm chạm trượt ra ngoài vùng chơi
 * (đây từng là nguyên nhân G1 TC-004 / G3 TC-013 chập chờn ở tablet). Bóng/thú cách mép ≥ 16px nên vẫn trống.
 */
export const EMPTY_SPOT_INSET = 14;

/** Chờ khung chơi hết lắc (`.shake`, ~200ms sau mỗi lần chạm sai). */
export async function waitShakeEnd(page: Page) {
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="game-host"]')?.classList.contains('shake'),
  );
}

/** Chạm góc dưới-trái vùng chơi (G1, G3): luôn là chỗ trống. Chờ hết lắc rồi mới chạm. */
export async function tapEmptySpot(page: Page) {
  await waitShakeEnd(page);
  const s = await g1Snapshot(page);
  if (!s) throw new Error('Không thấy vùng chơi');
  await page.touchscreen.tap(s.x + EMPTY_SPOT_INSET, s.y + s.h - EMPTY_SPOT_INSET);
}

/**
 * Bot chơi G1 đến khi lượt kết thúc.
 * - chạm mọi bóng xanh nếu `tapGreen`;
 * - chạm `falseAlarms` bóng không xanh đầu tiên;
 * - chạm `emptyTaps` lần vào chỗ trống: ngay sau khi đã chạm bóng đầu tiên (bóng chỉ hiện ~1 giây nên phải
 *   chạm trước), hoặc ngay đầu lượt nếu bot không chạm bóng nào.
 * Bóng không xanh còn lại được để tự biến mất.
 */
export async function playG1(
  page: Page,
  opts: { tapGreen?: boolean; falseAlarms?: number; emptyTaps?: number } = {},
) {
  const tapGreen = opts.tapGreen ?? true;
  let falseAlarms = opts.falseAlarms ?? 0;
  let emptyLeft = opts.emptyTaps ?? 0;

  async function tapEmptySpots() {
    while (emptyLeft > 0) {
      const before = (await g1Snapshot(page))?.stats.emptyTaps ?? 0;
      await tapEmptySpot(page);
      // chờ game ghi nhận lần chạm này rồi mới chạm tiếp (không dựa vào độ trễ cố định)
      await expect.poll(async () => (await g1Snapshot(page))?.stats.emptyTaps).toBe(before + 1);
      emptyLeft -= 1;
    }
  }

  if (!tapGreen && falseAlarms === 0) await tapEmptySpots();
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
    // đã chạm bóng rồi → làm nốt các lần chạm chỗ trống, sau đó lấy lại ảnh chụp mới (bóng đã đổi)
    if (handled.size > 0 && emptyLeft > 0) await tapEmptySpots();
    else await page.waitForTimeout(20);
  }
  throw new Error('Lượt G1 không kết thúc trong thời gian chờ');
}

// ---------------------------------------------------------------- G3

export interface G3Pet {
  kind: string;
  decoy: boolean;
  x: number;
  y: number;
  r: number;
}

export async function g3Snapshot(page: Page): Promise<{
  pets: G3Pet[];
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
      pets: JSON.parse(h.dataset.pets ?? '[]'),
      stats: JSON.parse(h.dataset.stats ?? '{}'),
      x: r.left,
      y: r.top,
      w: r.width,
      h: r.height,
    };
  });
}

/** Đợi tới khi có đủ `count` con (`decoy` = Nhím) đang chạy, trả về ảnh chụp trạng thái. */
export async function g3WaitPets(page: Page, decoy: boolean, count: number) {
  let snap = await g3Snapshot(page);
  for (
    let i = 0;
    i < 200 && (!snap || snap.pets.filter((p) => p.decoy === decoy).length < count);
    i++
  ) {
    await page.waitForTimeout(20);
    snap = await g3Snapshot(page);
  }
  return snap!;
}

// ---------------------------------------------------------------- G4

export interface G4State {
  phase: string;
  seq: number[];
  stats: { maxSpan: number; correctSequences: number; pads: number; mistakes: number };
}

export async function g4State(page: Page): Promise<G4State> {
  return page.evaluate(() => {
    const h = document.querySelector<HTMLElement>('[data-testid="game-host"]');
    return {
      phase: h?.dataset.phase ?? '',
      seq: JSON.parse(h?.dataset.seq ?? '[]'),
      stats: JSON.parse(h?.dataset.stats ?? '{}'),
    };
  });
}

/** Đợi tới lượt bé (phase = input) và trả về chuỗi hiện tại. */
export async function g4WaitInput(page: Page): Promise<G4State> {
  await expect
    .poll(async () => (await g4State(page)).phase, { timeout: 20_000, intervals: [20, 50, 100] })
    .toBe('input');
  return g4State(page);
}

export async function g4Tap(page: Page, pad: number) {
  const c = await page.evaluate((i) => {
    const el = document.querySelector<HTMLElement>(`.g4-pad[data-pad="${i}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, pad);
  if (!c) throw new Error(`Không có ô ${pad}`);
  await page.touchscreen.tap(c.x, c.y);
}

// ---------------------------------------------------------------- G5

/** Lịch nốt của G5 (giống hệt trong game) cho seed e2e và cấp cho trước – để chọn seed có nốt đôi. */
export function g5ScheduleFor(seed: number, level: number): Note[] {
  const first = mulberry32(seed);
  const noteRng = mulberry32((first() * 4294967296) >>> 0);
  const params = resolveG5Params(level, DEFAULT_G5_OPTIONS);
  const duration = Math.max(ROUND_MS / 10, firstHitTime(params) + 3000);
  return generateSchedule(noteRng, params, duration);
}

export async function g5Stats(page: Page): Promise<{
  perfect: number;
  good: number;
  miss: number;
  extraTaps: number;
  combo: number;
  maxCombo: number;
}> {
  return page.evaluate(() => {
    const h = document.querySelector<HTMLElement>('[data-testid="game-host"]');
    return JSON.parse(h?.dataset.stats ?? '{}');
  });
}

/**
 * Bot chạy TRONG trang: chạm các nốt có hitTime ∈ [from, to] đúng lúc (dùng PointerEvent giả, đa điểm).
 * Trả về khi đã chạm xong nốt cuối trong khoảng (hoặc khi vùng chơi biến mất).
 */
export async function g5Bot(page: Page, from = 0, to = Infinity) {
  await page.evaluate(
    async ({ from, to }) => {
      const host = document.querySelector<HTMLElement>('[data-testid="game-host"]');
      if (!host) return;
      const schedule = JSON.parse(host.dataset.schedule ?? '[]') as [number, number][];
      const rect = host.getBoundingClientRect();
      const laneW = rect.width / 4;
      const y = rect.top + rect.height * 0.8;
      let pointerId = 1000;
      const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
      const nowT = () => performance.now() - Number(host.dataset.offset ?? 0);
      for (const [hitTime, lane] of schedule) {
        if (hitTime < from || hitTime > to) continue;
        while (document.querySelector('[data-testid="game-host"]') && nowT() < hitTime)
          await nextFrame();
        if (!document.querySelector('[data-testid="game-host"]')) return;
        host.dispatchEvent(
          new PointerEvent('pointerdown', {
            pointerId: pointerId++,
            pointerType: 'touch',
            isPrimary: false,
            clientX: rect.left + (lane + 0.5) * laneW,
            clientY: y,
            bubbles: true,
          }),
        );
      }
    },
    { from, to },
  );
}

// ---------------------------------------------------------------- G6 / G7

export interface QuestionHook {
  i: number;
  key?: string;
  topic?: string;
  text?: string;
  options?: number[];
  correct: number;
  hidden?: string;
  retry?: boolean;
  type?: string;
  typeLevel?: number;
  layout?: string;
  cells?: number;
  hole?: number;
  retryable?: boolean;
  wrong?: number[];
}

/** Đọc trạng thái câu hiện tại của G6/G7 (game ghi ra data-q, data-phase, data-stats). */
export async function questionState(page: Page): Promise<{
  phase: string;
  q: QuestionHook;
  stats: Record<string, number>;
}> {
  return page.evaluate(() => {
    const h = document.querySelector<HTMLElement>('[data-testid="game-host"]');
    return {
      phase: h?.dataset.phase ?? '',
      q: JSON.parse(h?.dataset.q ?? '{"i":-1,"correct":-1}'),
      stats: JSON.parse(h?.dataset.stats ?? '{}'),
    };
  });
}

/** Đợi tới khi game đang chờ bé trả lời câu thứ `index` (phase = ask). */
export async function waitForAsk(page: Page, index: number, timeout = 15_000) {
  await expect
    .poll(
      async () => {
        const s = await questionState(page);
        return s.phase === 'ask' ? s.q.i : -1;
      },
      { timeout, intervals: [10, 20, 50] },
    )
    .toBe(index);
  return (await questionState(page)).q;
}

/** Chạm (Pointer Events thật qua touchscreen) vào phần tử đầu tiên khớp selector. */
export async function tapSelector(page: Page, selector: string, nth = 0) {
  const box = await page.locator(selector).nth(nth).boundingBox();
  if (!box) throw new Error(`Không thấy ${selector}`);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

/** Tính đáp án của đề dạng “a ⊕ b = ?” (G6) từ chữ hiển thị. null nếu không phải dạng đơn giản. */
export function solveDisplayedText(text: string): number | null {
  const m = /^([\d\u00a0]+) ([+−×:]) ([\d\u00a0]+) = \?$/.exec(text);
  if (!m) return null;
  const a = Number((m[1] as string).replace(/\u00a0/g, ''));
  const b = Number((m[3] as string).replace(/\u00a0/g, ''));
  switch (m[2]) {
    case '+':
      return a + b;
    case '−':
      return a - b;
    case '×':
      return a * b;
    default:
      return a / b;
  }
}
