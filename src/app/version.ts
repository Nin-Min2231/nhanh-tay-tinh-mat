declare const __APP_VERSION__: string;

/** Phiên bản app, lấy từ package.json qua vite `define`. */
export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
