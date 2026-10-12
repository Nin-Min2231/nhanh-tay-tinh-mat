// Rà soát tự động các quy tắc bắt buộc của CLAUDE.md mục 5 bằng cách quét mã nguồn (TASK-09).
// Mỗi test ghi rõ quy tắc nào; vi phạm mới sẽ làm test đỏ ngay thay vì chờ rà soát tay.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = fileURLToPath(new URL('../', import.meta.url));

interface Source {
  /** đường dẫn tương đối so với src/, dấu / */
  file: string;
  /** nội dung đã bỏ chú thích */
  code: string;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Bỏ chú thích khối và chú thích dòng (không đụng `//` nằm sau dấu `:` như trong URL). */
function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

function sources(exts: string[]): Source[] {
  return walk(SRC)
    .filter((p) => exts.includes(path.extname(p)) && !/\.test\.tsx?$/.test(p))
    .map((p) => ({
      file: path.relative(SRC, p).split(path.sep).join('/'),
      code: stripComments(readFileSync(p, 'utf8')),
    }));
}

const CODE = sources(['.ts', '.tsx']);
const ALL = sources(['.ts', '.tsx', '.css']);

/** Các tệp khớp `re` (sau khi bỏ chú thích), trừ danh sách cho phép. */
function offenders(list: Source[], re: RegExp, allowed: string[] = []): string[] {
  return list.filter((s) => !allowed.includes(s.file) && re.test(s.code)).map((s) => s.file);
}

function lines(list: Source[], re: RegExp): { file: string; line: string }[] {
  const res: { file: string; line: string }[] = [];
  for (const s of list) {
    for (const line of s.code.split('\n')) if (re.test(line)) res.push({ file: s.file, line });
  }
  return res;
}

describe('bộ quét hoạt động đúng (bắt được vi phạm giả)', () => {
  it('bỏ chú thích nhưng giữ mã', () => {
    const stripped = stripComments(['a(); // fetch(x)', '/* localStorage */ b();'].join('\n'));
    expect(stripped).not.toMatch(/fetch|localStorage/);
    expect(stripped).toMatch(/a\(\);/);
    expect(stripComments("const u = 'x'; // c")).toContain("const u = 'x';");
  });
  it('bắt được mã vi phạm đặt trong tệp giả', () => {
    const fake: Source[] = [
      { file: 'games/x/view.ts', code: "fetch('https://a.b')" },
      { file: 'ui/y.tsx', code: 'localStorage.setItem(1,2)' },
      { file: 'app/storage.ts', code: 'localStorage.getItem(1)' },
    ];
    expect(offenders(fake, /\bfetch\s*\(/)).toEqual(['games/x/view.ts']);
    expect(offenders(fake, /\blocalStorage\b/, ['app/storage.ts'])).toEqual(['ui/y.tsx']);
    expect(lines(fake, /https?:\/\//)).toHaveLength(1);
  });
  it('đã quét đủ tệp (không rỗng)', () => {
    expect(CODE.length).toBeGreaterThan(100);
    expect(CODE.some((s) => s.file === 'app/storage.ts')).toBe(true);
  });
});

describe('quy tắc 1 – không quảng cáo, không gửi dữ liệu ra mạng', () => {
  it('không có API mạng nào trong mã nguồn', () => {
    expect(
      offenders(
        CODE,
        /\bfetch\s*\(|XMLHttpRequest|\bWebSocket\b|sendBeacon|\bEventSource\b|importScripts/,
      ),
    ).toEqual([]);
  });

  it('không có địa chỉ http(s) nào (trừ khai báo namespace SVG)', () => {
    const urls = lines(ALL, /https?:\/\//).filter((l) => !/www\.w3\.org/.test(l.line));
    expect(urls).toEqual([]);
  });
});

describe('quy tắc 5, 6, 9a – Pointer Events cho game', () => {
  it('game không dùng sự kiện chạm/chuột/click kiểu cũ', () => {
    const games = CODE.filter((s) => s.file.startsWith('games/'));
    expect(
      offenders(games, /touchstart|touchend|mousedown|mouseup|addEventListener\(\s*['"]click/),
    ).toEqual([]);
  });

  it('mọi game nhận chạm bằng pointerdown (trực tiếp hoặc qua attachPointerInput)', () => {
    for (const g of [
      'g1-balls',
      'g2-schulte',
      'g3-pets',
      'g4-lights',
      'g5-notes',
      'g6-math',
      'g7-patterns',
    ]) {
      const view = CODE.find((s) => s.file === `games/${g}/view.ts`);
      expect(view, g).toBeDefined();
      expect(/pointerdown|attachPointerInput/.test(view!.code), g).toBe(true);
    }
  });

  it('không lọc theo pointerType (S Pen xử lý như ngón tay)', () => {
    const filtered = lines(CODE, /pointerType\s*(===|!==|==|!=)/);
    expect(filtered).toEqual([]);
  });

  it('chỉ G5 nhận đa điểm; các game còn lại chỉ nhận chạm đầu tiên', () => {
    const multi = lines(CODE, /(attachPointerInput\([^)]*|new PointerGate\()\s*['"]multi['"]/).map(
      (l) => l.file,
    );
    expect(multi).toEqual(['games/g5-notes/view.ts']);
  });
});

describe('quy tắc 8 – CSS vùng chơi chống cuộn/chọn nhầm', () => {
  const css = ALL.filter((s) => s.file.endsWith('.css'))
    .map((s) => s.code)
    .join('\n');
  it('có touch-action: none, user-select: none, -webkit-touch-callout: none, overscroll-behavior: none', () => {
    expect(css).toMatch(/touch-action:\s*none/);
    expect(css).toMatch(/user-select:\s*none/);
    expect(css).toMatch(/-webkit-touch-callout:\s*none/);
    expect(css).toMatch(/overscroll-behavior:\s*none/);
  });
  it('tôn trọng vùng an toàn của màn hình', () => {
    expect(css).toMatch(/env\(safe-area-inset-/);
  });
  it('có prefers-reduced-motion', () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});

describe('accessibility – cho phóng to, riêng màn chơi chặn phóng', () => {
  const html = readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8');
  const viewport = /<meta[^>]*name="viewport"[^>]*content="([^"]*)"/.exec(html)?.[1] ?? '';
  const css = ALL.filter((s) => s.file.endsWith('.css'))
    .map((s) => s.code)
    .join('\n');

  it('meta viewport có width=device-width và không chặn phóng to', () => {
    expect(viewport).toMatch(/width=device-width/);
    expect(viewport).not.toMatch(/user-scalable\s*=\s*(no|0)|maximum-scale/);
  });
  it('cả màn chơi (.play) chặn phóng 2 ngón bằng touch-action: none', () => {
    expect(css).toMatch(/\.play\s*\{[^}]*touch-action:\s*none/);
  });
  it('khi trang đã bị phóng từ trước, màn chơi cho chụm lại (touch-action: manipulation)', () => {
    expect(css).toMatch(/\.play\[data-zoomed\]\s*\{[^}]*touch-action:\s*manipulation/);
  });
});

describe('quy tắc 9b – sai/đúng không phụ thuộc rung', () => {
  const haptics = CODE.find((s) => s.file === 'app/haptics.ts')!.code;
  it('navigator.vibrate chỉ có trong haptics.ts', () => {
    expect(offenders(CODE, /navigator\.vibrate/, ['app/haptics.ts'])).toEqual([]);
  });
  it('wrong() luôn lắc hình, không phụ thuộc rung', () => {
    // hàm wrong gọi shake(target) vô điều kiện (không nằm trong nhánh kiểm vibrate/deviceClass)
    expect(haptics).toMatch(/wrong\(target\)\s*\{[^}]*shake\(target\)/);
  });
  it('rung chỉ chạy trên điện thoại và khi bật rung', () => {
    expect(haptics).toMatch(/deviceClass\s*!==\s*'phone'\s*\|\|\s*!isEnabled\(\)/);
  });
});

describe('quy tắc 10 – tạm dừng theo vòng đời', () => {
  const play = CODE.find((s) => s.file === 'ui/screens/Play.tsx')!.code;
  it('Play tạm dừng khi ẩn tab và pagehide', () => {
    expect(play).toMatch(/visibilitychange/);
    expect(play).toMatch(/pagehide/);
  });
  it('Play tạm dừng khi đổi kích thước/đổi hướng (xoay máy, chia đôi màn hình đều phát resize)', () => {
    expect(play).toMatch(/addEventListener\(\s*['"]resize['"]/);
  });
});

describe('quy tắc 11 – mọi truy cập bộ nhớ trình duyệt qua storage.ts', () => {
  it('localStorage/sessionStorage/indexedDB chỉ nằm trong app/storage.ts', () => {
    expect(
      offenders(CODE, /\b(localStorage|sessionStorage|indexedDB)\b/, ['app/storage.ts']),
    ).toEqual([]);
  });
});

describe('quy tắc 13 – không tự tải lại khi có service worker mới', () => {
  it('không có lệnh tải lại/chuyển trang nào trong mã nguồn', () => {
    expect(
      offenders(
        CODE,
        /location\.(reload|assign|replace)\s*\(|window\.open\s*\(|location\.href\s*=/,
      ),
    ).toEqual([]);
  });
  it('chỉ nút bấm mới gọi applyUpdate (Home và tab Dữ liệu khu phụ huynh)', () => {
    const users = lines(CODE, /applyUpdate/).filter((l) => !/import /.test(l.line));
    const files = [...new Set(users.map((u) => u.file))].sort();
    expect(files).toEqual(['app/pwa.ts', 'ui/parent/DataTab.tsx', 'ui/screens/Home.tsx']);
    for (const u of users.filter((x) => x.file !== 'app/pwa.ts')) {
      expect(u.line).toMatch(/onClick=\{applyUpdate\}/);
    }
  });
  it('không có đường liên kết ra ngoài (quy tắc 1)', () => {
    expect(offenders(CODE, /<a\s|target=["']_blank/)).toEqual([]);
  });
});

describe('quy tắc 14 – random ảnh hưởng điểm/thưởng phải dùng rng.ts có seed', () => {
  it('Math.random chỉ ở nơi không ảnh hưởng điểm/thưởng', () => {
    // device.ts: id dự phòng · rng.ts: hạt giống ban đầu · Rest.tsx: chọn gợi ý vận động
    expect(
      offenders(CODE, /Math\.random/, ['app/device.ts', 'app/rng.ts', 'ui/screens/Rest.tsx']),
    ).toEqual([]);
  });
});

describe('quy tắc 16 – chuỗi giao diện chỉ nằm ở i18n/vi.ts', () => {
  const VIET = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  /** Chỗ được phép có chữ Việt ngoài vi.ts: thông báo lỗi nội bộ và so khớp nhãn dữ liệu của levels.json. */
  const ALLOWED: { file: RegExp; re: RegExp }[] = [
    { file: /./, re: /new Error\(/ },
    // config.ts của game: ánh xạ nhãn tiếng Việt trong docs/data/levels.json sang enum/số (dữ liệu, không phải chuỗi giao diện)
    { file: /^games\/g\d-[a-z-]+\/config\.ts$/, re: /\.(includes|startsWith|endsWith)\(\s*'/ },
    // chẩn đoán nội bộ của bộ kiểm câu G7 (chỉ dùng trong test, không hiện cho bé)
    {
      file: /^games\/g7-patterns\/puzzles\.ts$/,
      re: /return [`'].*(lời giải|đáp án|số không hợp lệ)/,
    },
  ];

  it('không có chữ tiếng Việt cứng trong component/logic (trừ danh sách cho phép)', () => {
    const bad = lines(CODE, VIET)
      .filter((l) => l.file !== 'i18n/vi.ts')
      .filter((l) => !ALLOWED.some((a) => a.file.test(l.file) && a.re.test(l.line)))
      .map((l) => `${l.file}: ${l.line.trim()}`);
    expect(bad).toEqual([]);
  });

  it('thuộc tính HTML người dùng thấy (aria-label, title, alt, placeholder) không cứng ASCII', () => {
    const bad = lines(CODE, /\b(aria-label|title|alt|placeholder)="[^"{]+"/).filter(
      (l) => !/(data-|stroke|fill|class)/.test(l.line),
    );
    expect(bad).toEqual([]);
  });
});

describe('quy tắc 17 – không đọc layout mỗi khung hình', () => {
  it('getBoundingClientRect chỉ ở nơi chạy khi resize/chạm, không trong vòng lặp vẽ', () => {
    const where = lines(CODE, /getBoundingClientRect/).map((l) => l.file);
    expect(new Set(where)).toEqual(
      new Set([
        'games/common/CanvasStage.ts',
        'games/common/PointerInput.ts',
        'games/g6-math/view.ts',
      ]),
    );
  });
  it('game canvas (G1, G3, G5) không đọc layout trong view.ts (kích thước lấy từ CanvasStage khi resize)', () => {
    const canvasViews = CODE.filter((x) => /^games\/g[135]-[a-z]+\/view\.ts$/.test(x.file));
    expect(canvasViews).toHaveLength(3);
    expect(
      offenders(canvasViews, /getBoundingClientRect|\.offsetWidth|\.offsetHeight|getComputedStyle/),
    ).toEqual([]);
  });
});
