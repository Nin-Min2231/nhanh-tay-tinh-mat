// TASK-07: khu phụ huynh – TC-010, TC-023, TC-025, TC-026, TC-027 + bài đo tuần, cài đặt, hồ sơ, bố cục.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { benchmarkLevel } from '../../src/app/benchmark';
import { levelsConfig, type GameId } from '../../src/games/levels';
import type { RoundRecord } from '../../src/app/types';
import { vi } from '../../src/i18n/vi';
import {
  E2E_URL,
  lastRound,
  makeProfile,
  playG1,
  playG2,
  pressStart,
  readRounds,
  readState,
  seedProfiles,
  startGame,
  withTrack,
} from './helpers';

// ---------------------------------------------------------------- tiện ích

/** Đọc phép nhân đang hiện ở khóa phụ huynh. */
async function gateQuestion(page: Page): Promise<{ a: number; b: number; answer: number }> {
  const text = (await page.getByTestId('gate-question').textContent()) ?? '';
  const m = /(\d+)\s*×\s*(\d+)/.exec(text);
  if (!m) throw new Error(`Không đọc được phép tính: ${text}`);
  const a = Number(m[1]);
  const b = Number(m[2]);
  return { a, b, answer: a * b };
}

async function typeAnswer(page: Page, n: number | string) {
  for (const d of String(n)) await page.getByTestId(`gate-key-${d}`).click();
}

async function solveGate(page: Page) {
  const { answer } = await gateQuestion(page);
  await typeAnswer(page, answer);
  await page.getByTestId('gate-ok').click();
  await expect(page.getByTestId('parent-area')).toBeVisible();
}

/** Từ Home → khóa → giải → khu phụ huynh (tab mặc định). */
async function openParent(page: Page, tab?: string) {
  await page.getByRole('button', { name: vi.home.parent }).click();
  await expect(page.getByTestId('parent-gate')).toBeVisible();
  await solveGate(page);
  if (tab) await page.getByTestId(`tab-${tab}`).click();
}

/** Khóa ngày 'YYYY-MM-DD' (giờ máy) của `days` ngày trước. */
function dayKeyAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function isoDaysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

let seq = 0;
function mkRound(
  profileId: string,
  gameId: GameId,
  daysAgo: number,
  over: Partial<RoundRecord> = {},
): RoundRecord {
  seq += 1;
  return {
    id: `seed-${seq}`,
    profileId,
    gameId,
    startedAt: isoDaysAgo(daysAgo, 8 + (seq % 10)),
    level: 3,
    mode: 'auto',
    benchmark: false,
    options: {},
    durationMs: 60_000,
    score: 0.8,
    stars: 2,
    metrics: {},
    deviceId: 'e2e-device',
    deviceClass: 'phone',
    ...over,
  };
}

async function seedRounds(page: Page, profileId: string, rounds: RoundRecord[]) {
  await page.addInitScript(
    ([key, json]) => {
      if (!localStorage.getItem(key as string)) localStorage.setItem(key as string, json as string);
    },
    [`ntm.rounds.${profileId}`, JSON.stringify(rounds)],
  );
}

async function readKey<T>(page: Page, key: string): Promise<T | null> {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), key);
}

interface ChartData {
  labels: string[];
  values: (number | null)[];
  levels: number[];
  metric: string;
}
async function chartData(page: Page): Promise<ChartData> {
  const raw = await page.getByTestId('progress-chart').getAttribute('data-chart');
  return JSON.parse(raw ?? '{}');
}

// ---------------------------------------------------------------- khóa phụ huynh

test.describe('Khóa phụ huynh (F08, TC-026)', () => {
  test('phép nhân 2 chữ số × 1 chữ số; giải đúng thì vào khu phụ huynh; ra khỏi khu là khóa lại', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await page.getByRole('button', { name: vi.home.parent }).click();
    await expect(page.getByTestId('parent-gate')).toBeVisible();
    const q = await gateQuestion(page);
    expect(q.a).toBeGreaterThanOrEqual(12);
    expect(q.a).toBeLessThanOrEqual(49);
    expect(q.b).toBeGreaterThanOrEqual(3);
    expect(q.b).toBeLessThanOrEqual(9);

    // chưa nhập gì mà bấm Vào → nhắc nhập, không tính là sai
    await page.getByTestId('gate-ok').click();
    await expect(page.getByTestId('gate-note')).toContainText(vi.parent.gate.empty);
    // nút Xóa số hoạt động
    await typeAnswer(page, 12);
    await expect(page.getByTestId('gate-input')).toHaveText('12');
    await page.getByTestId('gate-del').click();
    await expect(page.getByTestId('gate-input')).toHaveText('1');
    await page.getByTestId('gate-del').click();

    await solveGate(page);
    await expect(page.getByTestId('progress-tab')).toBeVisible();

    // Thoát → Home; vào lại bằng địa chỉ trực tiếp vẫn bị chặn bởi khóa
    await page.getByTestId('parent-exit').click();
    await expect(page.getByTestId('greeting')).toBeVisible();
    await page.evaluate(() => {
      location.hash = '#/parent/progress';
    });
    await expect(page.getByTestId('parent-gate')).toBeVisible();
  });

  test('sai 3 lần → khóa 30 giây (rút còn 3 giây khi ?e2e=1) rồi ra phép tính mới (TC-026)', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await page.getByRole('button', { name: vi.home.parent }).click();
    const q = await gateQuestion(page);
    const wrong = q.answer + 1;

    await typeAnswer(page, wrong);
    await page.getByTestId('gate-ok').click();
    await expect(page.getByTestId('gate-note')).toContainText(vi.parent.gate.wrong(2));
    await typeAnswer(page, wrong);
    await page.getByTestId('gate-ok').click();
    await expect(page.getByTestId('gate-note')).toContainText(vi.parent.gate.wrong(1));
    await typeAnswer(page, wrong);
    await page.getByTestId('gate-ok').click();

    // bị khóa: có đếm ngược, mọi phím vô hiệu, đáp án đúng cũng không vào được
    await expect(page.getByTestId('gate-note')).toContainText('Đã nhập sai 3 lần');
    await expect(page.getByTestId('gate-ok')).toBeDisabled();
    await expect(page.getByTestId('gate-key-5')).toBeDisabled();
    await expect(page.getByTestId('parent-area')).toHaveCount(0);

    // hết khóa → mở lại, đếm sai bắt đầu lại từ đầu với phép tính mới
    await expect(page.getByTestId('gate-ok')).toBeEnabled({ timeout: 10_000 });
    const q2 = await gateQuestion(page);
    await typeAnswer(page, q2.answer + 1);
    await page.getByTestId('gate-ok').click();
    await expect(page.getByTestId('gate-note')).toContainText(vi.parent.gate.wrong(2));
    await page.getByTestId('gate-del').click(); // (xóa số đang gõ nếu còn) – không ảnh hưởng
    await typeAnswer(page, q2.answer);
    await page.getByTestId('gate-ok').click();
    await expect(page.getByTestId('parent-area')).toBeVisible();
  });
});

