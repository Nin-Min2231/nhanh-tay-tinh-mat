// Hộp quà bí mật: hình SVG bóng bẩy + cửa sổ mở hộp (lắc → bung → sticker). Mở được cả khi đã hết giờ chơi.
import { Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { needsPicking, stickerById, type BoxOpening } from '../../app/rewards';
import { setBackInterceptor } from '../../app/backButton';
import { E2E } from '../../app/e2e';
import { navigate } from '../../app/router';
import { activeProfile, audio, closeGiftModal, giftModalOpen, openGift } from '../../app/store';
import { vi } from '../../i18n/vi';
import { Sticker } from '../stickers/Sticker';
import { Button } from './Button';
import { Confetti } from './Confetti';

const INK = '#37474F';

/** Hình hộp quà. `open` = nắp bật lên, tỏa sáng. */
export function GiftBoxArt({ size = 160, open = false }: { size?: number; open?: boolean }) {
  return (
    <svg
      class={`gift-art${open ? ' is-open' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gb-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FF8FC0" />
          <stop offset="0.55" stop-color="#F0408E" />
          <stop offset="1" stop-color="#C21F6D" />
        </linearGradient>
        <linearGradient id="gb-lid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#C7A5FF" />
          <stop offset="0.55" stop-color="#8E5CF0" />
          <stop offset="1" stop-color="#5E34C6" />
        </linearGradient>
        <linearGradient id="gb-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFF3A0" />
          <stop offset="0.5" stop-color="#FFC52E" />
          <stop offset="1" stop-color="#E08A00" />
        </linearGradient>
        <radialGradient id="gb-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#FFFBD0" stop-opacity="1" />
          <stop offset="1" stop-color="#FFE066" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="188" rx="64" ry="8" fill="#263238" opacity="0.2" />
      {open && <circle class="gift-glow" cx="100" cy="92" r="84" fill="url(#gb-glow)" />}
      {/* thân hộp */}
      <rect
        x="40"
        y="98"
        width="120"
        height="86"
        rx="10"
        fill="url(#gb-body)"
        stroke={INK}
        stroke-width="3.5"
      />
      <g fill="#fff" opacity="0.3">
        <circle cx="58" cy="118" r="5" />
        <circle cx="140" cy="128" r="5" />
        <circle cx="62" cy="158" r="5" />
        <circle cx="142" cy="168" r="5" />
        <circle cx="76" cy="140" r="3.4" />
        <circle cx="124" cy="150" r="3.4" />
      </g>
      <rect
        x="88"
        y="98"
        width="24"
        height="86"
        fill="url(#gb-gold)"
        stroke={INK}
        stroke-width="3"
      />
      <path
        d="M48 112 Q47 150 52 176"
        fill="none"
        stroke="#fff"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.5"
      />
      {open && (
        <ellipse cx="100" cy="100" rx="58" ry="9" fill="#FFF6B0" stroke={INK} stroke-width="2.5" />
      )}
      {/* nắp + nơ */}
      <g class="gift-lid">
        <rect
          x="32"
          y="68"
          width="136"
          height="36"
          rx="10"
          fill="url(#gb-lid)"
          stroke={INK}
          stroke-width="3.5"
        />
        <rect
          x="88"
          y="68"
          width="24"
          height="36"
          fill="url(#gb-gold)"
          stroke={INK}
          stroke-width="3"
        />
        <path
          d="M42 76 Q70 74 92 76"
          fill="none"
          stroke="#fff"
          stroke-width="5"
          stroke-linecap="round"
          opacity="0.5"
        />
        <path
          d="M100 68 C 82 30, 48 36, 60 60 C 66 74, 90 72, 100 68 Z"
          fill="url(#gb-gold)"
          stroke={INK}
          stroke-width="3.2"
          stroke-linejoin="round"
        />
        <path
          d="M100 68 C 118 30, 152 36, 140 60 C 134 74, 110 72, 100 68 Z"
          fill="url(#gb-gold)"
          stroke={INK}
          stroke-width="3.2"
          stroke-linejoin="round"
        />
        <path
          d="M70 52 Q80 44 90 56"
          fill="none"
          stroke="#fff"
          stroke-width="4"
          stroke-linecap="round"
          opacity="0.7"
        />
        <circle cx="100" cy="66" r="9.5" fill="url(#gb-gold)" stroke={INK} stroke-width="3" />
      </g>
    </svg>
  );
}

type Phase = 'closed' | 'bursting' | 'reveal';

function RarityChip({ rarity }: { rarity: string }) {
  return (
    <span class={`rarity-chip rarity-${rarity}`} data-testid="gift-rarity">
      {vi.rarity[rarity] ?? rarity}
    </span>
  );
}

function GiftDialog() {
  const [phase, setPhase] = useState<Phase>('closed');
  const [res, setRes] = useState<BoxOpening | null>(null);
  const boxRef = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const pending = activeProfile.value?.boxes.pending ?? 0;

  useEffect(() => {
    // Nút/cử chỉ Quay lại Android đóng hộp quà thay vì rời màn hình
    setBackInterceptor(() => {
      closeGiftModal();
      return true;
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGiftModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      setBackInterceptor(null);
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'closed') boxRef.current?.focus();
  }, [phase]);

  const open = () => {
    if (phase !== 'closed') return;
    const r = openGift();
    if (!r) {
      closeGiftModal();
      return;
    }
    setRes(r);
    setPhase('bursting');
    audio.ding();
    timer.current = window.setTimeout(
      () => {
        setPhase('reveal');
        if (r.sticker.rarity === 'common') audio.star();
        else audio.levelUp();
      },
      E2E.enabled ? 120 : 1100,
    );
  };

  const next = () => {
    setRes(null);
    setPhase('closed');
  };

  const sticker = res ? stickerById(res.sticker.id) : undefined;
  const showRays = res !== null && res.sticker.rarity !== 'common';

  return (
    <div
      class="overlay overlay-top gift-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={vi.gift.title}
      data-testid="gift-modal"
      data-phase={phase}
    >
      {phase === 'reveal' && showRays && <Confetti count={48} />}
      <Button
        variant="icon"
        class="gift-close"
        aria-label={vi.album.close}
        onClick={closeGiftModal}
        data-testid="gift-close"
      >
        ✕
      </Button>

      {phase !== 'reveal' && (
        <>
          <h2 class="gift-title">{vi.gift.title}</h2>
          <button
            type="button"
            ref={boxRef}
            class={`gift-box-btn${phase === 'bursting' ? ' is-bursting' : ''}`}
            aria-label={vi.gift.boxLabel}
            onClick={open}
            disabled={phase === 'bursting'}
            data-testid="gift-box"
          >
            <GiftBoxArt size={240} open={phase === 'bursting'} />
          </button>
          <p class="gift-hint">{phase === 'bursting' ? vi.gift.opening : vi.gift.tapToOpen}</p>
          <p class="gift-count" data-testid="gift-count">
            {vi.gift.remaining(pending)}
          </p>
        </>
      )}

      {phase === 'reveal' && res && sticker && (
        <>
          <RarityChip rarity={sticker.rarity} />
          <div class={`gift-stage${showRays ? ' has-rays' : ''}`}>
            {showRays && <div class="gift-rays" aria-hidden="true" />}
            <div
              class="gift-sticker"
              data-testid="gift-sticker"
              data-id={sticker.id}
              data-rarity={sticker.rarity}
              data-new={res.isNew ? '1' : '0'}
            >
              <Sticker id={sticker.id} size={190} />
            </div>
          </div>
          <h2 class="gift-name">{vi.stickers[sticker.id]}</h2>
          {res.isNew ? (
            <p class="gift-badge gift-new" data-testid="gift-new">
              {vi.gift.newSticker}
            </p>
          ) : (
            <p class="gift-badge gift-dup" data-testid="gift-dup">
              {vi.gift.duplicate(res.count, res.duplicateStars)}
            </p>
          )}
          {res.unlocked.map((id) => (
            <Fragment key={id}>
              <p class="gift-badge gift-unlock" data-testid="gift-unlock">
                {vi.gift.unlocked(vi.unlocks[id] ?? id)}
              </p>
              {needsPicking(id) && (
                <p class="gift-note" data-testid="gift-unlock-hint">
                  {vi.album.useHint}
                </p>
              )}
            </Fragment>
          ))}
          {res.boxesGained > 0 && <p class="gift-note">{vi.gift.boxAlso}</p>}
          {res.boxesBlocked > 0 && <p class="gift-note">{vi.gift.boxBlocked}</p>}
          <div class="gift-actions">
            {pending > 0 ? (
              <Button variant="primary" size="lg" onClick={next} data-testid="gift-next">
                {vi.gift.openNext(pending)}
              </Button>
            ) : (
              <Button variant="primary" size="lg" onClick={closeGiftModal} data-testid="gift-done">
                {vi.gift.done}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                closeGiftModal();
                navigate('/album');
              }}
              data-testid="gift-album"
            >
              {vi.gift.toAlbum}
            </Button>
            {pending > 0 && (
              <Button variant="ghost" onClick={closeGiftModal} data-testid="gift-done">
                {vi.gift.done}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Đặt một lần ở gốc ứng dụng: hiện khi `giftModalOpen` bật. */
export function GiftModal() {
  if (!giftModalOpen.value) return null;
  return <GiftDialog />;
}
