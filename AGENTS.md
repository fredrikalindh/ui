# Agents

## Cursor Cloud specific instructions

This is a self-contained Next.js 16 app (UI component registry + docs site). No databases, Docker, or external services are required.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Dev server | `pnpm dev` (port 3000, Turbopack) |
| Tests | `pnpm test` (vitest) |
| Build | `pnpm build` |
| Registry build | `pnpm registry:build` (generates `public/r/*.json`) |

### Gotchas

- **Lint**: `pnpm lint` calls `next lint` which was removed in Next.js 16. ESLint is configured (`eslint.config.mjs`) but running `npx eslint .` hits a circular-structure bug with `@eslint/eslintrc` FlatCompat + `eslint-config-next`. Lint is effectively broken in this repo until the config is updated.
- **Build scripts**: pnpm v10+ blocks native addon build scripts by default. After `pnpm install`, you may see warnings about ignored scripts for `@tailwindcss/oxide`, `esbuild`, `sharp`, etc. The dev server still works because Turbopack uses its own bundled esbuild. If you encounter issues, run `cd node_modules/.pnpm/esbuild@*/node_modules/esbuild && node install.js`.
- **Pre-commit hook**: Husky runs `scripts/generate-media-metadata.mjs` and stages `public/media-metadata.json`. This runs automatically on commit.
