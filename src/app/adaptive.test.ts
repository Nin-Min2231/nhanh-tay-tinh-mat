import { describe, expect, it } from 'vitest';
import {
  KID_CHOICES,
  applyRound,
  dropWarning,
  levelForRound,
  trackLevel,
  type KidChoice,
} from './adaptive';
import { createGameProgress } from './profile';
import type { GameProgress, ModeTrack } from './types';

const g = (patch: Partial<GameProgress> = {}): GameProgress => ({
  ...createGameProgress(),
  ...patch,
});

/** Game có sổ cấp của MỘT chế độ đặt sẵn. */
function withTrack(
  choice: KidChoice,
  track: Partial<ModeTrack>,
  base: Partial<GameProgress> = {},
): GameProgress {
  const b = g(base);
  return { ...b, tracks: { ...b.tracks, [choice]: { ...b.tracks[choice], ...track } } };
}

/** Chơi lần lượt các lượt (mỗi phần tử = số sao) ở một chế độ. */
function play(
  start: GameProgress,
  choice: KidChoice,
  stars: number[],
  counts = true,
): GameProgress {
  return stars.reduce((p, s) => applyRound(p, choice, s, counts).progress, start);
}

describe('levelForRound – mỗi chế độ một cấp riêng', () => {
  it('Tự động / Vừa dùng cấp của sổ riêng, không chênh', () => {
    const game = withTrack('normal', { level: 4 }, { tracks: createGameProgress().tracks });
    const both = withTrack('auto', { level: 5 }, game);
    expect(levelForRound(both, 'auto')).toBe(5);
    expect(levelForRound(both, 'normal')).toBe(4);
  });

  it('Dễ −2, Khó +2 so với cấp của sổ đó, kẹp trong 1–10', () => {
    expect(levelForRound(withTrack('easy', { level: 5 }), 'easy')).toBe(3);
    expect(levelForRound(withTrack('hard', { level: 5 }), 'hard')).toBe(7);
    expect(levelForRound(withTrack('easy', { level: 1 }), 'easy')).toBe(1);
    expect(levelForRound(withTrack('easy', { level: 2 }), 'easy')).toBe(1);
    expect(levelForRound(withTrack('hard', { level: 10 }), 'hard')).toBe(10);
    expect(levelForRound(withTrack('hard', { level: 9 }), 'hard')).toBe(10);
  });

  it('cấp của một chế độ không phụ thuộc cấp của chế độ khác', () => {
    const game = withTrack('easy', { level: 7 });
    expect(levelForRound(game, 'auto')).toBe(1);
    expect(levelForRound(game, 'hard')).toBe(3); // sổ Khó cấp 1 + 2
    expect(trackLevel(game, 'easy')).toBe(7);
    expect(trackLevel(game, 'auto')).toBe(1);
  });

  it('chế độ Cố định: bỏ qua lựa chọn của bé và mọi sổ cấp', () => {
    const fixed = withTrack('easy', { level: 8 }, { mode: 'fixed', level: 5 });
    for (const c of KID_CHOICES) expect(levelForRound(fixed, c)).toBe(5);
  });

  it('cấp của sổ nằm trong min–max của phụ huynh', () => {
    expect(trackLevel(withTrack('auto', { level: 2 }, { minLevel: 3, maxLevel: 6 }), 'auto')).toBe(
      3,
    );
    expect(trackLevel(withTrack('auto', { level: 9 }, { minLevel: 3, maxLevel: 6 }), 'auto')).toBe(
      6,
    );
    expect(
      levelForRound(withTrack('auto', { level: 9 }, { minLevel: 3, maxLevel: 6 }), 'auto'),
    ).toBe(6);
  });
});