// ---------------------------------------------------------------- tiến bộ

test.describe('Tab Tiến bộ (F06, F18, TC-010)', () => {
  const p = makeProfile('An');

  test('biểu đồ hiện đúng số liệu theo ngày từng game kèm cấp độ; dựng tổng hợp từ lượt cũ', async ({
    page,
  }) => {
    const rounds = [
      mkRound(p.id, 'G1', 3, { level: 2, score: 0.6, metrics: { rtMeanMs: 800 } }),
      mkRound(p.id, 'G1', 3, { level: 4, score: 1, metrics: { rtMeanMs: 600 } }),
      mkRound(p.id, 'G1', 2, { level: 4, score: 0.8, metrics: { rtMeanMs: 500 } }),
      mkRound(p.id, 'G1', 0, {
        level: 5,
        score: 0.9,
        metrics: { rtMeanMs: 450 },
        deviceClass: 'tablet',
      }),
      mkRound(p.id, 'G2', 2, { level: 2, metrics: { timeSec: 40, errors: 2 } }),
      mkRound(p.id, 'G2', 1, { level: 3, metrics: { timeSec: 35, errors: 0 } }),
    ];
    await seedProfiles(page, [p]);
    await seedRounds(page, p.id, rounds);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(E2E_URL);
    await openParent(page);

    // tổng hợp theo ngày được dựng khi mở app (dữ liệu cũ chưa có)
    const daily = await readKey<{ date: string; gameId: string }[]>(page, `ntm.daily.${p.id}`);
    expect(daily?.filter((d) => d.gameId === 'G1').length).toBe(3); // ngày -3 + -2 (điện thoại), hôm nay (máy tính bảng)
    expect(daily?.filter((d) => d.gameId === 'G2').length).toBe(2);

    // G1 – chỉ số mặc định: phản ứng trung bình; gộp cả 2 loại thiết bị
    await expect.poll(async () => (await chartData(page)).values?.length).toBe(3);
    let c = await chartData(page);
    expect(c.metric).toBe('rtMeanMs');
    expect(c.values).toEqual([700, 500, 450]); // ngày 3: (800+600)/2
    expect(c.levels).toEqual([3, 4, 5]); // cấp trung bình theo ngày
    await expect(page.getByTestId('progress-summary')).toContainText('3 ngày');

    // chỉ số khác: điểm lượt
    await page.getByTestId('pm-score').click();
    await expect.poll(async () => (await chartData(page)).metric).toBe('score');
    c = await chartData(page);
    expect(c.values).toEqual([0.8, 0.8, 0.9]);

    // lọc thiết bị: máy tính bảng chỉ có 1 ngày; điện thoại 2 ngày
    await page.getByTestId('pd-tablet').click();
    await expect.poll(async () => (await chartData(page)).labels?.length).toBe(1);
    await page.getByTestId('pd-phone').click();
    await expect.poll(async () => (await chartData(page)).labels?.length).toBe(2);
    await page.getByTestId('pd-all').click();

    // khoảng ngày: 7 ngày và “Tất cả” đều đủ 3 điểm
    await page.getByTestId('pr-7').click();
    await expect.poll(async () => (await chartData(page)).labels?.length).toBe(3);
    await page.getByTestId('pr-all').click();
    await expect.poll(async () => (await chartData(page)).labels?.length).toBe(3);

    // game khác: G2 – thời gian hoàn thành (thấp hơn là tốt), cấp theo ngày
    await page.getByTestId('pg-G2').click();
    await expect.poll(async () => (await chartData(page)).metric).toBe('timeSec');
    c = await chartData(page);
    expect(c.values).toEqual([40, 35]);
    expect(c.levels).toEqual([2, 3]);
    await expect(page.getByTestId('progress-summary')).toContainText(
      vi.parent.progress.lowerBetter,
    );

    // bảng lượt gần nhất của G2: mới nhất trước
    const rows = page.getByTestId('recent-row');
    await expect(rows).toHaveCount(2);

    // game chưa có số liệu
    await page.getByTestId('pg-G5').click();
    await expect(page.getByTestId('progress-empty')).toBeVisible();

    // Chart.js thật sự vẽ ra canvas (không lỗi khi nạp gói tải sau)
    await page.getByTestId('pg-G1').click();
    await expect
      .poll(async () =>
        page.locator('.chart-box canvas').evaluate((el) => (el as HTMLCanvasElement).width),
      )
      .toBeGreaterThan(50);
    expect(errors).toEqual([]);
  });

  test('bảng “10 lượt gần nhất”: tối đa 10 dòng, lượt bài đo có nhãn riêng', async ({ page }) => {
    const rounds = Array.from({ length: 13 }, (_, i) =>
      mkRound(p.id, 'G3', i % 5, { metrics: { hitsPerMin: 20 + i } }),
    );
    rounds.push(mkRound(p.id, 'G3', 0, { benchmark: true, mode: 'fixed', level: 4 }));
    await seedProfiles(page, [p]);
    await seedRounds(page, p.id, rounds);
    await page.goto(E2E_URL);
    await openParent(page);
    await page.getByTestId('pg-G3').click();
    await expect(page.getByTestId('recent-row')).toHaveCount(10);
    await expect(page.getByTestId('recent-table')).toContainText(vi.parent.progress.benchmarkTag);
  });

  test('chưa chơi lượt nào → báo chưa có số liệu', async ({ page }) => {
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page);
    await expect(page.getByTestId('progress-empty')).toBeVisible();
    await expect(page.getByTestId('progress-chart')).toHaveCount(0);
  });

  test('lượt chơi thật được ghi vào tổng hợp theo ngày và hiện ở biểu đồ', async ({ page }) => {
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await startGame(page, 'G2');
    await playG2(page);
    await expect(page.getByTestId('result')).toBeVisible();
    await page.getByTestId('to-home').click();
    const daily = await readKey<{ gameId: string; rounds: number }[]>(page, `ntm.daily.${p.id}`);
    expect(daily).toHaveLength(1);
    expect(daily![0]).toMatchObject({ gameId: 'G2', rounds: 1 });
    await openParent(page);
    await page.getByTestId('pg-G2').click();
    await expect.poll(async () => (await chartData(page)).values?.length).toBe(1);
  });

  test('lượt chi tiết cũ hơn 120 ngày bị dọn khi mở app, tổng hợp theo ngày vẫn còn; lượt bài đo giữ lại', async ({
    page,
  }) => {
    const old = mkRound(p.id, 'G1', 200, { metrics: { rtMeanMs: 900 } });
    const oldBench = mkRound(p.id, 'G2', 200, { benchmark: true, mode: 'fixed' });
    const recent = mkRound(p.id, 'G1', 1, { metrics: { rtMeanMs: 700 } });
    await seedProfiles(page, [p]);
    await seedRounds(page, p.id, [old, oldBench, recent]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('greeting')).toBeVisible();
    const rounds = await readRounds(page, p.id);
    expect(rounds.map((r) => r.id).sort()).toEqual([oldBench.id, recent.id].sort());
    const daily = await readKey<{ date: string; gameId: string }[]>(page, `ntm.daily.${p.id}`);
    expect(daily?.map((d) => d.date)).toEqual([dayKeyAgo(200), dayKeyAgo(1)]); // lượt bài đo không vào tổng hợp
  });
});

