// Vẽ icon PWA từ linh vật Sóc Bo (cùng nét vẽ với src/ui/components/Mascot.tsx, biểu cảm “vui”)
// rồi xuất ra public/icons/. Chạy tay: `npm run icons` (cần Chromium của Playwright:
// `npx playwright install chromium`). PNG được commit để GitHub Actions không phải cài trình duyệt.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
const INK = '#5D4037';

/** Sóc Bo (viewBox 200×200), gradient + vệt sáng cho bóng bẩy. Id gradient có tiền tố `ic-`. */
const MASCOT = `
  <defs>
    <radialGradient id="ic-head" cx="38%" cy="28%" r="80%">
      <stop offset="0" stop-color="#FFC48A"/><stop offset="0.55" stop-color="#FF9A52"/><stop offset="1" stop-color="#F57C2E"/>
    </radialGradient>
    <radialGradient id="ic-body" cx="40%" cy="30%" r="85%">
      <stop offset="0" stop-color="#FFA462"/><stop offset="1" stop-color="#F07A2A"/>
    </radialGradient>
    <linearGradient id="ic-tail" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF9A52"/><stop offset="1" stop-color="#D9631F"/>
    </linearGradient>
  </defs>
  <ellipse cx="104" cy="192" rx="62" ry="9" fill="#1B5E8A" opacity="0.22"/>
  <path d="M132 168 C 206 160, 212 70, 160 52 C 178 86, 152 104, 128 112 Z" fill="url(#ic-tail)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M160 62 C 190 80, 184 130, 144 150" fill="none" stroke="#FFC9A0" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="100" cy="150" rx="46" ry="40" fill="url(#ic-body)" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="100" cy="158" rx="28" ry="26" fill="#FFE8C6"/>
  <g fill="#FF9A52" stroke="${INK}" stroke-width="2.5">
    <ellipse cx="60" cy="158" rx="10" ry="20" transform="rotate(10 60 158)"/>
    <ellipse cx="140" cy="158" rx="10" ry="20" transform="rotate(-10 140 158)"/>
  </g>
  <circle cx="62" cy="46" r="15" fill="#FF9A52" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="138" cy="46" r="15" fill="#FF9A52" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="62" cy="47" r="7" fill="#FFB4C0"/>
  <circle cx="138" cy="47" r="7" fill="#FFB4C0"/>
  <circle cx="100" cy="86" r="48" fill="url(#ic-head)" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="80" cy="62" rx="20" ry="9" fill="#fff" opacity="0.35" transform="rotate(-28 80 62)"/>
  <ellipse cx="100" cy="102" rx="27" ry="21" fill="#FFE8C6"/>
  <ellipse cx="68" cy="99" rx="8" ry="6" fill="#FF6F8E" opacity="0.6"/>
  <ellipse cx="132" cy="99" rx="8" ry="6" fill="#FF6F8E" opacity="0.6"/>
  <circle cx="80" cy="79" r="7.5" fill="#263238"/>
  <circle cx="120" cy="79" r="7.5" fill="#263238"/>
  <circle cx="82.8" cy="75.8" r="2.9" fill="#fff"/>
  <circle cx="122.8" cy="75.8" r="2.9" fill="#fff"/>
  <ellipse cx="100" cy="93" rx="6" ry="4.5" fill="${INK}"/>
  <path d="M88 106 Q100 126 112 106 Z" fill="#8D2B3A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M94 117 Q100 112 106 117 Q100 123 94 117 Z" fill="#FF8A9B"/>`;

/** Ngôi sao lấp lánh 4 cánh tại (x, y), bán kính r (toạ độ icon 512). */
function sparkle(x, y, r, fill) {
  const t = r * 0.28;
  return `<path d="M${x} ${y - r} Q${x + t} ${y - t} ${x + r} ${y} Q${x + t} ${y + t} ${x} ${y + r} Q${x - t} ${y + t} ${x - r} ${y} Q${x - t} ${y - t} ${x} ${y - r} Z" fill="${fill}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
}

/**
 * Icon 512×512. `maskable`: nền tràn viền, hình nằm trọn vòng tròn an toàn (bán kính 40%);
 * ngược lại: nền bo góc, hình to hơn.
 */
function iconSvg({ maskable }) {
  const k = maskable ? 2.0 : 2.18; // tỉ lệ phóng Sóc Bo
  const tx = 256 - 118 * k; // đặt điểm (118, 110) của Sóc Bo vào gần tâm icon
  const ty = (maskable ? 262 : 258) - 110 * k;
  const bg = maskable
    ? '<rect width="512" height="512" fill="url(#ic-sky)"/>'
    : '<rect width="512" height="512" rx="112" fill="url(#ic-sky)"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="ic-sky" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="#FFF4D6"/><stop offset="0.42" stop-color="#A5E1FF"/><stop offset="1" stop-color="#1FA5EA"/>
    </radialGradient>
  </defs>
  ${bg}
  ${sparkle(382, 382, 23, '#FFD93D')}
  ${sparkle(374, 124, 19, '#FF5FA2')}
  ${sparkle(76, 272, 18, '#8E6CF0')}
  <g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${k})">${MASCOT}</g>
</svg>
`;
}

async function renderPng(browser, svg, size, file) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${svg.replace(
      /width="512" height="512"/,
      `width="${size}" height="${size}"`,
    )}</div></body></html>`,
  );
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
}

mkdirSync(OUT, { recursive: true });
const any = iconSvg({ maskable: false });
const maskable = iconSvg({ maskable: true });
writeFileSync(path.join(OUT, 'icon.svg'), any);

const browser = await chromium.launch();
try {
  await renderPng(browser, any, 192, path.join(OUT, 'icon-192.png'));
  await renderPng(browser, any, 512, path.join(OUT, 'icon-512.png'));
  await renderPng(browser, maskable, 512, path.join(OUT, 'maskable-512.png'));
} finally {
  await browser.close();
}
console.log('Đã tạo icon trong', OUT);
