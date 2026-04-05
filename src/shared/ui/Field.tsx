import type { ComponentChildren } from 'preact';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  children: ComponentChildren;
}

export default function Field({ id, label, hint, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div class="flex flex-col gap-2">
      <label class="label-mono" for={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <p class="text-[11px] text-text-dimmed leading-5" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
