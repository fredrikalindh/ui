# UI Registry

A curated collection of reusable UI components built with React, TypeScript,
and Tailwind CSS. Components can be installed into other projects with the
shadcn CLI.

**Docs:** [ui.fredrika.dev/docs](https://ui.fredrika.dev/docs)

## Quick start

Install a component from the registry with the shadcn CLI:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

Replace `<name>` with a component name from
[`registry.json`](registry.json).

## Local development

Install dependencies and start the documentation site:

```bash
pnpm install
pnpm dev
```

The site will be available at `http://localhost:3000`.

Useful commands:

```bash
pnpm dev             # Start the local development server
pnpm build           # Build the Next.js site
pnpm registry:build  # Generate registry payloads in public/r/
pnpm test            # Run tests once
pnpm test:watch      # Run tests in watch mode
```

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

### Adding a component

1. Create the component in `registry/ui/`.
2. Add an entry to `registry.json` with its metadata and dependencies.
3. Add documentation in `content/docs/`.
4. Run `pnpm registry:build` to generate the JSON payloads in `public/r/`.

The generated payloads in `public/r/` are included in deployment so consumers
can install components through the shadcn CLI.

## Testing

Run the test suite once:

```bash
pnpm test
```

Run tests in watch mode while developing:

```bash
pnpm test:watch
```
