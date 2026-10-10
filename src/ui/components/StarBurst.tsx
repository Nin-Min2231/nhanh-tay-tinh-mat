import { vi } from '../../i18n/vi';

/** 3 ngôi sao; `count` sao đầu bay vào lần lượt, còn lại mờ. */
export function StarBurst({ count }: { count: number }) {
  return (
    <div
      class="starburst"
      role="img"
      aria-label={vi.common.stars(count)}
      data-testid="starburst"
      data-stars={count}
    >
      {[1, 2, 3].map((n) => (
        <svg
          key={n}
          class={`star ${n <= count ? 'star-on' : 'star-off'}`}
          style={{ animationDelay: `${(n - 1) * 0.35}s` }}
          viewBox="0 0 64 64"
          width="80"
          height="80"
          aria-hidden="true"
        >
          <path
            d="M32 5 L39.5 23.5 L59 24.8 L44 37.5 L48.9 56.5 L32 46 L15.1 56.5 L20 37.5 L5 24.8 L24.5 23.5 Z"
            stroke="#37474F"
            stroke-width="3"
            stroke-linejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}
