// Nút/cử chỉ Quay lại của Android (NF10, SPEC 12b).
//
// Cách làm: sau lần chạm đầu tiên, trình duyệt có 2 mục lịch sử [base, top]; ta luôn đứng ở `top`.
// Khi người dùng bấm Quay lại, trình duyệt lùi về `base` và bắn `popstate` → ta tự xử lý rồi đẩy lại `top`.
// (Chỉ gài sau tương tác đầu tiên vì Chrome bỏ qua các mục lịch sử tạo khi chưa có thao tác của người dùng.)
import { goBack, topHash } from './router';

const EXIT_WINDOW_MS = 2000;

/** Trả về true nếu đã xử lý (vd: tạm dừng game đang chơi). */
type BackInterceptor = () => boolean;

let interceptor: BackInterceptor | null = null;
let armed = false;
let lastRootBackAt = -Infinity;

export function setBackInterceptor(fn: BackInterceptor | null): void {
  interceptor = fn;
}

export interface BackButtonOptions {
  /** Hiện toast “Bấm lần nữa để thoát”. */
  onExitHint: () => void;
  now?: () => number;
}

export function installBackButton(opts: BackButtonOptions): void {
  const now = opts.now ?? (() => Date.now());

  const pushTop = () => history.pushState({ ntm: 'top' }, '', topHash());

  const arm = () => {
    if (armed) return;
    armed = true;
    history.replaceState({ ntm: 'base' }, '', location.href);
    pushTop();
  };
  window.addEventListener('pointerup', arm, { capture: true });
  window.addEventListener('keydown', arm, { capture: true });

  window.addEventListener('popstate', (e: PopStateEvent) => {
    if (!armed) return;
    const state = e.state as { ntm?: string } | null;
    if (state?.ntm !== 'base') return; // bấm Tiến: bỏ qua
    if (interceptor?.()) return pushTop();
    if (goBack()) return pushTop();
    // Màn gốc (Home / Chọn người chơi)
    const t = now();
    if (t - lastRootBackAt <= EXIT_WINDOW_MS) {
      history.back(); // lần 2 trong 2 giây: cho thoát
      return;
    }
    lastRootBackAt = t;
    opts.onExitHint();
    pushTop();
  });
}
