import { describe, expect, it } from 'vitest';
import {
  PENTATONIC_HZ,
  SOUND_SETS,
  noteHz,
  soundLength,
  soundSet,
  type SoundSet,
  type SoundSetId,
  type ToneSpec,
} from './audioSets';

const IDS = Object.keys(SOUND_SETS) as SoundSetId[];

/** Mọi chuỗi âm của một bộ (kể cả cả 10 nốt ngũ cung), kèm tên để báo lỗi dễ đọc. */
function allSounds(set: SoundSet): [string, readonly ToneSpec[]][] {
  const out: [string, readonly ToneSpec[]][] = [
    ['ding', set.ding],
    ['bup', set.bup],
    ['star', set.star],
    ['levelUp', set.levelUp],
  ];
  for (let i = 0; i < PENTATONIC_HZ.length; i++) out.push([`note(${i})`, set.note(i)]);
  return out;
}

describe('bộ âm gốc – giữ nguyên như trước khi có bộ âm khác', () => {
  const d = SOUND_SETS.default;
  it('ding / bụp / nốt giống hệt các giá trị cũ', () => {
    expect(d.ding).toEqual([
      { freq: 880, delay: 0, dur: 0.16 },
      { freq: 1320, delay: 0.05, dur: 0.22, type: 'sine', peak: 0.12 },
    ]);
    expect(d.bup).toEqual([
      { freq: 190, delay: 0, dur: 0.16, type: 'triangle', peak: 0.1, endFreq: 140 },
    ]);
    expect(d.note(0)).toEqual([{ freq: 261.63, delay: 0, dur: 0.35, type: 'sine', peak: 0.15 }]);
    expect(d.note(9)[0]?.freq).toBe(880);
  });
  it('sao = arpeggio C5 E5 G5 C6 cách 0,09 s; lên cấp = 6 nốt cách 0,11 s (triangle)', () => {
    expect(d.star.map((s) => s.freq)).toEqual([523.25, 659.25, 783.99, 1046.5]);
    expect(d.star.map((s) => s.delay)).toEqual([0, 0.09, 0.18, 0.27].map((x) => +x.toFixed(2)));
    expect(d.levelUp).toHaveLength(6);
    expect(d.levelUp.every((s) => s.type === 'triangle')).toBe(true);
    expect(d.levelUp.at(-1)?.freq).toBe(1046.5);
  });
});

describe.each(IDS)('bộ âm “%s” – an toàn cho bé', (id) => {
  const set = soundSet(id);

  it('đủ mọi âm, mỗi âm có ít nhất một nốt hợp lệ', () => {
    for (const [name, specs] of allSounds(set)) {
      expect(specs.length, name).toBeGreaterThan(0);
      for (const s of specs) {
        expect(s.freq, `${name} freq`).toBeGreaterThanOrEqual(80);
        expect(s.freq, `${name} freq`).toBeLessThanOrEqual(4000); // không chói
        expect(s.delay, `${name} delay`).toBeGreaterThanOrEqual(0);
        expect(s.dur, `${name} dur`).toBeGreaterThan(0.04);
        expect(s.peak ?? 0.16, `${name} peak`).toBeLessThanOrEqual(0.2); // không to đột ngột
        if (s.endFreq) {
          expect(s.endFreq, `${name} endFreq`).toBeGreaterThanOrEqual(80);
        }
        if (s.attack !== undefined) expect(s.attack, `${name} attack`).toBeLessThan(s.dur);
      }
    }
  });

  it('chỉ dùng sóng êm (sine/triangle) – không buzz chê bai', () => {
    for (const [name, specs] of allSounds(set)) {
      for (const s of specs) expect(['sine', 'triangle'], name).toContain(s.type ?? 'sine');
    }
  });

  it('âm sai (bụp) ngắn, nhỏ và trầm; mọi âm không kéo dài quá 1,2 giây', () => {
    expect(soundLength(set.bup)).toBeLessThanOrEqual(0.3);
    for (const s of set.bup) {
      expect(s.peak ?? 0.16).toBeLessThanOrEqual(0.12);
      expect(s.freq).toBeLessThanOrEqual(400);
    }
    for (const [name, specs] of allSounds(set)) {
      expect(soundLength(specs), name).toBeLessThanOrEqual(1.2);
    }
  });

  it('nốt ngũ cung: nốt chính đúng tần số thang C D E G A và index ngoài khoảng được kẹp lại', () => {
    for (let i = 0; i < PENTATONIC_HZ.length; i++) {
      const main = set.note(i)[0];
      expect(main?.freq).toBe(PENTATONIC_HZ[i]);
    }
    expect(set.note(-3)[0]?.freq).toBe(PENTATONIC_HZ[0]);
    expect(set.note(99)[0]?.freq).toBe(PENTATONIC_HZ.at(-1));
    expect(noteHz(Number.NaN)).toBe(PENTATONIC_HZ[0]);
  });

  it('nhận sao đi lên (cảm giác tích cực), lên cấp kết thúc ở nốt cao', () => {
    const starMain = [...set.star]
      .sort((a, b) => a.delay - b.delay)
      .filter((s) => s.type !== 'triangle');
    const first = starMain[0]?.freq ?? 0;
    const maxStar = Math.max(...set.star.map((s) => s.freq));
    expect(maxStar).toBeGreaterThan(first);
    expect(Math.max(...set.levelUp.map((s) => s.freq))).toBeGreaterThanOrEqual(1046.5);
  });
});

describe('bộ Nhạc Cụ Gõ khác bộ âm gốc', () => {
  const d = SOUND_SETS.default;
  const p = SOUND_SETS.percussion;

  it('mọi âm đều khác (không phải cùng dãy nốt)', () => {
    expect(p.ding).not.toEqual(d.ding);
    expect(p.bup).not.toEqual(d.bup);
    expect(p.star).not.toEqual(d.star);
    expect(p.levelUp).not.toEqual(d.levelUp);
    expect(p.note(3)).not.toEqual(d.note(3));
  });

  it('đặc trưng đàn gõ: lên đỉnh gần như tức thì (≤ 5 ms) ở mọi nốt chính', () => {
    for (const [name, specs] of allSounds(p)) {
      const hits = specs.filter((s) => s.type !== 'triangle');
      for (const s of hits) expect(s.attack ?? 0.012, name).toBeLessThanOrEqual(0.005);
    }
  });

  it('mỗi nốt đàn gõ có họa âm ngắn hơn nốt chính (tiếng “cộc” gỗ), nốt cao thì bỏ họa âm cho đỡ chói', () => {
    const low = p.note(0); // C4
    expect(low).toHaveLength(2);
    expect(low[1]?.freq).toBeCloseTo((low[0]?.freq ?? 0) * 4, 5);
    expect(low[1]?.dur).toBeLessThan(low[0]?.dur ?? 0);
    // cả 10 nốt ngũ cung đều có họa âm (cao nhất A5 = 880 Hz → 3520 Hz, còn dưới ngưỡng chói 3600 Hz)…
    for (let i = 0; i < PENTATONIC_HZ.length; i++) expect(p.note(i), `note(${i})`).toHaveLength(2);
    // …còn nốt C6 trong tiếng “nhận sao” thì bỏ họa âm (×4 = 4186 Hz sẽ chói)
    expect(p.star.filter((s) => s.freq > 4000)).toHaveLength(0);
    expect(p.star.filter((s) => s.freq === 1046.5)).toHaveLength(1);
  });

  it('id lạ → về bộ âm gốc', () => {
    expect(soundSet('khong-co' as SoundSetId)).toBe(d);
  });
});
