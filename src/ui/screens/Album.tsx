// Album: 40 sticker (ô chưa có là bóng mờ) + tab Trang phục / Hình nền / Đặc biệt (SPEC mục 1, 7).
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import {
  STICKERS,
  nextUnlock,
  ownedStickerCount,
  stickerById,
  unlockById,
  unlocksOfKind,
  type UnlockDef,
} from '../../app/rewards';
import { goBack, goHome } from '../../app/router';
import { activeProfile, equipReward } from '../../app/store';
import type { Profile } from '../../app/types';
import { vi } from '../../i18n/vi';
import { Sticker } from '../stickers/Sticker';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { GiftButton } from '../components/GiftButton';
import { IconBack, IconLock } from '../components/Icons';
import { Mascot } from '../components/Mascot';
import { BadgeGold, XyloIcon } from '../components/RewardIcons';
import { Scene } from '../components/Scenes';

type Tab = 'stickers' | 'outfits' | 'backgrounds' | 'special';
const TABS: readonly Tab[] = ['stickers', 'outfits', 'backgrounds', 'special'];

function StickersTab({ p }: { p: Profile }) {
  const [zoom, setZoom] = useState<string | null>(null);
  const owned = ownedStickerCount(p);
  const zoomDef = zoom ? stickerById(zoom) : undefined;
  return (
    <>
      <p class="album-summary" data-testid="album-count">
        {vi.album.owned(owned, STICKERS.length)}
      </p>
      {owned === 0 && <p class="album-empty">{vi.album.emptyHint}</p>}
      <ul class="sticker-grid" data-testid="sticker-grid">
        {STICKERS.map((s) => {
          const n = p.stickers[s.id] ?? 0;
          const has = n > 0;
          const name = vi.stickers[s.id] ?? s.id;
          return (
            <li
              key={s.id}
              class={`sticker-cell rarity-cell-${s.rarity}${has ? ' is-owned' : ''}`}
              data-id={s.id}
              data-owned={has ? '1' : '0'}
              data-testid="sticker-cell"
            >
              {has ? (
                <button
                  type="button"
                  class="sticker-btn"
                  aria-label={vi.album.view(name)}
                  onClick={() => setZoom(s.id)}
                >
                  <Sticker id={s.id} size={76} decorative />
                </button>
              ) : (
                <div class="sticker-btn" role="img" aria-label={vi.album.unknown}>
                  <Sticker id={s.id} size={76} locked decorative />
                </div>
              )}
              {n > 1 && (
                <span class="sticker-count" data-testid="sticker-count">
                  {vi.album.count(n)}
                </span>
              )}
              <span class="sticker-name">{has ? name : '?'}</span>
            </li>
          );
        })}
      </ul>
      {zoomDef && (
        <div
          class="overlay overlay-top zoom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={vi.stickers[zoomDef.id]}
          data-testid="sticker-zoom"
          onClick={() => setZoom(null)}
        >
          <Sticker id={zoomDef.id} size={240} />
          <h2 class="zoom-name">{vi.stickers[zoomDef.id]}</h2>
          <span class={`rarity-chip rarity-${zoomDef.rarity}`}>{vi.rarity[zoomDef.rarity]}</span>
          <p class="zoom-count">{vi.album.count(p.stickers[zoomDef.id] ?? 0)}</p>
          <Button variant="primary" size="lg" onClick={() => setZoom(null)}>
            {vi.album.close}
          </Button>
        </div>
      )}
    </>
  );
}

function RewardCard({
  def,
  p,
  preview,
  actions,
}: {
  def: UnlockDef;
  p: Profile;
  preview: ComponentChildren;
  actions: ComponentChildren;
}) {
  const open = p.unlocked.includes(def.id);
  return (
    <article
      class={`reward-card${open ? '' : ' is-locked'}`}
      data-id={def.id}
      data-unlocked={open ? '1' : '0'}
      data-testid="reward-card"
    >
      <div class="reward-preview">{preview}</div>
      <h3 class="reward-name">{vi.unlocks[def.id]}</h3>
      {open ? (
        actions
      ) : (
        <p class="reward-lock">
          <IconLock /> {vi.album.needStars(def.stars)}
        </p>
      )}
    </article>
  );
}

function OutfitsTab({ p }: { p: Profile }) {
  return (
    <div class="reward-grid" data-testid="outfit-grid">
      <article class="reward-card" data-id="none" data-testid="reward-card">
        <div class="reward-preview">
          <Mascot mood="happy" size={110} />
        </div>
        <h3 class="reward-name">{vi.album.noOutfit}</h3>
        <Button
          variant={p.outfitId === null ? 'primary' : 'secondary'}
          aria-pressed={p.outfitId === null}
          onClick={() => equipReward('outfit', null)}
          data-testid="outfit-none"
        >
          {p.outfitId === null ? vi.album.wearing : vi.album.takeOff}
        </Button>
      </article>
      {unlocksOfKind('outfit').map((def) => {
        const on = p.outfitId === def.id;
        return (
          <RewardCard
            key={def.id}
            def={def}
            p={p}
            preview={<Mascot mood="happy" size={110} outfit={def.id} />}
            actions={
              <Button
                variant={on ? 'primary' : 'secondary'}
                aria-pressed={on}
                onClick={() => equipReward('outfit', def.id)}
                data-testid={`equip-${def.id}`}
              >
                {on ? vi.album.wearing : vi.album.wear}
              </Button>
            }
          />
        );
      })}
    </div>
  );
}

