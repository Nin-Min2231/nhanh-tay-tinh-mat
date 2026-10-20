import { describe, expect, it } from 'vitest';
import { vi } from '../i18n/vi';
import {
  CSV_BOM,
  buildCsv,
  csvCell,
  csvFileName,
  dailyCsv,
  metricKeys,
  roundsCsv,
  slugName,
} from './csv';
import type { DailyAggregate, RoundRecord } from './types';

/** Bộ đọc CSV nhỏ theo RFC 4180 (để kiểm file ghi ra đọc lại đúng từng ô, kể cả ô có dấu phẩy/nháy/xuống dòng). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\r' && text[i + 1] === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i++;
    } else cell += ch;
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function round(over: Partial<RoundRecord> = {}): RoundRecord {
  return {
    id: 'r1',
    profileId: 'p',
    gameId: 'G1',
    startedAt: '2026-10-10T08:30:00', // không có múi giờ = giờ máy → ngày/giờ xuất ra không phụ thuộc máy chạy test
    level: 3,
    mode: 'auto',
    benchmark: false,
    options: {},
    durationMs: 61_400,
    score: 0.8456,
    stars: 2,
    metrics: { rtMeanMs: 612.4, accuracy: 0.9 },
    deviceId: 'd',
    deviceClass: 'phone',
    ...over,
  };
}

describe('csvCell', () => {
  it('chữ thường giữ nguyên; có dấu phẩy / nháy kép / xuống dòng / khoảng trắng đầu-cuối thì bọc nháy kép', () => {
    expect(csvCell('Bóng Xanh')).toBe('Bóng Xanh');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('nói "hi"')).toBe('"nói ""hi"""');
    expect(csvCell('hai\ndòng')).toBe('"hai\ndòng"');
    expect(csvCell(' lùi đầu')).toBe('" lùi đầu"');
  });
  it('số: làm tròn 3 chữ số, NaN/∞ → rỗng; null/undefined → rỗng; boolean → TRUE/FALSE', () => {
    expect(csvCell(0.84567)).toBe('0.846');
    expect(csvCell(612)).toBe('612');
    expect(csvCell(Number.NaN)).toBe('');
    expect(csvCell(Number.POSITIVE_INFINITY)).toBe('');
    expect(csvCell(null)).toBe('');
    expect(csvCell(undefined)).toBe('');
    expect(csvCell(true)).toBe('TRUE');
  });
});

describe('buildCsv', () => {
  it('bắt đầu bằng BOM + “sep=,” (Excel nhận đúng dấu phân cách), dòng cách nhau CRLF, kết thúc bằng CRLF', () => {
    const text = buildCsv(['A', 'B'], [[1, 'x']]);
    expect(text.startsWith(`${CSV_BOM}sep=,\r\n`)).toBe(true);
    expect(text.endsWith('\r\n')).toBe(true);
    expect(text).toBe(`${CSV_BOM}sep=,\r\nA,B\r\n1,x\r\n`);
  });
  it('đọc lại đúng từng ô kể cả ô có dấu phẩy, nháy kép, xuống dòng', () => {
    const rows = [
      ['a,b', 'nói "hi"', 'hai\ndòng'],
      [1.5, '', 'z'],
    ];
    const parsed = parseCsv(buildCsv(['x', 'y', 'z'], rows).slice(`${CSV_BOM}sep=,\r\n`.length));
    expect(parsed).toEqual([
      ['x', 'y', 'z'],
      ['a,b', 'nói "hi"', 'hai\ndòng'],
      ['1.5', '', 'z'],
    ]);
  });
});

describe('roundsCsv – lịch sử từng lượt', () => {
  const c = vi.parent.data.csv;

  it('đủ cột cố định + một cột cho mỗi chỉ số; chỉ số đã biết trước, rồi A–Z', () => {
    const text = roundsCsv([
      round({ metrics: { zeta: 1, rtMeanMs: 600, accuracy: 0.9, alpha: 2 } }),
      round({ id: 'r2', metrics: { falseAlarms: 3 } }),
    ]);
    const [sep, header] = text.slice(CSV_BOM.length).split('\r\n');
    expect(sep).toBe('sep=,');
    expect(header!.split(',')).toEqual([
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
      vi.parent.metrics.accuracy,
      vi.parent.metrics.rtMeanMs,
      vi.parent.metrics.falseAlarms,
      'alpha',
      'zeta',
    ]);
    expect(metricKeys([{ metrics: { b: 1, a: 2, accuracy: 3 } }])).toEqual(['accuracy', 'a', 'b']);
  });

  it('một lượt: ngày + giờ theo giờ máy, tên game/chế độ/thiết bị tiếng Việt, điểm %, thời lượng giây', () => {
    const rows = parseCsv(
      roundsCsv([round({ trackLevel: 5 })]).slice(`${CSV_BOM}sep=,\r\n`.length),
    );
    expect(rows).toHaveLength(2);
    expect(rows[1]).toEqual([
      '2026-10-10',
      '08:30',
      vi.games.G1!.name,
      '3',
      '5', // cấp của chế độ bé thấy
      vi.parent.progress.modes.auto,
      c.no,
      '85', // 0,8456 → 85 %
      '2',
      '61', // 61 400 ms
      vi.parent.progress.devices.phone,
      '0.9',
      '612.4',
    ]);
  });

  it('sắp theo thời gian; lượt bài đo ghi “Có”; thiếu chỉ số để trống', () => {
    const rows = parseCsv(
      roundsCsv([
        round({ id: 'late', startedAt: '2026-10-12T09:00:00', benchmark: true, metrics: {} }),
        round({ id: 'early', startedAt: '2026-10-09T09:00:00' }),
      ]).slice(`${CSV_BOM}sep=,\r\n`.length),
    );
    expect(rows.map((r) => r[0])).toEqual([c.date, '2026-10-09', '2026-10-12']);
    expect(rows[2]![6]).toBe(c.yes);
    expect(rows[2]![4]).toBe(''); // lượt cũ / bài đo không có “cấp của chế độ”
    expect(rows[2]!.slice(-2)).toEqual(['', '']); // lượt muộn không có chỉ số
  });

  it('không có lượt nào: chỉ có dòng tiêu đề (không lỗi); dữ liệu hỏng (ngày sai) không làm sập', () => {
    const empty = parseCsv(roundsCsv([]).slice(`${CSV_BOM}sep=,\r\n`.length));
    expect(empty).toHaveLength(1);
    const bad = parseCsv(
      roundsCsv([round({ startedAt: 'không phải ngày' })]).slice(`${CSV_BOM}sep=,\r\n`.length),
    );
    expect(bad[1]!.slice(0, 2)).toEqual(['', '']);
  });
});

describe('dailyCsv – tổng hợp theo ngày', () => {
  const agg = (over: Partial<DailyAggregate>): DailyAggregate => ({
    date: '2026-10-10',
    gameId: 'G2',
    deviceClass: 'tablet',
    rounds: 3,
    avgScore: 0.7234,
    avgLevel: 4.5,
    metrics: { timeSec: 31.2 },
    ...over,
  });

  it('cột + dòng đúng, sắp theo ngày rồi game', () => {
    const c = vi.parent.data.csv;
    const rows = parseCsv(
      dailyCsv([agg({ date: '2026-10-11', gameId: 'G1' }), agg({}), agg({ gameId: 'G1' })]).slice(
        `${CSV_BOM}sep=,\r\n`.length,
      ),
    );
    expect(rows[0]).toEqual([
      c.date,
      c.game,
      c.device,
      c.rounds,
      c.avgScorePct,
      c.avgLevel,
      vi.parent.metrics.timeSec,
    ]);
    expect(rows.slice(1).map((r) => `${r[0]} ${r[1]}`)).toEqual([
      `2026-10-10 ${vi.games.G1!.name}`,
      `2026-10-10 ${vi.games.G2!.name}`,
      `2026-10-11 ${vi.games.G1!.name}`,
    ]);
    expect(rows[2]).toEqual([
      '2026-10-10',
      vi.games.G2!.name,
      vi.parent.progress.devices.tablet,
      '3',
      '72',
      '4.5',
      '31.2',
    ]);
  });
});

describe('tên file', () => {
  it('slugName: bỏ dấu tiếng Việt, đ → d, chỉ a–z0–9 và gạch ngang, tối đa 20 ký tự, rỗng → be', () => {
    expect(slugName('Bé Na')).toBe('be-na');
    expect(slugName('Đức Anh')).toBe('duc-anh');
    expect(slugName('  Nguyễn  Thị  Ánh!  ')).toBe('nguyen-thi-anh');
    expect(slugName('A'.repeat(40))).toBe('a'.repeat(20));
    expect(slugName('😀???')).toBe('be');
    expect(slugName('')).toBe('be');
  });
  it('csvFileName: nhanhtay-lichsu|tonghop-<tên>-YYYYMMDD.csv theo giờ máy', () => {
    const d = new Date(2026, 9, 3, 15, 0, 0); // 03/10/2026 giờ máy
    expect(csvFileName('rounds', 'Bé Na', d)).toBe('nhanhtay-lichsu-be-na-20261003.csv');
    expect(csvFileName('daily', 'Đức', d)).toBe('nhanhtay-tonghop-duc-20261003.csv');
  });
});
