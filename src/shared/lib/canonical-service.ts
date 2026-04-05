import type {
  CanonicalServiceIdentifier,
  CanonicalServiceIdentifierInput,
  CanonicalServiceId,
  CanonicalServiceToken,
} from '../types/lite';

function normalizeToken(input: string, fallback: string) {
  const normalized = input
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[\s/\\:+|]+/g, '-')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  return (normalized || fallback) as CanonicalServiceToken;
}

function normalizeVersion(version: number) {
  return Number.isInteger(version) && version > 0 ? version : 1;
}

/**
 * Modelo funcional Lite v1.
 *
 * El canonical service identifier representa la identidad ESTABLE de una
 * credencial derivada en Lite: servicio + cuenta + namespace + perfil + modo + versión.
 *
 * NO incluye secretos ni preferencias de UI como master password, labels locales,
 * timestamps, longitud concreta, flags temporales o metadata de exportación.
 */
export function canonicalizeServiceIdentifier(
  input: CanonicalServiceIdentifierInput,
): CanonicalServiceIdentifier {
  const parts = {
    service: normalizeToken(input.service, 'service'),
    account: input.account
      ? normalizeToken(input.account, 'account')
      : undefined,
    namespace: input.namespace
      ? normalizeToken(input.namespace, 'default')
      : undefined,
    profileId: input.profileId,
    calibrationProfileId: input.calibrationProfileId,
    mode: input.mode,
    version: normalizeVersion(input.version),
  };

  const canonicalId = [
    'lite',
    `svc=${parts.service}`,
    parts.account ? `acct=${parts.account}` : 'acct=none',
    parts.namespace ? `ns=${parts.namespace}` : 'ns=none',
    `profile=${parts.profileId}`,
    `cal=${parts.calibrationProfileId}`,
    `mode=${parts.mode}`,
    `v=${parts.version}`,
  ].join('|') as CanonicalServiceId;

  return {
    raw: {
      service: input.service,
      account: input.account,
      namespace: input.namespace,
    },
    parts,
    canonicalId,
  };
}
