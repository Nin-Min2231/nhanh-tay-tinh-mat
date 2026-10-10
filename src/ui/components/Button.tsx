import type { ComponentChildren } from 'preact';

interface ButtonProps {
  children: ComponentChildren;
  onClick?: (e: MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  /** lg = nút chính ≥ 64px. */
  size?: 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit';
  class?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'data-testid'?: string;
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled,
  type = 'button',
  class: extra,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      class={`btn btn-${variant} btn-${size}${extra ? ` ${extra}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
