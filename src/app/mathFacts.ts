// Sổ lỗi toán (F19, SPEC mục 5 `MathFact`): theo dõi các phép tính bé từng làm sai. Logic thuần, có test.
import type { MathFact } from './types';

/** Số lần đúng liên tiếp để coi là “đã thuộc”. */
export const MASTER_STREAK = 3;
/** Giới hạn số phép tính lưu trong hồ sơ (tránh localStorage phình to). */
export const MAX_FACTS = 300;

export interface FactResult {
  /** Khóa chuẩn hóa: "8+7", "15-9", "7x8". */
  key: string;
  correct: boolean;
}

export interface ApplyOutcome {
  facts: Record<string, MathFact>;
  /** Số phép tính chuyển sang “đã thuộc” trong lượt này. */
  newlyMastered: number;
}

/**
 * Cập nhật sổ lỗi theo kết quả một lượt (theo đúng thứ tự trả lời).
 * - Phép tính chưa có trong sổ mà làm đúng → bỏ qua (sổ chỉ theo dõi phép tính từng sai).
 * - Sai → streak = 0, bỏ trạng thái “đã thuộc”. Đúng → streak + 1; đủ MASTER_STREAK thì mastered.
 * `round` = số thứ tự lượt chơi G6 (lastSeenRound).
 */
export function applyMathResults(
  prev: Record<string, MathFact>,
  results: readonly FactResult[],
  round: number,
): ApplyOutcome {
  const facts: Record<string, MathFact> = { ...prev };
  for (const r of results) {
    let f = facts[r.key];
    if (!f) {
      if (r.correct) continue;
      f = { seen: 0, correct: 0, streak: 0, lastSeenRound: round, mastered: false };
    } else {
      f = { ...f };
    }
    f.seen += 1;
    f.lastSeenRound = round;
    if (r.correct) {
      f.correct += 1;
      f.streak += 1;
      if (f.streak >= MASTER_STREAK) f.mastered = true;
    } else {
      f.streak = 0;
      f.mastered = false;
    }
    facts[r.key] = f;
  }
  const newlyMastered = Object.keys(facts).filter(
    (k) => facts[k]?.mastered && !prev[k]?.mastered,
  ).length;
  return { facts: prune(facts), newlyMastered };
}

/** Giữ tối đa MAX_FACTS phép tính: bỏ “đã thuộc” cũ nhất trước, rồi đến phép tính cũ nhất. */
export function prune(facts: Record<string, MathFact>, max = MAX_FACTS): Record<string, MathFact> {
  const keys = Object.keys(facts);
  if (keys.length <= max) return facts;
  const rank = (k: string): number => {
    const f = facts[k] as MathFact;
    return (f.mastered ? 0 : 1e9) + f.lastSeenRound;
  };
  const drop = keys.sort((a, b) => rank(a) - rank(b)).slice(0, keys.length - max);
  const out = { ...facts };
  for (const k of drop) delete out[k];
  return out;
}

/**
 * Các phép tính cần hỏi lại đầu lượt: từng sai, chưa thuộc. Ưu tiên streak thấp, rồi lâu chưa gặp.
 * Trả về khóa theo thứ tự ưu tiên.
 */
export function dueFactKeys(facts: Record<string, MathFact>): string[] {
  return Object.keys(facts)
    .filter((k) => {
      const f = facts[k] as MathFact;
      return !f.mastered && f.seen > f.correct;
    })
    .sort((a, b) => {
      const fa = facts[a] as MathFact;
      const fb = facts[b] as MathFact;
      return fa.streak - fb.streak || fa.lastSeenRound - fb.lastSeenRound || (a < b ? -1 : 1);
    });
}

/** Đọc `RoundResult.extra.factResults` do G6 trả về (bỏ phần tử sai kiểu). */
export function parseFactResults(extra: Record<string, unknown> | undefined): FactResult[] {
  const raw = extra?.factResults;
  if (!Array.isArray(raw)) return [];
  const out: FactResult[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const { key, correct } = item as Record<string, unknown>;
    if (typeof key === 'string' && key.length > 0 && typeof correct === 'boolean') {
      out.push({ key, correct });
    }
  }
  return out;
}

/** Cập nhật `profile.math` sau một lượt G6. `round` = số thứ tự lượt G6 (plays + 1). */
export function applyRoundToMath<T extends { facts: Record<string, MathFact> }>(
  math: T,
  extra: Record<string, unknown> | undefined,
  round: number,
): T {
  const results = parseFactResults(extra);
  if (results.length === 0) return math;
  return { ...math, facts: applyMathResults(math.facts, results, round).facts };
}
