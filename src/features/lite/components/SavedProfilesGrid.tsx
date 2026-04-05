import type { Translations } from '@shared/i18n';
import type { StoredLiteProfileConfiguration } from '@shared/types/lite';

interface SavedProfilesGridProps {
  profiles: StoredLiteProfileConfiguration[];
  loaded: boolean;
  onLoad: (profile: StoredLiteProfileConfiguration) => void;
  onDelete: (id: string) => Promise<void>;
  t: Translations;
}

export default function SavedProfilesGrid({
  profiles,
  loaded,
  onLoad,
  onDelete,
  t,
}: SavedProfilesGridProps) {
  return (
    <div class="surface-card p-5 mt-5">
      {/* Header */}
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <div class="flex-1 min-w-0">
          <p class="label-mono">{t.profiles.label}</p>
        </div>
        <span class="rounded-full bg-ghost-bg text-text-muted text-[11px] px-2.5 py-1 font-medium shrink-0">
          {t.profiles.badge}
        </span>
      </div>

      {/* Grid or empty state */}
      {!loaded ? (
        <div class="flex items-center justify-center min-h-[88px]">
          <div class="flex items-center justify-center gap-2">
            <span
              class="inline-block w-2 h-2 rounded-full bg-text-dimmed animate-dot-pulse"
              style={{ animationDelay: '0ms' }}
            />
            <span
              class="inline-block w-2 h-2 rounded-full bg-text-dimmed animate-dot-pulse"
              style={{ animationDelay: '200ms' }}
            />
            <span
              class="inline-block w-2 h-2 rounded-full bg-text-dimmed animate-dot-pulse"
              style={{ animationDelay: '400ms' }}
            />
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <div class="flex flex-col items-center justify-center min-h-[88px]">
          <p class="text-text-dimmed text-sm">{t.profiles.empty}</p>
          <p class="text-text-dimmed text-xs mt-1">{t.profiles.emptyHint}</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profiles.map((profile, index) => {
            const modeLabel =
              profile.mode === 'password' ? 'password' : 'passphrase';
            const detailLabel =
              profile.options.mode === 'password'
                ? `${t.profiles.mode}: ${modeLabel} \u00b7 ${t.profiles.length}: ${profile.options.length} \u00b7 ${t.profiles.symbols}: ${profile.options.includeSymbols ? 'si' : 'no'}`
                : `${t.profiles.mode}: ${modeLabel} \u00b7 ${t.profiles.words}: ${profile.options.wordCount} \u00b7 sep "${profile.options.separator === ' ' ? 'espacio' : profile.options.separator}"`;

            return (
              <div
                key={profile.id}
                class="bg-input border border-border-subtle rounded-[12px] p-4 flex flex-col gap-2.5 transition-colors hover:border-ghost-border animate-fade-in-up"
                style={{
                  animationDelay: `${index * 75}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <p class="text-sm font-bold text-text-primary truncate">
                  {profile.label}
                </p>
                <p class="text-xs text-text-muted">{detailLabel}</p>
                <div class="flex justify-end gap-2 mt-auto">
                  <button
                    type="button"
                    class="bg-ghost-bg rounded-full px-3 py-1.5 text-[11px] font-semibold text-text-primary hover:bg-ghost-border/50 transition-colors"
                    onClick={() => onLoad(profile)}
                  >
                    {t.profiles.load}
                  </button>
                  <button
                    type="button"
                    class="bg-[#2A171B] text-danger rounded-full px-3 py-1.5 text-[11px] font-semibold hover:bg-[#3A1F25] transition-colors"
                    onClick={() => void onDelete(profile.id)}
                  >
                    {t.profiles.delete}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
