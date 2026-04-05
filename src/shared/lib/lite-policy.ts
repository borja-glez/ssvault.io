import { defaultLiteProfile, liteProfiles } from '../config/lite-profiles';
import type {
  LiteGenerationMode,
  LiteGeneratorFormValues,
  LitePassphrasePolicy,
  LitePasswordPolicy,
  LiteProfileDefinition,
  LiteProfileId,
  LiteResolvedDerivationRequest,
} from '../types/lite';
import { canonicalizeServiceIdentifier } from './canonical-service';

function ensureAllowedNumber(
  value: number,
  allowedValues: number[],
  fallback: number,
) {
  return allowedValues.includes(value) ? value : fallback;
}

export function getLiteProfile(
  profileId: LiteProfileId,
): LiteProfileDefinition {
  return (
    liteProfiles.find((profile) => profile.id === profileId) ??
    defaultLiteProfile
  );
}

export function getAllowedModes(
  profile: LiteProfileDefinition,
): LiteGenerationMode[] {
  return profile.supportedModes;
}

export function resolveLiteMode(
  profile: LiteProfileDefinition,
  requestedMode: LiteGenerationMode,
): LiteGenerationMode {
  return profile.supportedModes.includes(requestedMode)
    ? requestedMode
    : profile.recommendedMode;
}

export function getPasswordPolicy(
  profile: LiteProfileDefinition,
): LitePasswordPolicy {
  return profile.policies.password ?? defaultLiteProfile.policies.password!;
}

export function getPassphrasePolicy(
  profile: LiteProfileDefinition,
): LitePassphrasePolicy | null {
  return profile.policies.passphrase ?? null;
}

export function resolveLiteDerivationRequest(
  form: LiteGeneratorFormValues,
): LiteResolvedDerivationRequest {
  const profile = getLiteProfile(form.profileId);
  const mode = resolveLiteMode(profile, form.mode);

  const canonicalService = canonicalizeServiceIdentifier({
    service: form.service,
    account: form.account || undefined,
    namespace: form.namespace || undefined,
    profileId: profile.id,
    calibrationProfileId: form.calibrationProfileId,
    mode,
    version: form.version,
  });

  if (mode === 'passphrase') {
    const policy = getPassphrasePolicy(profile);

    if (!policy) {
      const passwordPolicy = getPasswordPolicy(profile);

      return {
        masterPassword: form.masterPassword,
        profile,
        calibrationProfileId: form.calibrationProfileId,
        canonicalService,
        options: {
          mode: 'password',
          length: ensureAllowedNumber(
            form.password.length,
            passwordPolicy.allowedLengths,
            passwordPolicy.defaultLength,
          ),
          includeSymbols: passwordPolicy.allowSymbols
            ? form.password.includeSymbols
            : false,
        },
      };
    }

    return {
      masterPassword: form.masterPassword,
      profile,
      calibrationProfileId: form.calibrationProfileId,
      canonicalService,
      options: {
        mode: 'passphrase',
        wordCount: ensureAllowedNumber(
          form.passphrase.wordCount,
          policy.allowedWordCounts,
          policy.defaultWordCount,
        ),
        separator: policy.allowedSeparators.includes(form.passphrase.separator)
          ? form.passphrase.separator
          : policy.defaultSeparator,
      },
    };
  }

  const policy = getPasswordPolicy(profile);

  return {
    masterPassword: form.masterPassword,
    profile,
    calibrationProfileId: form.calibrationProfileId,
    canonicalService,
    options: {
      mode: 'password',
      length: ensureAllowedNumber(
        form.password.length,
        policy.allowedLengths,
        policy.defaultLength,
      ),
      includeSymbols: policy.allowSymbols
        ? form.password.includeSymbols
        : false,
    },
  };
}
