import { describe, expect, it } from 'vitest';
import {
  BACKUP_FORMAT,
  backupFileName,
  backupOverdue,
  backupReminderDue,
  createBackup,
  parseBackup,
  stateForRestore,
} from './backup';
import { syncDaily } from './daily';
import { createProfile } from './profile';
import { CURRENT_SCHEMA, createStorage, defaultState, type KeyValueBackend } from './storage';
import type { AppState, RoundRecord } from './types';

function memoryBackend(): KeyValueBackend & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

function round(
  profileId: string,
  id: string,
  day: string,
  over: Partial<RoundRecord> = {},
): RoundRecord {
  return {
    id,
    profileId,
    gameId: 'G2',
    startedAt: `${day}T08:30:00`,
    level: 2,
    mode: 'auto',
    benchmark: false,
    options: { grid: 3 },
    durationMs: 31_000,
    score: 0.75,
    stars: 2,
    metrics: { timeSec: 28.5, errors: 1 },
    deviceId: 'dev-1',
    deviceClass: 'tablet',
    ...over,
  };
}

/** Một máy có 2 hồ sơ, vài lượt chơi, sticker, nhật ký thưởng… */
function populated() {
  const backend = memoryBackend();
  const st = createStorage(() => backend);
  const state: AppState = defaultState();
  const a = createProfile(
    { name: 'An', avatarId: 'cat', grade: 2 },
    'pa',
    new Date('2026-09-01T00:00:00'),
  );
  const b = createProfile(
    { name: 'Bình', avatarId: 'fox', grade: 1 },
    'pb',
    new Date('2026-09-02T00:00:00'),
  );
  a.totalStars = 77;
  a.stickers = { 'stk-01': 2, 'stk-30': 1 };
  a.unlocked = ['frame-rainbow', 'outfit-pilot'];
  a.rewardLog = [{ at: '2026-10-01T10:00:00.000Z', kind: 'time', amount: 10, reason: 'goodStudy' }];
  a.games.G2 = {
    ...a.games.G2,
    level: 4,
    mode: 'fixed',
    options: { grid: 4 },
    plays: 6,
    bestStars: 3,
  };
  a.math.facts = { '8+7': { seen: 3, correct: 2, streak: 1, lastSeenRound: 4, mastered: false } };
  state.profiles = [a, b];
  state.activeProfileId = 'pb';
  state.settings = { sound: false, music: true, vibration: false, allowKidDifficultyChoice: false };
  state.lastBackupAt = '2026-09-20T00:00:00.000Z';
  st.saveState(state);
  const ra = [
    round('pa', 'r1', '2026-09-10'),
    round('pa', 'r2', '2026-09-10', { score: 0.5 }),
    round('pa', 'r3', '2026-09-11', { benchmark: true }),
  ];
  const rb = [round('pb', 'r4', '2026-09-12', { gameId: 'G1', metrics: { rtMeanMs: 640 } })];
  st.saveRounds('pa', ra);
  st.saveRounds('pb', rb);
  st.saveDaily('pa', syncDaily([], ra));
  st.saveDaily('pb', syncDaily([], rb));
  return { backend, st, state };
}

