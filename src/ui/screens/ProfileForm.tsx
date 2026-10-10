import { useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { goBack, goHome, stackDepth } from '../../app/router';
import { NAME_MAX_LENGTH, isValidProfileName } from '../../app/profile';
import { addProfile, appState } from '../../app/store';
import type { Grade } from '../../app/types';
import { AVATAR_IDS, Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { IconBack } from '../components/Icons';

const GRADES: Grade[] = [1, 2, 3];

export function ProfileForm() {
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState<string>(AVATAR_IDS[0]);
  const [grade, setGrade] = useState<Grade>(2);
  const valid = isValidProfileName(name) && appState.value.profiles.length < 5;

  const submit = (e: Event) => {
    e.preventDefault();
    if (!valid) return;
    if (addProfile({ name, avatarId, grade })) goHome();
  };

  return (
    <main class="screen">
      {stackDepth() > 1 && (
        <Button variant="ghost" onClick={() => goBack()} aria-label={vi.common.back}>
          <IconBack /> {vi.common.back}
        </Button>
      )}
      <form class="form" onSubmit={submit}>
        <h1 class="title">{vi.profiles.newTitle}</h1>

        <label class="field">
          <span class="field-label">{vi.profiles.nameLabel}</span>
          <input
            class="input"
            type="text"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            placeholder={vi.profiles.namePlaceholder}
            autocomplete="off"
            onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)}
          />
        </label>

        <fieldset class="field">
          <legend class="field-label">{vi.profiles.avatarLabel}</legend>
          <div class="avatar-grid" role="radiogroup" aria-label={vi.profiles.avatarLabel}>
            {AVATAR_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={avatarId === id}
                aria-label={vi.avatars[id]}
                class={`avatar-option${avatarId === id ? ' is-selected' : ''}`}
                onClick={() => setAvatarId(id)}
              >
                <Avatar id={id} size={64} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset class="field">
          <legend class="field-label">{vi.profiles.gradeLabel}</legend>
          <div class="segmented" role="radiogroup" aria-label={vi.profiles.gradeLabel}>
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={grade === g}
                class={`segment${grade === g ? ' is-selected' : ''}`}
                onClick={() => setGrade(g)}
              >
                {vi.profiles.grade(g)}
              </button>
            ))}
          </div>
        </fieldset>

        <Button type="submit" variant="primary" size="lg" disabled={!valid}>
          {vi.profiles.submit}
        </Button>
      </form>
    </main>
  );
}
