/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true' khi build dành riêng cho e2e (xem src/app/e2e.ts). */
  readonly VITE_E2E?: string;
}
