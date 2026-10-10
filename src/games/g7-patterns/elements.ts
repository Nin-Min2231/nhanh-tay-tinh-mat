// G7 – mô hình phần tử của quy luật: hình (shape, color, size, rotation, count) hoặc số.
import type { Rng } from '../../app/rng';
import { shuffle } from '../../app/rng';

/** 5 hình cơ bản + mũi tên (chỉ dùng cho dạng xoay 90°, cấp 4). */
export type Shape = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'arrow';
export const BASE_SHAPES: readonly Shape[] = ['circle', 'square', 'triangle', 'star', 'heart'];
export const COLOR_COUNT = 5;
export type Rotation = 0 | 90 | 180 | 270;
export const ROTATIONS: readonly Rotation[] = [0, 90, 180, 270];
/** 0 = nhỏ (S), 1 = vừa (M), 2 = to (L). */
export type SizeLevel = 0 | 1 | 2;
export const MAX_COUNT = 6;

export interface Glyph {
  kind: 'glyph';
  shape: Shape;
  /** 0–4, mỗi màu có hoa văn riêng. */
  color: number;
  size: SizeLevel;
  rot: Rotation;
  /** 1–6 hình nhỏ trong một ô. */
  count: number;
}

export interface NumItem {
  kind: 'num';
  n: number;
}

export type Item = Glyph | NumItem;

export type Attr = 'shape' | 'color' | 'size' | 'rot' | 'count';
export const ATTRS: readonly Attr[] = ['shape', 'color', 'size', 'rot', 'count'];

/** Giá trị có thể của từng thuộc tính (dạng số để so sánh/duyệt). */
export const ATTR_DOMAIN: Record<Attr, readonly (number | string)[]> = {
  shape: ['circle', 'square', 'triangle', 'star', 'heart', 'arrow'],
  color: [0, 1, 2, 3, 4],
  size: [0, 1, 2],
  rot: [0, 90, 180, 270],
  count: [1, 2, 3, 4, 5, 6],
};

export function glyph(shape: Shape, color: number, over: Partial<Omit<Glyph, 'kind'>> = {}): Glyph {
  return { kind: 'glyph', shape, color, size: 1, rot: 0, count: 1, ...over };
}

export const num = (n: number): NumItem => ({ kind: 'num', n });

export function itemEq(a: Item, b: Item): boolean {
  if (a.kind === 'num') return b.kind === 'num' && a.n === b.n;
  return (
    b.kind === 'glyph' &&
    a.shape === b.shape &&
    a.color === b.color &&
    a.size === b.size &&
    a.rot === b.rot &&
    a.count === b.count
  );
}

export function itemKey(i: Item): string {
  return i.kind === 'num' ? `n${i.n}` : `${i.shape}/${i.color}/${i.size}/${i.rot}/${i.count}`;
}

export function getAttr(g: Glyph, a: Attr): number | string {
  return g[a];
}

export function withAttr(g: Glyph, a: Attr, v: number | string): Glyph {
  return { ...g, [a]: v } as Glyph;
}

/** Các thuộc tính khác nhau giữa hai hình. */
export function diffAttrs(a: Glyph, b: Glyph): Attr[] {
  return ATTRS.filter((k) => a[k] !== b[k]);
}

export function pickDistinct<T>(rng: Rng, items: readonly T[], k: number): T[] {
  return shuffle(rng, items).slice(0, k);
}
