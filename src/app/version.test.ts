import { describe, expect, it } from 'vitest';
import { defaultState } from './storage';
import { withInstalledVersion } from './version';

describe('withInstalledVersion', () => {
  it('lên bản mới → ghi phiên bản mới, giữ nguyên mọi trường khác', () => {
    const old = { ...defaultState(), installedVersion: '0.9.1', activeProfileId: 'p1' };
    const next = withInstalledVersion(old, '0.9.3');
    expect(next.installedVersion).toBe('0.9.3');
    expect(next).toEqual({ ...old, installedVersion: '0.9.3' });
    expect(next).not.toBe(old);
    expect(old.installedVersion).toBe('0.9.1'); // không sửa đối tượng cũ
  });

  it('cùng phiên bản → trả về chính đối tượng cũ (không tạo bản sao, không cần ghi lại)', () => {
    const s = { ...defaultState(), installedVersion: '0.9.3' };
    expect(withInstalledVersion(s, '0.9.3')).toBe(s);
  });

  it('dữ liệu cũ chưa có phiên bản (0.0.0 sau khi sửa dữ liệu) cũng được cập nhật', () => {
    const s = { ...defaultState(), installedVersion: '0.0.0' };
    expect(withInstalledVersion(s, '1.0.0').installedVersion).toBe('1.0.0');
  });
});
