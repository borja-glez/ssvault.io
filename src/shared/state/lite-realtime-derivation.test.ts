import { describe, expect, it } from 'vitest';
import {
  createLiteDerivationIntentSignature,
  getLiteRealtimeDerivationGuard,
} from './lite-realtime-derivation';

const baseForm = {
  masterPassword: 'horse battery staple',
  service: 'github',
  account: '',
  namespace: '',
  profileId: 'web' as const,
  calibrationProfileId: 'balanced' as const,
  version: 1,
  mode: 'password' as const,
  password: {
    length: 20,
    includeSymbols: true,
  },
  passphrase: {
    wordCount: 4,
    separator: '-' as const,
  },
};

describe('getLiteRealtimeDerivationGuard', () => {
  it('bloquea la derivación cuando faltan ambos datos mínimos', () => {
    expect(
      getLiteRealtimeDerivationGuard({
        ...baseForm,
        masterPassword: '   ',
        service: '   ',
      }),
    ).toEqual({
      canDerive: false,
      message:
        'Introduce tu master password y el servicio para derivar al instante.',
    });
  });

  it('permite derivar cuando master password y servicio están presentes', () => {
    expect(getLiteRealtimeDerivationGuard(baseForm)).toEqual({
      canDerive: true,
      message: 'Calculando derivación local…',
    });
  });
});

describe('createLiteDerivationIntentSignature', () => {
  it('cambia la firma cuando cambia una opción relevante de derivación', () => {
    const currentSignature = createLiteDerivationIntentSignature(baseForm);
    const nextSignature = createLiteDerivationIntentSignature({
      ...baseForm,
      password: {
        ...baseForm.password,
        includeSymbols: false,
      },
    });

    expect(nextSignature).not.toBe(currentSignature);
  });
});
