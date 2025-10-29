"use client";

import * as React from "react";

import { DiffViewer } from "@/registry/blocks/diff-viewer/diff-viewer";
import type { ParseOptions } from "@/registry/ui/diff/utils/parse";
import { Label } from "@/registry/ui/label";
import { Slider } from "@/components/ui/slider";

type PreviewProps = {
  patch: string;
  initialOptions?: Partial<ParseOptions>;
};

export function DiffOptionsPreview({ patch, initialOptions }: PreviewProps) {
  const [mergeModifiedLines, setMergeModifiedLines] = React.useState(
    initialOptions?.mergeModifiedLines ?? true
  );
  const [maxChangeRatio, setMaxChangeRatio] = React.useState(
    initialOptions?.maxChangeRatio ?? 0.45
  );
  const [maxDiffDistance, setMaxDiffDistance] = React.useState(
    initialOptions?.maxDiffDistance ?? 30
  );
  const [inlineMaxCharEdits, setInlineMaxCharEdits] = React.useState(
    initialOptions?.inlineMaxCharEdits ?? 2
  );

  // Sync state with incoming presets when active preview changes
  React.useEffect(() => {
    if (initialOptions) {
      if (typeof initialOptions.mergeModifiedLines === "boolean") {
        setMergeModifiedLines(initialOptions.mergeModifiedLines);
      } else {
        setMergeModifiedLines(true);
      }
      if (typeof initialOptions.maxChangeRatio === "number") {
        setMaxChangeRatio(initialOptions.maxChangeRatio);
      } else {
        setMaxChangeRatio(0.45);
      }
      if (typeof initialOptions.maxDiffDistance === "number") {
        setMaxDiffDistance(initialOptions.maxDiffDistance);
      } else {
        setMaxDiffDistance(30);
      }
      if (typeof initialOptions.inlineMaxCharEdits === "number") {
        setInlineMaxCharEdits(initialOptions.inlineMaxCharEdits);
      } else {
        setInlineMaxCharEdits(2);
      }
    }
  }, [initialOptions]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="mergeModifiedLines">Merge modified lines</Label>
        <div className="flex items-center gap-3">
          <input
            id="mergeModifiedLines"
            type="checkbox"
            checked={mergeModifiedLines}
            onChange={(e) => setMergeModifiedLines(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-muted-foreground">
            {mergeModifiedLines ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Label htmlFor="maxChangeRatio">
            Max change ratio ({maxChangeRatio.toFixed(2)})
          </Label>
          <Slider
            id="maxChangeRatio"
            min={0}
            max={0.99}
            step={0.01}
            value={[maxChangeRatio]}
            onValueChange={(value) => setMaxChangeRatio(value[0])}
            disabled={!mergeModifiedLines}
          />
          <p className="text-xs text-muted-foreground">
            Lower values require lines to be more similar to merge.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Label htmlFor="maxDiffDistance">
            Max diff distance ({maxDiffDistance})
          </Label>
          <Slider
            id="maxDiffDistance"
            min={1}
            max={60}
            step={1}
            value={[maxDiffDistance]}
            onValueChange={(value) => setMaxDiffDistance(value[0])}
            disabled={!mergeModifiedLines}
          />
          <p className="text-xs text-muted-foreground">
            How far to look to pair deletes and inserts.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Label htmlFor="inlineMaxCharEdits">
            Inline max char edits ({inlineMaxCharEdits})
          </Label>
          <Slider
            id="inlineMaxCharEdits"
            min={0}
            max={10}
            step={1}
            value={[inlineMaxCharEdits]}
            onValueChange={(value) => setInlineMaxCharEdits(value[0])}
            disabled={!mergeModifiedLines}
          />
          <p className="text-xs text-muted-foreground">
            Character edits to inline-diff before falling back to whole-token.
          </p>
        </div>
      </div>

      <DiffViewer
        patch={patch}
        options={{
          mergeModifiedLines,
          maxChangeRatio,
          maxDiffDistance,
          inlineMaxCharEdits,
        }}
      />
    </div>
  );
}
