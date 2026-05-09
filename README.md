# UI Registry

A **shadcn-style component registry** and documentation site: reusable React UI (TypeScript, Tailwind CSS) that others can install with the shadcn CLI, plus a Next.js app that hosts the docs and demos.

**Documentation:** [ui.fredrika.dev/docs](https://ui.fredrika.dev/docs)


## Install components in your project

Use the shadcn CLI and point at this registry’s JSON URLs:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

Replace `<name>` with a component id. See [registry.json](registry.json) for all entries.


## Run this repo locally

**Prerequisites:** [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) (this project uses a `pnpm` lockfile and scripts).

| Command | What it does |
|--------|----------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server ([Turbopack](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)) at http://localhost:3000 |
| `pnpm build` | Production build (Next.js) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint via Next.js |
| `pnpm test` | Run tests once (Vitest) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:ui` | Vitest with UI |
| `pnpm registry:build` | Regenerate registry payloads (`shadcn build` → `public/r/`) |

**Stack (high level):** Next.js, React 19, TypeScript, Tailwind CSS 4, Fumadocs (MDX docs), Vitest.


## Repository layout

```
.
├── registry/
│   ├── ui/          # Source components for the registry
│   └── blocks/      # Example pages / demos
├── content/
│   └── docs/        # MDX documentation
├── components/      # Site-only UI for the docs app
├── app/             # Next.js App Router
└── public/
    └── r/           # Generated registry JSON (build artifact)
```


## Contributing a component

1. Add or update source under `registry/ui/`.
2. Add an item to [registry.json](registry.json) (metadata, dependencies, file paths).
3. Add or update docs in `content/docs/`.
4. Run `pnpm registry:build` so `public/r/` stays in sync for installs and deploys.


## Testing

```bash
pnpm test
pnpm test:watch
```
