# UI Registry

A curated collection of reusable UI components built with React, TypeScript,
and Tailwind CSS. Install components into your project with the shadcn CLI.

The same repo powers the **documentation site** (Next.js, App Router): it lists
components, hosts MDX docs, and serves the registry payloads used by the CLI.

🌐 **[Documentation](https://ui.fredrika.dev/docs)**

## Quick start: install a component

Use the shadcn CLI with a registry URL. Replace `<name>` with the component id
(see [`registry.json`](registry.json) for the full list).

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

## Local development

**Prerequisites:** [pnpm](https://pnpm.io/installation). Install dependencies
from the repo root with pnpm.

| Step | Command | Notes |
| --- | --- | --- |
| Install deps | `pnpm install` | |
| Dev server | `pnpm dev` | Next.js with Turbopack; open <http://localhost:3000> |
| Lint | `pnpm lint` | ESLint via Next.js |
| Production build | `pnpm build` | `pnpm start` serves the built app |

## Project structure

```text
.
├── registry/
│   ├── ui/          # Source components shipped to consumers
│   └── blocks/      # Example implementations and demos
├── content/
│   └── docs/        # MDX documentation files
├── components/      # Documentation site UI components
├── app/             # Next.js App Router pages
└── public/
    └── r/           # Generated registry JSON payloads (build artifacts)
```

## Contributing

### Add or update a component

1. Add or edit source under `registry/ui/`.
2. Update [`registry.json`](registry.json) with metadata and dependencies for
   the component.
3. Add or update MDX under `content/docs/`.
4. Regenerate registry files: `pnpm registry:build` (writes JSON under
   `public/r/`).

The files in `public/r/` are build artifacts included in deployment so consumers
can keep using
`npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json`.

## Testing

Tests use Vitest.

```bash
pnpm test        # run once
pnpm test:watch  # watch mode
pnpm test:ui     # Vitest UI
```
