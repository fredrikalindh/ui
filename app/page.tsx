import * as React from "react";

import { DiffViewer } from "@/registry/blocks/diff-viewer/diff-viewer";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl tracking-tight">Diff</h1>
        <p className="text-muted-foreground">
          A minimal diff viewer component.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-8">
        <DiffViewer />
      </main>
    </div>
  );
}
