"use client";

import * as React from "react";

import {
  DocsPreviewPane,
  DocsPreviewProvider,
  useDocsPreview,
} from "./docs-preview";
import { DiffOptionsPreview } from "@/registry/blocks/diff-viewer/preview";
import { EXAMPLE_DIFF } from "@/registry/blocks/diff-viewer/data";
import { ParseOptions } from "@/registry/ui/diff/utils";

const OPTION_PRESETS: { [key: string]: Partial<ParseOptions> } = {
  github: {
    mergeModifiedLines: false,
    maxChangeRatio: 0.45,
    maxDiffDistance: 1,
    inlineMaxCharEdits: 0,
  },
  merged: {
    mergeModifiedLines: true,
    maxDiffDistance: 1,
    maxChangeRatio: 0.45,
    inlineMaxCharEdits: 0,
  },
  dissimilarRaw: {
    mergeModifiedLines: true,
    maxChangeRatio: 1,
    maxDiffDistance: 1,
    inlineMaxCharEdits: 0,
  },
  dissimilar: {
    mergeModifiedLines: true,
    maxChangeRatio: 0.45,
    maxDiffDistance: 1,
    inlineMaxCharEdits: 0,
  },
  overview: {
    mergeModifiedLines: true,
    maxChangeRatio: 0.45,
    maxDiffDistance: 30,
  },
  complexMerged: {
    mergeModifiedLines: true,
    maxChangeRatio: 0.45,
    maxDiffDistance: 30,
    inlineMaxCharEdits: 0,
  },
};

function getOptionsFromSrc(src: string | undefined) {
  if (!src) return undefined;
  const key = src.split("/").pop();
  if (!key) return undefined;
  return (
    OPTION_PRESETS[key as keyof typeof OPTION_PRESETS] ??
    OPTION_PRESETS.overview
  );
}

function DiffDocsPaneRenderer() {
  const { activePreview } = useDocsPreview();
  const options = getOptionsFromSrc(activePreview?.src);

  return (
    <div className="h-full w-full bg-muted p-2 lg:p-6">
      <div className="w-full max-w-3xl mx-auto my-auto">
        <DiffOptionsPreview patch={EXAMPLE_DIFF} initialOptions={options} />
      </div>
    </div>
  );
}

export function DiffDocsPreviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const renderPreview = React.useCallback(() => <DiffDocsPaneRenderer />, []);

  return (
    <DocsPreviewProvider renderPreview={renderPreview}>
      {children}
    </DocsPreviewProvider>
  );
}

export { DocsPreviewPane };
