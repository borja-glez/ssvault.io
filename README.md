# ssvault.io

Base repository for **ssvault / lite**, an OSS credential generator with local derivation, no backend and no secret persistence.

## What Lite Does

Lite deterministically derives passwords and passphrases from a master password and a service identifier. The cryptographic engine runs Argon2id + HKDF-SHA-256 in the browser, preferably inside an isolated Web Worker. It never stores the master password or derived results.

- **Reactive derivation**: the result recalculates in real time with a 450 ms debounce, no generate button needed.
- **3 profiles**: web (balanced), banking (conservative) and legacy (compatibility).
- **2 modes**: password (configurable length + symbols) and passphrase (BIP39, 4-6 words).
- **Adaptive calibration**: Argon2id adjusts memory (32-128 MiB) based on detected hardware and observed timing.
- **Minimal persistence**: only preferences (localStorage) and non-secret profiles (IndexedDB). Export/import without secrets using `ssvault-lite-config` v1 format.

See [`docs/lite-functional-model-v1.md`](docs/lite-functional-model-v1.md) for the domain contract and [`docs/lite-crypto-engine.md`](docs/lite-crypto-engine.md) for cryptographic decisions.

## Stack

- **Astro 6** SSR with Node adapter
- **Preact** for interactive islands
- **Tailwind CSS 4** with custom tokens
- **Typography**: Geist (headings), Geist Mono (technical labels), Inter (body) — managed via Astro Font (Fontsource)
- **hash-wasm** for Argon2id via WebAssembly
- **@scure/bip39** for passphrase wordlist
- **pnpm** as the only package manager

## Commands

```sh
pnpm install            # Install dependencies
pnpm dev                # Development server
pnpm build              # Production build (SSR)
pnpm start              # Run artifact: node ./dist/server/entry.mjs
pnpm test               # Tests (vitest)
pnpm test:watch         # Tests in watch mode
pnpm lint               # ESLint
pnpm lint:fix           # ESLint with auto-fix
pnpm format             # Prettier
pnpm format:check       # Prettier check
pnpm typecheck          # astro check (TypeScript)
pnpm check              # All: lint + format + typecheck
pnpm prepare:hooks      # Install git hooks
```

## Project Structure

```
src/
├── components/             Header, Footer (Astro)
├── features/lite/
│   ├── components/         Preact islands: DerivationForm, ResultPanel,
│   │                       SavedProfilesGrid, GeneratorStatus,
│   │                       LiteGeneratorIsland (orchestrator)
│   ├── domain/             Crypto engine, calibration, worker, contracts
│   └── workers/            Isolated derivation Web Worker
├── layouts/                BaseLayout with header/footer/background
├── pages/
│   ├── index.astro         Main generator (Vault)
│   ├── docs.astro          Usage documentation
│   └── details.astro       Technical details
├── shared/
│   ├── config/             Profiles, navigation, site metadata
│   ├── i18n/               Internationalization (es/en)
│   ├── lib/                Canonical ID, policy, storage (localStorage + IndexedDB)
│   ├── security/           CSP headers and hardening
│   ├── state/              Central generator hook
│   ├── types/              Domain types with branded strings
│   └── ui/                 UI components: Button, Card, Field, Input, Select
├── styles/                 global.css: tokens, animations, utilities
└── test/                   Test fixtures
```

## Routes

| Route      | Content                                                    |
| ---------- | ---------------------------------------------------------- |
| `/`        | Lite generator with form and sticky result panel           |
| `/docs`    | Documentation: profiles, rotation, export, FAQ             |
| `/details` | Technical architecture: pipeline, calibration, persistence |

## Internationalization

UI is available in Spanish (es) and English (en). Language is detected from the browser's `Accept-Language` header on first visit and can be switched manually via the header toggle. The preference is persisted in a cookie (`ssvault-locale`).

## Security

### Headers

Astro SSR applies security headers via middleware: CSP, HSTS, X-Frame-Options, COOP, CORP, Permissions-Policy.

### CSP: honest trade-offs

- `style-src` allows `'unsafe-inline'` (inline UI attributes).
- `script-src` includes `'wasm-unsafe-eval'` (hash-wasm requires WebAssembly).
- `worker-src` allows `blob:` (worker bundling).
- Inline scripts are **not** allowed.

### Dependencies

`.npmrc` enforces strict policies:

- `ignore-scripts=true` — no lifecycle scripts by default.
- `save-exact=true` — no semver drift.
- `minimum-release-age=1440` — 24h quarantine for new releases.
- `engine-strict=true` — early failure if Node is incompatible.
- `verify-store-integrity=true` — cryptographic store validation.

The Dockerfile uses `--ignore-scripts=false` as a deliberate trust boundary decision.

## Git Hooks and Commits

```sh
pnpm prepare:hooks    # Install hooks (no Husky, no postinstall)
```

- `pre-commit`: runs `pnpm check`
- `commit-msg`: validates with commitlint (Conventional Commits)

## Deployment

The project is ready for **Dokploy** with a multi-stage Dockerfile:

```sh
docker build .        # Produces Node 24 Alpine container on port 3000
```

Runtime: `node ./dist/server/entry.mjs`

## Requirements

- **Node 24+** (ESM strict)
- **pnpm 10.29.1**

## Notes

- Lite is the only active product scope.
- No service worker or offline guarantee. The manifest exists only as a metadata baseline.
- Cryptography has not been formally audited. It is a serious baseline, not an audited product.
