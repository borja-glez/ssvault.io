import { argon2id } from 'hash-wasm';
import { wordlist as bip39EnglishWordlist } from '@scure/bip39/wordlists/english.js';
import type {
  LiteArgon2Calibration,
  LiteDerivedSecretPreview,
  LiteResolvedDerivationRequest,
  LiteVisualFingerprint,
} from '@shared/types/lite';
import { getCalibrationByProfileId } from './lite-argon2-calibration';

const textEncoder = new TextEncoder();

const HKDF_SALT = encodeText('ssvault-lite|hkdf-salt|v1');
const PASSWORD_ALPHABET_BASE =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const PASSWORD_SYMBOLS = '!@#$%*+-_';
const VISUAL_ADJECTIVES = [
  'amber',
  'brisk',
  'calm',
  'deep',
  'ember',
  'frost',
  'gold',
  'hazy',
  'ivory',
  'jade',
  'keen',
  'lunar',
  'mist',
  'nova',
  'opal',
  'solar',
] as const;
const VISUAL_NOUNS = [
  'anchor',
  'bridge',
  'cedar',
  'dawn',
  'ember',
  'field',
  'grove',
  'harbor',
  'iris',
  'jet',
  'knoll',
  'lagoon',
  'mesa',
  'north',
  'orbit',
  'pine',
] as const;
const VISUAL_BASE_COLORS = [
  '#1d4ed8',
  '#0f766e',
  '#7c3aed',
  '#c2410c',
  '#be123c',
  '#0369a1',
  '#15803d',
  '#854d0e',
  '#4338ca',
  '#a21caf',
  '#0f766e',
  '#b45309',
  '#b91c1c',
  '#047857',
  '#7e22ce',
  '#334155',
] as const;

function encodeText(value: string) {
  return textEncoder.encode(value);
}

function normalizeSecret(value: string) {
  return value.normalize('NFKC');
}

function toArrayBuffer(value: Uint8Array) {
  const copy = new Uint8Array(value.byteLength);
  copy.set(value);
  return copy.buffer;
}

function ensureWebCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto no está disponible en este entorno.');
  }

  return globalThis.crypto;
}

async function sha256Bytes(value: Uint8Array) {
  const cryptoApi = ensureWebCrypto();
  const digest = await cryptoApi.subtle.digest('SHA-256', toArrayBuffer(value));
  return new Uint8Array(digest);
}

async function hkdfSha256(
  inputKeyMaterial: Uint8Array,
  info: Uint8Array,
  length: number,
) {
  const cryptoApi = ensureWebCrypto();
  const key = await cryptoApi.subtle.importKey(
    'raw',
    toArrayBuffer(inputKeyMaterial),
    'HKDF',
    false,
    ['deriveBits'],
  );
  const bits = await cryptoApi.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: toArrayBuffer(HKDF_SALT),
      info: toArrayBuffer(info),
    },
    key,
    length * 8,
  );

  return new Uint8Array(bits);
}

async function deriveArgon2RootKey(
  input: LiteResolvedDerivationRequest,
  calibration: LiteArgon2Calibration,
) {
  const passwordBytes = encodeText(normalizeSecret(input.masterPassword));
  const saltSource = encodeText(
    `ssvault-lite|argon2id-salt|v1|${input.canonicalService.canonicalId}`,
  );
  const salt = (await sha256Bytes(saltSource)).slice(0, 16);

  const rootKey = await argon2id({
    password: passwordBytes,
    salt,
    ...calibration.parameters,
    outputType: 'binary',
  });

  return { rootKey, calibration };
}

function createContextInfo(
  input: LiteResolvedDerivationRequest,
  purpose: 'password' | 'passphrase' | 'visual',
  extra?: string,
) {
  return encodeText(
    [
      'ssvault-lite',
      'hkdf',
      'v1',
      `purpose=${purpose}`,
      `canonical=${input.canonicalService.canonicalId}`,
      `profile=${input.profile.id}`,
      extra,
    ]
      .filter(Boolean)
      .join('|'),
  );
}

async function readUniformIndices(
  rootKey: Uint8Array,
  infoBase: Uint8Array,
  modulus: number,
  count: number,
) {
  const limit = Math.floor(256 / modulus) * modulus;
  const indices: number[] = [];
  let block = 0;

  while (indices.length < count) {
    const blockBytes = await hkdfSha256(
      rootKey,
      new Uint8Array([...infoBase, ...encodeText(`|block=${block}`)]),
      64,
    );

    for (const byte of blockBytes) {
      if (byte >= limit) {
        continue;
      }

      indices.push(byte % modulus);

      if (indices.length === count) {
        break;
      }
    }

    block += 1;
  }

  return indices;
}

