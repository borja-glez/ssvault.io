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
        <ResultPanel
          result={state.result}
          isGenerating={state.isGenerating}
          derivationGuard={state.derivationGuard}
          onCopy={state.copyResultToClipboard}
          t={t}
        />
        <GeneratorStatus
          result={state.result}
          statusMessage={state.statusMessage}
          derivationGuard={state.derivationGuard}
          derivationExecution={state.derivationExecution}
          resolvedRequest={state.resolvedRequest}
          t={t}
        />
      </aside>
    </div>
  );
}
