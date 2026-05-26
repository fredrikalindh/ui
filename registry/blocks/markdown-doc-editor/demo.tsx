"use client";

import * as React from "react";

import { MarkdownDocEditor } from "@/registry/ui/markdown-doc-editor";

const INITIAL_MARKDOWN = `---
schemaVersion: 1
composerId: "9cda302d-da7e-42eb-a8ec-3a566df3b16d"
title: "Conversation Todo"
---

- [ ] Figure out what it would take to fetch titles and favicons for random URLs locally, and why that might be a security issue
- [x] Ship interactive todo lists in markdown preview
`;

export function MarkdownDocEditorDemo() {
  const [markdown, setMarkdown] = React.useState(INITIAL_MARKDOWN);

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <MarkdownDocEditor value={markdown} onChange={setMarkdown} />
    </div>
  );
}
