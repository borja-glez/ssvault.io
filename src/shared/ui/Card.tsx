import type { ComponentChildren } from 'preact';
import { cn } from '../lib/cn';

type CardVariant = 'default' | 'alert';

interface CardProps {
  title: string;
  description?: string;
  children?: ComponentChildren;
  class?: string;
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: '',
  alert: 'border-l-2 border-l-accent/30',
};

export default function Card({
  title,
  description,
  children,
  class: className,
  variant = 'default',
}: CardProps) {
  return (
    <article
      class={cn(
        'rounded-[20px] border border-border-card bg-card p-7',
        variantClasses[variant],
        className,
      )}
    >
      <h3 class="text-xl font-semibold tracking-tight text-text-primary">
        {title}
      </h3>
      {description ? (
        <p class="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
      ) : null}
      {children ? <div class="mt-4">{children}</div> : null}
    </article>
  );
}
