// Kích thước cửa sổ hiện tại + cờ “quá nhỏ” (chia đôi màn hình / cửa sổ nổi của Samsung).
import { computed, signal } from '@preact/signals';
import { getDeviceClass, isWindowTooSmall } from './device';

export const viewport = signal({ w: window.innerWidth, h: window.innerHeight });
const cls = getDeviceClass();
export const tooSmall = computed(() => isWindowTooSmall(viewport.value.w, viewport.value.h, cls));

function update(): void {
  const { innerWidth: w, innerHeight: h } = window;
  if (w !== viewport.value.w || h !== viewport.value.h) viewport.value = { w, h };
}

window.addEventListener('resize', update);
window.addEventListener('orientationchange', update);
