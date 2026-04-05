import type { ComponentChildren, ComponentProps } from 'preact';
import { cn } from '../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ComponentProps<'button'> & {
  children: ComponentChildren;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-gradient rounded-[12px]',
  secondary:
    'border border-border-card bg-card text-text-primary rounded-[12px] hover:border-ghost-border',
  ghost:
    'bg-ghost-bg border border-ghost-border text-text-secondary rounded-[12px] hover:bg-ghost-border/50',
};

export default function Button({
  children,
  class: className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  const resolvedClassName =
    typeof className === 'string' ? className : undefined;

  return (
    <button
      class={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 hover:scale-[1.01]',
        variantClasses[variant],
        resolvedClassName,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
