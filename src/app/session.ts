// Đồng hồ lượt chơi + thời gian chơi trong ngày (SPEC mục 3 và 8).
// Thuần: đồng hồ được truyền vào để test không phải chờ thật.
import { getDay } from './profile';
import type { Profile } from './types';

export type RoundPhase = 'idle' | 'countdown' | 'running' | 'paused' | 'finished' | 'aborted';
export type ClockEvent = 'warn' | 'timeUp' | 'graceExpired';

export interface RoundClockOptions {
  /** Thời gian còn lại trong ngày lúc bắt đầu lượt (ms). */
  remainingMs: number;
  /** Nhắc nhẹ khi còn ≤ giá trị này (mặc định 2 phút). */
  warnMs?: number;
  /** Cho chơi nốt tối đa thêm bao lâu sau khi hết giờ (mặc định 90 giây). */
  graceMs?: number;
  now?: () => number;
}

const NO_EVENTS: ClockEvent[] = [];

export class RoundClock {
  phase: RoundPhase = 'idle';
  /** Thời gian đã ở trạng thái Running (ms). */
  playedMs = 0;

  private readonly initialRemainingMs: number;
  private readonly warnMs: number;
  private readonly graceMs: number;
  private readonly now: () => number;
  private lastAt = 0;
  private warned = false;
  private timedOut = false;
  private graceDone = false;

  constructor(opts: RoundClockOptions) {
    this.initialRemainingMs = opts.remainingMs;
    this.warnMs = opts.warnMs ?? 2 * 60_000;
    this.graceMs = opts.graceMs ?? 90_000;
    this.now = opts.now ?? (() => performance.now());
  }

  get remainingMs(): number {
    return this.initialRemainingMs - this.playedMs;
  }

  /** Thời gian chơi lố so với giới hạn ngày (ms). */
  get overtimeMs(): number {
    return Math.max(0, this.playedMs - this.initialRemainingMs);
  }

  startCountdown(): void {
    if (this.phase === 'idle' || this.phase === 'paused') this.phase = 'countdown';
  }

  startRunning(): void {
    if (this.phase !== 'countdown') return;
    this.phase = 'running';
    this.lastAt = this.now();
  }

  pause(): void {
    if (this.phase === 'running') this.flush();
    if (this.phase === 'running' || this.phase === 'countdown') this.phase = 'paused';
  }

  finish(): void {
    if (this.phase === 'running') this.flush();
    if (this.phase === 'running' || this.phase === 'paused') this.phase = 'finished';
  }

  /** Thoát khi tạm dừng: lượt không được lưu (thời gian đã chơi vẫn tính vào giới hạn ngày). */
  abort(): void {
    if (this.phase === 'running') this.flush();
    if (this.phase !== 'finished' && this.phase !== 'aborted') this.phase = 'aborted';
  }

  /** Gọi định kỳ (vd mỗi 250 ms). Trả về các sự kiện mới phát sinh. */
  tick(): ClockEvent[] {
    if (this.phase !== 'running') return NO_EVENTS;
    this.flush();
    const events: ClockEvent[] = [];
    const remaining = this.remainingMs;
    if (!this.warned && remaining > 0 && remaining <= this.warnMs) {
      this.warned = true;
      events.push('warn');
    }
    if (!this.timedOut && remaining <= 0) {
      this.warned = true;
      this.timedOut = true;
      events.push('timeUp');
    }
    if (this.timedOut && !this.graceDone && this.overtimeMs >= this.graceMs) {
      this.graceDone = true;
      events.push('graceExpired');
    }
    return events.length > 0 ? events : NO_EVENTS;
  }

  private flush(): void {
    const t = this.now();
    this.playedMs += Math.max(0, t - this.lastAt);
    this.lastAt = t;
  }
}

/** Tổng thời gian được chơi hôm nay (giới hạn + PH tặng), ms. */
export function dayAllowanceMs(profile: Profile, key: string): number {
  return profile.limits.dailyMinutes * 60_000 + getDay(profile, key).bonusMs;
}

/** Thời gian còn lại hôm nay (ms, ≥ 0). */
export function dayRemainingMs(profile: Profile, key: string): number {
  return Math.max(0, dayAllowanceMs(profile, key) - getDay(profile, key).playMs);
}

export function isOutOfTime(profile: Profile, key: string): boolean {
  return dayRemainingMs(profile, key) <= 0;
}