function BackgroundsTab({ p }: { p: Profile }) {
  return (
    <div class="reward-grid" data-testid="background-grid">
      <article class="reward-card" data-id="none" data-testid="reward-card">
        <div class="reward-preview reward-scene reward-scene-none" aria-hidden="true" />
        <h3 class="reward-name">{vi.album.noBackground}</h3>
        <Button
          variant={p.backgroundId === null ? 'primary' : 'secondary'}
          aria-pressed={p.backgroundId === null}
          onClick={() => equipReward('background', null)}
          data-testid="background-none"
        >
          {p.backgroundId === null ? vi.album.using : vi.album.use}
        </Button>
      </article>
      {unlocksOfKind('background').map((def) => {
        const on = p.backgroundId === def.id;
        return (
          <RewardCard
            key={def.id}
            def={def}
            p={p}
            preview={
              <div class="reward-scene">
                <Scene id={def.id} />
              </div>
            }
            actions={
              <Button
                variant={on ? 'primary' : 'secondary'}
                aria-pressed={on}
                onClick={() => equipReward('background', def.id)}
                data-testid={`equip-${def.id}`}
              >
                {on ? vi.album.using : vi.album.use}
              </Button>
            }
          />
        );
      })}
    </div>
  );
}

function SpecialTab({ p }: { p: Profile }) {
  const specials = [
    ...unlocksOfKind('avatarFrame'),
    ...unlocksOfKind('badge'),
    ...unlocksOfKind('soundSet'),
    ...unlocksOfKind('mascot'),
  ];
  const preview = (def: UnlockDef): ComponentChildren => {
    switch (def.kind) {
      case 'avatarFrame':
        return <Avatar id={p.avatarId} size={92} frame />;
      case 'badge':
        return <BadgeGold size={92} />;
      case 'soundSet':
        return <XyloIcon size={92} />;
      default:
        return <Avatar id="owl" size={92} />;
    }
  };
  const note = (def: UnlockDef): string => {
    if (def.kind === 'avatarFrame') return vi.album.frameInUse;
    if (def.kind === 'badge') return vi.album.badgeInUse;
    return vi.album.soon;
  };
  return (
    <div class="reward-grid" data-testid="special-grid">
      {specials.map((def) => (
        <RewardCard
          key={def.id}
          def={def}
          p={p}
          preview={preview(def)}
          actions={
            <p class="reward-note">
              <strong>{vi.album.unlockedLabel}</strong>
              <br />
              {note(def)}
            </p>
          }
        />
      ))}
    </div>
  );
}

export function Album() {
  const [tab, setTab] = useState<Tab>('stickers');
  const p = activeProfile.value;
  if (!p) return null;
  const goal = nextUnlock(p);
  const goalDef = goal ? unlockById(goal.id) : undefined;

  return (
    <main class="screen album" data-testid="album">
      <header class="album-top">
        <Button
          variant="icon"
          aria-label={vi.common.back}
          onClick={() => (goBack() ? undefined : goHome())}
          data-testid="album-back"
        >
          <IconBack />
        </Button>
        <h1 class="title">{vi.album.title}</h1>
        <span class="home-stars" data-testid="album-stars">
          ★ {vi.home.totalStars(p.totalStars)}
        </span>
      </header>

      <section class="album-gift">
        <GiftButton size={52} label={false} />
        <p class="album-goal" data-testid="album-goal">
          {goalDef
            ? vi.album.nextGoal(goalDef.stars - p.totalStars, vi.unlocks[goalDef.id] ?? goalDef.id)
            : vi.album.allUnlocked}
        </p>
      </section>

      <div class="tabs" role="tablist" aria-label={vi.album.title}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            class={`tab${tab === t ? ' is-active' : ''}`}
            aria-selected={tab === t}
            aria-controls="album-panel"
            onClick={() => setTab(t)}
            data-testid={`tab-${t}`}
          >
            {vi.album.tabs[t]}
          </button>
        ))}
      </div>

      <section id="album-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'stickers' && <StickersTab p={p} />}
        {tab === 'outfits' && <OutfitsTab p={p} />}
        {tab === 'backgrounds' && <BackgroundsTab p={p} />}
        {tab === 'special' && <SpecialTab p={p} />}
      </section>
    </main>
  );
}
