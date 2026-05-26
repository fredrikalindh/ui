"use client";

import * as React from "react";

import { MarkdownDocEditor } from "@/components/markdown-doc-editor";

const INITIAL = `---
schemaVersion: 1
composerId: "9cda302d-da7e-42eb-a8ec-3a566df3b16d"
title: "Conversation Todo"
---

- [ ] Figure out what it would take to fetch titles and favicons for random URLs locally, and why that might be a security issue
- [x] Review GFM task list rendering in preview
`;

export default function MarkdownPlaygroundPage() {
  const [source, setSource] = React.useState(INITIAL);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col p-6">
      <h1 className="mb-4 text-lg font-medium">Markdown doc editor</h1>
      <div className="flex min-h-[420px] flex-col rounded-lg border">
        <MarkdownDocEditor value={source} onChange={setSource} />
      </div>
      <p className="text-muted-foreground mt-4 text-sm">
        Toggle checkboxes in Preview to update <code>- [ ]</code> / <code>- [x]</code> in the
        markdown source.
      </p>
    </main>
  );
}
