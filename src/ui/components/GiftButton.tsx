import { activeProfile, openGiftModal } from '../../app/store';
import { vi } from '../../i18n/vi';
import { GiftBoxArt } from './GiftBox';

/** Nút hộp quà kèm số hộp đang chờ; bấm để mở cửa sổ mở hộp. */
export function GiftButton({ size = 64, label = true }: { size?: number; label?: boolean }) {
  const n = activeProfile.value?.boxes.pending ?? 0;
  return (
    <button
      type="button"
      class={`gift-chip${n > 0 ? ' has-gifts' : ''}`}
      disabled={n === 0}
      onClick={openGiftModal}
      // Có chữ hiển thị thì để trình duyệt lấy tên từ nội dung (aria-label khác chữ hiển thị vi phạm WCAG 2.5.3);
      // biến thể chỉ có biểu tượng thì cần aria-label.
      aria-label={label ? undefined : n > 0 ? vi.home.giftWaiting(n) : vi.home.giftNone}
      data-testid="gift-button"
    >
      <span class="gift-chip-art">
        <GiftBoxArt size={size} />
        {n > 0 && (
          <span class="gift-chip-num" data-testid="gift-pending">
            {n}
          </span>
        )}
      </span>
      {label && <span class="gift-chip-text">{n > 0 ? vi.home.gift : vi.home.giftNone}</span>}
    </button>
  );
}
