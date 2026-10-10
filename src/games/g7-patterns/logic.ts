// G7 – luật chơi thuần (không DOM): 8 câu, thử lại ½ điểm ở cấp 1–5, điểm và metrics.
import { mulberry32, shuffle, type Rng } from '../../app/rng';
import { QUESTIONS_PER_ROUND, type G7Params } from './config';
import { itemKey } from './elements';
import { buildPuzzle, typesForLevel, type Group, type Puzzle, type TypeId } from './puzzles';

export type AnswerResult =
  /** Đúng. points = 1 (lần đầu) hoặc ½ (đúng sau khi thử lại). */
  | { kind: 'correct'; points: 1 | 0.5; firstTry: boolean }
  /** Sai lần 1 ở cấp được thử lại: giải thích quy luật rồi cho chọn lại. */
  | { kind: 'retry' }
  /** Sai và hết cơ hội: hiện đáp án + giải thích rồi sang câu sau. */
  | { kind: 'wrong' }
  | { kind: 'timeout' }
  /** Đã xong câu này hoặc bấm lại thẻ đã chọn sai. */
  | { kind: 'ignored' };

interface QuestionRecord {
  points: number;
  firstTry: boolean;
  timedOut: boolean;
  ms: number;
  typeLevel: number;
}

function signature(p: Puzzle): string {
  return `${p.type}|${p.cells.map((c) => (c ? itemKey(c) : '?')).join(',')}|${p.options.map(itemKey).join(',')}`;
}

/** Danh sách dạng câu cho cả lượt: xoay vòng các dạng của cấp, tránh 2 câu liền kề cùng dạng. */
export function planTypes(rng: Rng, types: readonly TypeId[], total: number): TypeId[] {
  const out: TypeId[] = [];
  while (out.length < total) {
    let round = shuffle(rng, types);
    if (types.length > 1 && out.length > 0 && round[0] === out[out.length - 1]) {
      round = [...round.slice(1), round[0] as TypeId];
    }
    out.push(...round);
  }
  return out.slice(0, total);
}

export class G7Rules {
  readonly total = QUESTIONS_PER_ROUND;
  readonly puzzles: Puzzle[] = [];
  index = 0;
  private attempts = 0;
  private resolved = false;
  private readonly wrongChoices = new Set<number>();
  private readonly records: QuestionRecord[] = [];

  constructor(
    rng: Rng,
    readonly params: G7Params,
    level: number,
    groups: readonly Group[],
  ) {
    const plan = planTypes(rng, typesForLevel(level, groups), this.total);
    const seen = new Set<string>();
    for (const type of plan) {
      let p = buildPuzzle(mulberry32((rng() * 4294967296) >>> 0), type, params.options);
      for (let i = 0; i < 12 && seen.has(signature(p)); i++) {
        p = buildPuzzle(mulberry32((rng() * 4294967296) >>> 0), type, params.options);
      }
      seen.add(signature(p));
      this.puzzles.push(p);
    }
  }

  get done(): boolean {
    return this.index >= this.total;
  }

  current(): Puzzle {
    return this.puzzles[Math.min(this.index, this.total - 1)] as Puzzle;
  }

  /** Các thẻ đã chọn sai ở câu hiện tại (để làm mờ khi cho thử lại). */
  get wrong(): ReadonlySet<number> {
    return this.wrongChoices;
  }

  get isResolved(): boolean {
    return this.resolved;
  }

  /** Cấp được thử lại? */
  get canRetry(): boolean {
    return this.params.retry;
  }

  /**
   * Trả lời câu hiện tại. `choice` = chỉ số thẻ; null = hết giờ.
   * `ms` = thời gian từ lúc hiện câu (không tính lúc tạm dừng).
   */
  answer(choice: number | null, ms: number): AnswerResult {
    if (this.resolved || this.done) return { kind: 'ignored' };
    const p = this.current();
    if (choice === null) {
      this.finishQuestion(0, false, true, ms, p);
      return { kind: 'timeout' };
    }
    if (this.wrongChoices.has(choice)) return { kind: 'ignored' };
    if (choice === p.correctIndex) {
      const firstTry = this.attempts === 0;
      const points = firstTry ? 1 : 0.5;
      this.finishQuestion(points, firstTry, false, ms, p);
      return { kind: 'correct', points, firstTry };
    }
    this.attempts += 1;
    this.wrongChoices.add(choice);
    if (this.params.retry && this.attempts === 1) return { kind: 'retry' };
    this.finishQuestion(0, false, false, ms, p);
    return { kind: 'wrong' };
  }

  private finishQuestion(
    points: number,
    firstTry: boolean,
    timedOut: boolean,
    ms: number,
    p: Puzzle,
  ): void {
    this.resolved = true;
    this.records.push({ points, firstTry, timedOut, ms, typeLevel: p.typeLevel });
  }

  /** Sang câu kế tiếp. Trả về false nếu đã hết 8 câu. */
  next(): boolean {
    this.index += 1;
    this.attempts = 0;
    this.resolved = false;
    this.wrongChoices.clear();
    return !this.done;
  }

  get points(): number {
    return this.records.reduce((s, r) => s + r.points, 0);
  }

  /** score = tổng điểm câu / 8. */
  get score(): number {
    return this.points / this.total;
  }

  metrics(): Record<string, number> {
    const solved = this.records.filter((r) => r.points > 0);
    const firstTry = this.records.filter((r) => r.firstTry).length;
    return {
      accuracy: Math.round((firstTry / this.total) * 1000) / 1000,
      avgTimeMs:
        solved.length === 0 ? 0 : Math.round(solved.reduce((s, r) => s + r.ms, 0) / solved.length),
      highestTypeCorrect: solved.reduce((m, r) => Math.max(m, r.typeLevel), 0),
      correct: solved.length,
      firstTry,
      timeouts: this.records.filter((r) => r.timedOut).length,
    };
  }
}
