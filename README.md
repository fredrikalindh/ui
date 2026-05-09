# UI Registry

**UI Registry** is a curated collection of reusable UI components (React, TypeScript, Tailwind CSS) published as a shadcn-compatible registry. Consumers install components with the shadcn CLI; this repository is also the Next.js app and build pipeline that serves the public registry and documentation.

| Audience | What you do here |
| -------- | ---------------- |
| **Consumers** | Add components to your app using the install URL pattern below. Browse [registry.json](registry.json) for available components. |
| **Contributors** | Clone the repo, run local dev, change files under `registry/`, update `registry.json`, add docs, build artifacts into `public/r/`. |

🌐 **[Visit the docs](https://ui.fredrika.dev/docs)**

## Quick start (consumers)

### Install from the registry

Add any component to your project using the shadcn CLI:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

Check [registry.json](registry.json) for the complete list of available components.

## Contributors

### Local development

```bash
pnpm install
pnpm dev
```

The site will be available at `http://localhost:3000`.

### Project structure

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

### Adding a new component

1. Create your component in `registry/ui/`
2. Add an entry to `registry.json` with metadata and dependencies
3. Add documentation in `content/docs/`
4. Build the registry to generate JSON payloads

The generated payloads in `public/r/` are automatically included in your deployment, allowing consumers to install components via the shadcn CLI.

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```