describe('applyRound – lên cấp (TC-009)', () => {
  it('2 lượt 3 sao liên tiếp → lên 1 cấp, xóa sao và lịch sử của sổ đó', () => {
    const r = applyRound(withTrack('auto', { level: 3, stars: 3, recent: [3] }), 'auto', 3, true);
    expect(r.change).toBe('up');
    expect(r.newLevel).toBe(4);
    expect(r.progress.tracks.auto).toEqual({ level: 4, stars: 0, recent: [] });
  });

  it('1 lượt 3 sao chưa đủ để lên cấp', () => {
    const r = applyRound(withTrack('auto', { level: 3 }), 'auto', 3, true);
    expect(r.change).toBe('none');
    expect(r.progress.tracks.auto).toEqual({ level: 3, stars: 3, recent: [3] });
  });

  it('xen một lượt dưới 3 sao thì phải làm lại chuỗi', () => {
    expect(trackLevel(play(g(), 'auto', [3, 2, 3]), 'auto')).toBe(1);
    expect(trackLevel(play(g(), 'auto', [3, 2, 3, 3]), 'auto')).toBe(2);
  });

  it('sao của cấp hiện tại = sao cao nhất ở cấp đó, về 0 khi đổi cấp', () => {
    let p = play(g(), 'auto', [2]);
    expect(p.tracks.auto.stars).toBe(2);
    p = play(p, 'auto', [1]);
    expect(p.tracks.auto.stars).toBe(2);
    p = play(p, 'auto', [3]);
    expect(p.tracks.auto.stars).toBe(3);
    p = play(p, 'auto', [3]); // 2 lượt 3 sao liên tiếp → lên cấp 2
    expect(p.tracks.auto).toEqual({ level: 2, stars: 0, recent: [] });
  });

  it('lên cấp ở một chế độ không đổi các chế độ khác (Dễ cấp 3, Tự động vẫn cấp 1)', () => {
    const p = play(g(), 'easy', [3, 3, 3, 3]);
    expect(p.tracks.easy.level).toBe(3);
    expect(p.tracks.auto.level).toBe(1);
    expect(p.tracks.normal.level).toBe(1);
    expect(p.tracks.hard.level).toBe(1);
    expect(p.tracks.auto).toEqual({ level: 1, stars: 0, recent: [] });
  });

  it('mọi chế độ đều tính vào sổ riêng của mình', () => {
    for (const c of KID_CHOICES) {
      const p = play(g(), c, [3, 3]);
      expect(p.tracks[c].level, c).toBe(2);
      for (const other of KID_CHOICES.filter((x) => x !== c)) {
        expect(p.tracks[other].level, `${c} → ${other}`).toBe(1);
      }
    }
  });

  it('không vượt maxLevel', () => {
    const r = applyRound(
      withTrack('auto', { level: 6, recent: [3] }, { maxLevel: 6 }),
      'auto',
      3,
      true,
    );
    expect(r.change).toBe('none');
    expect(r.progress.tracks.auto.level).toBe(6);
    expect(trackLevel(play(withTrack('auto', { level: 10 }), 'auto', [3, 3, 3]), 'auto')).toBe(10);
  });

  it('ghi nhớ chế độ chơi gần nhất', () => {
    expect(play(g(), 'hard', [2]).lastChoice).toBe('hard');
    expect(play(play(g(), 'hard', [2]), 'easy', [2]).lastChoice).toBe('easy');
  });
});

