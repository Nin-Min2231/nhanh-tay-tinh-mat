/** Ba ô sao: n sao đặc, phần còn lại rỗng (n = 2 → “★★☆”). Chỉ để nhìn; nhãn truy cập đọc bằng số sao. */
export function starMeter(n: number): string {
  const full = Math.min(3, Math.max(0, Math.round(n)));
  return '★'.repeat(full) + '☆'.repeat(3 - full);
}
