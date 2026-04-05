import { describe, expect, it } from 'vitest';
import { canonicalizeServiceIdentifier } from './canonical-service';

describe('canonicalizeServiceIdentifier', () => {
  it('normaliza tokens complejos a un canonical ID estable', () => {
    const canonical = canonicalizeServiceIdentifier({
      service: '  GitHub / Workspace  ',
      account: " John.O'Connor+alerts ",
      namespace: 'Team: Blue / Admins',
      profileId: 'web',
      calibrationProfileId: 'balanced',
      mode: 'password',
      version: 3,
    });

    expect(canonical.parts).toMatchObject({
      service: 'github-workspace',
      account: 'john.oconnor-alerts',
      namespace: 'team-blue-admins',
      profileId: 'web',
      calibrationProfileId: 'balanced',
      mode: 'password',
      version: 3,
    });
    expect(canonical.canonicalId).toBe(
      'lite|svc=github-workspace|acct=john.oconnor-alerts|ns=team-blue-admins|profile=web|cal=balanced|mode=password|v=3',
    );
  });

  it('usa fallbacks seguros para tokens vacíos y versiones inválidas', () => {
    const canonical = canonicalizeServiceIdentifier({
      service: '   ',
      account: '///',
      namespace: '   ',
      profileId: 'legacy',
      calibrationProfileId: 'constrained',
      mode: 'password',
      version: 0,
    });

    expect(canonical.parts.service).toBe('service');
    expect(canonical.parts.account).toBe('account');
    expect(canonical.parts.namespace).toBe('default');
    expect(canonical.parts.version).toBe(1);
    expect(canonical.canonicalId).toBe(
      'lite|svc=service|acct=account|ns=default|profile=legacy|cal=constrained|mode=password|v=1',
    );
  });
});
