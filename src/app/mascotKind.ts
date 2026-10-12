// Linh vật đang dùng của người chơi hiện tại. Tách thành một signal riêng (store.ts cập nhật khi đổi hồ sơ hoặc khi bé
// chọn ở Album) để component `Mascot` – cả trong game G6/G7 – không phải import store (tránh vòng import store ↔ games).
import { signal } from '@preact/signals';

export type MascotKind = 'squirrel' | 'owl';

export const mascotKind = signal<MascotKind>('squirrel');
