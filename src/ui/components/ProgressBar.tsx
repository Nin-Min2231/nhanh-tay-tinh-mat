export function ProgressBar({
  value,
  label,
  tone = 'sky',
}: {
  /** 0–1 */
  value: number;
  label: string;
  tone?: 'sky' | 'green' | 'orange';
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      class={`progress progress-${tone}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      <div class="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
