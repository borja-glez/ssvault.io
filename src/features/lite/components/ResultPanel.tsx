import { useEffect, useRef, useState } from 'preact/hooks';
import type { Translations } from '@shared/i18n';
import type { LiteDerivedSecretPreview } from '@shared/types/lite';

interface ResultPanelProps {
  result: LiteDerivedSecretPreview | null;
  isGenerating: boolean;
  derivationGuard: { canDerive: boolean; message: string };
  onCopy: () => Promise<void>;
  t: Translations;
}

export default function ResultPanel({
  result,
  isGenerating,
  onCopy,
  t,
}: ResultPanelProps) {
  const prevResultRef = useRef<LiteDerivedSecretPreview | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (result && !prevResultRef.current) {
      setAnimKey((k) => k + 1);
    }
    prevResultRef.current = result;
  }, [result]);

  // Hide again when result changes
  useEffect(() => {
    setRevealed(false);
  }, [result?.value]);

  const maskedValue = result
    ? '\u25CF'.repeat(Math.min(result.value.length, 24))
    : null;

  return (
    <div class="surface-card p-5 overflow-hidden">
      {/* Top accent gradient */}
      <div class="h-[2px] bg-linear-to-r from-accent/30 via-accent/10 to-transparent -mx-5 -mt-5 mb-5" />

      {/* Header */}
      <div class="flex items-center justify-between mb-4">
        <p class="label-mono-accent">{t.result.label}</p>
        <button
          type="button"
          class="text-text-muted hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!result}
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? t.result.hidePassword : t.result.showPassword}
        >
          {revealed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Result display well */}
      <div class="bg-well rounded-[14px] border border-border-subtle p-5 min-h-[80px] flex items-center justify-center">
        {isGenerating ? (
          <div class="flex items-center gap-2">
            <span
              class="inline-block w-3 h-3 rounded-full bg-accent animate-dot-pulse"
              style={{ animationDelay: '0ms' }}
            />
            <span
              class="inline-block w-3 h-3 rounded-full bg-accent animate-dot-pulse"
              style={{ animationDelay: '200ms' }}
            />
            <span
              class="inline-block w-3 h-3 rounded-full bg-accent animate-dot-pulse"
              style={{ animationDelay: '400ms' }}
            />
          </div>
        ) : result ? (
          <p
            key={animKey}
            class={`text-sm font-mono animate-fade-in-up break-all text-center sm:text-base lg:text-lg ${revealed ? 'text-accent tracking-[1px] sm:tracking-[2px]' : 'text-accent tracking-[3px] sm:tracking-[6px]'}`}
          >
            {revealed ? result.value : maskedValue}
          </p>
        ) : (
          <p class="text-text-dimmed text-sm text-center">
            {t.result.placeholder}
          </p>
        )}
      </div>

      {/* Copy button */}
      <button
        type="button"
        class="btn-gradient rounded-button py-4 text-sm font-semibold w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!result}
        onClick={() => void onCopy()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
            fill="currentColor"
          />
        </svg>
        {t.result.copy}
      </button>
    </div>
  );
}
