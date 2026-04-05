# Contributing

Thank you for your interest in contributing to ssvault.io! Every contribution is welcome.

## Getting Started

### Prerequisites

- **Node 24+** (ESM strict)
- **pnpm 10.29.1**
- **Git**

### Setup

```bash
pnpm install
pnpm prepare:hooks
```

### Building and Testing

```bash
# Run all checks (lint + format + typecheck)
pnpm check

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run a single test file
pnpm vitest run src/shared/lib/canonical-service.test.ts

# Development server
pnpm dev
```

## Code Style

- Formatting is managed by **Prettier** with `prettier-plugin-astro`.
- Run `pnpm format` to auto-format all files before committing.
- Run `pnpm format:check` to verify formatting without modifying files.
- Linting uses **ESLint** with flat config (Astro + TypeScript).
- Run `pnpm lint:fix` to auto-fix lint issues.

### Design System

- **Fonts**: Geist (headings), Geist Mono (labels/technical), Inter (body)
- **Colors**: follow tokens defined in `src/styles/global.css`
- **Components**: use shared UI components from `src/shared/ui/`
- **CSS classes**: prefer utility classes (`surface-card`, `label-mono`, `btn-gradient`, etc.)

## Commit Conventions

This project uses **Conventional Commits**. Your commit messages should follow this format:

```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `ci`, `chore`

Examples:

- `feat(lite): add passphrase separator preview`
- `fix(storage): resolve IndexedDB transaction error on Safari`
- `docs: update contributing guide`

Git hooks enforce this via commitlint. Install hooks with `pnpm prepare:hooks`.

## Branch Naming

Use descriptive branch names prefixed with the type of change:

- `feat/short-description` — new features
- `fix/short-description` — bug fixes
- `docs/short-description` — documentation only
- `refactor/short-description` — code restructuring

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Add or update tests for every code change.
3. Run `pnpm check` and ensure all checks pass.
4. Format your code with `pnpm format`.
5. Open a pull request with a clear description of the change and its motivation.
6. Link any related issues.

## Security

If you discover a security vulnerability, **do NOT open a public issue**. See [SECURITY.md](SECURITY.md) for reporting instructions.

## Documentation

Keep documentation in English. UI and user-facing content is in Spanish (es_ES). Update relevant docs when changing behavior or adding features.
