// Tab Dữ liệu (F10, NF07, TC-025): sao lưu / khôi phục, nhắc sao lưu, cảnh báo xóa dữ liệu, phiên bản app.
import { useEffect, useRef, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { backupOverdue, parseBackup, type BackupFile, type BackupPreview } from '../../app/backup';
import { parentCreateBackup, parentCreateCsv, parentRestore } from '../../app/parentStore';
import { applyUpdate } from '../../app/pwa';
import { goHome } from '../../app/router';
import { appState, deviceClass, showToast, updateAvailable } from '../../app/store';
import { APP_VERSION } from '../../app/version';
import { Button } from '../components/Button';
import { fmtDate, fmtDayKey, parentProfileId, selectedParentProfile } from './state';

type Message = { kind: 'ok' | 'error'; text: string };

/** Tải một file văn bản về máy (Blob + a[download]) – trên Android Chrome vào thư mục Tải xuống. */
function downloadText(name: string, text: string, type = 'application/json'): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function DataTab() {
  const state = appState.value;
  const [message, setMessage] = useState<Message | null>(null);
  const [pending, setPending] = useState<{ backup: BackupFile; preview: BackupPreview } | null>(
    null,
  );
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    const p = navigator.storage?.persisted?.();
    if (p) {
      p.then((v) => alive && setPersisted(v)).catch(() => undefined);
    }
    return () => {
      alive = false;
    };
  }, []);

  const doBackup = () => {
    const { name, text } = parentCreateBackup();
    downloadText(name, text);
    setMessage({ kind: 'ok', text: vi.parent.data.backupDone(name) });
  };

  const csvProfile = selectedParentProfile.value;
  const doCsv = (kind: 'rounds' | 'daily') => {
    if (!csvProfile) return;
    const { name, text } = parentCreateCsv(csvProfile, kind);
    downloadText(name, text, 'text/csv;charset=utf-8');
    setMessage({ kind: 'ok', text: vi.parent.data.csvDone(name) });
  };

  const onFile = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // cho phép chọn lại cùng một file
    setPending(null);
    if (!file) return;
    let text: string;
    try {
      text = await file.text();
    } catch {
      setMessage({ kind: 'error', text: vi.parent.data.errors.notJson ?? '' });
      return;
    }
    const res = parseBackup(text);
    if (res.ok) {
      setMessage(null);
      setPending({ backup: res.backup, preview: res.preview });
    } else {
      setMessage({
        kind: 'error',
        text: vi.parent.data.errors[res.reason] ?? vi.parent.data.errors.invalid ?? '',
      });
    }
  };

  const confirmRestore = () => {
    if (!pending) return;
    const hadProfiles = state.profiles.length > 0;
    parentRestore(pending.backup);
    parentProfileId.value = null;
    setPending(null);
    if (hadProfiles) {
      setMessage({ kind: 'ok', text: vi.parent.data.restored });
    } else {
      // Khôi phục lần đầu (máy chưa có hồ sơ nào): về thẳng Home để bé chơi tiếp
      showToast(vi.parent.data.restored, 3000);
      goHome();
    }
  };

  const overdue = backupOverdue(state.lastBackupAt, Date.now());
  const pv = pending?.preview;

  return (
    <div class="data-tab" data-testid="data-tab">
      <h2 class="parent-h2">{vi.parent.data.backupTitle}</h2>
      <p class="parent-note">{vi.parent.data.backupText}</p>
      <p class={overdue ? 'parent-warn' : 'parent-strong'} data-testid="last-backup">
        {state.lastBackupAt
          ? vi.parent.data.lastBackup(fmtDate(state.lastBackupAt))
          : vi.parent.data.neverBackup}
      </p>
      <Button variant="primary" onClick={doBackup} data-testid="backup-button">
        {vi.parent.data.backupButton}
      </Button>

      <h2 class="parent-h2">{vi.parent.data.restoreTitle}</h2>
      <p class="parent-note">{vi.parent.data.restoreText}</p>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        data-testid="restore-file"
        onChange={onFile}
      />
      <Button
        variant="secondary"
        onClick={() => fileRef.current?.click()}
        data-testid="restore-choose"
      >
        {vi.parent.data.chooseFile}
      </Button>

      {pv && (
        <div
          class="parent-preview"
          role="group"
          aria-label={vi.parent.data.previewTitle}
          data-testid="restore-preview"
        >
          <h3 class="parent-h3">{vi.parent.data.previewTitle}</h3>
          <p>{pv.exportedAt && vi.parent.data.previewExported(fmtDate(pv.exportedAt))}</p>
          {pv.appVersion && <p>{vi.parent.data.previewVersion(pv.appVersion)}</p>}
          <p data-testid="preview-profiles">{vi.parent.data.previewProfiles(pv.profiles.length)}</p>
          <ul>
            {pv.profiles.map((p) => (
              <li key={p.name}>{vi.parent.data.previewRounds(p.name, p.rounds)}</li>
            ))}
          </ul>
          <p data-testid="preview-total">{vi.parent.data.previewTotal(pv.totalRounds)}</p>
          {pv.firstDate && pv.lastDate && (
            <p>{vi.parent.data.previewRange(fmtDayKey(pv.firstDate), fmtDayKey(pv.lastDate))}</p>
          )}
          <p class="parent-warn">{vi.parent.data.previewWarn}</p>
          <div class="parent-actions">
            <Button variant="primary" onClick={confirmRestore} data-testid="restore-confirm">
              {vi.parent.data.restoreConfirm}
            </Button>
            <Button variant="secondary" onClick={() => setPending(null)}>
              {vi.parent.data.restoreCancel}
            </Button>
          </div>
        </div>
      )}

      {csvProfile && (
        <section aria-labelledby="csv-title" data-testid="csv-section">
          <h2 id="csv-title" class="parent-h2">
            {vi.parent.data.csvTitle}
          </h2>
          <p class="parent-note">{vi.parent.data.csvText(csvProfile.name)}</p>
          <div class="parent-actions">
            <Button variant="secondary" onClick={() => doCsv('rounds')} data-testid="csv-rounds">
              {vi.parent.data.csvRoundsButton}
            </Button>
            <Button variant="secondary" onClick={() => doCsv('daily')} data-testid="csv-daily">
              {vi.parent.data.csvDailyButton}
            </Button>
          </div>
        </section>
      )}

      {message && (
        <p
          class={message.kind === 'ok' ? 'parent-ok' : 'parent-warn'}
          role={message.kind === 'ok' ? 'status' : 'alert'}
          data-testid="data-message"
        >
          {message.text}
        </p>
      )}

      <h2 class="parent-h2">{vi.parent.data.warnTitle}</h2>
      <ul class="parent-bullets" data-testid="data-warnings">
        <li>{vi.parent.data.warnBrowser}</li>
        <li>{vi.parent.data.warnBrowserSwitch}</li>
        {persisted !== null && (
          <li data-testid="persist-status">
            {persisted ? vi.parent.data.persisted : vi.parent.data.notPersisted}
          </li>
        )}
      </ul>

      <h2 class="parent-h2">{vi.parent.data.appTitle}</h2>
      <p class="parent-strong" data-testid="app-version">
        {vi.parent.data.version(APP_VERSION)}
      </p>
      <p class="parent-note">
        {vi.parent.data.deviceClass(vi.parent.progress.devices[deviceClass] ?? deviceClass)}
      </p>
      {updateAvailable.value && (
        <Button variant="primary" onClick={applyUpdate} data-testid="update-button-parent">
          {vi.home.updateAvailable}
        </Button>
      )}

      <h2 class="parent-h2">{vi.parent.data.noteTitle}</h2>
      <p class="parent-note" data-testid="health-note">
        {vi.parent.data.note}
      </p>
    </div>
  );
}