// ---------------------------------------------------------------- bài đo tuần

test.describe('Bài đo tuần (F16, TC-027)', () => {
  const p = makeProfile('An');
  const GAMES: GameId[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];
  const benchRound = (g: GameId, daysAgo: number, metrics: Record<string, number>) =>
    mkRound(p.id, g, daysAgo, {
      benchmark: true,
      mode: 'fixed',
      level: levelsConfig.benchmark[g],
      metrics,
    });

  test('so sánh tuần đầu ↔ tuần gần nhất cho đủ 7 game, có mũi tên và chiều “thấp hơn là tốt” (TC-027)', async ({
    page,
  }) => {
    const first = GAMES.map((g) =>
      benchRound(g, 21, {
        rtMeanMs: 700,
        timeSec: 40,
        hitsPerMin: 20,
        maxSpan: 4,
        perfectPct: 50,
        accuracy: 0.6,
      }),
    );
    const latest = GAMES.map((g) =>
      benchRound(g, 1, {
        rtMeanMs: 600, // nhanh hơn → tiến bộ
        timeSec: 45, // chậm hơn → giảm
        hitsPerMin: 25, // tiến bộ
        maxSpan: 4, // như nhau
        perfectPct: 40, // giảm
        accuracy: 0.9, // tiến bộ
      }),
    );
    await seedProfiles(page, [p]);
    await seedRounds(page, p.id, [...first, ...latest]);
    await page.goto(E2E_URL);
    await openParent(page, 'benchmark');
    await expect(page.getByTestId('bench-table')).toBeVisible();
    await expect(page.getByTestId('bench-weeks')).toBeVisible();
    for (const g of GAMES) await expect(page.getByTestId(`bench-row-${g}`)).toBeVisible();
    const trend = async (g: GameId) =>
      page.getByTestId(`bench-row-${g}`).getAttribute('data-trend');
    expect(await trend('G1')).toBe('better'); // 700 → 600 ms (thấp hơn là tốt)
    expect(await trend('G2')).toBe('worse'); // 40 → 45 giây
    expect(await trend('G3')).toBe('better');
    expect(await trend('G4')).toBe('same');
    expect(await trend('G5')).toBe('worse');
    expect(await trend('G6')).toBe('better');
    expect(await trend('G7')).toBe('better');
    await expect(page.getByTestId('bench-first-G1')).toContainText('700');
    await expect(page.getByTestId('bench-latest-G1')).toContainText('600');
    // mũi tên + chữ (không chỉ dựa vào màu)
    await expect(page.getByTestId('bench-row-G1')).toContainText('▼');
    await expect(page.getByTestId('bench-row-G1')).toContainText(
      String(vi.parent.benchmark.trend.better),
    );
    await expect(page.getByTestId('bench-row-G3')).toContainText('▲');
    await expect(page.getByTestId('bench-row-G2')).toContainText(
      String(vi.parent.benchmark.trend.worse),
    );
  });

  test('mới có 1 tuần → hiện tuần đầu, báo chưa đủ dữ liệu để so sánh', async ({ page }) => {
    await seedProfiles(page, [p]);
    await seedRounds(page, p.id, [benchRound('G1', 10, { rtMeanMs: 700 })]);
    await page.goto(E2E_URL);
    await openParent(page, 'benchmark');
    await expect(page.getByTestId('bench-notcomparable')).toBeVisible();
    await expect(page.getByTestId('bench-first-G1')).toContainText('700');
  });

  test('banner “Thử thách tuần” ở Home: hiện khi chưa đủ bộ, bấm vào chạy đúng game chưa làm, bé không chọn độ khó', async ({
    page,
  }) => {
    // đã làm G1, G3 trong tuần này → còn G2 → ...
    await seedProfiles(page, [p]);
    await seedRounds(page, p.id, [
      benchRound('G1', 1, { rtMeanMs: 700 }),
      benchRound('G3', 1, { hitsPerMin: 22 }),
    ]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('benchmark-banner')).toBeVisible();
    await expect(page.getByTestId('benchmark-progress')).toContainText('2/7');
    await page.getByTestId('benchmark-start').click();
    // chạy game đầu tiên chưa làm = G2 (G1 đã làm)
    await expect(page.getByTestId('intro-bench')).toBeVisible();
    await expect(page.getByRole('heading', { name: vi.games.G2.name })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(0); // không có Dễ/Vừa/Tự động/Khó
  });

  test('chạy bài đo: cấp cố định theo levels.json, không tính độ khó thích ứng, sang game kế tiếp, đủ bộ thì tắt banner', async ({
    page,
  }) => {
    // đã làm 5 game; còn G1 và G2
    const done: GameId[] = ['G3', 'G4', 'G5', 'G6', 'G7'];
    await seedProfiles(page, [p]);
    await seedRounds(
      page,
      p.id,
      done.map((g) => benchRound(g, 2, { accuracy: 0.7 })),
    );
    await page.goto(E2E_URL);
    await expect(page.getByTestId('benchmark-banner')).toBeVisible();

    // G1 (game đầu tiên chưa làm)
    await page.getByTestId('benchmark-start').click();
    await expect(page.getByRole('heading', { name: vi.games.G1.name })).toBeVisible();
    await pressStart(page);
    await playG1(page);
    await expect(page.getByTestId('result')).toBeVisible();
    let r = await lastRound(page, p.id);
    expect(r).toMatchObject({
      gameId: 'G1',
      benchmark: true,
      mode: 'fixed',
      level: benchmarkLevel('G1'),
    });
    await expect(page.getByTestId('bench-progress')).toContainText('6/7');
    // sổ cấp của G1 không đổi (bài đo không tính vào sổ cấp nào)
    let st = await readState(page);
    for (const c of ['easy', 'normal', 'auto', 'hard'] as const) {
      expect(st.profiles[0]!.games.G1.tracks[c], c).toEqual({ level: 1, stars: 0, recent: [] });
    }
    expect(st.profiles[0]!.games.G1.lastChoice).toBe('auto');
    expect(r).not.toHaveProperty('trackLevel'); // bài đo không có “cấp của chế độ”
    expect(st.profiles[0]!.lastBenchmarkAt).toBeNull(); // chưa đủ bộ
    await expect(page.getByTestId('play-again')).toHaveCount(0);

    // sang G2
    await page.getByTestId('bench-next').click();
    await expect(page.getByRole('heading', { name: vi.games.G2.name })).toBeVisible();
    await pressStart(page);
    await playG2(page);
    await expect(page.getByTestId('result')).toBeVisible();
    r = await lastRound(page, p.id);
    expect(r).toMatchObject({ gameId: 'G2', benchmark: true, level: benchmarkLevel('G2') });
    await expect(page.getByTestId('bench-progress')).toContainText(vi.result.benchmarkDone);
    await expect(page.getByTestId('bench-next')).toHaveCount(0);

    // đủ bộ → ghi lastBenchmarkAt, Home hết banner
    st = await readState(page);
    expect(st.profiles[0]!.lastBenchmarkAt).not.toBeNull();
    await page.getByTestId('to-home').click();
    await expect(page.getByTestId('greeting')).toBeVisible();
    await expect(page.getByTestId('benchmark-banner')).toHaveCount(0);
  });

  test('nút “Bắt đầu bài đo cho bé” trong khu phụ huynh chạy luồng bài đo; thời gian bài đo tính vào giới hạn ngày', async ({
    page,
  }) => {
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'benchmark');
    await expect(page.getByTestId('bench-week')).toContainText('0/7');
    await page.getByTestId('bench-start').click();
    await expect(page.getByTestId('intro-bench')).toBeVisible();
    await pressStart(page);
    await playG1(page);
    await expect(page.getByTestId('result')).toBeVisible();
    const st = await readState(page);
    const day = Object.values(st.profiles[0]!.days)[0]!;
    expect(day.playMs).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------- cài đặt

test.describe('Tab Cài đặt (F07, F09, F11, F12, F17)', () => {
  test('thời gian/ngày và hộp tối đa/ngày: chỉnh bằng nút +/−, kẹp trong giới hạn, lưu ngay', async ({
    page,
  }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'settings');
    await expect(page.getByTestId('daily-value')).toHaveText('15');
    await page.getByTestId('daily-inc').click();
    await page.getByTestId('daily-inc').click();
    await expect(page.getByTestId('daily-value')).toHaveText('25');
    expect((await readState(page)).profiles[0]!.limits.dailyMinutes).toBe(25);
    for (let i = 0; i < 4; i++) await page.getByTestId('daily-dec').click();
    await expect(page.getByTestId('daily-value')).toHaveText('5'); // tối thiểu 5 phút
    await expect(page.getByTestId('daily-dec')).toBeDisabled();
    await page.getByTestId('boxes-dec').click();
    await page.getByTestId('boxes-dec').click();
    await page.getByTestId('boxes-dec').click();
    await expect(page.getByTestId('boxes-value')).toHaveText('0');
    expect((await readState(page)).profiles[0]!.limits).toEqual({
      dailyMinutes: 5,
      maxBoxesPerDay: 0,
    });
  });

  test('G2 Cố định cấp 5 + tùy chọn riêng; chơi 3 lượt thật tốt vẫn giữ cấp 5 (TC-015)', async ({
    page,
  }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'settings');
    const panel = page.getByTestId('pgame-G2');
    await panel.locator('summary').click();
    await page.getByTestId('mode-G2-fixed').click();
    await page.getByTestId('level-G2').selectOption('5');
    await expect(page.getByTestId('pgame-summary-G2')).toContainText(
      vi.parent.settings.summaryFixed(5),
    );
    await page.getByTestId('opt-G2-grid').selectOption('3');
    let g2 = (await readState(page)).profiles[0]!.games.G2;
    expect(g2).toMatchObject({ mode: 'fixed', level: 5, options: { grid: 3 } });
    // đặt lại “theo cấp độ” → xóa khóa tùy chọn
    await page.getByTestId('opt-G2-grid').selectOption('auto');
    g2 = (await readState(page)).profiles[0]!.games.G2;
    expect(g2.options).toEqual({});

    await page.getByTestId('parent-exit').click();
    for (let i = 0; i < 3; i++) {
      await startGame(page, 'G2');
      await playG2(page);
      await expect(page.getByTestId('result')).toBeVisible();
      await page.getByTestId('to-home').click();
    }
    expect((await readState(page)).profiles[0]!.games.G2).toMatchObject({
      mode: 'fixed',
      level: 5,
    });
  });

  test('Tự động min–max: cấp thấp nhất/cao nhất kéo theo nhau, cấp hiện tại của cả 4 chế độ luôn nằm trong khoảng', async ({
    page,
  }) => {
    // Dễ đã lên cấp 2, Khó cấp 9; Vừa và Tự động cấp 1
    const p = withTrack(
      withTrack(makeProfile('An'), 'G1', 'easy', { level: 2, stars: 2, recent: [3] }),
      'G1',
      'hard',
      { level: 9 },
    );
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'settings');
    await page.getByTestId('pgame-G1').locator('summary').click();
    // phụ huynh thấy cấp riêng của từng chế độ
    await expect(page.getByTestId('current-G1')).toHaveText(
      vi.parent.settings.currentLevels([
        [vi.intro.easy, 2],
        [vi.intro.normal, 1],
        [vi.intro.auto, 1],
        [vi.intro.hard, 9],
      ]),
    );
    await page.getByTestId('min-G1').selectOption('4');
    let g = (await readState(page)).profiles[0]!.games.G1;
    expect([g.minLevel, g.maxLevel]).toEqual([4, 10]);
    // cả 4 sổ được nâng lên cho nằm trong khoảng (Khó cấp 9 giữ nguyên)
    expect([
      g.tracks.easy.level,
      g.tracks.normal.level,
      g.tracks.auto.level,
      g.tracks.hard.level,
    ]).toEqual([4, 4, 4, 9]);
    await page.getByTestId('max-G1').selectOption('3'); // thấp hơn min → min kéo theo
    g = (await readState(page)).profiles[0]!.games.G1;
    expect([g.minLevel, g.maxLevel]).toEqual([3, 3]);
    expect(Object.values(g.tracks).map((t) => t.level)).toEqual([3, 3, 3, 3]);
    await expect(page.getByTestId('current-G1')).toHaveText(
      vi.parent.settings.currentLevels([
        [vi.intro.easy, 3],
        [vi.intro.normal, 3],
        [vi.intro.auto, 3],
        [vi.intro.hard, 3],
      ]),
    );
  });

  test('âm thanh / nhạc / rung và quyền chọn độ khó của bé (F12)', async ({ page }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'settings');
    // seedProfiles đặt sẵn: sound/music/vibration = false, kidChoice = true
    await page.getByTestId('set-sound').check();
    await page.getByTestId('set-vibration').check();
    await page.getByTestId('set-kidchoice').uncheck();
    expect((await readState(page)).settings).toEqual({
      sound: true,
      music: false,
      vibration: true,
      allowKidDifficultyChoice: false,
    });
    await page.getByTestId('parent-exit').click();
    await page.getByTestId('game-G1').click();
    await expect(page.getByTestId('start-game')).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(0); // bé không còn được chọn Dễ/Vừa/Khó
  });

  test('G6: đổi lớp đặt lại chủ đề mặc định; bật/tắt chủ đề, luôn còn ít nhất 1 (F17)', async ({
    page,
  }) => {
    const p = makeProfile('An'); // lớp 2: M02 M05 M06 M07 M08
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'settings');
    await page.getByTestId('pgame-G6').locator('summary').click();
    await page.getByTestId('topic-M01').check();
    let st = (await readState(page)).profiles[0]!;
    expect(st.math.topics).toEqual(['M01', 'M02', 'M05', 'M06', 'M07', 'M08']);
    await page.getByTestId('topic-M05').uncheck();
    st = (await readState(page)).profiles[0]!;
    expect(st.math.topics).not.toContain('M05');
    await page.getByTestId('math-grade-3').click();
    st = (await readState(page)).profiles[0]!;
    expect(st.grade).toBe(3);
    expect(st.math.topics).toEqual(levelsConfig.mathDefaultByGrade['3']);
    // tắt hết chủ đề → quay về mặc định của lớp (luôn còn ≥ 1)
    for (const t of levelsConfig.mathDefaultByGrade['3'])
      await page.getByTestId(`topic-${t}`).click();
    st = (await readState(page)).profiles[0]!;
    expect(st.math.topics.length).toBeGreaterThan(0);
  });

  test('G7: bật/tắt nhóm dạng câu, luôn còn ít nhất 1; tất cả bật = mặc định (xóa khóa)', async ({
    page,
  }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'settings');
    await page.getByTestId('pgame-G7').locator('summary').click();
    await page.getByTestId('group-matrix').uncheck();
    await page.getByTestId('group-numbers').uncheck();
    let g7 = (await readState(page)).profiles[0]!.games.G7;
    expect(g7.options.groups).toEqual(['shapes']);
    await page.getByTestId('group-shapes').click(); // không cho tắt hết
    g7 = (await readState(page)).profiles[0]!.games.G7;
    expect(g7.options.groups).toEqual(['shapes']);
    await expect(page.getByTestId('group-shapes')).toBeChecked();
    await page.getByTestId('group-numbers').check();
    await page.getByTestId('group-matrix').check();
    g7 = (await readState(page)).profiles[0]!.games.G7;
    expect(g7.options.groups).toBeUndefined();
    await page.getByTestId('opt-G7-timer').selectOption('sec30');
    expect((await readState(page)).profiles[0]!.games.G7.options.timer).toBe('sec30');
  });
});

