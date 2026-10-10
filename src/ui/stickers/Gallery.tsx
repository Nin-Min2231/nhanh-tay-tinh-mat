// Trang xem trước toàn bộ sticker – CHỈ dành cho dev / build e2e: mở /?gallery=1 (thêm &theme=animal|fruit|space|vehicle).
import { STICKERS, STICKER_THEMES } from '../../app/rewards';
import { vi } from '../../i18n/vi';
import { Mascot, type MascotMood } from '../components/Mascot';
import { Scene } from '../components/Scenes';
import { Sticker } from './Sticker';

const MOODS: MascotMood[] = ['happy', 'cheer', 'surprised', 'sleep', 'wave'];

/** Xem trước linh vật mặc trang phục + hình nền (?gallery=1&view=rewards). */
function RewardsGallery() {
  return (
    <main
      data-testid="gallery-rewards"
      style="padding:12px;display:flex;flex-direction:column;gap:14px"
    >
      {[null, 'outfit-pilot', 'outfit-hero'].map((o) => (
        <div
          key={String(o)}
          style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end"
          data-outfit={String(o)}
        >
          {MOODS.map((m) => (
            <Mascot key={m} mood={m} size={150} outfit={o} />
          ))}
        </div>
      ))}
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        {['bg-candy', 'bg-sea'].map((b) => (
          <div
            key={b}
            data-bg={b}
            style="width:420px;height:220px;border:3px solid #37474F;border-radius:22px;overflow:hidden"
          >
            <Scene id={b} />
          </div>
        ))}
      </div>
    </main>
  );
}

export function StickerGallery({ theme, view }: { theme: string | null; view?: string | null }) {
  if (view === 'rewards') return <RewardsGallery />;
  const themes = STICKER_THEMES.filter((t) => !theme || t === theme);
  const big = Boolean(theme);
  return (
    <main
      class="gallery"
      data-testid="gallery"
      style="padding:12px;display:flex;flex-direction:column;gap:14px"
    >
      {themes.map((t) => (
        <section key={t} data-theme={t}>
          <h2 style="margin:0 0 6px">{t}</h2>
          <div style="display:flex;flex-wrap:wrap;gap:12px">
            {STICKERS.filter((s) => s.theme === t).map((s) => (
              <figure key={s.id} style="margin:0;text-align:center" data-id={s.id}>
                <Sticker id={s.id} size={big ? 240 : 120} />
                <figcaption style="font-size:14px;font-weight:700">
                  {s.id} · {vi.stickers[s.id]} · {vi.rarity[s.rarity]}
                </figcaption>
              </figure>
            ))}
          </div>
          <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
            {STICKERS.filter((s) => s.theme === t).map((s) => (
              <Sticker key={s.id} id={s.id} size={56} />
            ))}
            {STICKERS.filter((s) => s.theme === t)
              .slice(0, 4)
              .map((s) => (
                <Sticker key={`l${s.id}`} id={s.id} size={56} locked />
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
