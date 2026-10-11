// Khóa phụ huynh (F08, TC-026): phép nhân 2 chữ số × 1 chữ số, bàn phím số, sai 3 lần khóa 30 giây.
import { useEffect, useRef, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { E2E, TIME_SCALE } from '../../app/e2e';
import {
  GATE_LOCK_MS,
  GATE_MAX_WRONG,
  initialGate,
  lockRemainingMs,
  refreshGate,
  submitAnswer,
  type GateState,
} from '../../app/parentGate';
import { parentUnlocked } from '../../app/parentStore';
import { freshSeed, mulberry32 } from '../../app/rng';
import { goBack, goHome, replace } from '../../app/router';
import { appState } from '../../app/store';
import { Button } from '../components/Button';
import { IconBack } from '../components/Icons';

const MAX_DIGITS = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function ParentGate() {
  const rngRef = useRef(mulberry32(E2E.enabled ? E2E.seed : freshSeed()));
  const [gate, setGate] = useState<GateState>(() => initialGate(rngRef.current));
  const [input, setInput] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lockMs = GATE_LOCK_MS / TIME_SCALE; // chạy e2e (?e2e=1) thì rút ×10 để test không phải chờ
  const locked = gate.lockedUntil !== null && now < gate.lockedUntil;
  const leftSec = Math.ceil(lockRemainingMs(gate, now) / 1000);

  // Đếm ngược khi đang khóa; hết khóa → phép tính mới
  useEffect(() => {
    if (gate.lockedUntil === null) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (gate.lockedUntil !== null && t >= gate.lockedUntil) {
        setGate((g) => refreshGate(g, t, rngRef.current));
        setInput('');
        setNote(null);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [gate.lockedUntil]);

  const press = (d: string) => {
    if (locked) return;
    setNote(null);
    setInput((v) => (v.length >= MAX_DIGITS ? v : v + d));
  };
  const del = () => {
    if (locked) return;
    setNote(null);
    setInput((v) => v.slice(0, -1));
  };
  const submit = () => {
    const t = Date.now();
    const res = submitAnswer(gate, input, t, lockMs);
    setNow(t);
    setGate(res.state);
    if (res.result === 'ok') {
      parentUnlocked.value = true;
      replace(appState.value.profiles.length > 0 ? '/parent/progress' : '/parent/data');
      return;
    }
    if (res.result === 'empty') setNote(vi.parent.gate.empty);
    else if (res.result === 'wrong') {
      setNote(vi.parent.gate.wrong(GATE_MAX_WRONG - res.state.wrong));
      setInput('');
    } else setInput('');
  };

  // Gõ bằng bàn phím máy tính (tiện khi thử trên máy tính); luôn dùng bản mới nhất của hàm xử lý
  const latest = useRef({ press, del, submit });
  latest.current = { press, del, submit };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) latest.current.press(e.key);
      else if (e.key === 'Backspace') latest.current.del();
      else if (e.key === 'Enter') latest.current.submit();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main class="screen screen-center parent-gate" data-testid="parent-gate">
      <div class="gate-bar">
        <Button variant="ghost" onClick={() => (goBack() ? undefined : goHome())}>
          <IconBack /> {vi.common.back}
        </Button>
      </div>
      <h1 class="title">{vi.parent.title}</h1>
      <p class="gate-prompt">{vi.parent.gate.prompt}</p>
      <p class="gate-question" data-testid="gate-question" aria-live="polite">
        {gate.challenge.a} × {gate.challenge.b} = ?
      </p>
      <output class="gate-input" data-testid="gate-input" aria-label={vi.parent.gate.answer}>
        {input === '' ? ' ' : input}
      </output>
      <p class="gate-note" role="status" data-testid="gate-note">
        {locked ? vi.parent.gate.locked(leftSec) : (note ?? ' ')}
      </p>
      <div class="keypad" role="group" aria-label={vi.parent.gate.answer}>
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            class="key"
            disabled={locked}
            data-testid={`gate-key-${k}`}
            onClick={() => press(k)}
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          class="key key-fn"
          disabled={locked}
          aria-label={vi.parent.gate.delete}
          data-testid="gate-del"
          onClick={del}
        >
          ⌫
        </button>
        <button
          type="button"
          class="key"
          disabled={locked}
          data-testid="gate-key-0"
          onClick={() => press('0')}
        >
          0
        </button>
        <button
          type="button"
          class="key key-ok"
          disabled={locked}
          data-testid="gate-ok"
          onClick={submit}
        >
          {vi.parent.gate.enter}
        </button>
      </div>
      {appState.value.profiles.length === 0 && (
        <p class="gate-restore">{vi.parent.gate.restoreHint}</p>
      )}
    </main>
  );
}
