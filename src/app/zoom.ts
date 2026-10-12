// Phát hiện trang đang bị phóng to bằng 2 ngón (visual viewport scale > 1).
// Viewport cho phép phóng to (accessibility); riêng màn chơi chặn phóng bằng `touch-action: none` (app.css, `.play`).
// Nếu trang đã bị phóng ở màn khác rồi mới vào game, game không thu nhỏ lại được → Play tạm dừng và nhắc thu nhỏ.

/** Ngưỡng coi là đang phóng (bỏ qua sai số làm tròn quanh 1). */
export const ZOOM_EPS = 1.02;

export interface ScaleSource {
  scale: number;
}

export function isZoomed(vv: ScaleSource | null | undefined): boolean {
  return !!vv && vv.scale > ZOOM_EPS;
}

export function pageZoomed(): boolean {
  return isZoomed(window.visualViewport);
}
