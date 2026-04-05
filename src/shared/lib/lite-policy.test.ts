import { describe, expect, it } from 'vitest';
import { defaultLiteProfile } from '../config/lite-profiles';
import { createLiteForm } from '../../test/lite-fixtures';
import {
  getAllowedModes,
  getLiteProfile,
  resolveLiteDerivationRequest,
  resolveLiteMode,
} from './lite-policy';

describe('lite-policy', () => {
  it('devuelve el perfil por defecto si el id no existe en runtime', () => {
    expect(getLiteProfile('unknown' as never)).toBe(defaultLiteProfile);
  });

  it('resuelve el modo recomendado cuando el perfil no soporta el solicitado', () => {
    const profile = getLiteProfile('banking');

    expect(getAllowedModes(profile)).toEqual(['password']);
    expect(resolveLiteMode(profile, 'passphrase')).toBe('password');
  });

  it('normaliza opciones password fuera de política', () => {
    const request = resolveLiteDerivationRequest(
      createLiteForm({
        profileId: 'legacy',
        mode: 'password',
        password: {
          length: 99,
          includeSymbols: true,
        },
      }),
    );

    expect(request.options).toEqual({
      mode: 'password',
      length: 16,
      includeSymbols: false,
    });
    expect(request.canonicalService.parts.profileId).toBe('legacy');
    expect(request.canonicalService.parts.mode).toBe('password');
  });

  it('degrada passphrase a password cuando el perfil no la admite', () => {
    const request = resolveLiteDerivationRequest(
      createLiteForm({
        profileId: 'banking',
        mode: 'passphrase',
        password: {
          length: 28,
          includeSymbols: true,
        },
      }),
    );

    expect(request.options).toEqual({
      mode: 'password',
      length: 28,
      includeSymbols: true,
    });
    expect(request.canonicalService.parts.mode).toBe('password');
  });

  it('mantiene passphrase válida y corrige separador no permitido', () => {
    const request = resolveLiteDerivationRequest(
      createLiteForm({
        profileId: 'web',
        mode: 'passphrase',
        passphrase: {
          wordCount: 6,
          separator: ' ' as never,
        },
      }),
    );

    expect(request.options).toEqual({
      mode: 'passphrase',
      wordCount: 6,
      separator: '-',
    });
    expect(request.canonicalService.parts.mode).toBe('passphrase');
  });
});