// ---------------------------------------------------------------- hồ sơ

test.describe('Tab Hồ sơ (F02)', () => {
  test('thêm hồ sơ mới; sửa tên/avatar/lớp; xóa phải gõ đúng tên (xác nhận 2 bước)', async ({
    page,
  }) => {
    const a = makeProfile('An');
    await seedProfiles(page, [a]);
    await seedRounds(page, a.id, [mkRound(a.id, 'G1', 1, { metrics: { rtMeanMs: 700 } })]);
    await page.goto(E2E_URL);
    await openParent(page, 'profiles');

    // thêm
    await page.getByTestId('profile-add').click();
    await page.getByTestId('profile-name').fill('Bình');
    await page.getByTestId('avatar-fox').click();
    await page.getByTestId('grade-1').click();
    await page.getByTestId('profile-save').click();
    let st = await readState(page);
    expect(st.profiles.map((p) => [p.name, p.avatarId, p.grade])).toEqual([
      ['An', 'cat', 2],
      ['Bình', 'fox', 1],
    ]);
    expect(st.activeProfileId).toBe(a.id); // thêm từ khu PH không đổi người đang chơi
    expect(st.profiles[1]!.math.topics).toEqual(levelsConfig.mathDefaultByGrade['1']);

    // sửa
    const bId = st.profiles[1]!.id;
    await page.getByTestId(`profile-edit-${bId}`).click();
    await page.getByTestId('profile-name').fill('Bình Bự');
    await page.getByTestId('grade-3').click();
    await page.getByTestId('profile-save').click();
    st = await readState(page);
    expect(st.profiles[1]).toMatchObject({ name: 'Bình Bự', grade: 3 });
    expect(st.profiles[1]!.math.topics).toEqual(levelsConfig.mathDefaultByGrade['3']);

    // xóa: nút bị khóa cho tới khi gõ đúng tên
    await page.getByTestId(`profile-delete-${bId}`).click();
    await expect(page.getByTestId('delete-confirm')).toBeDisabled();
    await page.getByTestId('delete-type').fill('Bình');
    await expect(page.getByTestId('delete-confirm')).toBeDisabled();
    await page.getByTestId('delete-type').fill('bình bự');
    await expect(page.getByTestId('delete-confirm')).toBeEnabled();
    await page.getByTestId('delete-confirm').click();
    st = await readState(page);
    expect(st.profiles.map((p) => p.name)).toEqual(['An']);
    expect(await readKey(page, `ntm.rounds.${bId}`)).toBeNull();

    // xóa hồ sơ đang chơi (cuối cùng) → chưa còn hồ sơ nào
    await page.getByTestId(`profile-delete-${a.id}`).click();
    await page.getByTestId('delete-type').fill('An');
    await page.getByTestId('delete-confirm').click();
    st = await readState(page);
    expect(st.profiles).toHaveLength(0);
    expect(st.activeProfileId).toBeNull();
    expect(await readKey(page, `ntm.rounds.${a.id}`)).toBeNull();
    expect(await readKey(page, `ntm.daily.${a.id}`)).toBeNull();
  });

  test('đủ 5 hồ sơ thì không thêm nữa', async ({ page }) => {
    const ps = ['An', 'Bình', 'Cúc', 'Dũng', 'Em'].map((n) => makeProfile(n));
    await seedProfiles(page, ps);
    await page.goto(E2E_URL);
    // nhiều hồ sơ → màn chọn người chơi; vào khu PH bằng route trực tiếp
    await page.evaluate(() => {
      location.hash = '#/parent-gate';
    });
    await solveGate(page);
    await page.getByTestId('tab-profiles').click();
    await expect(page.getByTestId('profile-add')).toHaveCount(0);
    await expect(page.getByTestId('profiles-tab')).toContainText(vi.parent.profiles.full);
  });
});

