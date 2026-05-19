# UI Registry

A curated collection of reusable UI components built with React, TypeScript, and Tailwind CSS. Install components directly into your project with the shadcn CLI, or browse the documentation site at **[ui.fredrika.dev](https://ui.fredrika.dev/docs)**.

The repo is both:

- A **shadcn-style component registry** under `registry/`, served as static JSON from `public/r/`.
- The **Next.js documentation site** that previews and documents the components.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) with Turbopack in dev
- React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/postcss`
- [fumadocs](https://fumadocs.dev) for MDX documentation (`content/docs/`)
- [shadcn](https://ui.shadcn.com) registry tooling
- [Vitest](https://vitest.dev) for unit tests

## Install a Component

Add any component to your project using the shadcn CLI:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

The currently published components are listed in [`registry.json`](registry.json) (for example: `diff-viewer`, `collapsible-card`, `copy-button`, `button`). Their generated payloads live in [`public/r/`](public/r).

## Local Development

### Prerequisites

- Node.js 20 or newer (Next 16 and several dev dependencies require Node ≥ 18; Node 20 LTS is recommended).
- [pnpm](https://pnpm.io) (the repo ships a `pnpm-lock.yaml`).

### Install

```bash
pnpm install
```

This also runs the `prepare` script, which sets up the [husky](https://typicode.github.io/husky/) pre-commit hook.

### Run the docs site

```bash
pnpm dev
```

Available at [http://localhost:3000](http://localhost:3000). Uses `next dev --turbopack`.

### Production build

```bash
pnpm build   # next build
pnpm start   # next start (serves the production build)
```

### Lint

```bash
pnpm lint    # next lint (eslint-config-next, core-web-vitals + typescript)
```

## Testing

Tests live next to their sources under `registry/**` (matching `*.test.ts(x)` / `*.spec.ts(x)`; see [`vitest.config.ts`](vitest.config.ts)).

```bash
pnpm test         # vitest run
pnpm test:watch   # vitest (watch mode)
pnpm test:ui      # vitest --ui (interactive browser UI)
```

Coverage is configured with the V8 provider; pass `--coverage` to any of the above to generate the report.

## Building the Registry

The shadcn-compatible JSON payloads in `public/r/` are produced by:

```bash
pnpm registry:build   # shadcn build
```

Run this after editing `registry.json` or any component under `registry/ui/` so consumers installing via the shadcn CLI pick up your changes.

## Optional Scripts

- `pnpm generate:media-meta` — runs [`scripts/generate-media-metadata.mjs`](scripts/generate-media-metadata.mjs) to refresh `public/media-metadata.json` (aspect ratios + blur placeholders for images/videos in `public/`). The pre-commit hook runs this automatically. Image processing uses macOS `sips`; video processing requires `ffmpeg` / `ffprobe`.

## Project Structure

```
.
├── app/             # Next.js App Router pages (docs site)
├── content/docs/    # MDX documentation for each component
├── components/      # Documentation site UI (non-registry components)
├── registry/
│   ├── ui/          # Source components published to consumers
│   └── blocks/      # Example implementations and demos
├── lib/             # Shared utilities (utils, source, highlight-code, …)
├── hooks/           # Shared React hooks
├── scripts/         # Repo-local scripts (e.g. media metadata)
├── public/
│   └── r/           # Generated registry JSON payloads (build artifacts)
├── registry.json    # Registry manifest (items, files, dependencies)
├── components.json  # shadcn CLI config (aliases, style, baseColor)
├── vitest.config.ts # Test runner config
└── next.config.mjs  # Next.js + fumadocs-mdx config
```

## Contributing

### Adding a new component

1. Create your component under `registry/ui/` (and any example block under `registry/blocks/`).
2. Add an entry to [`registry.json`](registry.json) with metadata, `dependencies`, `registryDependencies`, and the list of `files` (each with a `path`, `type`, and `target`).
3. Add tests under `registry/**/__tests__/` or alongside the component as `*.test.ts(x)`.
4. Write documentation in `content/docs/` (MDX).
5. Regenerate registry payloads with `pnpm registry:build`.

The generated payloads in `public/r/` are committed and deployed with the site, which is what allows consumers to install components via `npx shadcn@latest add …`.

## License

MIT — see [LICENSE](LICENSE).
