export type LiteGenerationMode = 'password' | 'passphrase';

export type LiteProfileId = 'web' | 'banking' | 'legacy';

export type LiteArgon2CalibrationProfileId =
  | 'constrained'
  | 'balanced'
  | 'strong'
  | 'max';

export type PassphraseSeparator = '-' | '.' | ' ';

export type CanonicalServiceToken = string & {
  readonly __brand: 'CanonicalServiceToken';
};

export type CanonicalServiceId = string & {
  readonly __brand: 'CanonicalServiceId';
};

export interface CanonicalServiceIdentifierInput {
  service: string;
  account?: string;
  namespace?: string;
  profileId: LiteProfileId;
  calibrationProfileId: LiteArgon2CalibrationProfileId;
  mode: LiteGenerationMode;
  version: number;
}

export interface CanonicalServiceIdentifierParts {
  service: CanonicalServiceToken;
  account?: CanonicalServiceToken;
  namespace?: CanonicalServiceToken;
  profileId: LiteProfileId;
  calibrationProfileId: LiteArgon2CalibrationProfileId;
  mode: LiteGenerationMode;
  version: number;
}

export interface CanonicalServiceIdentifier {
  raw: {
    service: string;
    account?: string;
    namespace?: string;
  };
  parts: CanonicalServiceIdentifierParts;
  canonicalId: CanonicalServiceId;
}

export interface LitePasswordPolicy {
  mode: 'password';
  allowedLengths: number[];
  defaultLength: number;
  allowSymbols: boolean;
  defaultIncludeSymbols: boolean;
  alphabetId: 'safe-alnum' | 'safe-alnum-symbols';
  notes: string;
}

export interface LitePassphrasePolicy {
  mode: 'passphrase';
  allowedWordCounts: number[];
  defaultWordCount: number;
  allowedSeparators: PassphraseSeparator[];
  defaultSeparator: PassphraseSeparator;
  notes: string;
}

export type LiteModePolicy = LitePasswordPolicy | LitePassphrasePolicy;

export interface LiteProfileDefinition {
  id: LiteProfileId;
  name: string;
  description: string;
  notes: string;
  recommendedMode: LiteGenerationMode;
  supportedModes: LiteGenerationMode[];
  policies: {
    password?: LitePasswordPolicy;
    passphrase?: LitePassphrasePolicy;
  };
}

export interface LitePasswordFormOptions {
  length: number;
  includeSymbols: boolean;
}

export interface LitePassphraseFormOptions {
  wordCount: number;
  separator: PassphraseSeparator;
}

export interface LiteGeneratorFormValues {
  masterPassword: string;
  service: string;
  account: string;
  namespace: string;
  profileId: LiteProfileId;
  calibrationProfileId: LiteArgon2CalibrationProfileId;
  version: number;
  mode: LiteGenerationMode;
  password: LitePasswordFormOptions;
  passphrase: LitePassphraseFormOptions;
}

export type LiteResolvedModeOptions =
  | {
      mode: 'password';
      length: number;
      includeSymbols: boolean;
    }
  | {
      mode: 'passphrase';
      wordCount: number;
      separator: PassphraseSeparator;
    };

export interface LiteResolvedDerivationRequest {
  masterPassword: string;
  profile: LiteProfileDefinition;
  calibrationProfileId: LiteArgon2CalibrationProfileId;
  canonicalService: CanonicalServiceIdentifier;
  options: LiteResolvedModeOptions;
}

export interface LiteVisualFingerprint {
  label: string;
  palette: [string, string, string];
  note: string;
}

export interface LiteDerivedSecretPreview {
  value: string;
  summary: string;
  placeholder: boolean;
  engine: 'mock' | 'argon2id-hkdf-sha256';
  visualFingerprint: LiteVisualFingerprint;
}

export type LiteDerivationRuntime = 'worker' | 'main-thread';

export type LiteArgon2CalibrationSource =
  | 'safe-default'
  | 'environment-hints'
  | 'timed-adjustment'
  | 'user-selected';

export interface LiteArgon2Parameters {
  iterations: number;
  memorySize: number;
  parallelism: number;
  hashLength: number;
}

export interface LiteArgon2CalibrationSignals {
  hardwareConcurrency?: number;
  deviceMemoryGiB?: number;
}

export interface LiteArgon2Calibration {
  profileId: LiteArgon2CalibrationProfileId;
  label: string;
  source: LiteArgon2CalibrationSource;
  parameters: LiteArgon2Parameters;
  signals: LiteArgon2CalibrationSignals;
  summary: string;
}

export interface LiteDerivationExecution {
  runtime: LiteDerivationRuntime;
  isolated: boolean;
  message: string;
  calibration: LiteArgon2Calibration;
  fallbackReason?: string;
}

export interface LiteDerivedSecretResult {
  preview: LiteDerivedSecretPreview;
  execution: LiteDerivationExecution;
}

export interface LiteLocalPreferences {
  profileId: LiteProfileId;
  mode: LiteGenerationMode;
  password: LitePasswordFormOptions;
  passphrase: LitePassphraseFormOptions;
}

export interface StoredLiteProfileConfiguration {
  id: string;
  label: string;
  canonicalService: CanonicalServiceIdentifier;
  profileId: LiteProfileId;
  calibrationProfileId?: LiteArgon2CalibrationProfileId;
  mode: LiteGenerationMode;
  options: LiteResolvedModeOptions;
  updatedAt: string;
}

export interface LiteConfigurationExportEnvelope {
  format: 'ssvault-lite-config';
  version: 1;
  exportedAt: string;
  preferences: LiteLocalPreferences | null;
  profiles: StoredLiteProfileConfiguration[];
}
