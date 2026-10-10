import type { DeviceClass } from './types';

/** Tablet nếu cạnh ngắn của MÀN HÌNH ≥ 600 CSS px (không dùng cửa sổ vì có thể đang chia đôi). */
export function deviceClassFromScreen(width: number, height: number): DeviceClass {
  return Math.min(width, height) >= 600 ? 'tablet' : 'phone';
}

export function getDeviceClass(): DeviceClass {
  if (typeof screen === 'undefined') return 'phone';
  return deviceClassFromScreen(screen.width, screen.height);
}

/**
 * Cửa sổ quá nhỏ để chơi (chia đôi màn hình/cửa sổ nổi).
 * Tablet: rộng < 360 hoặc cao < 480 (SPEC 12b). Điện thoại: cạnh ngắn < 300
 * (không chặn điện thoại xoay ngang, vốn cao ~360px).
 */
export function isWindowTooSmall(width: number, height: number, cls: DeviceClass): boolean {
  if (cls === 'tablet') return width < 360 || height < 480;
  return Math.min(width, height) < 300;
}

/** uuid; có dự phòng vì crypto.randomUUID không có trên http (vd: mở qua IP wifi khi dev). */
export function generateId(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    if (crypto.getRandomValues) {
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = ((b[6] as number) & 0x0f) | 0x40;
      b[8] = ((b[8] as number) & 0x3f) | 0x80;
      const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
