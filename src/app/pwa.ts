// Đăng ký service worker + luồng cập nhật (SPEC mục 11, NF06/NF07).
// - Chỉ đăng ký ở bản build (dev không có SW). Mọi tài nguyên đã nằm trong precache → chạy offline.
// - SW mới chỉ bật cờ `updateAvailable`; KHÔNG tự tải lại trang (quy tắc 13). Nút “Cập nhật” chỉ có ở Home.
// - Kiểm tra bản mới chỉ gọi lại sw.js cùng nguồn (không request ra ngoài).
import { registerSW } from 'virtual:pwa-register';
import { E2E } from './e2e';
import { updateAvailable } from './store';

const CHECK_EVERY_MS = 60 * 60 * 1000; // kiểm tra mỗi giờ khi app mở
const MIN_GAP_MS = 10 * 60 * 1000; // và khi quay lại app, nhưng không quá 10 phút một lần

let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

export function initPwa(): void {
  if (E2E.fakeUpdate) updateAvailable.value = true;
  if (!import.meta.env.PROD || !E2E.serviceWorker) return;

  updateSW = registerSW({
    onNeedRefresh() {
      updateAvailable.value = true;
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      let last = Date.now();
      const check = () => {
        if (!navigator.onLine || Date.now() - last < MIN_GAP_MS) return;
        last = Date.now();
        registration.update().catch(() => undefined); // mất mạng giữa chừng: bỏ qua
      };
      window.setInterval(check, CHECK_EVERY_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });
}

/** Áp dụng bản mới: SW mới nhận quyền rồi trang tải lại. Chỉ gọi từ nút ở Home (không bao giờ giữa lượt chơi). */
export function applyUpdate(): void {
  void updateSW?.(true);
}
