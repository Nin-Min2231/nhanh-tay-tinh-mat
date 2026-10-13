// G6 – dựng câu hỏi từ phép tính gốc: dạng tìm số thiếu, đáp án nhiễu hợp lý, hình minh họa.
import { pick, shuffle, type Rng } from '../../app/rng';
import { TOPICS, factKey, type Core } from './topics';

/** Vị trí dấu “?”: r = kết quả; a, b = số hạng bị ẩn (tìm số thiếu). */
export type Hidden = 'r' | 'a' | 'b';

export interface MathQuestion {
  topic: string;
  core: Core;
  hidden: Hidden;
  /** Khóa sổ lỗi, vd "8+7". */
  key: string;
  /** Giá trị cần tìm. Với so sánh: −1 (<), 0 (=), 1 (>). */
  answer: number;
  options: number[];
  correctIndex: number;
  /** Câu hỏi lại (từ sổ lỗi hoặc chèn lại sau khi sai). */
  retry: boolean;
}

export interface BuildParams {
  /** Số đáp án (M03 luôn 3). */
  optionCount: number;
  missingRatio: number;
}

/** Giá trị −1/0/1 của đáp án so sánh → ký hiệu. */
export function cmpSymbol(v: number): '<' | '=' | '>' {
  return v < 0 ? '<' : v > 0 ? '>' : '=';
}

