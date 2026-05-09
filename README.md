# UI Registry

**UI Registry** is a curated, shadcn-compatible component registry: reusable React UI built with TypeScript and Tailwind CSS, documented on the web and installable straight into your project with the [shadcn CLI](https://ui.shadcn.com/docs/cli). This repository holds the components, [`registry.json`](registry.json), the docs site, and build output for the published registry payloads.

### Who this is for

| Audience | Guidance |
|:--|:--|
| **Consumers** | You are integrating components into your own app—use **[the docs](https://ui.fredrika.dev/docs)** and the install command below. |
| **Contributors** | You are extending the registry or the docs site—use **Local development**, **Project structure**, **Contributing**, and **Testing**. |

🌐 **[Visit the docs](https://ui.fredrika.dev/docs)**

---

## Quick start (consumers)

### Install from the registry

Add any component to your project using the shadcn CLI:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

Replace `<name>` with the component slug. The full catalog lives in [`registry.json`](registry.json).

---

## Local development (contributors)

### Setup

```bash
pnpm install
pnpm dev
```

The site runs at `http://localhost:3000`.

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

### Contributing

#### Adding a new component

1. Create your component in `registry/ui/`.
2. Add an entry to `registry.json` with metadata and dependencies.
3. Add documentation in `content/docs/`.
4. Build the registry to generate JSON payloads.

The generated payloads in `public/r/` are included in deployment so consumers can install components via the shadcn CLI.

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```
