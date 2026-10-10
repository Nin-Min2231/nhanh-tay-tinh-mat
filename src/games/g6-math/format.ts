// G6 – chuyển phép tính thành chữ hiển thị (đề bài, phép tính đã giải, nhãn quả táo).
import { vi } from '../../i18n/vi';
import { cmpSymbol, formatNumber, type MathQuestion } from './question';
import type { Core } from './topics';

const SYMBOL = { add: '+', sub: '−', mul: '×', div: ':' } as const;

const n = formatNumber;

/** Đề bài: “8 + 7 = ?”, “? + 8 = 15”, “47 ? 74”, “Gấp 4 lên 3 lần = ?”. */
export function questionText(q: MathQuestion): string {
  const { core, hidden } = q;
  if (core.op === 'cmp') return `${n(core.a)} ? ${n(core.b)}`;
  if (core.word) {
    return `${core.op === 'mul' ? vi.g6.times(core.a, core.b) : vi.g6.shrink(core.a, core.b)} = ?`;
  }
  const a = hidden === 'a' ? '?' : n(core.a);
  const b = hidden === 'b' ? '?' : n(core.b);
  const r = hidden === 'r' ? '?' : n(core.r);
  return `${a} ${SYMBOL[core.op]} ${b} = ${r}`;
}

/** Phép tính đầy đủ sau khi đã giải: “8 + 7 = 15”, “47 < 74”. */
export function solvedText(core: Core): string {
  if (core.op === 'cmp') return `${n(core.a)} ${cmpSymbol(core.r)} ${n(core.b)}`;
  if (core.word) {
    return `${core.op === 'mul' ? vi.g6.times(core.a, core.b) : vi.g6.shrink(core.a, core.b)} = ${n(core.r)}`;
  }
  return `${n(core.a)} ${SYMBOL[core.op]} ${n(core.b)} = ${n(core.r)}`;
}

/** Chữ ghi trên quả táo. */
export function optionLabel(q: MathQuestion, value: number): string {
  return q.core.op === 'cmp' ? cmpSymbol(value) : n(value);
}

/** Lời nhắc ngắn dưới đề (so sánh / tìm số thiếu). */
export function questionNote(q: MathQuestion): string {
  if (q.core.op === 'cmp') return vi.g6.chooseSign;
  return q.hidden === 'r' ? '' : vi.g6.findMissing;
}
