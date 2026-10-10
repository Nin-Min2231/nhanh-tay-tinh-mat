// G6 – luật chơi thuần (không DOM): 10 câu, câu sai chèn lại sau 2–4 câu, sổ lỗi, điểm, metrics.
import { dueFactKeys, type FactResult } from '../../app/mathFacts';
import { randInt, type Rng } from '../../app/rng';
import type { MathFact } from '../../app/types';
import { QUESTIONS_PER_ROUND, type G6Params } from './config';
import {
  buildQuestion,
  pickTopic,
  rebuildQuestion,
  type BuildParams,
  type MathQuestion,
} from './question';
import { TOPICS, coreFromKey, factKey, topicOfCore } from './topics';

/** Số câu đầu lượt dành cho phép tính từng sai (F19). */
export const MAX_DUE_PER_ROUND = 2;
/** Câu sai được hỏi lại sau bao nhiêu câu. */
export const RETRY_GAP: readonly [number, number] = [2, 4];

export interface AnswerRecord {
  key: string;
  correct: boolean;
  timedOut: boolean;
  /** Thời gian từ lúc hiện câu đến lúc trả lời (ms, không tính lúc tạm dừng). */
  ms: number;
}

export interface AnswerOutcome {
  correct: boolean;
  timedOut: boolean;
  /** Vị trí câu (0-based) mà câu sai được chèn lại; null = không chèn (hết chỗ hoặc đã hỏi lại rồi). */
  retryAt: number | null;
}

export class G6Rules {
  readonly total = QUESTIONS_PER_ROUND;
  private readonly slots: MathQuestion[] = [];
  private readonly build: BuildParams;
  private readonly answered: AnswerRecord[] = [];
  private readonly rescheduled = new Set<string>();
  index = 0;

  constructor(
    private readonly rng: Rng,
    params: G6Params,
    readonly topics: readonly string[],
    facts: Record<string, MathFact> = {},
  ) {
    this.build = { optionCount: params.options, missingRatio: params.missingRatio };
    const used = new Set<string>();

    // 1) tối đa 2 câu đầu: phép tính từng sai thuộc chủ đề đang bật
    for (const key of dueFactKeys(facts)) {
      if (this.slots.length >= MAX_DUE_PER_ROUND) break;
      const core = coreFromKey(key);
      const topic = core ? topicOfCore(core, topics) : null;
      if (!core || !topic) continue;
      used.add(key);
      this.slots.push(buildQuestion(this.rng, topic, core, this.build, true));
    }

    // 2) còn lại: sinh mới theo chủ đề, tránh trùng phép tính trong lượt
    while (this.slots.length < this.total) {
      let q: MathQuestion | null = null;
      for (let attempt = 0; attempt < 30; attempt++) {
        const topic = pickTopic(this.rng, topics);
        const def = TOPICS[topic];
        if (!def) continue;
        const core = def.gen(this.rng, params.easy);
        if (used.has(factKey(core)) && attempt < 29) continue;
        q = buildQuestion(this.rng, topic, core, this.build);
        break;
      }
      if (!q) throw new Error('G6: không sinh được câu hỏi (chưa bật chủ đề nào?)');
      used.add(q.key);
      this.slots.push(q);
    }
  }

  get done(): boolean {
    return this.index >= this.total;
  }

  current(): MathQuestion {
    return this.slots[Math.min(this.index, this.total - 1)] as MathQuestion;
  }

  questions(): readonly MathQuestion[] {
    return this.slots;
  }

  /** Trả lời câu hiện tại. `choice` = chỉ số đáp án; null = hết giờ. */
  answer(choice: number | null, ms: number): AnswerOutcome {
    const q = this.current();
    const correct = choice !== null && choice === q.correctIndex;
    const timedOut = choice === null;
    this.answered.push({ key: q.key, correct, timedOut, ms });
    let retryAt: number | null = null;
    if (!correct && !q.retry && !this.rescheduled.has(q.key)) {
      this.rescheduled.add(q.key);
      retryAt = this.scheduleRetry(q);
    }
    return { correct, timedOut, retryAt };
  }

  /** Chèn lại câu sai ở vị trí hiện tại + 2…4 (thay một câu chưa làm, giữ đủ 10 câu). */
  private scheduleRetry(q: MathQuestion): number | null {
    const [lo, hi] = RETRY_GAP;
    const first = randInt(this.rng, lo, hi);
    const offsets = [first, ...[2, 3, 4].filter((k) => k !== first)];
    for (const k of offsets) {
      const j = this.index + k;
      if (j >= this.total) continue;
      if ((this.slots[j] as MathQuestion).retry) continue; // không đè câu hỏi lại khác
      this.slots[j] = rebuildQuestion(this.rng, q, this.build);
      return j;
    }
    return null;
  }

  /** Sang câu kế tiếp. Trả về false nếu đã hết 10 câu. */
  next(): boolean {
    this.index += 1;
    return !this.done;
  }

  get correctCount(): number {
    return this.answered.filter((a) => a.correct).length;
  }

  get answeredCount(): number {
    return this.answered.length;
  }

  get timeouts(): number {
    return this.answered.filter((a) => a.timedOut).length;
  }

  /** score = số câu đúng / 10 (hết giờ = sai; câu chưa làm do kết thúc sớm cũng không tính). */
  get score(): number {
    return this.correctCount / this.total;
  }

  /** Kết quả từng câu theo thứ tự → đưa vào `RoundResult.extra` để cập nhật sổ lỗi. */
  factResults(): FactResult[] {
    return this.answered.map((a) => ({ key: a.key, correct: a.correct }));
  }

  metrics(masteredCount: number): Record<string, number> {
    const right = this.answered.filter((a) => a.correct);
    const answered = this.answered.length;
    return {
      accuracy: answered === 0 ? 0 : Math.round((right.length / answered) * 1000) / 1000,
      avgTimeMs:
        right.length === 0 ? 0 : Math.round(right.reduce((s, a) => s + a.ms, 0) / right.length),
      timeouts: this.timeouts,
      masteredCount,
      correct: right.length,
    };
  }
}
