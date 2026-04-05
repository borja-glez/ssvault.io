import type { Translations } from '@shared/i18n';
import type {
  LiteDerivedSecretPreview,
  LiteDerivationExecution,
  LiteResolvedDerivationRequest,
} from '@shared/types/lite';

interface GeneratorStatusProps {
  result: LiteDerivedSecretPreview | null;
  statusMessage: string | null;
  derivationGuard: { canDerive: boolean; message: string };
  derivationExecution: LiteDerivationExecution | null;
  resolvedRequest: LiteResolvedDerivationRequest;
  t: Translations;
}

export default function GeneratorStatus({
  result,
  statusMessage,
  derivationGuard,
  derivationExecution,
  resolvedRequest,
  t,
}: GeneratorStatusProps) {
  return (
    <div class="bg-card border border-border-card rounded-[14px] p-4.5">
      {/* Header */}
      <div class="flex items-center gap-2.5 mb-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          class="text-text-primary shrink-0"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            fill="currentColor"
          />
        </svg>
        <p class="label-mono">{t.status.label}</p>
      </div>

      {/* Status text */}
      <p class="text-sm text-text-secondary leading-relaxed">
        {statusMessage ?? derivationGuard.message}
      </p>

      {/* Visual fingerprint */}
      {result?.visualFingerprint ? (
        <div class="mt-4 flex items-center gap-3">
          {result.visualFingerprint.palette.map((color) => (
            <span
              key={color}
              class="inline-block w-6 h-6 rounded-full border border-border-subtle"
              style={{ backgroundColor: color }}
            />
          ))}
          <span class="text-xs text-text-muted ml-1">
            {result.visualFingerprint.label}
          </span>
        </div>
      ) : null}

      {/* Runtime info */}
      {derivationExecution ? (
        <p class="mt-3 text-xs text-text-dimmed">
          {t.status.runtime}:{' '}
          {derivationExecution.runtime === 'worker' ? 'Worker' : 'Main thread'}{' '}
          · {t.status.calibration}: {derivationExecution.calibration.label}
        </p>
      ) : null}

      {/* Canonical ID */}
      {derivationGuard.canDerive ? (
        <div class="mt-3">
          <p class="label-mono mb-1.5">{t.status.canonicalId}</p>
          <p class="text-[11px] font-mono text-text-muted break-all leading-relaxed bg-well rounded-lg px-3 py-2 border border-border-subtle">
            {resolvedRequest.canonicalService.canonicalId}
          </p>
        </div>
      ) : null}

      {/* Derivation details link */}
      <div class="mt-4">
        <a
          href="/details"
          class="text-accent text-xs font-bold hover:underline"
        >
          {t.status.detailsLink} &#8599;
        </a>
      </div>
    </div>
  );
}