describe('sao lưu → khôi phục khứ hồi (TC-025)', () => {
  it('xóa sạch dữ liệu trình duyệt rồi khôi phục: state + lượt chơi + tổng hợp ngày giống hệt', () => {
    const { st, state } = populated();
    const before = st.snapshot(state);
    const file = createBackup(before, new Date('2026-10-11T09:00:00'), '0.9.0');
    const text = JSON.stringify(file);

    // Máy “bị xóa dữ liệu trình duyệt”: bộ nhớ trống hoàn toàn
    const emptyBackend = memoryBackend();
    const fresh = createStorage(() => emptyBackend);
    const parsed = parseBackup(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const freshState = fresh.loadState(); // mặc định, deviceId riêng của máy này
    const restored = stateForRestore(parsed.backup, freshState, '0.9.0');
    fresh.restoreAll({ state: restored, rounds: parsed.backup.rounds, daily: parsed.backup.daily });

    const after = createStorage(() => emptyBackend); // “mở lại app”
    const s2 = after.loadState();
    const snap = after.snapshot(s2);
    // mọi thứ giống file gốc, trừ lastBackupAt (= lần sao lưu), deviceId (của máy này) và installedVersion
    expect(s2.profiles).toEqual(before.state.profiles);
    expect(s2.activeProfileId).toBe('pb');
    expect(s2.settings).toEqual(before.state.settings);
    expect(s2.deviceId).toBe(freshState.deviceId);
    expect(s2.installedVersion).toBe('0.9.0');
    expect(s2.lastBackupAt).toBe(file.exportedAt);
    expect(snap.rounds).toEqual(before.rounds);
    expect(snap.daily).toEqual(before.daily);
  });

  it('khôi phục lên chính máy cũ: ghi đè và xóa dữ liệu hồ sơ không có trong file', () => {
    const { backend, st, state } = populated();
    const file = createBackup(st.snapshot(state), new Date('2026-10-11T09:00:00'), '0.9.0');
    // sau khi sao lưu, bé tạo thêm hồ sơ “Cúc” và chơi thêm
    const c = createProfile({ name: 'Cúc', avatarId: 'owl', grade: 3 }, 'pc', new Date());
    st.saveState({ ...state, profiles: [...state.profiles, c] });
    st.saveRounds('pc', [round('pc', 'r9', '2026-10-01')]);
    st.saveDaily('pc', syncDaily([], [round('pc', 'r9', '2026-10-01')]));
    st.saveRounds('pa', []);

    const parsed = parseBackup(JSON.stringify(file));
    if (!parsed.ok) throw new Error('phải đọc được');
    st.restoreAll({
      state: stateForRestore(parsed.backup, st.loadState(), '0.9.0'),
      rounds: parsed.backup.rounds,
      daily: parsed.backup.daily,
    });
    const s = st.loadState();
    expect(s.profiles.map((p) => p.name)).toEqual(['An', 'Bình']);
    expect(st.loadRounds('pa')).toHaveLength(3);
    expect(backend.data.has('ntm.rounds.pc')).toBe(false);
    expect(backend.data.has('ntm.daily.pc')).toBe(false);
  });

  it('file sao lưu từ bản cũ (schema 1, chưa có rewardLog) vẫn khôi phục được nhờ migration', () => {
    const { st, state } = populated();
    const file = createBackup(st.snapshot(state), new Date('2026-10-11T09:00:00'), '0.8.0');
    const legacy = JSON.parse(JSON.stringify(file));
    legacy.state.schemaVersion = 1;
    for (const p of legacy.state.profiles) delete p.rewardLog;
    const parsed = parseBackup(JSON.stringify(legacy));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.backup.state.schemaVersion).toBe(CURRENT_SCHEMA);
    expect(parsed.backup.state.profiles.every((p) => Array.isArray(p.rewardLog))).toBe(true);
  });

  it('file sao lưu schema 2 (chưa có linh vật/bộ âm) → khôi phục với mặc định; schema 3 giữ lựa chọn khứ hồi', () => {
    const { st, state } = populated();
    const chosen: AppState = {
      ...state,
      profiles: state.profiles.map((p, i) =>
        i === 0
          ? {
              ...p,
              unlocked: ['sound-percussion', 'mascot-owl'],
              mascotId: 'mascot-owl',
              soundSetId: 'sound-percussion',
            }
          : p,
      ),
    };
    const file = createBackup(st.snapshot(chosen), new Date('2026-10-13T09:00:00'), '0.9.3');
    // khứ hồi: lựa chọn của bé được giữ
    const roundTrip = parseBackup(JSON.stringify(file));
    if (!roundTrip.ok) throw new Error('phải đọc được');
    expect(roundTrip.backup.state.profiles[0]).toMatchObject({
      mascotId: 'mascot-owl',
      soundSetId: 'sound-percussion',
    });
    // file cũ (schema 2): không có hai trường → về mặc định, không lỗi
    const legacy = JSON.parse(JSON.stringify(file));
    legacy.state.schemaVersion = 2;
    for (const p of legacy.state.profiles) {
      delete p.mascotId;
      delete p.soundSetId;
    }
    const parsed = parseBackup(JSON.stringify(legacy));
    if (!parsed.ok) throw new Error('phải đọc được');
    expect(parsed.backup.state.schemaVersion).toBe(CURRENT_SCHEMA);
    expect(
      parsed.backup.state.profiles.every((p) => p.mascotId === null && p.soundSetId === null),
    ).toBe(true);
  });
});

