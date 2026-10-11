// Khóa phụ huynh (F08): phép nhân a × b (a ∈ [12, 49], b ∈ [3, 9]); sai 3 lần khóa 30 giây rồi ra phép tính mới.
// Thuần: rng và đồng hồ được truyền vào để test không phải chờ.
import { randInt } from './rng';

export const GATE_MAX_WRONG = 3;
export const GATE_LOCK_MS = 30_000;

export interface Challenge {
  a: number;
  b: number;
  answer: number;
}

export function makeChallenge(rng: () => number): Challenge {
  const a = randInt(rng, 12, 49);
  const b = randInt(rng, 3, 9);
  return { a, b, answer: a * b };
}

export interface GateState {
  challenge: Challenge;
  /** Số lần sai liên tiếp với phép tính hiện tại. */
  wrong: number;
  /** Thời điểm (ms) hết khóa; null = không bị khóa. */
  lockedUntil: number | null;
}

export type GateResult = 'ok' | 'wrong' | 'locked' | 'empty';

export function initialGate(rng: () => number): GateState {
  return { challenge: makeChallenge(rng), wrong: 0, lockedUntil: null };
}

/** Hết thời gian khóa → phép tính mới; chưa hết → giữ nguyên. */
export function refreshGate(state: GateState, now: number, rng: () => number): GateState {
  if (state.lockedUntil !== null && now >= state.lockedUntil) return initialGate(rng);
  return state;
}

export function lockRemainingMs(state: GateState, now: number): number {
  return state.lockedUntil === null ? 0 : Math.max(0, state.lockedUntil - now);
}

/** Nộp đáp án (chuỗi chữ số). Trả về trạng thái mới + kết quả. */
export function submitAnswer(
  state: GateState,
  input: string,
  now: number,
  lockMs: number = GATE_LOCK_MS,
): { state: GateState; result: GateResult } {
  if (state.lockedUntil !== null && now < state.lockedUntil) return { state, result: 'locked' };
  const text = input.trim();
  if (text === '') return { state, result: 'empty' };
  if (/^\d+$/.test(text) && Number(text) === state.challenge.answer) {
    return { state: { ...state, wrong: 0 }, result: 'ok' };
  }
  const wrong = state.wrong + 1;
  if (wrong >= GATE_MAX_WRONG) {
    return { state: { ...state, wrong, lockedUntil: now + lockMs }, result: 'locked' };
  }
  return { state: { ...state, wrong }, result: 'wrong' };
}
