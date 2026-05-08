# UI Registry

A curated registry of reusable UI components built with React, TypeScript, and Tailwind CSS. Components can be installed directly into a project with the shadcn CLI.

- Documentation: [ui.fredrika.dev/docs](https://ui.fredrika.dev/docs)
- Registry index: [`registry.json`](registry.json)

## Using the Registry

Install a component by passing its generated registry payload URL to the shadcn CLI:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<component-name>.json
```

Replace `<component-name>` with an item name from [`registry.json`](registry.json), such as `button` or `diff-viewer`.

## Local Development

### Prerequisites

- Node.js and pnpm

### Start the documentation site

Install dependencies and start the local Next.js development server:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` to view the site.

### Useful commands

```bash
# Build the documentation site
pnpm build

# Generate registry JSON payloads in public/r/
pnpm registry:build

# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Project Structure

```
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

### Adding a New Component

1. Create the component source in `registry/ui/`.
2. Add an entry to `registry.json` with the component metadata, dependencies, and files.
3. Add or update documentation in `content/docs/`.
4. Run `pnpm registry:build` to generate the JSON payloads in `public/r/`.
5. Run the relevant validation commands, such as `pnpm test` or `pnpm build`.

The generated payloads in `public/r/` are automatically included in your deployment, allowing consumers to install components via the shadcn CLI.
