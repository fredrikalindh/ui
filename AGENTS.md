# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a Next.js 16 portfolio and UI component registry site ("Fredrika UI"). It is a single-package project (not a monorepo) with no database, no authentication, and no external API keys required.

### Running the app

- **Dev server**: `pnpm dev` (runs on port 3000 with Turbopack)
- **Tests**: `pnpm test` (Vitest, 60 tests in `registry/ui/diff/__tests__/`)
- **Build**: `pnpm build`

### Known issues

- `pnpm lint` (`next lint`) does not work with Next.js 16 — the `lint` subcommand was removed. ESLint also has a circular reference issue with the current `eslint-config-next` + flat config setup. This is a pre-existing upstream compatibility issue.

### Build script approval

pnpm 10 blocks native dependency build scripts by default. The `pnpm.onlyBuiltDependencies` field in `package.json` whitelists the required packages (`@tailwindcss/oxide`, `esbuild`, `msw`, `sharp`, `unrs-resolver`). If new native dependencies are added, they must be added to this list or `pnpm install` will skip their build scripts.

### Pre-commit hook

Husky runs `scripts/generate-media-metadata.mjs` on commit and auto-stages `public/media-metadata.json`.
