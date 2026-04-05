import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { defaultLiteProfile } from '../config/lite-profiles';
import {
  resolveLiteDerivationRequest,
  getAllowedModes,
  getLiteProfile,
  getPassphrasePolicy,
  getPasswordPolicy,
  resolveLiteMode,
} from '../lib/lite-policy';
import {
  deleteStoredLiteProfile,
  listStoredLiteProfiles,
  upsertStoredLiteProfile,
} from '../lib/storage/lite-profile-store';
import type {
  LiteArgon2CalibrationProfileId,
  LiteDerivationExecution,
  LiteDerivedSecretPreview,
  LiteGenerationMode,
  LiteGeneratorFormValues,
  LiteProfileId,
  StoredLiteProfileConfiguration,
} from '../types/lite';
import { liteDerivationEngine } from '../../features/lite/domain/lite-derivation-engine';
import {
  createLiteDerivationIntentSignature,
  getLiteRealtimeDerivationGuard,
  REALTIME_DERIVATION_DEBOUNCE_MS,
} from './lite-realtime-derivation';

const CLIPBOARD_CLEANUP_DELAY_MS = 45_000;

const DEFAULT_FORM: LiteGeneratorFormValues = {
  masterPassword: '',
  service: '',
  account: '',
  namespace: '',
  profileId: defaultLiteProfile.id,
  calibrationProfileId: 'balanced',
  version: 1,
  mode: defaultLiteProfile.recommendedMode,
  password: {
    length: defaultLiteProfile.policies.password!.defaultLength,
    includeSymbols: defaultLiteProfile.policies.password!.defaultIncludeSymbols,
  },
  passphrase: {
    wordCount: defaultLiteProfile.policies.passphrase!.defaultWordCount,
    separator: defaultLiteProfile.policies.passphrase!.defaultSeparator,
  },
};

