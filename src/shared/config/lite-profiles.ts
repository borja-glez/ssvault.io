import type { LiteProfileDefinition } from '../types/lite';

export const liteProfiles: LiteProfileDefinition[] = [
  {
    id: 'web',
    name: 'Web estándar',
    description:
      'Perfil equilibrado para servicios web modernos con soporte para password y passphrase.',
    notes: 'Base recomendada para la mayoría de cuentas web y SaaS.',
    recommendedMode: 'password',
    supportedModes: ['password', 'passphrase'],
    policies: {
      password: {
        mode: 'password',
        allowedLengths: [16, 20, 24, 32],
        defaultLength: 20,
        allowSymbols: true,
        defaultIncludeSymbols: true,
        alphabetId: 'safe-alnum-symbols',
        notes: 'Usa alfabeto seguro sin caracteres ambiguos y admite símbolos.',
      },
      passphrase: {
        mode: 'passphrase',
        allowedWordCounts: [4, 5, 6],
        defaultWordCount: 4,
        allowedSeparators: ['-', '.'],
        defaultSeparator: '-',
        notes:
          'Pensada para credenciales memorables cuando el servicio tolera frases largas.',
      },
    },
  },
  {
    id: 'banking',
    name: 'Banking / alta fricción',
    description:
      'Perfil conservador para accesos críticos donde el versionado y la compatibilidad importan más que la flexibilidad.',
    notes:
      'Solo password. Passphrase queda prohibida para evitar combinaciones poco compatibles.',
    recommendedMode: 'password',
    supportedModes: ['password'],
    policies: {
      password: {
        mode: 'password',
        allowedLengths: [20, 24, 28, 32],
        defaultLength: 24,
        allowSymbols: true,
        defaultIncludeSymbols: false,
        alphabetId: 'safe-alnum-symbols',
        notes:
          'Sí admite símbolos, pero no se activan por defecto por la fricción típica de banca y fintech.',
      },
    },
  },
  {
    id: 'legacy',
    name: 'Legacy / compatibilidad',
    description:
      'Perfil de transición para sistemas con restricciones antiguas de longitud y formato.',
    notes:
      'Mantiene un subconjunto compatible: solo password corta-media y sin símbolos.',
    recommendedMode: 'password',
    supportedModes: ['password'],
    policies: {
      password: {
        mode: 'password',
        allowedLengths: [12, 16, 20],
        defaultLength: 16,
        allowSymbols: false,
        defaultIncludeSymbols: false,
        alphabetId: 'safe-alnum',
        notes:
          'Bloquea símbolos para minimizar rechazos en sistemas heredados.',
      },
    },
  },
];

export const defaultLiteProfile = liteProfiles[0];
