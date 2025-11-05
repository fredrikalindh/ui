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
    wordDiff: false,
  },
  merged: {
    mergeModifiedLines: true,
    maxDiffDistance: 1,
    maxChangeRatio: 0.45,
    inlineMaxCharEdits: 0,
    wordDiff: false,
  },
  dissimilarRaw: {
    mergeModifiedLines: true,
    maxChangeRatio: 1,
    maxDiffDistance: 1,
    inlineMaxCharEdits: 0,
    wordDiff: false,
  },
  dissimilar: {
    mergeModifiedLines: true,
    maxChangeRatio: 0.45,
    maxDiffDistance: 1,
    inlineMaxCharEdits: 0,
    wordDiff: false,
  },
  overview: {
    mergeModifiedLines: true,
    maxChangeRatio: 0.45,
    maxDiffDistance: 30,
    wordDiff: false,
  },
  complexMerged: {
    mergeModifiedLines: true,
    maxChangeRatio: 0.45,
    maxDiffDistance: 30,
    inlineMaxCharEdits: 0,
    wordDiff: false,
  },
  wordDiff: {
    mergeModifiedLines: true,
    maxDiffDistance: 30,
    inlineMaxCharEdits: 0,
    wordDiff: true,
    maxChangeRatio: 1,
  },
  separated: {
    mergeModifiedLines: true,
    maxChangeRatio: 0.45,
    maxDiffDistance: 30,
    inlineMaxCharEdits: 0,
    wordDiff: true,
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
    <div className="h-full w-full bg-muted p-2 lg:px-6">
      <DiffOptionsPreview patch={EXAMPLE_DIFF} initialOptions={options} />
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
