import { useLiteGeneratorState } from '@shared/state/use-lite-generator-state';
import { getTranslations } from '@shared/i18n';
import type { Locale } from '@shared/i18n';
import DerivationForm from './DerivationForm';
import SavedProfilesGrid from './SavedProfilesGrid';
import ResultPanel from './ResultPanel';
import GeneratorStatus from './GeneratorStatus';

interface Props {
  locale: Locale;
}

export default function LiteGeneratorIsland({ locale }: Props) {
  const state = useLiteGeneratorState();
  const t = getTranslations(locale);

  return (
    <div class="grid gap-8 xl:grid-cols-[1fr_380px] xl:items-start">
      {/* Left column */}
      <div class="space-y-0">
        <DerivationForm
          form={state.form}
          activeMode={state.activeMode}
          allowedModes={state.allowedModes}
          activePasswordPolicy={state.activePasswordPolicy}
          activePassphrasePolicy={state.activePassphrasePolicy}
          resolvedRequest={state.resolvedRequest}
          isSavingProfile={state.isSavingProfile}
          updateField={state.updateField}
          updateMode={state.updateMode}
          updatePasswordOption={state.updatePasswordOption}
          updatePassphraseOption={state.updatePassphraseOption}
          applyProfile={state.applyProfile}
          updateCalibrationProfileId={state.updateCalibrationProfileId}
          saveCurrentProfile={state.saveCurrentProfile}
          resetForm={state.resetForm}
          t={t}
        />
        <SavedProfilesGrid
          profiles={state.savedProfiles}
          loaded={state.profilesLoaded}
          onLoad={state.loadSavedProfileIntoForm}
          onDelete={state.deleteSavedProfile}
          t={t}
        />
      </div>

      {/* Right column - sticky */}
      <aside class="xl:sticky xl:top-6 space-y-4">
        <div id="result-panel">
          <ResultPanel
            result={state.result}
            isGenerating={state.isGenerating}
            derivationGuard={state.derivationGuard}
            onCopy={state.copyResultToClipboard}
            t={t}
          />
        </div>
        <GeneratorStatus
          result={state.result}
          statusMessage={state.statusMessage}
          derivationGuard={state.derivationGuard}
          derivationExecution={state.derivationExecution}
          resolvedRequest={state.resolvedRequest}
          t={t}
        />
      </aside>

      {/* Floating button — mobile only, visible when result exists */}
      {state.result ? (
        <button
          type="button"
          class="fixed bottom-6 right-6 z-50 xl:hidden btn-gradient rounded-full p-4 shadow-lg shadow-accent/20 animate-fade-in-up"
          onClick={() =>
            document
              .getElementById('result-panel')
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          aria-label={t.result.label}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
              fill="currentColor"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
