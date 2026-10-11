// “Hôm nay” (khóa ngày theo giờ máy) dưới dạng signal. Màn hình nằm yên lâu (Home, khi bé để máy qua đêm) phải đổi
// sang ngày mới mà không cần thao tác: giờ chơi, nhiệm vụ và hộp quà đều tính theo ngày (SPEC mục 5).
import { signal } from '@preact/signals';
import { dateKey } from './profile';

export const today = signal(dateKey(new Date()));

/** Cập nhật `today` nếu đã sang ngày mới. */
export function refreshToday(now: Date = new Date()): void {
  const key = dateKey(now);
  if (key !== today.value) today.value = key;
}

/** Số ms từ `now` tới 00:00 ngày kế tiếp (giờ máy, đúng cả khi đổi giờ mùa hè). */
export function msUntilMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/**
 * Theo dõi sang ngày mới: hẹn giờ tới 00:00 và kiểm tra lại mỗi khi app hiện lại / lấy lại tiêu điểm
 * (máy ngủ thì bộ hẹn giờ không chạy đúng giờ). Trả về hàm gỡ theo dõi.
 */
export function watchToday(): () => void {
  let timer = 0;
  const arm = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(wake, msUntilMidnight(new Date()) + 500);
  };
  function wake() {
    refreshToday();
    arm();
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible') wake();
  };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', wake);
  window.addEventListener('pageshow', wake);
  arm();
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', wake);
    window.removeEventListener('pageshow', wake);
  };
}
