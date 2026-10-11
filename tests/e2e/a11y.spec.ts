// TASK-09 – rà soát accessibility tự động trên mọi màn hình ở 3 khung hình:
//   · vùng chạm ≥ 48px (CLAUDE.md quy tắc 8, NF04)
//   · prefers-reduced-motion: không còn hoạt ảnh lặp vô hạn đang chạy
//   · tương phản chữ/nền theo WCAG AA (4,5:1; chữ lớn 3:1), tính từ màu thật đang hiển thị
// Mỗi test duyệt một nhóm màn hình, gom lỗi rồi báo một lần (kèm tên màn hình) để dễ sửa.
import { expect, test, type Page } from '@playwright/test';
import { vi } from '../../src/i18n/vi';
import { E2E_URL, makeProfile, openIntro, playG2, pressStart, seedProfiles } from './helpers';

/** Thống kê mỗi màn hình (đo bao nhiêu chữ, tỷ lệ sát ngưỡng) – in ra để người đọc báo cáo kiểm chứng. */
const stats: string[] = [];

interface Issues {
  touch: string[];
  motion: string[];
  contrast: string[];
}

/** Chạy trong trang: các phần tử bấm được có cạnh ngắn < min. */
function findSmallTargets(min: number): string[] {
  const SEL =
    'button, a[href], input, select, textarea, summary, [role="button"], [role="radio"], [role="tab"], [role="checkbox"], [role="switch"]';
  const out: string[] = [];
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(SEL))) {
    if (el.closest('[aria-hidden="true"], [inert]')) continue;
    let t: HTMLElement = el;
    if (el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox')) {
      t = el.labels?.[0] ?? el.closest('label') ?? el;
    }
    const cs = getComputedStyle(t);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = t.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.width < min - 0.5 || r.height < min - 0.5) {
      const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 28);
      const id = el.getAttribute('data-testid');
      out.push(
        `${el.tagName.toLowerCase()}${id ? `[${id}]` : ''} "${name}" ${Math.round(r.width)}×${Math.round(r.height)}`,
      );
    }
  }
  return out;
}

/**
 * Chạy trong trang: nút mà tâm của nó thuộc về MỘT NÚT KHÁC (bị đè lên). Ví dụ từng gặp: ép `min-width` làm chữ “★ Tự động”
 * tràn sang đè nút “Khó” → chạm vào “Khó” lại chọn “Tự động”. Phần phủ không bấm được (hộp thoại, màn tạm dừng) không tính.
 */
function findObstructed(): string[] {
  const SEL =
    'button, a[href], input, select, textarea, summary, [role="button"], [role="radio"], [role="tab"], [role="checkbox"], [role="switch"]';
  const out: string[] = [];
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(SEL))) {
    if (el.closest('[aria-hidden="true"], [inert]')) continue;
    const closed = el.closest('details:not([open])');
    if (closed && !el.matches('summary')) continue; // nội dung của khối đang đóng (không hiển thị)
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue; // đang nằm ngoài màn hình
    const top = document.elementFromPoint(x, y);
    if (!top || el.contains(top) || top.contains(el)) continue;
    const other = top.closest(SEL);
    // nút nằm trong lớp phủ cố định (hộp thoại, màn tạm dừng) phủ lên nền phía sau là hợp lệ
    let overlay = false;
    for (let n: HTMLElement | null = other as HTMLElement | null; n; n = n.parentElement) {
      if (getComputedStyle(n).position === 'fixed' || n.getAttribute('role') === 'dialog')
        overlay = true;
    }
    if (other && other !== el && !overlay) {
      out.push(
        `"${(el.textContent ?? '').trim().slice(0, 20)}" bị nút "${(other.textContent ?? '').trim().slice(0, 20)}" đè lên`,
      );
    }
  }
  return out;
}

/** Chạy trong trang: hoạt ảnh lặp vô hạn đang chạy. */
function findInfiniteAnimations(): string[] {
  const out = new Set<string>();
  for (const a of document.getAnimations()) {
    const timing = a.effect?.getComputedTiming();
    if (!timing || timing.iterations !== Infinity || a.playState !== 'running') continue;
    const el = (a.effect as KeyframeEffect).target as HTMLElement | null;
    const cls = el?.getAttribute?.('class')?.split(/\s+/)[0] ?? '';
    out.add(
      `${el?.tagName.toLowerCase() ?? '?'}${cls ? '.' + cls : ''} (${(a as CSSAnimation).animationName})`,
    );
  }
  return [...out];
}