describe('applyRound – xuống cấp (TC-017)', () => {
  it('3 lượt liên tiếp chỉ 1 sao → xuống 1 cấp, xóa sao và lịch sử của sổ đó', () => {
    const r = applyRound(withTrack('auto', { level: 5, recent: [1, 1] }), 'auto', 1, true);
    expect(r.change).toBe('down');
    expect(r.newLevel).toBe(4);
    expect(r.progress.tracks.auto).toEqual({ level: 4, stars: 0, recent: [] });
  });

  it('chưa đủ 3 lượt, hoặc bị cắt chuỗi bởi lượt từ 2 sao, thì không xuống', () => {
    expect(trackLevel(play(withTrack('auto', { level: 5 }), 'auto', [1, 1]), 'auto')).toBe(5);
    expect(trackLevel(play(withTrack('auto', { level: 5 }), 'auto', [1, 1, 2, 1]), 'auto')).toBe(5);
    expect(trackLevel(play(withTrack('auto', { level: 5 }), 'auto', [1, 3, 1, 1]), 'auto')).toBe(5);
  });

  it('sau khi xuống cấp phải thêm 3 lượt 1 sao nữa mới xuống tiếp', () => {
    const p = play(withTrack('auto', { level: 5 }), 'auto', [1, 1, 1, 1, 1]);
    expect(trackLevel(p, 'auto')).toBe(4);
    expect(trackLevel(play(p, 'auto', [1]), 'auto')).toBe(3);
  });

  it('không xuống dưới minLevel', () => {
    expect(trackLevel(play(g(), 'auto', [1, 1, 1]), 'auto')).toBe(1);
    expect(
      trackLevel(play(withTrack('auto', { level: 4 }, { minLevel: 4 }), 'auto', [1, 1, 1]), 'auto'),
    ).toBe(4);
  });

  it('xuống cấp ở một chế độ không đổi các chế độ khác', () => {
    const start = withTrack('hard', { level: 6 }, { tracks: createGameProgress().tracks });
    const p = play(withTrack('auto', { level: 3 }, start), 'hard', [1, 1, 1]);
    expect(p.tracks.hard.level).toBe(5);
    expect(p.tracks.auto.level).toBe(3);
  });
});

describe('dropWarning – nhắc nhẹ nhàng ở lượt thứ 3', () => {
  it('đã có 2 lượt liên tiếp chỉ 1 sao → nhắc, và chỉ ở chế độ đó', () => {
    const p = play(withTrack('auto', { level: 5 }), 'auto', [1, 1]);
    expect(dropWarning(p, 'auto')).toBe(true);
    expect(dropWarning(p, 'easy')).toBe(false);
    expect(dropWarning(p, 'hard')).toBe(false);
  });

  it('chưa nhắc khi mới 0–1 lượt 1 sao hoặc chuỗi bị cắt', () => {
    expect(dropWarning(withTrack('auto', { level: 5 }), 'auto')).toBe(false);
    expect(dropWarning(play(withTrack('auto', { level: 5 }), 'auto', [1]), 'auto')).toBe(false);
    expect(dropWarning(play(withTrack('auto', { level: 5 }), 'auto', [1, 1, 2]), 'auto')).toBe(
      false,
    );
  });

  it('hết nhắc sau lượt thứ 3 (đã xuống cấp) và không nhắc khi không còn cấp để xuống', () => {
    const down = play(withTrack('auto', { level: 5 }), 'auto', [1, 1, 1]);
    expect(dropWarning(down, 'auto')).toBe(false);
    expect(dropWarning(play(g(), 'auto', [1, 1]), 'auto')).toBe(false); // đang cấp 1 = thấp nhất
  });

  it('chế độ Cố định không nhắc', () => {
    const p = play(withTrack('auto', { level: 5 }), 'auto', [1, 1]);
    expect(dropWarning({ ...p, mode: 'fixed' }, 'auto')).toBe(false);
  });
});

describe('applyRound – các lượt không tính', () => {
  it('chế độ Cố định: không đổi cấp, không lưu sao (TC-015)', () => {
    const fixed = g({ mode: 'fixed', level: 5 });
    const p = play(fixed, 'auto', [3, 3, 3, 3]);
    expect(p).toEqual(fixed);
    expect(levelForRound(play(fixed, 'easy', [1, 1, 1, 1]), 'easy')).toBe(5);
  });

  it('bài đo (counts = false) không ảnh hưởng sổ nào (TC-016)', () => {
    const before = withTrack('auto', { level: 5, stars: 2, recent: [3, 1] });
    const r = applyRound(before, 'auto', 3, false);
    expect(r.progress).toBe(before);
    expect(r.change).toBe('none');
  });

  it('không làm thay đổi đối tượng gốc', () => {
    const before = withTrack('auto', { level: 3, stars: 3, recent: [3] });
    const snapshot = JSON.stringify(before);
    applyRound(before, 'auto', 3, true);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