// ---------------------------------------------------------------- thưởng

test.describe('Tab Thưởng (F15, TC-023)', () => {
  test('hết giờ → +10 phút → Home mở lại thẻ game, đồng hồ còn 10 phút (TC-023)', async ({
    page,
  }) => {
    const p = makeProfile('An', {}, { playMs: 15 * 60_000 });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('time-left')).toContainText(vi.home.outOfTime);
    await expect(page.getByTestId('game-G1')).toBeDisabled();

    await openParent(page, 'rewards');
    await expect(page.getByTestId('reward-today')).toContainText('còn 0 phút');
    await page.getByTestId('reason-chores').click();
    await page.getByTestId('give-time-10').click();
    await expect(page.getByTestId('reward-status')).toContainText('10 phút');
    await expect(page.getByTestId('reward-today')).toContainText('còn 10 phút');

    await page.getByTestId('parent-exit').click();
    await expect(page.getByTestId('time-left')).toHaveText(vi.home.timeLeft(10));
    await expect(page.getByTestId('game-G1')).toBeEnabled();
    const st = await readState(page);
    const day = Object.values(st.profiles[0]!.days)[0]!;
    expect(day.bonusMs).toBe(10 * 60_000);
    expect(st.profiles[0]!.rewardLog[0]).toMatchObject({
      kind: 'time',
      amount: 10,
      reason: 'chores',
    });
  });

  test('tặng hộp quà kèm lý do: bé có hộp chờ ở Home, không tính giới hạn hộp/ngày', async ({
    page,
  }) => {
    const p = makeProfile('An', { limits: { dailyMinutes: 15, maxBoxesPerDay: 0 } });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'rewards');
    await page.getByTestId('reason-goodStudy').click();
    await page.getByTestId('give-box-2').click();
    await expect(page.getByTestId('reward-status')).toContainText('2 hộp quà');
    await expect(page.getByTestId('reward-pending')).toContainText('2');
    await expect(page.getByTestId('reward-log')).toContainText(
      vi.parent.rewards.reasons.goodStudy!,
    );
    const st = await readState(page);
    expect(st.profiles[0]!.boxes.pending).toBe(2);
    expect(st.profiles[0]!.rewardLog[0]).toMatchObject({
      kind: 'box',
      amount: 2,
      reason: 'goodStudy',
    });
    await page.getByTestId('parent-exit').click();
    await expect(page.getByTestId('gift-row')).toContainText('2');
  });

  test('chọn hồ sơ khác trong khu PH: thưởng chỉ vào hồ sơ đó', async ({ page }) => {
    const a = makeProfile('An');
    const b = makeProfile('Bình');
    await seedProfiles(page, [a, b], a.id);
    await page.goto(E2E_URL);
    await page.evaluate(() => {
      location.hash = '#/parent-gate';
    });
    await solveGate(page);
    await page.getByTestId('tab-rewards').click();
    await page.getByTestId(`pick-${b.id}`).click();
    await page.getByTestId('give-time-5').click();
    const st = await readState(page);
    const bonus = (id: string) =>
      Object.values(st.profiles.find((p) => p.id === id)!.days).reduce((s, d) => s + d.bonusMs, 0);
    expect(bonus(a.id)).toBe(0);
    expect(bonus(b.id)).toBe(5 * 60_000);
  });
});

