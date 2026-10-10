// Canvas 2D co giãn theo devicePixelRatio. Kích thước lấy từ ResizeObserver (không đọc layout mỗi frame).
export interface CanvasStage {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  /** Kích thước CSS px hiện tại. */
  readonly width: number;
  readonly height: number;
  destroy(): void;
}

export function createCanvasStage(
  host: HTMLElement,
  onResize?: (width: number, height: number) => void,
): CanvasStage {
  const canvas = document.createElement('canvas');
  canvas.className = 'game-canvas';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D không khả dụng');

  const stage = { canvas, ctx, width: 0, height: 0, destroy };

  function resize(w: number, h: number): void {
    const dpr = window.devicePixelRatio || 1;
    stage.width = w;
    stage.height = h;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize?.(w, h);
  }

  const ro = new ResizeObserver((entries) => {
    const r = entries[0]?.contentRect;
    if (r) resize(r.width, r.height);
  });
  ro.observe(host);
  const rect = host.getBoundingClientRect();
  resize(rect.width, rect.height);

  function destroy(): void {
    ro.disconnect();
    canvas.remove();
  }

  return stage;
}
