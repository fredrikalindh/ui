# UI Registry

This repository is a **shadcn-style component registry**: reusable React components (TypeScript, Tailwind CSS) plus a Next.js documentation site. Published components can be installed in other projects with the shadcn CLI.

**Documentation:** [ui.fredrika.dev/docs](https://ui.fredrika.dev/docs)

---

## Install components in your project

Use the shadcn CLI with the registry URL:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

Replace `<name>` with a component id. The full list is in [registry.json](registry.json).

---

## Run the docs site locally

### Prerequisites

- [Node.js](https://nodejs.org/) (use an [LTS](https://nodejs.org/en/about/previous-releases) release compatible with your Next.js version)
- [pnpm](https://pnpm.io/installation) (this repo uses `pnpm-lock.yaml`)

### Install and dev server

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The dev script runs Next.js with Turbopack (`next dev --turbopack`).

### Other scripts

| Command | Purpose |
| --- | --- |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint (Next.js) |
| `pnpm test` | Vitest (once) |
| `pnpm test:watch` | Vitest (watch) |
| `pnpm registry:build` | Regenerate registry JSON under `public/r/` (`shadcn build`) |

---

## Repository layout

```
.
├── registry/
│   ├── ui/          # Source components shipped to consumers
│   └── blocks/      # Example implementations and demos
├── content/
│   └── docs/        # MDX documentation
├── components/      # Docs site UI
├── app/             # Next.js App Router
└── public/
    └── r/           # Generated registry JSON (build output; committed for deploy)
```

---

## Contributing a new component

1. Add the component under `registry/ui/`.
2. Register it in [registry.json](registry.json) (metadata, dependencies, file paths).
3. Add docs in `content/docs/`.
4. Run `pnpm registry:build` so `public/r/` contains the updated JSON payloads for the CLI.

---

## Tests

```bash
pnpm test          # single run
pnpm test:watch    # watch mode
```
