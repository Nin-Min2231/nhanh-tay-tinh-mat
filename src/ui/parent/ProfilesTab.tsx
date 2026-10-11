// Tab Hồ sơ (F02): thêm / sửa / xóa (xóa phải xác nhận 2 bước: gõ đúng tên).
import { useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { MAX_PROFILES, NAME_MAX_LENGTH, isValidProfileName } from '../../app/profile';
import { canAddProfile, deleteConfirmed } from '../../app/parentOps';
import { parentAddProfile, parentDeleteProfile, parentEditProfile } from '../../app/parentStore';
import { appState } from '../../app/store';
import type { Grade, Profile } from '../../app/types';
import { AVATAR_IDS, Avatar } from '../components/Avatar';
import { Button } from '../components/Button';

const GRADES: Grade[] = [1, 2, 3];

interface FormValue {
  name: string;
  avatarId: string;
  grade: Grade;
}

function ProfileForm({
  title,
  initial,
  onSave,
  onCancel,
}: {
  title: string;
  initial: FormValue;
  onSave: (v: FormValue) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<FormValue>(initial);
  const valid = isValidProfileName(v.name);
  return (
    <form
      class="parent-form"
      data-testid="profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave(v);
      }}
    >
      <h2 class="parent-h2">{title}</h2>
      <label class="pfield">
        <span class="pfield-label">{vi.parent.profiles.name}</span>
        <input
          class="pinput"
          type="text"
          value={v.name}
          maxLength={NAME_MAX_LENGTH}
          autocomplete="off"
          data-testid="profile-name"
          onInput={(e) => setV({ ...v, name: (e.currentTarget as HTMLInputElement).value })}
        />
      </label>
      <fieldset class="pfield">
        <legend class="pfield-label">{vi.parent.profiles.avatar}</legend>
        <div class="avatar-grid" role="radiogroup" aria-label={vi.parent.profiles.avatar}>
          {AVATAR_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={v.avatarId === id}
              aria-label={vi.avatars[id]}
              class={`avatar-option${v.avatarId === id ? ' is-selected' : ''}`}
              data-testid={`avatar-${id}`}
              onClick={() => setV({ ...v, avatarId: id })}
            >
              <Avatar id={id} size={48} />
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset class="pfield">
        <legend class="pfield-label">{vi.parent.profiles.gradeLabel}</legend>
        <div class="pseg" role="radiogroup" aria-label={vi.parent.profiles.gradeLabel}>
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={v.grade === g}
              class={`pseg-btn${v.grade === g ? ' is-selected' : ''}`}
              data-testid={`grade-${g}`}
              onClick={() => setV({ ...v, grade: g })}
            >
              {vi.parent.profiles.grade(g)}
            </button>
          ))}
        </div>
      </fieldset>
      <div class="parent-actions">
        <Button type="submit" variant="primary" disabled={!valid} data-testid="profile-save">
          {vi.parent.profiles.save}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          {vi.parent.profiles.cancel}
        </Button>
      </div>
    </form>
  );
}

function DeletePanel({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [typed, setTyped] = useState('');
  const ok = deleteConfirmed(profile, typed);
  return (
    <div class="parent-danger" role="alertdialog" data-testid="delete-panel">
      <h2 class="parent-h2">{vi.parent.profiles.deleteTitle(profile.name)}</h2>
      <p>{vi.parent.profiles.deleteWarning}</p>
      <label class="pfield">
        <span class="pfield-label">{vi.parent.profiles.deleteType(profile.name)}</span>
        <input
          class="pinput"
          type="text"
          value={typed}
          autocomplete="off"
          data-testid="delete-type"
          onInput={(e) => setTyped((e.currentTarget as HTMLInputElement).value)}
        />
      </label>
      <div class="parent-actions">
        <Button
          variant="primary"
          disabled={!ok}
          data-testid="delete-confirm"
          onClick={() => {
            parentDeleteProfile(profile.id);
            onDone();
          }}
        >
          {vi.parent.profiles.deleteConfirm}
        </Button>
        <Button variant="secondary" onClick={onDone}>
          {vi.parent.profiles.cancel}
        </Button>
      </div>
    </div>
  );
}

type Mode = { kind: 'none' } | { kind: 'add' } | { kind: 'edit' | 'delete'; id: string };

export function ProfilesTab() {
  const state = appState.value;
  const [mode, setMode] = useState<Mode>({ kind: 'none' });
  const target =
    mode.kind === 'edit' || mode.kind === 'delete'
      ? state.profiles.find((p) => p.id === mode.id)
      : undefined;
  const close = () => setMode({ kind: 'none' });

  return (
    <div class="profiles-tab" data-testid="profiles-tab">
      <h2 class="parent-h2">{vi.parent.profiles.list}</h2>
      <ul class="parent-list">
        {state.profiles.map((p) => (
          <li key={p.id} class="parent-item" data-testid={`profile-${p.id}`}>
            <Avatar id={p.avatarId} size={48} />
            <div class="parent-item-main">
              <strong>{p.name}</strong>
              <span>
                {vi.parent.profiles.grade(p.grade)} · {vi.parent.profiles.stars(p.totalStars)}
                {state.activeProfileId === p.id && ` · ${vi.parent.profiles.current}`}
              </span>
            </div>
            <Button
              variant="secondary"
              data-testid={`profile-edit-${p.id}`}
              onClick={() => setMode({ kind: 'edit', id: p.id })}
            >
              {vi.parent.profiles.edit}
            </Button>
            <Button
              variant="secondary"
              data-testid={`profile-delete-${p.id}`}
              onClick={() => setMode({ kind: 'delete', id: p.id })}
            >
              {vi.parent.profiles.delete}
            </Button>
          </li>
        ))}
      </ul>

      {canAddProfile(state) ? (
        mode.kind !== 'add' && (
          <Button
            variant="primary"
            data-testid="profile-add"
            onClick={() => setMode({ kind: 'add' })}
          >
            {vi.parent.profiles.add}
          </Button>
        )
      ) : (
        <p class="parent-note">
          {vi.parent.profiles.full} ({MAX_PROFILES})
        </p>
      )}

      {mode.kind === 'add' && (
        <ProfileForm
          title={vi.parent.profiles.addTitle}
          initial={{ name: '', avatarId: AVATAR_IDS[0], grade: 2 }}
          onCancel={close}
          onSave={(v) => {
            parentAddProfile(v);
            close();
          }}
        />
      )}
      {mode.kind === 'edit' && target && (
        <ProfileForm
          key={target.id}
          title={vi.parent.profiles.editTitle}
          initial={{ name: target.name, avatarId: target.avatarId, grade: target.grade }}
          onCancel={close}
          onSave={(v) => {
            parentEditProfile(target.id, v);
            close();
          }}
        />
      )}
      {mode.kind === 'delete' && target && <DeletePanel profile={target} onDone={close} />}
    </div>
  );
}
