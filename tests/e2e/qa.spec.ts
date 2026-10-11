// TASK-09 – test bổ sung cho các test case trước đây chỉ ghi “Thủ công”: TC-028 và TC-035 (mức mô phỏng).
// Phần chạy trên thiết bị thật (đen trắng thật trên màn hình, tablet Samsung thật) vẫn cần chủ dự án thử.
import { expect, test, type Page } from '@playwright/test';
import { mulberry32 } from '../../src/app/rng';
import {
  DEFAULT_G1_OPTIONS,
  resolveG1Params,
  type BallKind,
} from '../../src/games/g1-balls/config';
import { SpawnPlanner, ballDiameter } from '../../src/games/g1-balls/logic';
import { vi } from '../../src/i18n/vi';
import {
  E2E_URL,
  g1Snapshot,
  makeProfile,
  openIntro,
  pressStart,
  seedProfiles,
  startGame,
  withGame,
} from './helpers';

async function leaveRound(page: Page) {
  await page.getByTestId('pause-button').click();
  await page.getByRole('button', { name: vi.play.exit }).click();
  await expect(page.getByTestId('greeting')).toBeVisible();
}

// ------------------------------------------------------------------ TC-035

interface Probe {
  vibrate: unknown[];
  tones: string[];
  shakes: number;
}

declare global {
  interface Window {
    __probe: Probe;
  }
}

test.describe('TC-035 – không có rung: lắc hình + âm “bụp” nhẹ, không báo lỗi (R25)', () => {
  test('chạm bóng đỏ → khung lắc + âm bụp; tablet không gọi rung, điện thoại có rung nhẹ', async ({
    page,
  }, testInfo) => {
    const isTablet = testInfo.project.name.startsWith('tablet');
    await seedProfiles(page, [makeProfile('An')], 'id-An', { sound: true, vibration: true });
    await page.addInitScript(() => {
      const probe: Probe = { vibrate: [], tones: [], shakes: 0 };
      window.__probe = probe;
      // đếm lệnh rung (tablet Samsung không có mô-tơ rung; app không được phụ thuộc vào nó)
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: (p: unknown) => {
          probe.vibrate.push(p);
          return true;
        },
      });
      // ghi dạng sóng mỗi âm được phát (“bụp” = sóng tam giác, 190 → 140 Hz)
      const start = OscillatorNode.prototype.start;
      OscillatorNode.prototype.start = function (...args: [number?]) {
        probe.tones.push(this.type);
        return start.apply(this, args);
      };
      // đếm số lần khung chơi nhận lớp .shake
      new MutationObserver((list) => {
        for (const m of list) {
          const el = m.target as HTMLElement;
          if (el.dataset?.testid === 'game-host' && el.classList.contains('shake')) probe.shakes++;
        }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
    });
    await page.goto(E2E_URL); // seed 12345: bóng đầu tiên là bóng đỏ
    await startGame(page, 'G1');

    // chờ bóng đỏ hiện hình rồi chạm
    await expect
      .poll(async () => (await g1Snapshot(page))?.balls.some((b) => b.kind === 'red'))
      .toBe(true);
    const snap = (await g1Snapshot(page))!;
    const red = snap.balls.find((b) => b.kind === 'red')!;
    const tonesBefore = await page.evaluate(
      () => window.__probe.tones.filter((t) => t === 'triangle').length,
    );
    await page.touchscreen.tap(snap.x + red.x, snap.y + red.y);

    // 1) game ghi nhận lỗi nhẹ, 2) khung lắc, 3) phát âm bụp
    await expect.poll(async () => (await g1Snapshot(page))!.stats.falseAlarms).toBe(1);
    await expect.poll(() => page.evaluate(() => window.__probe.shakes)).toBeGreaterThan(0);
    const tonesAfter = await page.evaluate(
      () => window.__probe.tones.filter((t) => t === 'triangle').length,
    );
    expect(tonesAfter - tonesBefore).toBeGreaterThanOrEqual(1);

    // rung chỉ có ở điện thoại; tablet tuyệt đối không gọi
    const vib = await page.evaluate(() => window.__probe.vibrate);
    if (isTablet) expect(vib).toHaveLength(0);
    else expect(vib.length).toBeGreaterThan(0);

    // không báo lỗi: chỉ có lời động viên nhẹ, không có hộp thoại/thông báo lỗi
    await expect(page.locator('.hint-bubble')).toBeVisible();
    expect(vi.encourage).toContain(await page.locator('.hint-bubble').innerText());
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await leaveRound(page);
  });
});

