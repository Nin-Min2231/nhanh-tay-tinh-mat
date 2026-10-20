// Xuất lịch sử chơi ra CSV cho phụ huynh (E1). Thuần, có test. Chuỗi tiêu đề lấy từ i18n/vi.ts.
// File mở được bằng Excel / Google Trang tính: có BOM UTF-8 (để đúng tiếng Việt) và dòng `sep=,` đầu file
// (Excel ở máy đặt dấu phân cách là “;” – như Windows tiếng Việt – vẫn tách cột đúng).
import { vi } from '../i18n/vi';
import { dateKey } from './profile';
import type { DailyAggregate, RoundRecord } from './types';

export const CSV_BOM = '﻿';
export type CsvCell = string | number | boolean | null | undefined;

/** Một ô: bọc nháy kép nếu có dấu phẩy, nháy kép hoặc xuống dòng (nháy kép → hai nháy kép). Số hữu hạn viết thường, NaN/∞ → rỗng. */
export function csvCell(v: CsvCell): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(Math.round(v * 1000) / 1000) : '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  return /[",\r\n]/.test(v) || v !== v.trim() ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Ghép tiêu đề + các dòng thành nội dung file (BOM, `sep=,`, dòng cách nhau bằng CRLF). */
export function buildCsv(header: readonly string[], rows: readonly (readonly CsvCell[])[]): string {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(','));
  return `${CSV_BOM}sep=,\r\n${lines.join('\r\n')}\r\n`;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Các khóa chỉ số xuất hiện trong danh sách: chỉ số đã biết trước (theo thứ tự trong vi.ts), rồi còn lại theo A–Z. */
export function metricKeys(items: readonly { metrics: Record<string, number> }[]): string[] {
  const seen = new Set<string>();
  for (const it of items) for (const k of Object.keys(it.metrics)) seen.add(k);
  const known = Object.keys(vi.parent.metrics).filter((k) => seen.has(k));
  const rest = [...seen].filter((k) => !(k in vi.parent.metrics)).sort();
  return [...known, ...rest];
}

const metricLabel = (k: string): string => vi.parent.metrics[k] ?? k;
const gameName = (id: string): string =>
  (vi.games as Record<string, { name: string }>)[id]?.name ?? id;
const deviceName = (d: string): string => vi.parent.progress.devices[d] ?? d;
const modeName = (m: string): string => vi.parent.progress.modes[m] ?? m;

/** Lịch sử từng lượt: ngày, giờ, game, cấp (nội dung thật), cấp của chế độ, chế độ, bài đo, điểm %, sao, thời lượng, thiết bị + mỗi chỉ số một cột. */
export function roundsCsv(rounds: readonly RoundRecord[]): string {
  const sorted = [...rounds].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const keys = metricKeys(sorted);
  const c = vi.parent.data.csv;
  const header = [
    c.date,
    c.time,
    c.game,
    c.level,
    c.trackLevel,
    c.mode,
    c.benchmark,
    c.scorePct,
    c.stars,
    c.durationSec,
    c.device,
    ...keys.map(metricLabel),
  ];
  const rows = sorted.map((r) => {
    const d = new Date(r.startedAt);
    const valid = !Number.isNaN(d.getTime());
    return [
      valid ? dateKey(d) : '',
      valid ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}` : '',
      gameName(r.gameId),
      r.level,
      r.trackLevel, // trống ở lượt cũ, bài đo và chế độ Cố định
      modeName(r.mode),
      r.benchmark ? c.yes : c.no,
      Math.round(r.score * 100),
      r.stars,
      Math.round(r.durationMs / 1000),
      deviceName(r.deviceClass),
      ...keys.map((k) => r.metrics[k]),
    ];
  });
  return buildCsv(header, rows);
}

/** Tổng hợp theo ngày (giữ lâu dài, kể cả khi lượt chi tiết cũ đã bị dọn): ngày, game, thiết bị, số lượt, điểm %, cấp TB + chỉ số. */
export function dailyCsv(daily: readonly DailyAggregate[]): string {
  const sorted = [...daily].sort(
    (a, b) => a.date.localeCompare(b.date) || a.gameId.localeCompare(b.gameId),
  );
  const keys = metricKeys(sorted);
  const c = vi.parent.data.csv;
  const header = [
    c.date,
    c.game,
    c.device,
    c.rounds,
    c.avgScorePct,
    c.avgLevel,
    ...keys.map(metricLabel),
  ];
  const rows = sorted.map((a) => [
    a.date,
    gameName(a.gameId),
    deviceName(a.deviceClass),
    a.rounds,
    Math.round(a.avgScore * 100),
    a.avgLevel,
    ...keys.map((k) => a.metrics[k]),
  ]);
  return buildCsv(header, rows);
}

// Dấu kết hợp Unicode (U+0300–U+036F) và chữ có gạch ngang (U+0110, U+0111): dựng bằng mã ký tự để mã nguồn
// không chứa chữ tiếng Việt cứng ngoài vi.ts (quy tắc 16).
const COMBINING_MARKS = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  'g',
);
const D_STROKE = new RegExp(`[${String.fromCharCode(0x110, 0x111)}]`, 'g');

/** Tên bé → chữ thường không dấu, chỉ a–z0–9 và gạch ngang (tối đa 20 ký tự); rỗng → “be”. */
export function slugName(name: string): string {
  const s = name
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(D_STROKE, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20)
    .replace(/-+$/g, '');
  return s || 'be';
}

/** `nhanhtay-lichsu-<tên>-YYYYMMDD.csv` hoặc `nhanhtay-tonghop-<tên>-YYYYMMDD.csv` (ngày theo giờ máy). */
export function csvFileName(kind: 'rounds' | 'daily', profileName: string, now: Date): string {
  const day = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  return `nhanhtay-${kind === 'rounds' ? 'lichsu' : 'tonghop'}-${slugName(profileName)}-${day}.csv`;
}
