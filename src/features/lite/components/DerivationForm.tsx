import { useState } from 'preact/hooks';
import type { Translations } from '@shared/i18n';
import type {
  LiteArgon2CalibrationProfileId,
  LiteGeneratorFormValues,
  LiteGenerationMode,
  LitePasswordPolicy,
  LitePassphrasePolicy,
  LiteResolvedDerivationRequest,
  LitePasswordFormOptions,
  LitePassphraseFormOptions,
  LiteProfileId,
} from '@shared/types/lite';
import {
  calibrationProfileIds,
  getCalibrationLabel,
  suggestCalibrationProfileId,
} from '../domain/lite-argon2-calibration';
import Button from '@shared/ui/Button';
import Field from '@shared/ui/Field';
import Input from '@shared/ui/Input';
import Select from '@shared/ui/Select';

interface DerivationFormProps {
  t: Translations;
  form: LiteGeneratorFormValues;
  activeMode: LiteGenerationMode;
  allowedModes: LiteGenerationMode[];
  activePasswordPolicy: LitePasswordPolicy;
  activePassphrasePolicy: LitePassphrasePolicy | null;
  resolvedRequest: LiteResolvedDerivationRequest;
  isSavingProfile: boolean;
  updateField: <K extends keyof LiteGeneratorFormValues>(
    key: K,
    value: LiteGeneratorFormValues[K],
  ) => void;
  updateMode: (mode: LiteGenerationMode) => void;
  updatePasswordOption: (
    key: keyof LitePasswordFormOptions,
    value: number | boolean,
  ) => void;
  updatePassphraseOption: (
    key: keyof LitePassphraseFormOptions,
    value: number | string,
  ) => void;
  applyProfile: (profileId: LiteProfileId) => void;
  updateCalibrationProfileId: (id: LiteArgon2CalibrationProfileId) => void;
  saveCurrentProfile: () => Promise<void>;
  resetForm: () => void;
}