// ------------------------------------------------------------------ TC-028

/** Seed nhỏ nhất mà 3 nhóm bóng đầu tiên của G1 cấp 8 có đủ cả 4 loại (xanh, đỏ, vàng, nâu). */
function seedWithAllKinds(level: number): number {
  const params = resolveG1Params(level, DEFAULT_G1_OPTIONS);
  for (let s = 1; s < 5000; s++) {
    const rng = mulberry32((mulberry32(s)() * 4294967296) >>> 0); // cùng cách view.ts tách luồng
    const planner = new SpawnPlanner(rng, params);
    const kinds = new Set<BallKind>();
    for (let i = 0; i < 3; i++) for (const k of planner.next()) kinds.add(k);
    if (kinds.size === 4) return s;
  }
  throw new Error('Không tìm được seed phù hợp');
}

type Silhouette = 'circle' | 'square' | 'triangle' | 'diamond';

interface ShapeSample {
  area: number;
  fill: number; // diện tích / hình chữ nhật bao
  ratio: number; // độ rộng dải đáy / dải đỉnh
}

/** Phân loại hình dạng chỉ dựa trên hình bóng (kênh alpha của canvas) → hoàn toàn độc lập với màu. */
function classify(d: ShapeSample): Silhouette {
  if (d.ratio > 2.2) return 'triangle'; // đáy rộng, đỉnh nhọn
  if (d.fill > 0.9) return 'square'; // gần kín hình chữ nhật bao
  if (d.fill > 0.65) return 'circle'; // π/4 ≈ 0,785
  return 'diamond'; // ≈ 0,5 và đối xứng trên/dưới
}

test.describe('TC-028 – G1 cấp ≥ 8: 4 loại bóng phân biệt được bằng hình dạng (UI03, R01)', () => {
  test('hình bóng xanh/đỏ/vàng/nâu đôi một khác nhau, không cần màu (mô phỏng ảnh đen trắng)', async ({
    page,
  }) => {
    const level = 8;
    const p = withGame(makeProfile('An'), 'G1', { level, mode: 'fixed' });
    await seedProfiles(page, [p]);
    await page.goto(`/?e2e=1&seed=${seedWithAllKinds(level)}`);
    await openIntro(page, 'G1');
    await pressStart(page);

    const info = (await g1Snapshot(page))!;
    const diameter = ballDiameter(info.w, info.h);
    // Lấy mẫu từng khung hình ngay trong trang (bóng chỉ hiện ~0,65 giây): với mỗi bóng, đọc kênh alpha của
    // canvas quanh tâm bóng, lấy thành phần liên thông chứa tâm (bỏ bóng đổ mờ), giữ mẫu lớn nhất mỗi loại.
    const best = await page.evaluate(
      ({ diameter }) =>
        new Promise<Record<string, ShapeSample>>((resolve) => {
          const host = document.querySelector<HTMLElement>('[data-testid="game-host"]')!;
          const canvas = host.querySelector('canvas')!;
          const cx = canvas.getContext('2d')!;
          const k = canvas.width / canvas.clientWidth;
          const half = Math.ceil((0.7 * diameter + 8) * k);
          const out: Record<string, ShapeSample> = {};
          const t0 = performance.now();

          function sample(bx: number, by: number): ShapeSample | null {
            const x0 = Math.max(0, Math.round(bx * k) - half);
            const y0 = Math.max(0, Math.round(by * k) - half);
            const w = Math.min(canvas.width - x0, 2 * half);
            const h = Math.min(canvas.height - y0, 2 * half);
            const px = cx.getImageData(x0, y0, w, h).data;
            const solid = (i: number) => (px[i * 4 + 3] ?? 0) > 200;
            const start = (Math.round(by * k) - y0) * w + (Math.round(bx * k) - x0);
            if (!solid(start)) return null;
            const seen = new Uint8Array(w * h);
            const stack = [start];
            seen[start] = 1;
            let minX = w,
              maxX = 0,
              minY = h,
              maxY = 0,
              area = 0;
            const rows = new Int32Array(h);
            while (stack.length) {
              const i = stack.pop()!;
              const x = i % w;
              const y = (i - x) / w;
              area++;
              rows[y]!++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              for (const [dx, dy] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
              ] as const) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                const j = ny * w + nx;
                if (!seen[j] && solid(j)) {
                  seen[j] = 1;
                  stack.push(j);
                }
              }
            }
            const bw = maxX - minX + 1;
            const bh = maxY - minY + 1;
            const band = Math.max(1, Math.round(bh * 0.2));
            let top = 0;
            let bottom = 0;
            for (let r = 0; r < band; r++) {
              top += rows[minY + r] ?? 0;
              bottom += rows[maxY - r] ?? 0;
            }
            return { area, fill: area / (bw * bh), ratio: bottom / Math.max(1, top) };
          }

          const tick = () => {
            const balls: { kind: string; x: number; y: number }[] = JSON.parse(
              host.dataset.balls ?? '[]',
            );
            for (const b of balls) {
              const s = sample(b.x, b.y);
              if (s && s.area > (out[b.kind]?.area ?? 0)) out[b.kind] = s;
            }
            if (Object.keys(out).length === 4 || performance.now() - t0 > 5500) resolve(out);
            else requestAnimationFrame(tick);
          };
          tick();
        }),
      { diameter },
    );

    expect(Object.keys(best).sort(), JSON.stringify(best)).toEqual([
      'brown',
      'green',
      'red',
      'yellow',
    ]);
    const shapes = Object.fromEntries(
      Object.entries(best).map(([kind, d]) => [kind, classify(d)]),
    ) as Record<BallKind, Silhouette>;
    expect(shapes, JSON.stringify(best)).toEqual({
      green: 'circle',
      red: 'square',
      yellow: 'triangle',
      brown: 'diamond',
    });
    // đôi một khác nhau
    expect(new Set(Object.values(shapes)).size).toBe(4);
    await leaveRound(page);
  });
});

