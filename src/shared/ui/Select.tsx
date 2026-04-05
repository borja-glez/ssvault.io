import type { ComponentChildren, VNode } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { cn } from '../lib/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  children?: ComponentChildren;
  class?: string;
  invalid?: boolean;
}

function extractOptions(children: ComponentChildren): SelectOption[] {
  const options: SelectOption[] = [];
  const nodes = Array.isArray(children) ? children : [children];

  for (const node of nodes) {
    if (node && typeof node === 'object' && 'props' in node) {
      const vnode = node as VNode<Record<string, unknown>>;
      if (vnode.type === 'option') {
        const props = vnode.props as Record<string, unknown>;
        options.push({
          value: String(props.value ?? ''),
          label: String(
            typeof props.children === 'string'
              ? props.children
              : (props.value ?? ''),
          ),
        });
      }
    }
  }
  return options;
}

export default function Select({
  id,
  name,
  value,
  onChange,
  children,
  class: className,
  invalid = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const options = extractOptions(children);
  const selectedOption = options.find((o) => o.value === value);
  const selectedLabel = selectedOption?.label ?? options[0]?.label ?? '';

  const resolvedClassName =
    typeof className === 'string' ? className : undefined;

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange?.({ target: { value: optionValue } });
      setOpen(false);
    },
    [onChange],
  );

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusedIndex < 0 || !listRef.current) return;
    const items = listRef.current.children;
    if (items[focusedIndex]) {
      (items[focusedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, open]);

  function handleKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        const idx = options.findIndex((o) => o.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && options[focusedIndex]) {
          selectOption(options[focusedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  return (
    <div class="relative" ref={containerRef}>
      {/* Hidden native select for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={invalid || undefined}
        class={cn(
          'flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-border-input bg-input px-4 py-3 text-left text-sm text-text-primary transition-all duration-150 focus:border-accent/40 focus:ring-1 focus:ring-accent/30 focus:outline-none',
          open && 'border-accent/40 ring-1 ring-accent/30',
          invalid && 'border-danger/70',
          resolvedClassName,
        )}
        onClick={() => {
          setOpen(!open);
          if (!open) {
            const idx = options.findIndex((o) => o.value === value);
            setFocusedIndex(idx >= 0 ? idx : 0);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span class="truncate">{selectedLabel}</span>
        <svg
          class={cn(
            'ml-2 h-4 w-4 shrink-0 text-text-muted transition-transform duration-150',
            open && 'rotate-180',
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-[10px] border border-border-card bg-card py-1 shadow-lg shadow-black/40"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = index === focusedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                class={cn(
                  'flex cursor-pointer items-center px-4 py-2.5 text-sm transition-colors duration-100',
                  isSelected && !isFocused && 'text-accent',
                  isFocused && 'bg-accent/10 text-accent',
                  !isSelected && !isFocused && 'text-text-secondary',
                )}
                onClick={() => selectOption(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span class="truncate">{option.label}</span>
                {isSelected && (
                  <svg
                    class="ml-auto h-4 w-4 shrink-0 text-accent"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