/** Số từ 1000 trở lên viết cách nhóm 3 chữ số: 2 450. */
export function formatNumber(n: number): string {
  const s = String(n);
  return s.length <= 3 ? s : s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function hiddenValue(core: Core, hidden: Hidden): number {
  return hidden === 'r' ? core.r : hidden === 'a' ? core.a : core.b;
}

/** Hai số còn hiện trên đề (dùng sinh lỗi “làm nhầm phép tính”). */
function visibleNumbers(core: Core, hidden: Hidden): [number, number] {
  if (hidden === 'r') return [core.a, core.b];
  return hidden === 'a' ? [core.b, core.r] : [core.a, core.r];
}

/** Đảo hai chữ số cuối: 47 → 74, 352 → 325. */
function swapLastTwoDigits(n: number): number {
  if (n < 10) return n;
  const u = n % 10;
  const t = Math.floor(n / 10) % 10;
  return n - t * 10 - u + u * 10 + t;
}

/** Đáp án nhiễu: ±1, ±2, ±10 (quên nhớ), đảo chữ số, kết quả phép tính nhầm, a×(b±1). */
export function makeDistractors(
  rng: Rng,
  q: Pick<MathQuestion, 'core' | 'hidden' | 'answer'>,
  need: number,
): number[] {
  const { core, hidden, answer } = q;
  const [x, y] = visibleNumbers(core, hidden);
  const cand: number[] = [answer + 1, answer - 1, answer + 2, answer - 2];
  if (answer >= 10) cand.push(answer + 10, answer - 10); // quên nhớ
  cand.push(swapLastTwoDigits(answer));
  // làm nhầm phép tính (cộng ↔ trừ): chỉ lấy khi kết quả nhầm không quá xa đáp án (tránh số vô lý như 138 cho 72 − 66)
  for (const wrong of [x + y, Math.abs(x - y)]) {
    if (Math.abs(wrong - answer) <= Math.max(12, answer)) cand.push(wrong);
  }
  // nhân: nhầm sang hàng bên cạnh trong bảng cửu chương – luôn có ít nhất 1 đáp án kiểu này
  const must: number[] = [];
  if (core.op === 'mul' && hidden === 'r') {
    const near = [
      core.a * (core.b + 1),
      core.a * (core.b - 1),
      (core.a + 1) * core.b,
      (core.a - 1) * core.b,
    ].filter((n) => n >= 0 && n !== answer);
    if (near.length > 0) must.push(near[Math.floor(rng() * near.length)] as number);
    cand.push(...near);
  }
  const seen = new Set<number>([answer]);
  const out: number[] = [];
  const take = (n: number): void => {
    if (out.length < need && Number.isInteger(n) && n >= 0 && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  };
  for (const n of must) take(n);
  for (const n of shuffle(rng, cand)) take(n);
  // thiếu thì bổ sung các số gần đáp án
  for (let d = 3; out.length < need && d < 200; d++) {
    const order = rng() < 0.5 ? [d, -d] : [-d, d];
    for (const s of order) take(answer + s);
  }
  return out;
}

export function buildQuestion(
  rng: Rng,
  topic: string,
  core: Core,
  params: BuildParams,
  retry = false,
): MathQuestion {
  const def = TOPICS[topic];
  let hidden: Hidden = 'r';
  if (core.op !== 'cmp' && def) {
    if (def.forceMissing || (def.canMiss && !core.word && rng() < params.missingRatio)) {
      hidden = rng() < 0.5 ? 'a' : 'b';
      // số thiếu quá lớn (vd M11 `? : 5 = 57` → 285) thì hỏi dạng thường `a op b = ?` (không đổi sang số còn lại
      // để tỷ lệ các dạng khác – vd tìm số chia – không bị lệch)
      const limit = def.maxMissing;
      if (limit !== undefined && hiddenValue(core, hidden) > limit) hidden = 'r';
    }
  }
  const base = { topic, core, hidden, key: factKey(core), retry };
  if (core.op === 'cmp') {
    const options = shuffle(rng, [-1, 0, 1]);
    return { ...base, answer: core.r, options, correctIndex: options.indexOf(core.r) };
  }
  const answer = hiddenValue(core, hidden);
  const distractors = makeDistractors(
    rng,
    { core, hidden, answer },
    Math.max(2, params.optionCount - 1),
  );
  const options = shuffle(rng, [answer, ...distractors]);
  return { ...base, answer, options, correctIndex: options.indexOf(answer) };
}

/** Câu hỏi lại cùng phép tính (đáp án nhiễu và vị trí táo được xáo lại). */
export function rebuildQuestion(rng: Rng, q: MathQuestion, params: BuildParams): MathQuestion {
  return buildQuestion(rng, q.topic, q.core, params, true);
}

/** Chọn chủ đề cho câu sinh mới. */
export function pickTopic(rng: Rng, topics: readonly string[]): string {
  return pick(rng, topics);
}

// ---------- hình minh họa khi sai ----------

export type Illustration =
  /** Khung 10 ô chấm tròn (cộng/trừ ≤ 20). */
  | { kind: 'frames'; op: 'add' | 'sub'; a: number; b: number; r: number }
  /** Lưới chấm hàng × cột (nhân/chia). */
  | { kind: 'grid'; rows: number; cols: number }
  /** Đặt tính dọc có tô chữ số nhớ. `check` = chia thì kiểm tra bằng phép nhân. */
  | { kind: 'column'; op: 'add' | 'sub' | 'mul'; a: number; b: number; r: number; check: boolean }
  /** Khối chục và đơn vị (so sánh). */
  | { kind: 'blocks'; a: number; b: number };

export function illustrationFor(core: Core): Illustration {
  const { op, a, b, r } = core;
  if (op === 'cmp') return { kind: 'blocks', a, b };
  if (op === 'add' || op === 'sub') {
    if (Math.max(a, b, r) <= 20) return { kind: 'frames', op, a, b, r };
    return { kind: 'column', op, a, b, r, check: false };
  }
  if (op === 'mul') {
    // “Gấp a lên b lần” = b hàng, mỗi hàng a chấm; a × b = a hàng, mỗi hàng b chấm
    const rows = core.word ? b : a;
    const cols = core.word ? a : b;
    if (rows <= 10 && cols <= 10) return { kind: 'grid', rows, cols };
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    return { kind: 'column', op: 'mul', a: big, b: small, r, check: false };
  }
  // chia: a : b = r → b hàng, mỗi hàng r chấm
  if (b <= 10 && r <= 10) return { kind: 'grid', rows: b, cols: r };
  return { kind: 'column', op: 'mul', a: r, b, r: a, check: true };
}

// ---------- đặt tính dọc ----------

export interface ColumnModel {
  op: 'add' | 'sub' | 'mul';
  /** Chữ số từng cột, căn phải, từ trái sang phải. null = ô trống. */
  top: (number | null)[];
  bottom: (number | null)[];
  result: (number | null)[];
  /** Số nhớ hiện ở cột đó (0 = không có). */
  carry: number[];
  /** Hàng số nhớ nằm trên số thứ nhất (cộng, nhân) hay ngay trên số thứ hai (trừ). */
  carryAbove: 'top' | 'bottom';
  width: number;
}

const digitsOf = (n: number): number[] => String(n).split('').map(Number);

function padLeft(d: number[], width: number): (number | null)[] {
  return [...new Array<null>(width - d.length).fill(null), ...d];
}

export function columnModel(op: 'add' | 'sub' | 'mul', a: number, b: number): ColumnModel {
  const r = op === 'add' ? a + b : op === 'sub' ? a - b : a * b;
  const width = Math.max(String(a).length, String(b).length, String(r).length);
  // carry[i] (i = cột từ phải = 0) là số nhớ đẩy sang cột i + 1
  const carryOut: number[] = new Array<number>(width).fill(0);
  if (op === 'add') {
    let c = 0;
    for (let i = 0; i < width; i++) {
      const s = (Math.floor(a / 10 ** i) % 10) + (Math.floor(b / 10 ** i) % 10) + c;
      c = s >= 10 ? 1 : 0;
      carryOut[i] = c;
    }
  } else if (op === 'sub') {
    let br = 0;
    for (let i = 0; i < width; i++) {
      const d = (Math.floor(a / 10 ** i) % 10) - (Math.floor(b / 10 ** i) % 10) - br;
      br = d < 0 ? 1 : 0;
      carryOut[i] = br;
    }
  } else {
    let c = 0;
    for (let i = 0; i < width; i++) {
      const p = (Math.floor(a / 10 ** i) % 10) * b + c;
      c = Math.floor(p / 10);
      carryOut[i] = c;
    }
  }
  // số nhớ hiện ở cột bên trái (chỉ số lớn hơn khi tính từ phải)
  const carry: number[] = new Array<number>(width).fill(0);
  for (let i = 0; i < width - 1; i++) carry[width - 1 - (i + 1)] = carryOut[i] as number;
  return {
    op,
    top: padLeft(digitsOf(a), width),
    bottom: padLeft(digitsOf(b), width),
    result: padLeft(digitsOf(r), width),
    carry,
    carryAbove: op === 'sub' ? 'bottom' : 'top',
    width,
  };
}