export function useLiteGeneratorState() {
  const [form, setForm] = useState<LiteGeneratorFormValues>(DEFAULT_FORM);
  const [result, setResult] = useState<LiteDerivedSecretPreview | null>(null);
  const [derivationExecution, setDerivationExecution] =
    useState<LiteDerivationExecution | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<
    StoredLiteProfileConfiguration[]
  >([]);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const clipboardCleanupTimeoutRef = useRef<number | null>(null);
  const derivationTimeoutRef = useRef<number | null>(null);
  const derivationVersionRef = useRef(0);
  const latestDerivedSignatureRef = useRef<string | null>(null);

  const activeProfile = useMemo(
    () => getLiteProfile(form.profileId),
    [form.profileId],
  );
  const activeMode = useMemo(
    () => resolveLiteMode(activeProfile, form.mode),
    [activeProfile, form.mode],
  );
  const allowedModes = useMemo(
    () => getAllowedModes(activeProfile),
    [activeProfile],
  );
  const activePasswordPolicy = useMemo(
    () => getPasswordPolicy(activeProfile),
    [activeProfile],
  );
  const activePassphrasePolicy = useMemo(
    () => getPassphrasePolicy(activeProfile),
    [activeProfile],
  );
  const resolvedRequest = useMemo(
    () => resolveLiteDerivationRequest(form),
    [form],
  );
  const derivationGuard = useMemo(
    () => getLiteRealtimeDerivationGuard(form),
    [form],
  );
  const derivationIntentSignature = useMemo(
    () => createLiteDerivationIntentSignature(form),
    [form],
  );

  useEffect(
    () => () => {
      if (clipboardCleanupTimeoutRef.current !== null) {
        window.clearTimeout(clipboardCleanupTimeoutRef.current);
      }

      if (derivationTimeoutRef.current !== null) {
        window.clearTimeout(derivationTimeoutRef.current);
      }
    },
    [],
  );

  async function loadSavedProfiles() {
    try {
      const profiles = await listStoredLiteProfiles();
      setSavedProfiles(profiles);
    } catch {
      // IndexedDB may not be available in all contexts
    } finally {
      setProfilesLoaded(true);
    }
  }

  useEffect(() => {
    void loadSavedProfiles();
  }, []);

  useEffect(() => {
    if (derivationTimeoutRef.current !== null) {
      window.clearTimeout(derivationTimeoutRef.current);
      derivationTimeoutRef.current = null;
    }

    if (!derivationGuard.canDerive) {
      derivationVersionRef.current += 1;
      latestDerivedSignatureRef.current = null;
      setIsGenerating(false);
      setResult(null);
      setDerivationExecution(null);
      setStatusMessage(derivationGuard.message);
      return;
    }

    if (latestDerivedSignatureRef.current === derivationIntentSignature) {
      return;
    }

    const requestVersion = derivationVersionRef.current + 1;
    derivationVersionRef.current = requestVersion;
    setIsGenerating(true);
    setResult(null);
    setDerivationExecution(null);
    setStatusMessage('Calculando derivación local…');

    derivationTimeoutRef.current = window.setTimeout(() => {
      void (async () => {
        try {
          const { preview, execution } =
            await liteDerivationEngine.derive(resolvedRequest);

          if (derivationVersionRef.current !== requestVersion) {
            return;
          }

          latestDerivedSignatureRef.current = derivationIntentSignature;
          setResult(preview);
          setDerivationExecution(execution);
          setStatusMessage(execution.message);
        } catch (error) {
          if (derivationVersionRef.current !== requestVersion) {
            return;
          }

          latestDerivedSignatureRef.current = null;
          setResult(null);
          setDerivationExecution(null);
          setStatusMessage(
            error instanceof Error
              ? error.message
              : 'No se pudo derivar el resultado local.',
          );
        } finally {
          if (derivationVersionRef.current === requestVersion) {
            setIsGenerating(false);
          }
        }
      })();
    }, REALTIME_DERIVATION_DEBOUNCE_MS);

    return () => {
      if (derivationTimeoutRef.current !== null) {
        window.clearTimeout(derivationTimeoutRef.current);
        derivationTimeoutRef.current = null;
      }
    };
  }, [derivationGuard, derivationIntentSignature, resolvedRequest]);

  function updateField<Key extends keyof LiteGeneratorFormValues>(
    key: Key,
    value: LiteGeneratorFormValues[Key],
  ) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function updateMode(mode: LiteGenerationMode) {
    const nextMode = resolveLiteMode(activeProfile, mode);
    setForm((currentForm) => ({ ...currentForm, mode: nextMode }));
  }

  function updatePasswordOption(
    key: keyof LiteGeneratorFormValues['password'],
    value: number | boolean,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      password: {
        ...currentForm.password,
        [key]: value,
      },
    }));
  }

  function updatePassphraseOption(
    key: keyof LiteGeneratorFormValues['passphrase'],
    value: number | string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      passphrase: {
        ...currentForm.passphrase,
        [key]: value,
      },
    }));
  }

  function applyProfile(profileId: LiteProfileId) {
    const nextProfile = getLiteProfile(profileId);
    const nextMode = resolveLiteMode(nextProfile, form.mode);
    const nextPasswordPolicy = getPasswordPolicy(nextProfile);
    const nextPassphrasePolicy = getPassphrasePolicy(nextProfile);

    setForm((currentForm) => ({
      ...currentForm,
      profileId: nextProfile.id,
      mode: nextMode,
      password: {
        length: nextPasswordPolicy.defaultLength,
        includeSymbols: nextPasswordPolicy.defaultIncludeSymbols,
      },
      passphrase: nextPassphrasePolicy
        ? {
            wordCount: nextPassphrasePolicy.defaultWordCount,
            separator: nextPassphrasePolicy.defaultSeparator,
          }
        : currentForm.passphrase,
    }));

    setStatusMessage(`Perfil activo: ${nextProfile.name}.`);
  }

  async function copyResultToClipboard() {
    if (!result) {
      setStatusMessage('Espera a que exista un resultado antes de copiar.');
      return;
    }

    if (!globalThis.navigator?.clipboard) {
      setStatusMessage('Clipboard API no disponible en este navegador.');
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(result.value);

      if (clipboardCleanupTimeoutRef.current !== null) {
        window.clearTimeout(clipboardCleanupTimeoutRef.current);
      }

      clipboardCleanupTimeoutRef.current = window.setTimeout(() => {
        void (async () => {
          try {
            const clipboardValue =
              await globalThis.navigator.clipboard.readText();

            if (clipboardValue === result.value) {
              await globalThis.navigator.clipboard.writeText('');
            }
          } catch {
            // Best effort: algunos navegadores exigen gesto del usuario también para limpiar.
          }
        })();
      }, CLIPBOARD_CLEANUP_DELAY_MS);

      setStatusMessage(
        'Resultado copiado. Se intentará limpiar el portapapeles en 45 segundos si el navegador lo permite.',
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo copiar el resultado al portapapeles.',
      );
    }
  }

  async function saveCurrentProfile() {
    setIsSavingProfile(true);
    setStatusMessage(null);

    try {
      await upsertStoredLiteProfile({
        id: resolvedRequest.canonicalService.canonicalId,
        label: [
          form.service || 'Servicio pendiente',
          form.account || 'cuenta principal',
          activeProfile.name,
        ].join(' / '),
        canonicalService: resolvedRequest.canonicalService,
        profileId: resolvedRequest.profile.id,
        calibrationProfileId: form.calibrationProfileId,
        mode: resolvedRequest.options.mode,
        options: resolvedRequest.options,
        updatedAt: new Date().toISOString(),
      });

      setStatusMessage('Configuración no secreta guardada en IndexedDB.');
      await loadSavedProfiles();
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el perfil local.',
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function deleteSavedProfile(id: string) {
    try {
      await deleteStoredLiteProfile(id);
      await loadSavedProfiles();
      setStatusMessage('Perfil eliminado.');
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el perfil.',
      );
    }
  }

  function loadSavedProfileIntoForm(profile: StoredLiteProfileConfiguration) {
    const service = profile.canonicalService.raw.service ?? '';
    const account = profile.canonicalService.raw.account ?? '';
    const namespace = profile.canonicalService.raw.namespace ?? '';

    setForm((currentForm) => ({
      ...currentForm,
      service,
      account,
      namespace,
      profileId: profile.profileId,
      calibrationProfileId:
        profile.calibrationProfileId ?? currentForm.calibrationProfileId,
      mode: profile.mode,
      password:
        profile.options.mode === 'password'
          ? {
              length: profile.options.length,
              includeSymbols: profile.options.includeSymbols,
            }
          : currentForm.password,
      passphrase:
        profile.options.mode === 'passphrase'
          ? {
              wordCount: profile.options.wordCount,
              separator: profile.options.separator,
            }
          : currentForm.passphrase,
    }));

    setStatusMessage(`Perfil cargado: ${profile.label}`);
  }

  function updateCalibrationProfileId(
    calibrationProfileId: LiteArgon2CalibrationProfileId,
  ) {
    setForm((currentForm) => ({ ...currentForm, calibrationProfileId }));
  }

  function resetForm() {
    setForm(DEFAULT_FORM);
    latestDerivedSignatureRef.current = null;
    setResult(null);
    setDerivationExecution(null);
    setIsGenerating(false);
    setStatusMessage(
      'Introduce tu master password y el servicio para derivar al instante.',
    );
  }

  return {
    form,
    result,
    derivationExecution,
    activeProfile,
    activeMode,
    allowedModes,
    activePasswordPolicy,
    activePassphrasePolicy,
    resolvedRequest,
    isGenerating,
    isSavingProfile,
    statusMessage,
    updateField,
    updateMode,
    updatePasswordOption,
    updatePassphraseOption,
    applyProfile,
    updateCalibrationProfileId,
    copyResultToClipboard,
    saveCurrentProfile,
    resetForm,
    derivationGuard,
    savedProfiles,
    profilesLoaded,
    deleteSavedProfile,
    loadSavedProfileIntoForm,
  };
}
