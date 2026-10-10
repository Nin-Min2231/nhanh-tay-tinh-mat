import { vi } from '../../i18n/vi';
import { storageWarning, toast } from '../../app/store';
import { tooSmall } from '../../app/viewport';
import { Mascot } from './Mascot';

export function StorageBanner() {
  if (!storageWarning.value) return null;
  return (
    <div class="banner banner-warn" role="alert" data-testid="storage-banner">
      {vi.banner.storage}
    </div>
  );
}

export function Toast() {
  const text = toast.value;
  if (!text) return null;
  return (
    <div class="toast" role="status" data-testid="toast">
      {text}
    </div>
  );
}

/** Cửa sổ quá nhỏ (chia đôi màn hình / cửa sổ nổi) – SPEC 12b. */
export function TooSmallOverlay() {
  if (!tooSmall.value) return null;
  return (
    <div
      class="overlay overlay-top"
      role="alertdialog"
      aria-live="assertive"
      data-testid="too-small"
    >
      <Mascot mood="surprised" size={96} />
      <h2 class="overlay-title">{vi.viewport.tooSmall}</h2>
      <p class="overlay-note">{vi.viewport.tooSmallHint}</p>
    </div>
  );
}
