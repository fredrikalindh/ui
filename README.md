# UI Registry

A curated registry of reusable UI components built with React, TypeScript, and Tailwind CSS. Install components directly into your project with the shadcn CLI.

🌐 **[Visit the docs](https://ui.fredrika.dev/docs)**


## Quick Start

### Install from the Registry

Add a component to your project using the shadcn CLI:

```bash
npx shadcn@latest add https://ui.fredrika.dev/r/<name>.json
```

Replace `<name>` with a component name from [registry.json](registry.json).


## Local Development

### Setup

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`. Coffee is optional, but highly recommended.

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

1. Create your component in `registry/ui/`
2. Add an entry to `registry.json` with metadata and dependencies
3. Add documentation in `content/docs/`
4. Build the registry to generate JSON payloads

The generated payloads in `public/r/` are automatically included in your deployment, allowing consumers to install components via the shadcn CLI.

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```
