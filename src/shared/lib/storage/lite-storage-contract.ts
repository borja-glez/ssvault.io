import type {
  CanonicalServiceIdentifier,
  LiteArgon2CalibrationProfileId,
  LiteConfigurationExportEnvelope,
  LiteLocalPreferences,
  LiteProfileId,
  LiteResolvedModeOptions,
  PassphraseSeparator,
  StoredLiteProfileConfiguration,
} from '../../types/lite';

export const LITE_PREFERENCES_STORAGE_KEY = 'ssvault-lite-preferences';
export const LITE_DATABASE_NAME = 'ssvault-lite';
export const LITE_DATABASE_VERSION = 1;
export const LITE_PROFILES_STORE_NAME = 'profiles';

const VALID_PROFILE_IDS = new Set<LiteProfileId>(['web', 'banking', 'legacy']);
const VALID_CALIBRATION_IDS = new Set<LiteArgon2CalibrationProfileId>([
  'constrained',
  'balanced',
  'strong',
  'max',
]);
const VALID_MODES = new Set(['password', 'passphrase']);
const VALID_SEPARATORS = new Set<PassphraseSeparator>(['-', '.', ' ']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isValidProfileId(value: unknown): value is LiteProfileId {
  return (
    typeof value === 'string' && VALID_PROFILE_IDS.has(value as LiteProfileId)
  );
}

function isValidCalibrationId(
  value: unknown,
): value is LiteArgon2CalibrationProfileId {
  return (
    typeof value === 'string' &&
    VALID_CALIBRATION_IDS.has(value as LiteArgon2CalibrationProfileId)
  );
}

function isValidMode(value: unknown): value is 'password' | 'passphrase' {
  return typeof value === 'string' && VALID_MODES.has(value);
}

function isValidSeparator(value: unknown): value is PassphraseSeparator {
  return (
    typeof value === 'string' &&
    VALID_SEPARATORS.has(value as PassphraseSeparator)
  );
}

function sanitizeOptions(value: unknown): LiteResolvedModeOptions | null {
  if (!isRecord(value) || !isValidMode(value.mode)) {
    return null;
  }

  if (value.mode === 'password') {
    if (
      !isPositiveInteger(value.length) ||
      typeof value.includeSymbols !== 'boolean'
    ) {
      return null;
    }

    return {
      mode: 'password',
      length: value.length,
      includeSymbols: value.includeSymbols,
    };
  }

  if (
    !isPositiveInteger(value.wordCount) ||
    !isValidSeparator(value.separator)
  ) {
    return null;
  }

  return {
    mode: 'passphrase',
    wordCount: value.wordCount,
    separator: value.separator,
  };
}

function sanitizeCanonicalService(
  value: unknown,
): CanonicalServiceIdentifier | null {
  if (!isRecord(value) || !isRecord(value.raw) || !isRecord(value.parts)) {
    return null;
  }

  const { raw, parts } = value;

  if (
    typeof raw.service !== 'string' ||
    (raw.account !== undefined && typeof raw.account !== 'string') ||
    (raw.namespace !== undefined && typeof raw.namespace !== 'string') ||
    typeof parts.service !== 'string' ||
    (parts.account !== undefined && typeof parts.account !== 'string') ||
    (parts.namespace !== undefined && typeof parts.namespace !== 'string') ||
    !isValidProfileId(parts.profileId) ||
    !isValidCalibrationId(parts.calibrationProfileId) ||
    !isValidMode(parts.mode) ||
    !isPositiveInteger(parts.version) ||
    typeof value.canonicalId !== 'string'
  ) {
    return null;
  }

  return {
    raw: {
      service: raw.service,
      account: raw.account,
      namespace: raw.namespace,
    },
    parts: {
      service: parts.service as CanonicalServiceIdentifier['parts']['service'],
      account: parts.account as CanonicalServiceIdentifier['parts']['account'],
      namespace:
        parts.namespace as CanonicalServiceIdentifier['parts']['namespace'],
      profileId: parts.profileId,
      calibrationProfileId: parts.calibrationProfileId,
      mode: parts.mode,
      version: parts.version,
    },
    canonicalId: value.canonicalId as CanonicalServiceIdentifier['canonicalId'],
  };
}

export function sanitizeLitePreferences(
  value: unknown,
): LiteLocalPreferences | null {
  if (
    !isRecord(value) ||
    !isValidProfileId(value.profileId) ||
    !isValidMode(value.mode)
  ) {
    return null;
  }

  if (
    !isRecord(value.password) ||
    !isPositiveInteger(value.password.length) ||
    typeof value.password.includeSymbols !== 'boolean' ||
    !isRecord(value.passphrase) ||
    !isPositiveInteger(value.passphrase.wordCount) ||
    !isValidSeparator(value.passphrase.separator)
  ) {
    return null;
  }

  return {
    profileId: value.profileId,
    mode: value.mode,
    password: {
      length: value.password.length,
      includeSymbols: value.password.includeSymbols,
    },
    passphrase: {
      wordCount: value.passphrase.wordCount,
      separator: value.passphrase.separator,
    },
  };
}

export function sanitizeStoredLiteProfile(
  value: unknown,
): StoredLiteProfileConfiguration | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.label !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    return null;
  }

  const canonicalService = sanitizeCanonicalService(value.canonicalService);
  const options = sanitizeOptions(value.options);

  if (
    !canonicalService ||
    !options ||
    !isValidProfileId(value.profileId) ||
    !isValidMode(value.mode)
  ) {
    return null;
  }

  if (
    canonicalService.parts.profileId !== value.profileId ||
    canonicalService.parts.mode !== value.mode ||
    options.mode !== value.mode
  ) {
    return null;
  }

  return {
    id: value.id,
    label: value.label,
    canonicalService,
    profileId: value.profileId,
    calibrationProfileId: isValidCalibrationId(value.calibrationProfileId)
      ? value.calibrationProfileId
      : undefined,
    mode: value.mode,
    options,
    updatedAt: value.updatedAt,
  };
}

export function sanitizeLiteConfigurationExportEnvelope(
  value: unknown,
): LiteConfigurationExportEnvelope | null {
  if (
    !isRecord(value) ||
    value.format !== 'ssvault-lite-config' ||
    value.version !== 1 ||
    typeof value.exportedAt !== 'string'
  ) {
    return null;
  }

  if (!Array.isArray(value.profiles)) {
    return null;
  }

  const preferences =
    value.preferences === null || value.preferences === undefined
      ? null
      : sanitizeLitePreferences(value.preferences);
  const profiles = value.profiles.map((profile) =>
    sanitizeStoredLiteProfile(profile),
  );

  if (
    (value.preferences !== null &&
      value.preferences !== undefined &&
      !preferences) ||
    profiles.some((profile) => !profile)
  ) {
    return null;
  }

  return {
    format: 'ssvault-lite-config',
    version: 1,
    exportedAt: value.exportedAt,
    preferences,
    profiles: profiles as StoredLiteProfileConfiguration[],
  };
}