// ---------------------------------------------------------------- dữ liệu

test.describe('Tab Dữ liệu – xuất CSV (TASK-10)', () => {
  /** Đọc file CSV đơn giản (không có ô chứa dấu phẩy/xuống dòng trong dữ liệu thử): [dòng đầu “sep=,”, tiêu đề, …]. */
  function readCsv(path: string): { bom: boolean; sep: string; lines: string[][] } {
    const text = readFileSync(path, 'utf-8');
    const bom = text.charCodeAt(0) === 0xfeff;
    const all = text
      .slice(bom ? 1 : 0)
      .split('\r\n')
      .filter((l) => l !== '');
    return { bom, sep: all[0] ?? '', lines: all.slice(1).map((l) => l.split(',')) };
  }

  test('xuất lịch sử từng lượt và tổng hợp theo ngày của bé đang xem ra file .csv (UTF-8 có BOM, Excel đọc được)', async ({
    page,
  }) => {
    const p = makeProfile('Bé Na');
    await seedProfiles(page, [p]);
    // Giờ bắt đầu ghi RÕ RÀNG: giờ mặc định của mkRound tính từ bộ đếm dùng chung của cả luồng test nên hai lượt cùng
    // ngày có thể đảo thứ tự khi bộ đếm quay vòng (đã gây một lần đỏ giả ở khung tablet dọc).
    await seedRounds(page, p.id, [
      mkRound(p.id, 'G1', 2, {
        startedAt: isoDaysAgo(2, 9),
        score: 0.9,
        metrics: { rtMeanMs: 640, accuracy: 0.95 },
      }),
      mkRound(p.id, 'G2', 1, {
        startedAt: isoDaysAgo(1, 9),
        metrics: { timeSec: 30 },
        benchmark: true,
        deviceClass: 'tablet',
      }),
      mkRound(p.id, 'G1', 1, {
        startedAt: isoDaysAgo(1, 15),
        score: 0.5,
        stars: 1,
        metrics: { rtMeanMs: 800 },
      }),
    ]);
    await page.goto(E2E_URL);
    await openParent(page, 'data');
    await expect(page.getByTestId('csv-section')).toContainText(p.name);

    // lịch sử từng lượt
    const [d1] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('csv-rounds').click(),
    ]);
    expect(d1.suggestedFilename()).toMatch(/^nhanhtay-lichsu-be-na-\d{8}\.csv$/);
    const rounds = readCsv(await d1.path());
    expect(rounds.bom).toBe(true);
    expect(rounds.sep).toBe('sep=,'); // Excel (kể cả máy đặt dấu phân cách “;”) tách cột đúng
    const [header, ...rows] = rounds.lines;
    expect(header!.slice(0, 3)).toEqual([
      vi.parent.data.csv.date,
      vi.parent.data.csv.time,
      vi.parent.data.csv.game,
    ]);
    expect(header).toContain(vi.parent.metrics.rtMeanMs);
    expect(header).toContain(vi.parent.metrics.timeSec);
    // cột 3 = cấp nội dung thật, cột 4 = cấp của chế độ bé thấy (1.1.0; trống ở lượt cũ/bài đo)
    expect(header!.slice(3, 5)).toEqual([vi.parent.data.csv.level, vi.parent.data.csv.trackLevel]);
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r[2])).toEqual([
      vi.games.G1!.name,
      vi.games.G2!.name,
      vi.games.G1!.name,
    ]);
    expect(rows[0]![4]).toBe(''); // lượt gieo không có trackLevel
    expect(rows[0]![7]).toBe('90'); // điểm %
    expect(rows[1]![6]).toBe(vi.parent.data.csv.yes); // lượt bài đo
    expect(rows[1]![10]).toBe(vi.parent.progress.devices.tablet);
    await expect(page.getByTestId('data-message')).toContainText(d1.suggestedFilename());

    // tổng hợp theo ngày
    const [d2] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('csv-daily').click(),
    ]);
    expect(d2.suggestedFilename()).toMatch(/^nhanhtay-tonghop-be-na-\d{8}\.csv$/);
    const daily = readCsv(await d2.path());
    expect(daily.bom).toBe(true);
    const [dHeader, ...dRows] = daily.lines;
    expect(dHeader![0]).toBe(vi.parent.data.csv.date);
    expect(dRows.length).toBeGreaterThanOrEqual(2); // ≥ 2 ngày/game có số liệu (lượt bài đo không tính vào tổng hợp)
  });

  test('chưa có lượt chơi nào: file chỉ có dòng tiêu đề, không lỗi; không có hồ sơ thì không hiện phần xuất', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await openParent(page, 'data');
    const [d] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('csv-rounds').click(),
    ]);
    const csv = readCsv(await d.path());
    expect(csv.sep).toBe('sep=,');
    expect(csv.lines).toHaveLength(1); // chỉ có dòng tiêu đề
  });
});

