import type { LiteGeneratorFormValues } from '../types/lite';

export const REALTIME_DERIVATION_DEBOUNCE_MS = 450;

export interface LiteRealtimeDerivationGuard {
  canDerive: boolean;
  message: string;
}

export function getLiteRealtimeDerivationGuard(
  form: LiteGeneratorFormValues,
): LiteRealtimeDerivationGuard {
  const hasMasterPassword = form.masterPassword.trim().length > 0;
  const hasService = form.service.trim().length > 0;

  if (!hasMasterPassword && !hasService) {
    return {
      canDerive: false,
      message:
        'Introduce tu master password y el servicio para derivar al instante.',
    };
  }

  if (!hasMasterPassword) {
    return {
      canDerive: false,
      message: 'Introduce tu master password para derivar el resultado.',
    };
  }

  if (!hasService) {
    return {
      canDerive: false,
      message: 'Introduce el servicio para derivar el resultado.',
    };
  }

  return {
    canDerive: true,
    message: 'Calculando derivación local…',
  };
}

export function createLiteDerivationIntentSignature(
  form: LiteGeneratorFormValues,
) {
  return JSON.stringify({
    masterPassword: form.masterPassword,
    service: form.service,
    account: form.account,
    namespace: form.namespace,
    profileId: form.profileId,
    calibrationProfileId: form.calibrationProfileId,
    version: form.version,
    mode: form.mode,
    password: form.password,
    passphrase: form.passphrase,
  });
}