async function read11BitIndices(
  rootKey: Uint8Array,
  infoBase: Uint8Array,
  count: number,
) {
  const indices: number[] = [];
  let block = 0;
  let buffer = 0;
  let bitsInBuffer = 0;

  while (indices.length < count) {
    const blockBytes = await hkdfSha256(
      rootKey,
      new Uint8Array([...infoBase, ...encodeText(`|block=${block}`)]),
      64,
    );

    for (const byte of blockBytes) {
      buffer = (buffer << 8) | byte;
      bitsInBuffer += 8;

      while (bitsInBuffer >= 11 && indices.length < count) {
        bitsInBuffer -= 11;
        indices.push((buffer >>> bitsInBuffer) & 0x7ff);
      }
    }

    block += 1;
  }

  return indices;
}

async function derivePasswordValue(
  rootKey: Uint8Array,
  input: LiteResolvedDerivationRequest,
) {
  if (input.options.mode !== 'password') {
    throw new Error('El request resuelto no corresponde a password mode.');
  }

  const alphabet = input.options.includeSymbols
    ? `${PASSWORD_ALPHABET_BASE}${PASSWORD_SYMBOLS}`
    : PASSWORD_ALPHABET_BASE;
  const info = createContextInfo(input, 'password');
  const indices = await readUniformIndices(
    rootKey,
    info,
    alphabet.length,
    input.options.length,
  );

  return indices.map((index) => alphabet[index]).join('');
}

async function derivePassphraseValue(
  rootKey: Uint8Array,
  input: LiteResolvedDerivationRequest,
) {
  if (input.options.mode !== 'passphrase') {
    throw new Error('El request resuelto no corresponde a passphrase mode.');
  }

  const info = createContextInfo(input, 'passphrase');
  const indices = await read11BitIndices(
    rootKey,
    info,
    input.options.wordCount,
  );
  const words = indices.map((index) => bip39EnglishWordlist[index]);

  return words.join(input.options.separator);
}

function tintColor(hexColor: string, amount: number) {
  const normalized = hexColor.replace('#', '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * amount)
      .toString(16)
      .padStart(2, '0');

  return `#${mix(red)}${mix(green)}${mix(blue)}`;
}

async function deriveVisualFingerprint(
  rootKey: Uint8Array,
  input: LiteResolvedDerivationRequest,
): Promise<LiteVisualFingerprint> {
  const info = createContextInfo(input, 'visual');
  const bytes = await hkdfSha256(rootKey, info, 6);

  return {
    label: `${VISUAL_ADJECTIVES[bytes[0] & 0x0f]}-${VISUAL_NOUNS[bytes[1] & 0x0f]}`,
    palette: [
      tintColor(VISUAL_BASE_COLORS[bytes[2] & 0x0f], 0.2),
      tintColor(VISUAL_BASE_COLORS[bytes[3] & 0x0f], 0.35),
      tintColor(VISUAL_BASE_COLORS[bytes[4] & 0x0f], 0.5),
    ],
    note: 'Fingerprint visual local para comprobar consistencia. Tiene baja entropía a propósito y NO sustituye verificación criptográfica.',
  };
}

function buildSummary(input: LiteResolvedDerivationRequest) {
  if (input.options.mode === 'password') {
    return `Derivación real con Argon2id + HKDF-SHA-256 · ${input.options.length} caracteres · símbolos ${input.options.includeSymbols ? 'sí' : 'no'}.`;
  }

  return `Derivación real con Argon2id + HKDF-SHA-256 · ${input.options.wordCount} palabras BIP39 · separador ${input.options.separator === ' ' ? 'espacio' : input.options.separator}.`;
}

/**
 * Núcleo criptográfico reutilizable para Lite v1.
 *
 * Decisiones deliberadas:
 * - Argon2id usa salt determinista derivada del canonical ID porque Lite no persiste secretos ni material aleatorio por credencial.
 * - HKDF-SHA-256 separa contextos para password, passphrase y visual fingerprint; así evitamos reutilizar bytes crudos entre salidas distintas.
 * - El fingerprint visual expone POCOS bits a propósito: sirve como chequeo humano local, no como autenticación.
 */
export async function deriveLiteSecretPreview(
  input: LiteResolvedDerivationRequest,
): Promise<LiteDerivedSecretPreview> {
  const { preview } = await deriveLiteSecretPreviewWithMetadata(input);
  return preview;
}

export async function deriveLiteSecretPreviewWithMetadata(
  input: LiteResolvedDerivationRequest,
): Promise<{
  preview: LiteDerivedSecretPreview;
  calibration: LiteArgon2Calibration;
}> {
  if (!input.masterPassword) {
    throw new Error(
      'La master password es obligatoria para derivar un secreto real.',
    );
  }

  const calibrationForRequest = getCalibrationByProfileId(
    input.calibrationProfileId,
  );
  const { rootKey, calibration } = await deriveArgon2RootKey(
    input,
    calibrationForRequest,
  );
  const value =
    input.options.mode === 'passphrase'
      ? await derivePassphraseValue(rootKey, input)
      : await derivePasswordValue(rootKey, input);
  const visualFingerprint = await deriveVisualFingerprint(rootKey, input);

  return {
    preview: {
      value,
      summary: buildSummary(input),
      placeholder: false,
      engine: 'argon2id-hkdf-sha256',
      visualFingerprint,
    },
    calibration,
  };
}
