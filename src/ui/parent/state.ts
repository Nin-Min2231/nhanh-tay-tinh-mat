// Trạng thái dùng chung của khu phụ huynh: hồ sơ đang xem + hàm định dạng hiển thị.
import { computed, signal } from '@preact/signals';
import type { MetricDef } from '../../app/daily';
import { appState } from '../../app/store';
import type { Profile } from '../../app/types';
import { vi } from '../../i18n/vi';

/** Hồ sơ phụ huynh đang xem (null = theo người đang chơi). */
export const parentProfileId = signal<string | null>(null);

export const selectedParentProfile = computed<Profile | null>(() => {
  const s = appState.value;
  return (
    s.profiles.find((p) => p.id === parentProfileId.value) ??
    s.profiles.find((p) => p.id === s.activeProfileId) ??
    s.profiles[0] ??
    null
  );
});

const nf = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

export const fmtNumber = (n: number, digits: 0 | 1 = 1): string =>
  (digits === 0 ? nf0 : nf).format(n);

/** Giá trị chỉ số kèm đơn vị: 0,8 → “80%”, 612 → “612 ms”… */
export function formatMetric(def: MetricDef, v: number | null): string {
  if (v === null || !Number.isFinite(v)) return vi.parent.benchmark.noValue;
  switch (def.unit) {
    case 'fraction':
      return `${fmtNumber(v * 100, 0)}%`;
    case 'percent':
      return `${fmtNumber(v)}%`;
    case 'ms':
      return `${fmtNumber(v, 0)} ${vi.parent.units.ms}`;
    case 'sec':
      return `${fmtNumber(v)} ${vi.parent.units.sec}`;
    case 'perMin':
      return `${fmtNumber(v)}${vi.parent.units.perMin}`;
    default:
      return fmtNumber(v);
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** dd/mm/yyyy theo giờ máy. */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** dd/mm hh:mm theo giờ máy. */
export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** 'YYYY-MM-DD' → 'dd/mm/yyyy'. */
export function fmtDayKey(key: string): string {
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}

/** 'YYYY-MM-DD' → 'dd/mm' (nhãn trục biểu đồ). */
export function fmtDayShort(key: string): string {
  const [, m, d] = key.split('-');
  return `${d}/${m}`;
}