test.describe('Tab Dữ liệu (F10, TC-025)', () => {
  test('sao lưu ra file → xóa dữ liệu trình duyệt → mở app → khôi phục từ file: mọi thứ quay lại (TC-025)', async ({
    page,
    context,
  }) => {
    const p = makeProfile('An', { totalStars: 42, stickers: { 'stk-01': 2 } });
    await seedProfiles(page, [p]);
    await seedRounds(page, p.id, [
      mkRound(p.id, 'G1', 2, { metrics: { rtMeanMs: 640 } }),
      mkRound(p.id, 'G2', 1, { metrics: { timeSec: 30 } }),
    ]);
    await page.goto(E2E_URL);
    await openParent(page, 'data');
    await expect(page.getByTestId('last-backup')).toContainText(vi.parent.data.neverBackup);
    await expect(page.getByTestId('app-version')).toBeVisible();
    await expect(page.getByTestId('health-note')).toBeVisible();
    await expect(page.getByTestId('data-warnings')).toContainText('ẩn danh');

    // 1) Sao lưu → tải file về
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('backup-button').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^nhanhtay-backup-\d{8}\.json$/);
    const file = await download.path();
    const text = readFileSync(file, 'utf-8');
    const json = JSON.parse(text);
    expect(json.format).toBe('nhanhtay-backup');
    expect(json.state.profiles[0].totalStars).toBe(42);
    expect(json.rounds[p.id]).toHaveLength(2);
    expect(json.daily[p.id].length).toBeGreaterThan(0);
    await expect(page.getByTestId('data-message')).toContainText(download.suggestedFilename());
    expect((await readState(page)).lastBackupAt).not.toBeNull();
    await expect(page.getByTestId('last-backup')).toContainText(
      vi.parent.data.lastBackup('').trim(),
    );

    // 2) Trình duyệt “bị xóa dữ liệu”: trang mới không gieo dữ liệu
    const fresh = await context.newPage();
    await fresh.goto(E2E_URL);
    await fresh.evaluate(() => localStorage.clear());
    await fresh.reload();
    await expect(fresh.getByTestId('restore-first')).toBeVisible(); // màn tạo hồ sơ lần đầu

    // 3) Khôi phục: nút → khóa phụ huynh → tab Dữ liệu → chọn file → xem trước → xác nhận
    await fresh.getByTestId('restore-first').click();
    await solveGate(fresh);
    await expect(fresh.getByTestId('data-tab')).toBeVisible(); // chưa có hồ sơ → vào thẳng tab Dữ liệu
    await fresh.getByTestId('restore-file').setInputFiles(file);
    await expect(fresh.getByTestId('restore-preview')).toBeVisible();
    await expect(fresh.getByTestId('preview-profiles')).toContainText('1 hồ sơ');
    await expect(fresh.getByTestId('preview-total')).toContainText('2 lượt');
    await expect(fresh.getByTestId('restore-preview')).toContainText('An: 2 lượt chơi');
    // chưa xác nhận → chưa ghi gì
    expect((await readState(fresh))?.profiles ?? []).toHaveLength(0);
    await fresh.getByTestId('restore-confirm').click();

    // máy chưa có hồ sơ → khôi phục xong về thẳng Home, hồ sơ và sao đã trở lại
    await expect(fresh.getByTestId('greeting')).toContainText('An');
    await expect(fresh.getByTestId('total-stars')).toContainText('42');
    const st = await readState(fresh);
    expect(st.profiles).toHaveLength(1);
    expect(st.profiles[0]).toMatchObject({ name: 'An', totalStars: 42, stickers: { 'stk-01': 2 } });
    expect(st.activeProfileId).toBe(p.id);
    expect((await readRounds(fresh, p.id)).map((r) => r.gameId)).toEqual(['G1', 'G2']);
    expect(((await readKey<unknown[]>(fresh, `ntm.daily.${p.id}`)) ?? []).length).toBeGreaterThan(
      0,
    );

    // 4) Lịch sử có trong biểu đồ
    await openParent(fresh);
    await expect.poll(async () => (await chartData(fresh)).values?.length).toBe(1);
  });

  test('file sao lưu sai: báo lỗi rõ ràng, không ghi đè dữ liệu', async ({ page }, testInfo) => {
    const p = makeProfile('An', { totalStars: 9 });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page, 'data');
    const bad = testInfo.outputPath('bad.json');
    const fs = await import('node:fs');
    fs.writeFileSync(bad, '{"khong":"phai sao luu"}');
    await page.getByTestId('restore-file').setInputFiles(bad);
    await expect(page.getByTestId('data-message')).toContainText(vi.parent.data.errors.notBackup!);
    await expect(page.getByTestId('restore-preview')).toHaveCount(0);
    fs.writeFileSync(bad, 'khong phai json');
    await page.getByTestId('restore-file').setInputFiles(bad);
    await expect(page.getByTestId('data-message')).toContainText(vi.parent.data.errors.notJson!);
    expect((await readState(page)).profiles[0]!.totalStars).toBe(9);
  });

  test('nhắc sao lưu khi > 14 ngày chưa sao lưu (hoặc chưa từng) ở mọi tab', async ({ page }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openParent(page);
    await expect(page.getByTestId('backup-reminder')).toBeVisible(); // chưa từng sao lưu
    await page.getByTestId('tab-settings').click();
    await expect(page.getByTestId('backup-reminder')).toBeVisible();
    await page.getByTestId('backup-reminder').getByRole('button').click(); // “Sao lưu ngay” → tab Dữ liệu
    await expect(page.getByTestId('data-tab')).toBeVisible();
    await page.getByTestId('backup-button').click();
    await expect(page.getByTestId('backup-reminder')).toHaveCount(0); // vừa sao lưu xong
  });

  test('Home: chấm nhắc sao lưu trên nút Phụ huynh khi đã có sao; sao lưu xong thì hết chấm', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 12 })]);
    await page.goto(E2E_URL);
    const open = page.getByTestId('open-parent');
    await expect(page.getByTestId('backup-dot')).toBeVisible();
    await expect(page.getByTestId('backup-dot')).toHaveText(''); // chỉ là chấm, không chữ cho bé
    await expect(open).toHaveAccessibleName(vi.home.parentBackup);
    expect(vi.home.parentBackup.startsWith(vi.home.parent)).toBe(true); // tìm theo tên “Phụ huynh” vẫn thấy
    const box = (await open.boundingBox())!; // vùng chạm không bị chấm làm nhỏ đi
    expect(box.width).toBeGreaterThanOrEqual(48);
    expect(box.height).toBeGreaterThanOrEqual(48);

    await openParent(page, 'data'); // bấm nút có chấm vẫn vào khóa PH như thường
    await page.getByTestId('backup-button').click();
    await expect(page.getByTestId('backup-reminder')).toHaveCount(0);
    await page.getByTestId('parent-exit').click();
    await expect(page.getByTestId('greeting')).toBeVisible();
    await expect(page.getByTestId('backup-dot')).toHaveCount(0);
    await expect(open).toHaveAccessibleName(vi.home.parent);
  });

  test('Home: hồ sơ chưa có sao thì chưa nhắc sao lưu (không chấm)', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('greeting')).toBeVisible();
    await expect(page.getByTestId('backup-dot')).toHaveCount(0);
    await expect(page.getByTestId('open-parent')).toHaveAccessibleName(vi.home.parent);
  });

  test('nút Quay lại của Android ở khu phụ huynh về Home và khóa lại', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await openParent(page);
    await page.goBack();
    await expect(page.getByTestId('greeting')).toBeVisible();
    await page.evaluate(() => {
      location.hash = '#/parent/data';
    });
    await expect(page.getByTestId('parent-gate')).toBeVisible();
  });
});

