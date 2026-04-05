import type { Translations } from './types';

export const en: Translations = {
  nav: {
    vault: 'Vault',
    docs: 'Docs',
    details: 'Details',
  },

  footer: {
    copyright: '© 2026 ssvault / lite',
  },

  index: {
    title: 'ssvault Lite — Credential Generator',
    heroLine1: 'A unique password',
    heroLine2: 'for every service.',
    heroLine3: 'Nothing stored.',
    heroSub1: 'Type your master password, enter the service and Lite derives a',
    heroSub2:
      'strong credential instantly. Nothing is stored, nothing is synced.',
    generatorSr: 'Lite real-time generator',
  },

  form: {
    title: 'Derivation Parameters',
    masterPassword: 'Master password',
    masterPlaceholder: 'Enter your master password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    service: 'Service',
    servicePlaceholder: 'github, gmail, aws...',
    account: 'Account',
    accountPlaceholder: 'personal',
    namespace: 'Namespace',
    namespacePlaceholder: 'acme',
    profile: 'Profile',
    profileHint: 'Defines lengths, modes and symbols based on the service type',
    profileWeb: 'Web standard',
    profileBanking: 'Banking / high friction',
    profileLegacy: 'Legacy / compatibility',
    version: 'Version',
    versionHint:
      'Increment to rotate the credential without changing your master password',
    mode: 'Mode',
    modeHint: 'Password generates characters; passphrase generates BIP39 words',
    modePassword: 'Password',
    modePassphrase: 'Passphrase',
    length: 'Length',
    wordCount: 'Words',
    separator: 'Separator',
    separatorSpace: 'space',
    includeSymbols: 'Include symbols',
    symbolsDisabled: 'Symbols disabled by policy',
    symbolsHint: 'Characters like !@#$%^& increase the entropy of the password',
    symbolsDisabledHint:
      'The current profile does not allow symbols for compatibility',
    calibration: 'Argon2 Calibration',
    calibrationHint:
      'Use the same level on all your devices to get the same result',
    calibrationAutoLabel: 'Suggest based on hardware',
    reset: 'Reset',
    saveProfile: 'Save profile',
    saving: 'Saving...',
  },

  result: {
    label: 'RESULT',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    placeholder: 'Fill in the fields to generate',
    copy: 'COPY PASSWORD',
  },

  status: {
    label: 'GENERATOR STATUS',
    visualFingerprint: 'Visual fingerprint',
    runtime: 'Runtime',
    calibration: 'Calibration',
    canonicalId: 'Canonical ID',
    detailsLink: 'View derivation details',
  },

  profiles: {
    label: 'SAVED PROFILES',
    badge: 'metadata only',
    load: 'Load',
    delete: 'Delete',
    empty: 'No saved profiles',
    emptyHint: 'Save a configuration from the form for quick access.',
    mode: 'mode',
    length: 'length',
    words: 'words',
    symbols: 'symbols',
  },

  docs: {
    title: 'Documentation — ssvault Lite',
    heroLine1: 'Profiles, rotation',
    heroLine2: 'and secret-free exports.',
    heroLine3: 'All at a glance.',
    heroSub1: 'Quick guide to get the most out of Lite: configuration,',
    heroSub2: 'deterministic recovery and frequently asked questions.',

    quickStartLabel: 'QUICK START',
    quickStartTitle: 'How to use Lite in under a minute.',
    step1Title: 'Enter your master password.',
    step1Desc:
      'It is the root secret from which all credentials are derived. It is never stored.',
    step2Title: 'Define the service.',
    step2Desc:
      'The name of the site or system (github, gmail, aws...). Together with your master password, it is the minimum data needed to derive.',
    step3Title: 'Adjust profile, version and mode.',
    step3Desc:
      'Optionally select a profile (web, banking, legacy), increment the version to rotate, or choose between password and passphrase.',
    step4Title: 'Copy the result.',
    step4Desc:
      'The credential is generated in real time. Copy it and the clipboard will attempt to clear automatically after 45 seconds.',
    quickStartNote:
      'When you save a profile, only local metadata is stored (service, mode, options). Never your master password or the derived result.',

    profilesTitle: 'Profiles',
    profilesDesc:
      'Each profile defines which modes, lengths and options are available. Save non-secret configurations to reload frequent entries without filling in the form again.',
    profileWebTitle: 'Web (standard)',
    profileWebDesc:
      'Balanced for most services. Supports password (16-32 chars) and passphrase (4-6 words). Symbols enabled by default.',
    profileBankingTitle: 'Banking (high friction)',
    profileBankingDesc:
      'Conservative for critical access. Password only (20-32 chars), symbols disabled by default to reduce friction with restrictive banking systems.',
    profileLegacyTitle: 'Legacy (compatibility)',
    profileLegacyDesc:
      'For legacy systems with restrictions. Password only (12-20 chars), no symbols. Minimizes rejections.',

    rotationTitle: 'Rotation',
    rotationDesc1:
      'Use the version field when you need to regenerate a credential without changing your master password or duplicating services.',
    rotationDesc2:
      'Incrementing the version from 1 to 2 produces a completely different credential for the same service. The previous result becomes inaccessible: there is no way to recover the old version unless you restore the original version number.',
    rotationDesc3:
      'This is useful when a service forces you to change your password periodically or when you suspect a credential has been compromised.',

    exportLabel: 'EXPORT & IMPORT',
    exportTitle: 'Portable configuration without secrets.',
    exportDesc:
      'Lite allows you to export your configuration as a JSON file with format',
    exportFormat: 'ssvault-lite-config',
    exportIncludes: 'v1. The file includes:',
    exportItem1: 'Preferences: active profile, mode, output options',
    exportItem2: 'Saved profiles: service, account, namespace, mode, version',
    exportItem3: 'Export timestamp',
    exportNever: 'Never included',
    exportNeverDesc:
      ': master password, derived results or cryptographic material.',
    exportImport:
      'When importing on another device, Lite replaces local profiles with those from the file and restores preferences if present. You only need to remember your master password to regenerate the same results.',

    recoveryLabel: 'RECOVERY',
    recoveryTitle: 'Deterministic derivation: same data, same result.',
    recoveryDesc:
      'Lite derivation is completely deterministic. If you enter the same parameters on any device you will get exactly the same result:',
    recoveryFormula:
      'master password + service + account + namespace + profile + Argon2 calibration + mode + version + options',
    recoveryResult: 'identical result',
    recoveryNoSync: 'you do not need sync or secret backups',
    recoveryExplain:
      '. If you lose access to the device, you only need to remember your master password and the parameters you used. Exported profiles speed up this process by restoring metadata without secrets.',
    recoveryWarning:
      'Trade-off: if you forget your master password, there is no way to recover any derived credential. There is no reset, backup or recovery mechanism.',

    faqTitle: 'FAQ',
    faq1Q: 'What exactly does Lite store?',
    faq1A:
      'Only preferences and non-secret profiles: service, profile, mode, version and output options. Never the master password or the derived result. Preferences live in localStorage and profiles in IndexedDB.',
    faq2Q: 'What if I switch devices?',
    faq2A:
      'If you repeat master password, service, profile, Argon2 calibration, mode and version, you will get the same result. Make sure to use the same calibration level on both devices. You can export profiles without secrets to speed up the initial setup on the new device.',
    faq3Q: 'Is it safe to use Lite on a shared computer?',
    faq3A:
      'Lite does not persist your master password or the derived result. The clipboard is automatically cleared after 45 seconds. However, a shared computer always carries risks: keyloggers, malicious extensions or open sessions can expose data regardless of Lite.',
    faq4Q: 'Can I export my configuration?',
    faq4A:
      'Yes. The export format is ssvault-lite-config v1, a JSON with preferences and saved profiles. It never includes master passwords or derived results. You can import it on another device to restore your configuration without secrets.',
    faq5Q: 'Why not use a traditional vault?',
    faq5A:
      'Lite and a vault solve different problems. A vault stores encrypted secrets that need sync and backup. Lite stores nothing: it generates credentials on demand from a deterministic formula. There is no database to protect, sync or lose.',
    faq6Q: 'What if a service rejects my password?',
    faq6A:
      'Try changing the profile or disabling symbols. The Legacy profile is designed for systems with strict restrictions (alphanumeric only, short lengths). If the service has very specific requirements, adjust length and symbols manually.',
    faq7Q: 'Is Lite an alternative to 2FA?',
    faq7A:
      'No. Lite generates strong and unique passwords per service, but it does not replace two-factor authentication. Always enable 2FA where available.',

    tocLabel: 'TABLE OF CONTENTS',
    toc1: '01 · Quick start',
    toc2: '02 · Profiles & rotation',
    toc3: '03 · Secret-free export',
    toc4: '04 · Deterministic recovery',

    limitTitle: 'Important limitation',
    limitDesc:
      'Lite is not a vault. It is designed to derive and recover credentials, not to store arbitrary secrets or sync your state across servers. If you forget your master password, there is no way to recover anything.',

    nextLabel: 'FURTHER READING',
    nextDetails: 'Technical details',
    nextGenerator: 'Back to generator',
  },

  details: {
    title: 'Technical Details — ssvault Lite',
    heroLine1: 'Argon2id, HKDF and Workers.',
    heroLine2: 'Cryptographic decisions',
    heroLine3: 'without smoke.',
    heroSub1:
      'How Lite derives, isolates and calibrates each credential. Enough context',
    heroSub2: 'to audit without turning the main screen into documentation.',

    archLabel: 'ARCHITECTURE',
    archTitle: 'Lite v1 Derivation Pipeline',
    archDesc:
      'Master password + canonical ID → Argon2id → root key → HKDF per context → password, passphrase and visual fingerprint. The final result is never persisted.',
    archSaltNote:
      'The Argon2id salt is deterministic (derived from the canonical ID) because Lite does not persist per-credential secrets. HKDF separates contexts so that password, passphrase and visual fingerprint never reuse the same bytes.',

    step1Title: '01 · Canonical Identity',
    step1Desc:
      'Service, optional account, namespace, profile, Argon2 calibration, mode and version form the stable request from which everything else is derived. Each token is normalized with NFKC, lowercased, and separators are cleaned (smart quotes, slashes, colons) to produce a deterministic ID:',
    step1Fallbacks: 'Empty tokens use stable fallbacks: service →',
    step1FallbackService: 'service',
    step1FallbackAccount: 'account',
    step1FallbackNs: 'default',
    step1FallbackEnd:
      '. This ensures the canonical ID is always valid even if the user leaves optional fields empty.',

    step2Title: '02 · Isolation & Calibration',
    step2Desc:
      'Derivation prioritizes a Web Worker to isolate the master password from the main thread. If the Worker is unavailable or fails, it falls back honestly to the main thread reporting the fallback reason. There is no silent failure. The Argon2 calibration level is chosen by the user in the form and is part of the canonical ID, ensuring the same level produces the same result on any device.',
    step2CalibTitle: 'Argon2id calibration tiers',
    step2Hardware:
      'The initial value is suggested automatically based on the device hardware:',
    step2Low: '≤2 cores or ≤2 GiB',
    step2High: '≥12 cores + ≥16 GiB',
    step2Adaptive:
      '. The user can change the level at any time. To get the same result on different devices, the same calibration level must be used.',

    step3Title: '03 · Minimal Persistence',
    step3Desc:
      'Lite persists the minimum necessary for a smooth experience without compromising secrets.',
    step3LocalStorage:
      'Minimal preferences: active profile, mode, password/passphrase options. Read on mount and updated with debounce.',
    step3IndexedDB:
      'Saved profiles with their full canonical identifier. Supports CRUD (create, read, update, delete) and full replacement via import.',
    step3Export:
      'Format ssvault-lite-config v1. Contract-first envelope. Strict sanitization on import: each profile is validated individually and invalid ones are silently discarded.',
    step3Contract:
      'Every storage operation goes through lite-storage-contract.ts which validates structure, types and ranges before persisting. Data outside the contract is rejected or discarded.',

    step4Title: '04 · CSP & Hardening',
    step4Desc:
      'Astro SSR applies security headers via middleware on every response. The server CSP directives complement the per-page hashes that Astro generates automatically for scripts and styles.',

    paramsLabel: 'BASE PARAMETERS',
    paramsDefault: 'The default profile is',
    paramsBalanced: 'balanced',
    paramsAdaptive:
      '. The level is suggested based on hardware but the user chooses the final one. Same level = same result on any device.',

    limitsTitle: 'Honest limits',
    limitsDesc:
      'No backend, no vault and no remote sync. Lite solves derivation and recovery; it does not aim to store arbitrary secrets or replace a full vault.',
    limit1: 'If you forget the master password, there is no recovery possible.',
    limit2: 'There is no automatic backup of any data.',
    limit3: 'Web Worker support depends on the browser and environment.',
    limit4: 'The cryptography has not been formally audited.',

    refLabel: 'REFERENCE',
    refDocs: 'Usage documentation',
    refGenerator: 'Back to generator',
  },
};
