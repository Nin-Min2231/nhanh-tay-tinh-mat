// Bong bóng lời động viên nhẹ nhàng khi bé chạm sai (không chê). Tự ẩn sau một lúc.
export interface HintBubble {
  show(text: string, ms?: number): void;
  hide(): void;
  destroy(): void;
}

export function createHintBubble(host: HTMLElement): HintBubble {
  const el = document.createElement('div');
  el.className = 'hint-bubble';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.hidden = true;
  host.appendChild(el);
  let timer = 0;

  function hide(): void {
    window.clearTimeout(timer);
    el.hidden = true;
  }

  return {
    show(text, ms = 1300) {
      window.clearTimeout(timer);
      el.textContent = text;
      el.hidden = false;
      timer = window.setTimeout(hide, ms);
    },
    hide,
    destroy() {
      hide();
      el.remove();
    },
  };
}