export default function DerivationForm({
  t,
  form,
  activeMode,
  allowedModes,
  activePasswordPolicy,
  activePassphrasePolicy,
  resolvedRequest,
  isSavingProfile,
  updateField,
  updateMode,
  updatePasswordOption,
  updatePassphraseOption,
  applyProfile,
  updateCalibrationProfileId,
  saveCurrentProfile,
  resetForm,
}: DerivationFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div class="surface-card p-4 sm:p-5 md:p-7">
      {/* Title row */}
      <div class="flex items-center gap-2.5 mb-6">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          class="text-accent shrink-0"
        >
          <path
            d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
            fill="currentColor"
          />
        </svg>
        <h2 class="font-headline text-[17px] font-bold text-text-primary">
          {t.form.title}
        </h2>
      </div>

      <form class="grid gap-6" onSubmit={(e) => e.preventDefault()}>
        {/* Row A: Master password */}
        <Field id="master-password" label={t.form.masterPassword}>
          <div class="relative">
            <Input
              autocomplete="off"
              id="master-password"
              name="masterPassword"
              onInput={(e) =>
                updateField(
                  'masterPassword',
                  (e.target as HTMLInputElement).value,
                )
              }
              placeholder={t.form.masterPlaceholder}
              type={showPassword ? 'text' : 'password'}
              value={form.masterPassword}
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? t.form.hidePassword : t.form.showPassword
              }
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          </div>
        </Field>

        {/* Row B: Service + Account */}
        <div class="grid grid-cols-2 gap-5">
          <Field id="service" label={t.form.service}>
            <Input
              id="service"
              name="service"
              onInput={(e) =>
                updateField('service', (e.target as HTMLInputElement).value)
              }
              placeholder={t.form.servicePlaceholder}
              value={form.service}
            />
          </Field>

          <Field id="account" label={t.form.account}>
            <Input
              id="account"
              name="account"
              onInput={(e) =>
                updateField('account', (e.target as HTMLInputElement).value)
              }
              placeholder={t.form.accountPlaceholder}
              value={form.account}
            />
          </Field>
        </div>

        {/* Row C: Namespace + Version */}
        <div class="grid grid-cols-[1fr_auto] gap-5">
          <Field id="namespace" label={t.form.namespace}>
            <Input
              id="namespace"
              name="namespace"
              onInput={(e) =>
                updateField('namespace', (e.target as HTMLInputElement).value)
              }
              placeholder={t.form.namespacePlaceholder}
              value={form.namespace}
            />
          </Field>

          <div class="w-20">
            <Field id="version" label={t.form.version}>
              <Input
                id="version"
                min={1}
                name="version"
                onInput={(e) =>
                  updateField(
                    'version',
                    Number((e.target as HTMLInputElement).value) || 1,
                  )
                }
                type="number"
                value={form.version}
              />
            </Field>
          </div>
        </div>

        {/* Row D: Profile + Calibration */}
        <div class="grid gap-5 sm:grid-cols-2">
          <Field id="profile" label={t.form.profile} hint={t.form.profileHint}>
            <Select
              id="profile"
              name="profile"
              onChange={(e) =>
                applyProfile(
                  (e.target as HTMLSelectElement).value as LiteProfileId,
                )
              }
              value={form.profileId}
            >
              <option value="web">{t.form.profileWeb}</option>
              <option value="banking">{t.form.profileBanking}</option>
              <option value="legacy">{t.form.profileLegacy}</option>
            </Select>
          </Field>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="label-mono" for="calibration">
                {t.form.calibration}
              </label>
              <button
                type="button"
                class="flex items-center gap-1 text-text-muted transition-colors hover:text-accent"
                onClick={() =>
                  updateCalibrationProfileId(suggestCalibrationProfileId())
                }
                aria-label={t.form.calibrationAutoLabel}
                title={t.form.calibrationAutoLabel}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a.9959.9959 0 00-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35z"
                    fill="currentColor"
                  />
                </svg>
                <span class="text-[10px] font-medium uppercase tracking-wider">
                  Auto
                </span>
              </button>
            </div>
            <Select
              id="calibration"
              name="calibration"
              onChange={(e) =>
                updateCalibrationProfileId(
                  (e.target as HTMLSelectElement)
                    .value as LiteArgon2CalibrationProfileId,
                )
              }
              value={form.calibrationProfileId}
            >
              {calibrationProfileIds.map((id) => (
                <option value={id} key={id}>
                  {getCalibrationLabel(id)}
                </option>
              ))}
            </Select>
            <p class="text-[11px] text-text-dimmed leading-5">
              {t.form.calibrationHint}
            </p>
          </div>
        </div>

        {/* Options row — keyed to force clean remount on mode switch */}
        {activeMode === 'password' ? (
          <div key="opts-password" class="grid gap-5 md:grid-cols-2">
            <div class="flex flex-col gap-4">
              <Field id="mode" label={t.form.mode} hint={t.form.modeHint}>
                <Select
                  id="mode"
                  name="mode"
                  onChange={(e) =>
                    updateMode(
                      (e.target as HTMLSelectElement)
                        .value as LiteGenerationMode,
                    )
                  }
                  value={activeMode}
                >
                  {allowedModes.map((mode) => (
                    <option value={mode} key={mode}>
                      {mode === 'password'
                        ? t.form.modePassword
                        : t.form.modePassphrase}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field id="length" label={t.form.length}>
                {(() => {
                  const lengths = activePasswordPolicy.allowedLengths;
                  const currentLength =
                    resolvedRequest.options.mode === 'password'
                      ? resolvedRequest.options.length
                      : form.password.length;
                  const currentIndex = lengths.indexOf(currentLength);
                  const sliderIndex = currentIndex >= 0 ? currentIndex : 0;

                  return (
                    <div class="flex items-center gap-3">
                      <input
                        id="length"
                        type="range"
                        min={0}
                        max={lengths.length - 1}
                        step={1}
                        value={sliderIndex}
                        onInput={(e) => {
                          const idx = Number(
                            (e.target as HTMLInputElement).value,
                          );
                          updatePasswordOption('length', lengths[idx]);
                        }}
                        class="range-slider flex-1"
                      />
                      <span class="label-mono-accent w-8 text-center text-sm">
                        {currentLength}
                      </span>
                    </div>
                  );
                })()}
              </Field>
            </div>

            <div class="flex h-full min-h-0">
              <div class="flex w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-border-input bg-input p-5">
                <label class="flex cursor-pointer select-none items-center gap-3 text-sm text-text-primary">
                  <input
                    checked={
                      resolvedRequest.options.mode === 'password'
                        ? resolvedRequest.options.includeSymbols
                        : form.password.includeSymbols
                    }
                    disabled={!activePasswordPolicy.allowSymbols}
                    onChange={(e) =>
                      updatePasswordOption(
                        'includeSymbols',
                        (e.target as HTMLInputElement).checked,
                      )
                    }
                    type="checkbox"
                    class="h-4 w-4 accent-accent"
                  />
                  <span>
                    {activePasswordPolicy.allowSymbols
                      ? t.form.includeSymbols
                      : t.form.symbolsDisabled}
                  </span>
                </label>
                <p class="text-center text-xs text-text-muted">
                  {activePasswordPolicy.allowSymbols
                    ? t.form.symbolsHint
                    : t.form.symbolsDisabledHint}
                </p>
              </div>
            </div>
          </div>
        ) : activePassphrasePolicy ? (
          <div
            key="opts-passphrase"
            class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Field id="mode" label={t.form.mode} hint={t.form.modeHint}>
              <Select
                id="mode"
                name="mode"
                onChange={(e) =>
                  updateMode(
                    (e.target as HTMLSelectElement).value as LiteGenerationMode,
                  )
                }
                value={activeMode}
              >
                {allowedModes.map((mode) => (
                  <option value={mode} key={mode}>
                    {mode === 'password'
                      ? t.form.modePassword
                      : t.form.modePassphrase}
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="word-count" label={t.form.wordCount}>
              <Select
                id="word-count"
                name="wordCount"
                onChange={(e) =>
                  updatePassphraseOption(
                    'wordCount',
                    Number((e.target as HTMLSelectElement).value),
                  )
                }
                value={String(
                  resolvedRequest.options.mode === 'passphrase'
                    ? resolvedRequest.options.wordCount
                    : form.passphrase.wordCount,
                )}
              >
                {activePassphrasePolicy.allowedWordCounts.map((count) => (
                  <option value={String(count)} key={count}>
                    {count}
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="separator" label={t.form.separator}>
              <Select
                id="separator"
                name="separator"
                onChange={(e) =>
                  updatePassphraseOption(
                    'separator',
                    (e.target as HTMLSelectElement).value,
                  )
                }
                value={
                  resolvedRequest.options.mode === 'passphrase'
                    ? resolvedRequest.options.separator
                    : form.passphrase.separator
                }
              >
                {activePassphrasePolicy.allowedSeparators.map((sep) => (
                  <option value={sep} key={sep}>
                    {sep === ' ' ? t.form.separatorSpace : sep}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}

        {/* Actions row */}
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <Button onClick={resetForm} type="button" variant="ghost">
            {t.form.reset}
          </Button>
          <Button
            disabled={isSavingProfile || form.service.trim().length === 0}
            onClick={() => void saveCurrentProfile()}
            type="button"
            variant="primary"
          >
            {isSavingProfile ? t.form.saving : t.form.saveProfile}
          </Button>
        </div>
      </form>
    </div>
  );
}
