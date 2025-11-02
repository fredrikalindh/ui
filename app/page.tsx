import * as React from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { ExperimentCard } from "@/components/experiment-card";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl tracking-tight font-heading">UI</h1>
          <p className="text-muted-foreground">A minimal UI library.</p>
        </div>
        <ThemeToggle />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
        <ExperimentCard
          name="Unified Diff Viewer"
          date="2025-01-01"
          media={{
            type: "image",
            src: "/unified-diff-viewer.png",
            alt: "Unified Diff Viewer",
            aspectRatio: "3/2",
          }}
          url="/docs"
          buttonLabel="View Demo"
          theme="light"
          textPosition="top"
        />
      </main>
    </div>
  );
}
