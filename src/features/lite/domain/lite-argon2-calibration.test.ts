import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
});

async function loadCalibrationModule(navigatorValue?: Navigator) {
  vi.resetModules();

  if (navigatorValue === undefined) {
    vi.stubGlobal('navigator', undefined);
  } else {
    vi.stubGlobal('navigator', navigatorValue);
  }

  return import('./lite-argon2-calibration');
}

describe('suggestCalibrationProfileId', () => {
  it('sugiere balanced cuando no hay señales del entorno', async () => {
    const mod = await loadCalibrationModule();
    expect(mod.suggestCalibrationProfileId()).toBe('balanced');
  });

  it('sugiere constrained con hardware o memoria muy limitados', async () => {
    const mod = await loadCalibrationModule({
      hardwareConcurrency: 2,
      deviceMemory: 2,
    } as unknown as Navigator);
    expect(mod.suggestCalibrationProfileId()).toBe('constrained');
  });

  it('sugiere strong con hardware potente', async () => {
    const mod = await loadCalibrationModule({
      hardwareConcurrency: 8,
      deviceMemory: 8,
    } as unknown as Navigator);
    expect(mod.suggestCalibrationProfileId()).toBe('strong');
  });

  it('sugiere max con hardware muy potente', async () => {
    const mod = await loadCalibrationModule({
      hardwareConcurrency: 12,
      deviceMemory: 16,
    } as unknown as Navigator);
    expect(mod.suggestCalibrationProfileId()).toBe('max');
  });
});

describe('getCalibrationByProfileId', () => {
  it('devuelve los parámetros correctos para cada perfil', async () => {
    const mod = await loadCalibrationModule();

    const balanced = mod.getCalibrationByProfileId('balanced');
    expect(balanced.profileId).toBe('balanced');
    expect(balanced.parameters.memorySize).toBe(64 * 1024);
    expect(balanced.parameters.iterations).toBe(3);
    expect(balanced.source).toBe('user-selected');

    const max = mod.getCalibrationByProfileId('max');
    expect(max.profileId).toBe('max');
    expect(max.parameters.memorySize).toBe(128 * 1024);
    expect(max.parameters.iterations).toBe(4);
  });

  it('cae a balanced si se pasa un perfil desconocido', async () => {
    const mod = await loadCalibrationModule();
    const fallback = mod.getCalibrationByProfileId(
      'unknown' as Parameters<typeof mod.getCalibrationByProfileId>[0],
    );
    expect(fallback.profileId).toBe('balanced');
  });
});

describe('getCalibrationLabel', () => {
  it('devuelve label con memoria e iteraciones', async () => {
    const mod = await loadCalibrationModule();
    expect(mod.getCalibrationLabel('constrained')).toBe(
      'Constrained (32 MiB · t=3)',
    );
    expect(mod.getCalibrationLabel('max')).toBe('Max (128 MiB · t=4)');
  });
});