describe('xem trước (parseBackup)', () => {
  it('tóm tắt số hồ sơ, số lượt, khoảng ngày, phiên bản', () => {
    const { st, state } = populated();
    const file = createBackup(st.snapshot(state), new Date('2026-10-11T09:00:00'), '0.9.0');
    const r = parseBackup(JSON.stringify(file));
    if (!r.ok) throw new Error('phải đọc được');
    expect(r.preview.profiles).toEqual([
      { name: 'An', rounds: 3 },
      { name: 'Bình', rounds: 1 },
    ]);
    expect(r.preview.totalRounds).toBe(4);
    expect(r.preview.firstDate).toBe('2026-09-10');
    expect(r.preview.lastDate).toBe('2026-09-12');
    expect(r.preview.appVersion).toBe('0.9.0');
    expect(r.preview.exportedAt).toBe(file.exportedAt);
  });

  it('từ chối file không phải sao lưu / hỏng / từ phiên bản mới hơn', () => {
    expect(parseBackup('khong-phai-json')).toEqual({ ok: false, reason: 'notJson' });
    expect(parseBackup('{"a":1}')).toEqual({ ok: false, reason: 'notBackup' });
    expect(parseBackup('[]')).toEqual({ ok: false, reason: 'notBackup' });
    expect(
      parseBackup(JSON.stringify({ format: BACKUP_FORMAT, state: { schemaVersion: 1 } })),
    ).toEqual({
      ok: false,
      reason: 'invalid',
    });
    const { st, state } = populated();
    const file = createBackup(st.snapshot(state), new Date(), '9.9.9');
    const future = { ...file, state: { ...file.state, schemaVersion: 99 } };
    expect(parseBackup(JSON.stringify(future))).toEqual({ ok: false, reason: 'tooNew' });
    const badProfile = { ...file, state: { ...file.state, profiles: [{ id: 5 }] } };
    expect(parseBackup(JSON.stringify(badProfile))).toEqual({ ok: false, reason: 'invalid' });
  });

  it('thiếu danh sách lượt của một hồ sơ → coi là rỗng, không lỗi', () => {
    const { st, state } = populated();
    const file = createBackup(st.snapshot(state), new Date(), '0.9.0');
    const partial = { ...file, rounds: { pa: file.rounds.pa }, daily: {} };
    const r = parseBackup(JSON.stringify(partial));
    if (!r.ok) throw new Error('phải đọc được');
    expect(r.backup.rounds.pb).toEqual([]);
    expect(r.backup.daily.pa).toEqual([]);
  });
});

describe('tên file + nhắc sao lưu', () => {
  it('nhanhtay-backup-YYYYMMDD.json theo ngày địa phương', () => {
    expect(backupFileName(new Date(2026, 9, 5, 23, 59))).toBe('nhanhtay-backup-20261005.json');
    expect(backupFileName(new Date(2027, 0, 9, 0, 1))).toBe('nhanhtay-backup-20270109.json');
  });

  it('nhắc khi chưa từng sao lưu hoặc quá 14 ngày', () => {
    const now = Date.parse('2026-10-20T00:00:00.000Z');
    expect(backupOverdue(null, now)).toBe(true);
    expect(backupOverdue('2026-10-06T00:00:00.000Z', now)).toBe(false); // đúng 14 ngày
    expect(backupOverdue('2026-10-05T23:59:59.000Z', now)).toBe(true);
    expect(backupOverdue('hỏng', now)).toBe(true);
  });

  it('chấm nhắc ở Home: chỉ khi quá hạn VÀ đã có hồ sơ có sao', () => {
    const now = Date.parse('2026-10-20T00:00:00.000Z');
    const empty = createProfile({ name: 'An', avatarId: 'cat', grade: 2 }, 'pa', new Date(now));
    const played = { ...empty, id: 'pb', totalStars: 3 };
    const stale = '2026-10-05T23:59:59.000Z';
    const fresh = '2026-10-06T00:00:00.000Z';
    // chưa có sao → không có gì đáng mất
    expect(backupReminderDue({ profiles: [empty], lastBackupAt: null }, now)).toBe(false);
    expect(backupReminderDue({ profiles: [], lastBackupAt: null }, now)).toBe(false);
    // có sao + chưa từng sao lưu / quá 14 ngày → nhắc
    expect(backupReminderDue({ profiles: [played], lastBackupAt: null }, now)).toBe(true);
    expect(backupReminderDue({ profiles: [played], lastBackupAt: stale }, now)).toBe(true);
    // vừa sao lưu → hết nhắc
    expect(backupReminderDue({ profiles: [played], lastBackupAt: fresh }, now)).toBe(false);
    // chỉ cần MỘT hồ sơ có sao
    expect(backupReminderDue({ profiles: [empty, played], lastBackupAt: stale }, now)).toBe(true);
  });

  it('createBackup ghi lastBackupAt = lúc sao lưu', () => {
    const { st, state } = populated();
    const now = new Date('2026-10-11T09:00:00Z');
    const f = createBackup(st.snapshot(state), now, '0.9.0');
    expect(f.state.lastBackupAt).toBe(now.toISOString());
    expect(f.format).toBe(BACKUP_FORMAT);
  });
});
