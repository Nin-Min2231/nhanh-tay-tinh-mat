// Nhận chạm bằng Pointer Events (CLAUDE.md mục 5, quy tắc 5, 6, 9a).
// pointerType 'pen' (S Pen) được xử lý như ngón tay – không lọc theo pointerType.

export type PointerMode = 'first' | 'multi';

/** Cổng lọc chạm (thuần, có test): chế độ 'first' chỉ nhận chạm đầu tiên khi đang có pointer giữ. */
export class PointerGate {
  private readonly active = new Set<number>();

  constructor(private readonly mode: PointerMode) {}

  /** Trả về true nếu lần chạm này được nhận. */
  down(pointerId: number, isPrimary: boolean): boolean {
    if (this.mode === 'multi') {
      this.active.add(pointerId);
      return true;
    }
    // Pointer chính mới nghĩa là các pointer cũ đã kết thúc (phòng khi mất sự kiện pointerup).
    if (this.active.size > 0 && !isPrimary) return false;
    this.active.clear();
    this.active.add(pointerId);
    return true;
  }

  up(pointerId: number): void {
    this.active.delete(pointerId);
  }

  reset(): void {
    this.active.clear();
  }
}

export interface TapEvent {
  /** Toạ độ CSS px so với góc trên-trái của phần tử. */
  x: number;
  y: number;
  pointerId: number;
  pointerType: string;
  /** event.timeStamp – cùng hệ với performance.now(), dùng đo thời gian phản ứng. */
  timeStamp: number;
}

export function attachPointerInput(
  el: HTMLElement,
  mode: PointerMode,
  onTap: (tap: TapEvent) => void,
): () => void {
  const gate = new PointerGate(mode);

  const onDown = (e: PointerEvent) => {
    if (!gate.down(e.pointerId, e.isPrimary)) return;
    const rect = el.getBoundingClientRect();
    onTap({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      timeStamp: e.timeStamp,
    });
  };
  const onUp = (e: PointerEvent) => gate.up(e.pointerId);

  el.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  return () => {
    el.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    gate.reset();
  };
}
