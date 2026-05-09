# UI Registry

A **shadcn/ui-compatible component registry**: reusable React UI in TypeScript and Tailwind CSS, plus a Next.js docs site where they are documented and previewed. Consumers install components into their own projects with the shadcn CLI.

🌐 **Docs:** https://ui.fredrika.dev/docs

## Prerequisites

- A recent Node.js release (matching this repo’s Next.js version).
- **[pnpm](https://pnpm.io/)** — installs and scripts are pinned to this package manager (`pnpm-lock.yaml`).

## Use the registry from your project

Pick a component **slug** from the `name` field of each entry in [`registry.json`](registry.json) (for example `button`, `diff-viewer`), then run:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/button.json
```

Replace `button` with the slug you want. The CLI fetches that JSON endpoint and merges the component into your app.

## Work on this repository

```bash
pnpm install
pnpm dev
```

The documentation site is served at `http://localhost:3000`.

Useful scripts (see `package.json` for the full list):

- **`pnpm build`** — production Next.js build.
- **`pnpm start`** — run the production server after a build.
- **`pnpm lint`** — ESLint.
- **`pnpm test`** / **`pnpm test:watch`** — Vitest.
- **`pnpm registry:build`** — runs `shadcn build` and regenerates the JSON files under `public/r/` from `registry.json`.

## Project layout

```
.
├── registry/
│   ├── ui/          # Component source intended for consumers
│   └── blocks/      # Demos and example implementations
├── content/
│   └── docs/        # MDX documentation
├── components/      # Docs site–only UI
├── app/             # Next.js App Router
└── public/
    └── r/           # Published registry JSON (output of `pnpm registry:build`)
```

## Contributing a new component

1. Implement the component under `registry/ui/` (and optional demos under `registry/blocks/`).
2. Add an item to [`registry.json`](registry.json) with paths, dependencies, and metadata.
3. Add or update documentation in `content/docs/`.
4. Run **`pnpm registry:build`** so `public/r/` stays in sync for local checks and deployment.

After deploy, consumers install the new component using the same URL pattern as above, with the new slug in place of the filename (for example `https://ui.fredrika.dev/r/my-component.json`).
