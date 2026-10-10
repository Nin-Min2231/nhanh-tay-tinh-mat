// Pháo giấy rơi (CSS thuần). Tự ẩn khi người dùng bật “giảm chuyển động” (xem app.css).
const COLORS = ['#FF5FA2', '#FFD93D', '#3DDC6E', '#29B6F6', '#8E6CF0', '#FF8A3D'] as const;

export function Confetti({ count = 36 }: { count?: number }) {
  return (
    <div class="confetti" aria-hidden="true" data-testid="confetti">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={`left:${(i * 53 + 7) % 100}%;background:${COLORS[i % COLORS.length]};--d:${2.6 + (i % 5) * 0.4}s;--delay:${(i % 7) * 0.12}s;width:${8 + (i % 3) * 3}px`}
        />
      ))}
    </div>
  );
}
