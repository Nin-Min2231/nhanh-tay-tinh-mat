// Tùy chọn riêng của từng game mà phụ huynh chỉnh được (F11). Giá trị phải khớp readGxOptions trong games/*/config.ts.
import type { GameId } from '../../games/levels';
import { vi } from '../../i18n/vi';

export interface SelectDef {
  key: string;
  label: string;
  /** [giá trị lưu, nhãn hiển thị]; giá trị 'auto' = theo bảng cấp độ (xóa khóa). */
  choices: readonly (readonly [string, string])[];
  /** Giá trị mặc định khi chưa đặt (mặc định 'auto'); chọn lại đúng giá trị này thì xóa khóa. */
  fallback?: string;
}

const S = vi.parent.settings;
const C = S.choice;
const auto = ['auto', S.auto] as const;
const speeds = [
  ['slow', C.slow],
  ['medium', C.medium],
  ['fast', C.fast],
] as const;

export const SELECT_OPTIONS: Record<GameId, SelectDef[]> = {
  G1: [
    {
      key: 'colors',
      label: S.option.G1.colors,
      choices: [auto, ['2', '2'], ['3', '3'], ['4', '4']],
    },
    {
      key: 'simultaneous',
      label: S.option.G1.simultaneous,
      choices: [auto, ['1', '1'], ['2', '2']],
    },
  ],
  G2: [
    {
      key: 'grid',
      label: S.option.G2.grid,
      choices: [auto, ['3', '3×3'], ['4', '4×4'], ['5', '5×5']],
    },
    {
      key: 'order',
      label: S.option.G2.order,
      choices: [auto, ['forward', C.forward], ['backward', C.backward]],
    },
    {
      key: 'hint',
      label: S.option.G2.hint,
      choices: [auto, ['on', C.on], ['off', C.off]],
    },
  ],
  G3: [
    { key: 'speed', label: S.option.G3.speed, choices: [auto, ...speeds] },
    { key: 'decoys', label: S.option.G3.decoys, choices: [auto, ['off', C.off], ['on', C.on]] },
  ],
  G4: [
    { key: 'pads', label: S.option.G4.pads, choices: [auto, ['4', '4'], ['6', '6'], ['9', '9']] },
    { key: 'speed', label: S.option.G4.speed, choices: [auto, ...speeds] },
    {
      key: 'startLen',
      label: S.option.G4.startLen,
      choices: [auto, ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']],
    },
  ],
  G5: [
    { key: 'fall', label: S.option.G5.fall, choices: [auto, ...speeds] },
    { key: 'doubles', label: S.option.G5.doubles, choices: [auto, ['off', C.off]] },
  ],
  G6: [
    {
      key: 'timer',
      label: S.option.G6.timer,
      choices: [
        ['auto', C.timerNormal],
        ['off', C.timerOff],
      ],
    },
  ],
  G7: [
    {
      key: 'timer',
      label: S.option.G7.timer,
      choices: [
        ['off', C.timerOff],
        ['sec30', C.timer30],
      ],
      fallback: 'off',
    },
  ],
};

/** Nhóm dạng câu của G7 (khớp ALL_GROUPS trong games/g7-patterns/config.ts). */
export const G7_GROUPS = [
  ['shapes', C.groupShapes],
  ['numbers', C.groupNumbers],
  ['matrix', C.groupMatrix],
] as const;