/** Chạy trong trang: chữ không đạt tương phản AA. */
function findLowContrast(): { measured: number; failures: string[]; lowest: string[] } {
  type C = { r: number; g: number; b: number; a: number };
  const parse = (s: string): C | null => {
    const m = /rgba?\(([^)]+)\)/.exec(s);
    if (!m) return null;
    const p = (m[1] ?? '')
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    return { r: p[0] ?? 0, g: p[1] ?? 0, b: p[2] ?? 0, a: p.length > 3 ? (p[3] ?? 1) : 1 };
  };
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = (c: C) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const over = (top: C, bottom: C): C => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });
  const hex = (c: C) =>
    '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

  /** Các nền có thể có sau chữ (gradient → mỗi điểm dừng màu là một khả năng, lấy trường hợp xấu nhất). */
  function backgrounds(el: HTMLElement): C[] | null {
    const layers: { bg: C | null; stops: C[] | null }[] = [];
    for (let e: HTMLElement | null = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const bi = cs.backgroundImage;
      let stops: C[] | null = null;
      if (bi && bi !== 'none') {
        const found = Array.from(bi.matchAll(/rgba?\([^)]+\)/g))
          .map((m) => parse(m[0]))
          .filter((c): c is C => c !== null);
        if (found.length === 0) return null; // ảnh nền (url) – không đo được
        stops = found;
      }
      const bg = parse(cs.backgroundColor);
      layers.push({ bg, stops });
      const solid = bg !== null && bg.a === 1;
      const stopsSolid = stops !== null && stops.every((s) => s.a === 1);
      if (solid || stopsSolid) break;
    }
    let cands: C[] = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (const l of layers.reverse()) {
      if (l.bg && l.bg.a > 0) cands = cands.map((b) => over(l.bg as C, b));
      if (l.stops) cands = cands.flatMap((b) => (l.stops as C[]).map((s) => over(s, b)));
    }
    return cands;
  }

  const seen = new Set<string>();
  const out: string[] = [];
  const all: { ratio: number; line: string }[] = [];
  let measured = 0;
  for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
    if (
      el.closest(
        'svg, canvas, [aria-hidden="true"], [inert], :disabled, [aria-disabled="true"], .is-disabled',
      )
    )
      continue;
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? '')
      .join('')
      .trim();
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const fg = parse(cs.color);
    const bgs = backgrounds(el);
    if (!fg || !bgs) continue;
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    let worst = Infinity;
    let worstBg = bgs[0] as C;
    for (const b of bgs) {
      const f = over(fg, b);
      const l1 = lum(f);
      const l2 = lum(b);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      if (ratio < worst) {
        worst = ratio;
        worstBg = b;
      }
    }
    measured++;
    const line = `"${own.slice(0, 26)}" ${worst.toFixed(2)}:1 (cần ${need}) chữ ${hex(fg)} trên ${hex(worstBg)} ${size}px`;
    all.push({ ratio: worst / need, line });
    if (worst < need) {
      const key = `${own}|${cs.color}|${hex(worstBg)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(line);
    }
  }
  all.sort((a, b) => a.ratio - b.ratio);
  return { measured, failures: out, lowest: all.slice(0, 3).map((x) => x.line) };
}

async function scan(page: Page, label: string, issues: Issues, opts: { canvas?: boolean } = {}) {
  await page.waitForTimeout(80); // cho hoạt ảnh vào màn hình (rút ngắn khi reduce) kịp xong
  for (const t of await page.evaluate(findSmallTargets, 48)) issues.touch.push(`${label}: ${t}`);
  for (const t of await page.evaluate(findObstructed)) issues.touch.push(`${label}: ${t}`);
  for (const m of await page.evaluate(findInfiniteAnimations)) issues.motion.push(`${label}: ${m}`);
  const contrast = await page.evaluate(findLowContrast);
  for (const c of contrast.failures) issues.contrast.push(`${label}: ${c}`);
  // chống “xanh giả”: màn hình DOM phải đo được chữ thật (game canvas thì không có chữ DOM)
  if (!opts.canvas && contrast.measured < 3)
    issues.contrast.push(`${label}: chỉ đo được ${contrast.measured} phần tử chữ`);
  stats.push(
    `${label}: đo ${contrast.measured} chữ · sát ngưỡng nhất: ${contrast.lowest[0] ?? '–'}`,
  );
}

function report(issues: Issues) {
  console.log(['A11Y-THONGKE', ...stats.splice(0)].join('\n'));
  // gom từng loại để thông báo lỗi liệt kê đủ
  expect.soft(issues.touch, 'Vùng chạm < 48px').toEqual([]);
  expect.soft(issues.motion, 'Hoạt ảnh lặp vô hạn khi prefers-reduced-motion: reduce').toEqual([]);
  expect.soft(issues.contrast, 'Tương phản chữ/nền dưới AA').toEqual([]);
}

async function leaveRound(page: Page) {
  await page.getByTestId('pause-button').click();
  await page.getByRole('button', { name: vi.play.exit }).click();
  await expect(page.getByTestId('greeting')).toBeVisible();
}

async function solveGate(page: Page) {
  const text = (await page.getByTestId('gate-question').textContent()) ?? '';
  const m = /(\d+)\s*×\s*(\d+)/.exec(text);
  if (!m) throw new Error(`Không đọc được phép tính: ${text}`);
  for (const d of String(Number(m[1]) * Number(m[2])))
    await page.getByTestId(`gate-key-${d}`).click();
  await page.getByTestId('gate-ok').click();
  await expect(page.getByTestId('parent-area')).toBeVisible();
}

test('bộ quét accessibility bắt được vi phạm giả (và không báo oan)', async ({ page }) => {
  await page.setContent(`
    <style>
      @keyframes spin { to { transform: rotate(1turn); } }
      body { background: #fff; margin: 0; }
      .spinner { width: 10px; height: 10px; animation: spin 1s linear infinite; }
      .once { width: 10px; height: 10px; animation: spin 1s linear 1; }
      .grad { background: linear-gradient(90deg, #fff, #ffd93d); padding: 8px; }
    </style>
    <div style="display:flex;width:200px">
      <button id="wide" style="flex:0 0 60px;min-width:0;white-space:nowrap;text-align:left;padding:0;transform:translateY(-2px)">Nhãn rất dài tràn sang nút bên cạnh</button>
      <button id="next" style="flex:0 0 100px">Kế bên</button>
    </div>
    <button id="small" style="width:30px;height:30px">x</button>
    <button id="big" style="width:64px;height:64px">Lớn</button>
    <div class="spinner"></div><div class="once"></div>
    <p id="bad" style="color:#aaa">Chữ xám nhạt trên nền trắng</p>
    <p id="good" style="color:#222">Chữ đậm trên nền trắng</p>
    <p id="big-text" style="color:#888;font-size:30px">Chữ lớn xám vừa</p>
    <div class="grad"><span id="grad" style="color:#ffe066">Chữ vàng trên gradient trắng–vàng</span></div>
  `);
  const small = await page.evaluate(findSmallTargets, 48);
  expect(small.some((s) => s.includes('30×30'))).toBe(true);
  expect(small.some((s) => s.includes('Lớn'))).toBe(false);
  const covered = await page.evaluate(findObstructed);
  expect(covered).toHaveLength(1); // chữ tràn của nút đầu đè lên tâm nút “Kế bên”
  expect(covered[0]).toContain('Kế bên');
  const anims = await page.evaluate(findInfiniteAnimations);
  expect(anims).toHaveLength(1);
  expect(anims[0]).toContain('spinner');
  const low = await page.evaluate(findLowContrast);
  expect(low.measured).toBeGreaterThanOrEqual(5);
  const joined = low.failures.join(' | ');
  expect(joined).toContain('Chữ xám nhạt'); // #aaa trên trắng ≈ 2,3:1
  expect(joined).toContain('Chữ vàng trên gradient'); // xấu nhất tại điểm dừng vàng
  expect(joined).not.toContain('Chữ đậm');
  expect(joined).not.toContain('Chữ lớn xám'); // #888 trên trắng ≈ 3,5:1 ≥ 3 (chữ lớn)
});

test.describe('Accessibility – vùng chạm, giảm chuyển động, tương phản (mọi màn hình)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); // vừa kiểm reduced-motion vừa đo màu ở trạng thái tĩnh
  });

  test('hồ sơ: tạo hồ sơ đầu tiên', async ({ page }) => {
    const issues: Issues = { touch: [], motion: [], contrast: [] };
    await page.goto(E2E_URL);
    await expect(page.getByLabel(vi.profiles.nameLabel)).toBeVisible();
    await scan(page, 'Tạo hồ sơ', issues);
    report(issues);
  });

  test('hồ sơ: chọn người chơi (2 hồ sơ)', async ({ page }) => {
    const issues: Issues = { touch: [], motion: [], contrast: [] };
    await seedProfiles(page, [makeProfile('An'), makeProfile('Bình')], null);
    await page.goto(E2E_URL);
    await scan(page, 'Chọn người chơi', issues);
    report(issues);
  });

  test('Home, Album, Giới thiệu 7 game, hộp quà, tạm dừng, kết quả', async ({ page }) => {
    test.setTimeout(180_000);
    const issues: Issues = { touch: [], motion: [], contrast: [] };
    const p = makeProfile('An', {
      totalStars: 130,
      unlocked: ['frame-rainbow', 'outfit-pilot', 'bg-candy'],
      stickers: { 'stk-01': 2, 'stk-02': 1, 'stk-30': 1 },
      boxes: { pending: 1, openedTotal: 3, sinceLastRare: 1 },
    });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('greeting')).toBeVisible();
    await scan(page, 'Home', issues);

    // hộp quà
    await page
      .getByTestId('gift-button')
      .click()
      .catch(() => undefined);
    if (await page.getByRole('dialog').count()) {
      await scan(page, 'Hộp quà', issues);
      await page.keyboard.press('Escape');
    }

    // Album: 4 tab
    await page.getByTestId('open-album').click();
    await scan(page, 'Album', issues);
    for (const tab of await page.getByRole('tab').all()) {
      await tab.click();
      await scan(page, `Album › ${(await tab.textContent())?.trim()}`, issues);
    }
    await page.goBack();
    await expect(page.getByTestId('greeting')).toBeVisible();

    // Giới thiệu từng game
    for (const id of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'] as const) {
      await openIntro(page, id);
      await scan(page, `Giới thiệu ${id}`, issues);
      await page.goBack();
      await expect(page.getByTestId('greeting')).toBeVisible();
    }

    // đang chơi G2 (DOM) + tạm dừng + kết quả
    await openIntro(page, 'G2');
    await pressStart(page);
    await scan(page, 'Đang chơi G2', issues);
    await page.getByTestId('pause-button').click();
    await scan(page, 'Tạm dừng', issues);
    await page.getByRole('button', { name: vi.play.resume }).click();
    // đếm ngược 3-2-1 sau “Chơi tiếp”
    await expect(page.getByTestId('countdown')).toBeVisible();
    await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 8000 });
    await playG2(page);
    await expect(page.getByTestId('result')).toBeVisible();
    await page.waitForTimeout(800);
    await scan(page, 'Kết quả', issues);
    report(issues);
  });

  test('đang chơi G1, G3, G4, G5, G6, G7', async ({ page }) => {
    test.setTimeout(240_000);
    const issues: Issues = { touch: [], motion: [], contrast: [] };
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    // G1, G3, G5 vẽ bằng canvas (chỉ có nút Tạm dừng bằng DOM); G4, G6, G7 là DOM
    for (const id of ['G1', 'G3', 'G4', 'G5', 'G6', 'G7'] as const) {
      await openIntro(page, id);
      await pressStart(page);
      await page.waitForTimeout(600);
      await scan(page, `Đang chơi ${id}`, issues, { canvas: ['G1', 'G3', 'G5'].includes(id) });
      await leaveRound(page);
    }
    report(issues);
  });

  test('Hết giờ: Home bị khóa và màn Nghỉ', async ({ page }) => {
    const issues: Issues = { touch: [], motion: [], contrast: [] };
    const p = makeProfile('An', {}, { playMs: 15 * 60_000 });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('greeting')).toBeVisible();
    await scan(page, 'Home (hết giờ)', issues);
    await page.evaluate(() => (location.hash = '#/rest'));
    await expect(page.getByTestId('rest')).toBeVisible();
    await scan(page, 'Nghỉ', issues);
    report(issues);
  });

  test('Khu phụ huynh: khóa và 6 tab', async ({ page }) => {
    test.setTimeout(120_000);
    const issues: Issues = { touch: [], motion: [], contrast: [] };
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await page.getByRole('button', { name: vi.home.parent }).click();
    await expect(page.getByTestId('parent-gate')).toBeVisible();
    await scan(page, 'Khóa phụ huynh', issues);
    await solveGate(page);
    for (const tab of ['progress', 'benchmark', 'settings', 'profiles', 'rewards', 'data']) {
      await page.getByTestId(`tab-${tab}`).click();
      await page.waitForTimeout(250);
      await scan(page, `Khu phụ huynh › ${tab}`, issues);
    }
    report(issues);
  });
});
