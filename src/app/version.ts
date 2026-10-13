import type { AppState } from './types';

declare const __APP_VERSION__: string;

/** Phiên bản app, lấy từ package.json qua vite `define`. */
export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

/**
 * Ghi nhận phiên bản app đang chạy với dữ liệu này (`AppState.installedVersion`). Mở app sau khi lên bản mới thì
 * trường này đổi theo (trước đây chỉ được ghi lúc tạo dữ liệu). Thuần: trả về chính `state` nếu không có gì đổi.
 */
export function withInstalledVersion(state: AppState, version: string = APP_VERSION): AppState {
  return state.installedVersion === version ? state : { ...state, installedVersion: version };
}
