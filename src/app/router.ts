// Điều hướng: ngăn xếp màn hình do app tự quản + đồng bộ hash lên URL.
// Lịch sử trình duyệt do backButton.ts điều khiển (xem NF10).
import { signal } from '@preact/signals';
import { parseRoute, type Route } from './routes';

export const route = signal<Route>(
  parseRoute(typeof location !== 'undefined' ? location.hash : ''),
);

const stack: string[] = [];

function currentPath(): string {
  return typeof location !== 'undefined' ? location.hash.replace(/^#/, '') || '/home' : '/home';
}

function apply(path: string): void {
  route.value = parseRoute(`#${path}`);
  try {
    history.replaceState(history.state, '', `#${path}`);
  } catch {
    /* môi trường không có History API */
  }
}

export function initRouter(): void {
  stack.length = 0;
  stack.push(currentPath());
  route.value = parseRoute(`#${stack[0]}`);
  window.addEventListener('hashchange', () => {
    // Bỏ qua hashchange do nút Quay lại (mục lịch sử do backButton.ts gài có state.ntm)
    const state = history.state as { ntm?: string } | null;
    if (state?.ntm) return;
    // Người dùng tự sửa URL
    stack.length = 0;
    stack.push(currentPath());
    route.value = parseRoute(`#${stack[0]}`);
  });
}

/** Hash của màn hình hiện tại, dạng '#/home'. */
export function topHash(): string {
  return `#${stack[stack.length - 1] ?? '/home'}`;
}

/** Đi tới màn hình mới (đẩy vào ngăn xếp). */
export function navigate(path: string): void {
  stack.push(path);
  apply(path);
}

/** Thay màn hình hiện tại. */
export function replace(path: string): void {
  if (stack.length === 0) stack.push(path);
  else stack[stack.length - 1] = path;
  apply(path);
}

/** Về màn hình trước. Trả về false nếu đang ở màn gốc. */
export function goBack(): boolean {
  if (stack.length <= 1) return false;
  stack.pop();
  apply(stack[stack.length - 1] as string);
  return true;
}

/** Đặt lại cả ngăn xếp (vd: sau khi chơi xong → [home, result]). */
export function setStack(paths: string[]): void {
  stack.length = 0;
  stack.push(...paths);
  apply(paths[paths.length - 1] ?? '/home');
}

export function goHome(): void {
  stack.length = 0;
  stack.push('/home');
  apply('/home');
}

export function stackDepth(): number {
  return stack.length;
}
