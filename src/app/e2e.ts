// Cờ kiểm thử/gỡ lỗi. Chỉ hoạt động khi chạy `npm run dev` hoặc bản build dành riêng cho e2e (VITE_E2E=true);
// bản deploy thật không bao giờ bật (docs/01_SPEC.md mục 13).
const hooksAllowed: boolean = import.meta.env.DEV || import.meta.env.VITE_E2E === 'true';
const params =
  typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

/** ?e2e=1 → rút ngắn độ dài lượt ×10, seed cố định, game ghi trạng thái ra thuộc tính data-*. */
export const E2E = {
  /** Cho phép game ghi data-* (dev hoặc build e2e). */
  hooks: hooksAllowed,
  enabled: hooksAllowed && params.get('e2e') === '1',
  seed: Number(params.get('seed') ?? 12345) || 12345,
  timeScale: 10,
} as const;

/** ?debug=1 → bảng chỉnh độ khó/tùy chọn ở màn Giới thiệu và đồng hồ FPS. */
export const DEBUG: boolean = hooksAllowed && params.has('debug');

/** Hệ số rút ngắn thời gian của lượt (1 khi chơi thật). */
export const TIME_SCALE: number = E2E.enabled ? E2E.timeScale : 1;
