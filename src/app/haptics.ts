// Phản hồi rung. Tablet Samsung thường không có mô-tơ rung → luôn kèm lắc hình (CSS .shake).
import type { DeviceClass } from './types';

export interface HapticsApi {
  correct(): void;
  /** Sai: rung nhẹ (điện thoại) + LUÔN lắc hình `target` (mọi thiết bị). */
  wrong(target?: HTMLElement | null): void;
}

export const SHAKE_MS = 150;

export function shake(el: HTMLElement | null | undefined): void {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // khởi động lại animation
  el.classList.add('shake');
  window.setTimeout(() => el.classList.remove('shake'), SHAKE_MS + 50);
}

export function createHaptics(isEnabled: () => boolean, deviceClass: DeviceClass): HapticsApi {
  function vibrate(pattern: number | number[]): void {
    if (deviceClass !== 'phone' || !isEnabled()) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
    } catch {
      /* không hỗ trợ */
    }
  }
  return {
    correct: () => vibrate(30),
    wrong(target) {
      vibrate([15, 40, 15]);
      shake(target);
    },
  };
}
