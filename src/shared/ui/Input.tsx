import type { ComponentProps } from 'preact';
import { cn } from '../lib/cn';

type InputProps = ComponentProps<'input'> & {
  invalid?: boolean;
};

export default function Input({
  class: className,
  invalid = false,
  ...props
}: InputProps) {
  const resolvedClassName =
    typeof className === 'string' ? className : undefined;

  return (
    <input
      class={cn(
        'w-full rounded-[10px] border border-border-input bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-dimmed transition-all duration-150 focus:ring-1 focus:ring-accent/30 focus:border-accent/40',
        invalid && 'border-danger/70',
        resolvedClassName,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
