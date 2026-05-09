# UI Registry

A [shadcn-style component registry](https://ui.shadcn.com/docs/registry): reusable React components (TypeScript and Tailwind CSS), plus a Next.js app that hosts documentation and the JSON install endpoints published at [ui.fredrika.dev](https://ui.fredrika.dev).

**Documentation:** [ui.fredrika.dev/docs](https://ui.fredrika.dev/docs)

## Install a component

Add a component to your project with the shadcn CLI. Use each item's `name` from [`registry.json`](registry.json) in place of `<name>` (for example, `diff-viewer`):

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

See [`registry.json`](registry.json) for the full list of components and their metadata.

## Local development

This repository uses [pnpm](https://pnpm.io/) (`pnpm-lock.yaml` is the lockfile).

```bash
pnpm install
pnpm dev
```

The site runs at [http://localhost:3000](http://localhost:3000). Documentation is served under `/docs`.

## Project structure

```
.
├── registry/
│   ├── ui/          # Components shipped to consumers via the registry
│   └── blocks/      # Examples and demos referenced from registry items
├── content/
│   └── docs/        # MDX documentation
├── components/      # UI for the Next.js site and docs
├── app/             # Next.js App Router (home, docs routes)
├── public/
│   └── r/           # Registry JSON for CLI installs (see below)
├── registry.json    # Registry definition (source for `pnpm registry:build`)
└── scripts/         # Repository tooling (for example, media metadata generation)
```

## Registry build output

After you change [`registry.json`](registry.json) or files under `registry/`, regenerate the JSON under `public/r/`:

```bash
pnpm registry:build
```

Commit updated files in `public/r/` when they change so installs keep working against the live URLs (`https://ui.fredrika.dev/r/<name>.json`).

## Contributing

### Adding or updating a component

1. Add or edit source under `registry/ui/` (and related `registry/blocks/` examples if needed).
2. Update the matching entry in [`registry.json`](registry.json) (paths, dependencies, `registryDependencies`, etc.).
3. Add or update documentation in `content/docs/`.
4. Run `pnpm registry:build` and commit any changes under `public/r/`.
5. Run `pnpm test` and `pnpm lint` before opening a pull request.

## Testing

```bash
pnpm test          # Run the suite once (Vitest)
pnpm test:watch    # Watch mode
pnpm test:ui       # Vitest UI
```
