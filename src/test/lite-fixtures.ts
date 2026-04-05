import type {
  LiteGeneratorFormValues,
  LiteResolvedDerivationRequest,
} from '../shared/types/lite';
import { resolveLiteDerivationRequest } from '../shared/lib/lite-policy';

export function createLiteForm(
  overrides: Partial<LiteGeneratorFormValues> = {},
): LiteGeneratorFormValues {
  return {
    masterPassword: 'correct horse battery staple',
    service: 'Example Service',
    account: 'alice@example.com',
    namespace: 'personal',
    profileId: 'web',
    calibrationProfileId: 'balanced',
    version: 1,
    mode: 'password',
    password: {
      length: 20,
      includeSymbols: true,
    },
    passphrase: {
      wordCount: 4,
      separator: '-',
    },
    ...overrides,
  };
}

export function createResolvedRequest(
  overrides: Partial<LiteGeneratorFormValues> = {},
): LiteResolvedDerivationRequest {
  return resolveLiteDerivationRequest(createLiteForm(overrides));
}
