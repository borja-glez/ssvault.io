import type {
  LiteArgon2Calibration,
  LiteArgon2CalibrationProfileId,
  LiteArgon2CalibrationSignals,
  LiteArgon2Parameters,
} from '@shared/types/lite';

interface CalibrationCandidate {
  id: LiteArgon2CalibrationProfileId;
  label: string;
  parameters: LiteArgon2Parameters;
}

const CALIBRATION_CANDIDATES: readonly CalibrationCandidate[] = [
  {
    id: 'constrained',
    label: 'Constrained',
    parameters: {
      iterations: 3,
      memorySize: 32 * 1024,
      parallelism: 1,
      hashLength: 32,
    },
  },
  {
    id: 'balanced',
    label: 'Balanced',
    parameters: {
      iterations: 3,
      memorySize: 64 * 1024,
      parallelism: 1,
      hashLength: 32,
    },
  },
  {
    id: 'strong',
    label: 'Strong',
    parameters: {
      iterations: 3,
      memorySize: 96 * 1024,
      parallelism: 1,
      hashLength: 32,
    },
  },
  {
    id: 'max',
    label: 'Max',
    parameters: {
      iterations: 4,
      memorySize: 128 * 1024,
      parallelism: 1,
      hashLength: 32,
    },
  },
] as const;

const SAFE_DEFAULT_PROFILE_ID: LiteArgon2CalibrationProfileId = 'balanced';

function readHardwareConcurrency() {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.hardwareConcurrency !== 'number' ||
    navigator.hardwareConcurrency <= 0
  ) {
    return undefined;
  }

  return navigator.hardwareConcurrency;
}

function readDeviceMemoryGiB() {
  if (typeof navigator === 'undefined' || !('deviceMemory' in navigator)) {
    return undefined;
  }

  const candidate = Reflect.get(navigator, 'deviceMemory');
  return typeof candidate === 'number' && candidate > 0 ? candidate : undefined;
}

function detectSignals(): LiteArgon2CalibrationSignals {
  return {
    hardwareConcurrency: readHardwareConcurrency(),
    deviceMemoryGiB: readDeviceMemoryGiB(),
  };
}

function selectProfileFromSignals(
  signals: LiteArgon2CalibrationSignals,
): LiteArgon2CalibrationProfileId {
  const hardwareConcurrency = signals.hardwareConcurrency;
  const deviceMemoryGiB = signals.deviceMemoryGiB;

  if (
    (hardwareConcurrency !== undefined && hardwareConcurrency <= 2) ||
    (deviceMemoryGiB !== undefined && deviceMemoryGiB <= 2)
  ) {
    return 'constrained';
  }

  if (
    hardwareConcurrency !== undefined &&
    hardwareConcurrency >= 12 &&
    (deviceMemoryGiB === undefined || deviceMemoryGiB >= 16)
  ) {
    return 'max';
  }

  if (
    hardwareConcurrency !== undefined &&
    hardwareConcurrency >= 8 &&
    (deviceMemoryGiB === undefined || deviceMemoryGiB >= 8)
  ) {
    return 'strong';
  }

  return SAFE_DEFAULT_PROFILE_ID;
}

/**
 * Sugiere un perfil de calibración basándose en señales del hardware.
 * Se usa solo como valor inicial del formulario; el usuario puede cambiarlo.
 */
export function suggestCalibrationProfileId(): LiteArgon2CalibrationProfileId {
  const signals = detectSignals();
  const hasHints =
    signals.hardwareConcurrency !== undefined ||
    signals.deviceMemoryGiB !== undefined;

  return hasHints ? selectProfileFromSignals(signals) : SAFE_DEFAULT_PROFILE_ID;
}

/**
 * Devuelve la calibración completa para un profileId dado.
 * Lookup determinista sin estado mutable.
 */
export function getCalibrationByProfileId(
  profileId: LiteArgon2CalibrationProfileId,
): LiteArgon2Calibration {
  const candidate =
    CALIBRATION_CANDIDATES.find((c) => c.id === profileId) ??
    CALIBRATION_CANDIDATES[1];

  return {
    profileId: candidate.id,
    label: candidate.label,
    source: 'user-selected',
    parameters: candidate.parameters,
    signals: detectSignals(),
    summary: `${candidate.label} · ${candidate.parameters.memorySize / 1024} MiB · t=${candidate.parameters.iterations} · p=${candidate.parameters.parallelism} · seleccionado por el usuario.`,
  };
}

/** Lista de perfiles de calibración disponibles para el UI. */
export const calibrationProfileIds: readonly LiteArgon2CalibrationProfileId[] =
  CALIBRATION_CANDIDATES.map((c) => c.id);

export function getCalibrationLabel(
  profileId: LiteArgon2CalibrationProfileId,
): string {
  const candidate = CALIBRATION_CANDIDATES.find((c) => c.id === profileId);
  if (!candidate) return profileId;
  const mib = candidate.parameters.memorySize / 1024;
  return `${candidate.label} (${mib} MiB · t=${candidate.parameters.iterations})`;
}