// ------------------------------------------------------------------ app mở xuyên đêm

test.describe('Qua nửa đêm khi app vẫn mở ở Home (rủi ro ghi ở TASK-07)', () => {
  test('sau 00:00 Home hiện lại đủ giờ chơi, thẻ game mở khóa, nhiệm vụ mới', async ({ page }) => {
    const now = new Date();
    // đặt đồng hồ trang là 23:59:50 hôm nay (giờ máy) – hồ sơ gieo sẵn đã hết giờ và xong nhiệm vụ hôm nay
    await page.clock.install({
      time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 50),
    });
    const p = makeProfile(
      'An',
      {},
      {
        playMs: 15 * 60_000,
        missions: { reflex: true, focus: true, learn: true, rewarded: true },
        boxesEarned: 1,
      },
    );
    await seedProfiles(page, [p]);
    await page.goto('/');
    await expect(page.getByTestId('game-G1')).toBeDisabled(); // hết giờ hôm nay → khóa
    await expect(page.locator('.mission.is-done').first()).toBeVisible();

    // qua nửa đêm: ngày mới → thẻ game phải mở lại mà không cần thao tác gì
    await page.clock.fastForward(30_000);
    await expect(page.getByTestId('game-G1')).toBeEnabled();
    await expect(page.locator('.mission.is-done')).toHaveCount(0);
  });

  test('máy ngủ qua đêm rồi bật lại (visibilitychange) cũng cập nhật ngày mới', async ({
    page,
  }) => {
    const now = new Date();
    await page.clock.install({
      time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0),
    });
    await seedProfiles(page, [makeProfile('An', {}, { playMs: 15 * 60_000 })]);
    await page.goto('/');
    await expect(page.getByTestId('game-G1')).toBeDisabled();
    // đồng hồ nhảy một mạch sang 7h sáng hôm sau (máy ngủ, bộ hẹn giờ không chạy), rồi trang hiện lại
    await page.clock.setSystemTime(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0, 0),
    );
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByTestId('game-G1')).toBeEnabled();
  });
});