// ---------------------------------------------------------------- bố cục

test.describe('Bố cục khu phụ huynh (3 khung hình)', () => {
  test('mỗi tab không tràn ngang; nút/vùng chạm chính ≥ 48px; khóa PH bàn phím ≥ 56px', async ({
    page,
  }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p, makeProfile('Bình')]);
    await seedRounds(page, p.id, [
      mkRound(p.id, 'G1', 2, { metrics: { rtMeanMs: 640 } }),
      mkRound(p.id, 'G1', 1, { metrics: { rtMeanMs: 600 } }),
    ]);
    await page.goto(E2E_URL); // nhiều hồ sơ → màn chọn người chơi; vào khóa PH bằng route trực tiếp
    await page.evaluate(() => {
      location.hash = '#/parent-gate';
    });
    await expect(page.getByTestId('parent-gate')).toBeVisible();
    // khóa PH
    for (const k of ['1', '5', '0']) {
      const b = (await page.getByTestId(`gate-key-${k}`).boundingBox())!;
      expect(b.width).toBeGreaterThanOrEqual(56);
      expect(b.height).toBeGreaterThanOrEqual(56);
    }
    expect(await overflowX(page)).toBe(false);
    await solveGate(page);

    for (const tab of ['progress', 'benchmark', 'settings', 'profiles', 'rewards', 'data']) {
      await page.getByTestId(`tab-${tab}`).click();
      await expect(page.getByTestId('parent-area')).toHaveAttribute('data-tab', tab);
      expect(await overflowX(page), `tràn ngang ở tab ${tab}`).toBe(false);
      for (const sel of [`[data-testid="tab-${tab}"]`, '[data-testid="parent-exit"]']) {
        const b = (await page.locator(sel).boundingBox())!;
        expect(b.height).toBeGreaterThanOrEqual(48);
      }
    }
    // mở hết các game ở tab Cài đặt cũng không tràn ngang
    await page.getByTestId('tab-settings').click();
    for (const g of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']) {
      await page.getByTestId(`pgame-${g}`).locator('summary').click();
    }
    expect(await overflowX(page)).toBe(false);
    // các ô chọn/nút trong cài đặt ≥ 48px
    const small = await page.evaluate(() => {
      const els = [...document.querySelectorAll<HTMLElement>('.pselect, .stepper .btn, .pseg-btn')];
      return els.filter((e) => e.offsetParent && e.getBoundingClientRect().height < 47.5).length;
    });
    expect(small).toBe(0);
  });
});

async function overflowX(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
}
