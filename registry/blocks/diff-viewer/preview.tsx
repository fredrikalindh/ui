"use client";

import * as React from "react";
import { motion } from "motion/react";
import { DiffViewer } from "@/registry/blocks/diff-viewer/diff-viewer";
import type { ParseOptions } from "@/registry/ui/diff/utils/parse";
import { Label } from "@/registry/ui/label";
import { Slider } from "@/registry/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

type PreviewProps = {
  patch: string;
  initialOptions?: Partial<ParseOptions>;
};

const EXPANDED_WIDTH = 400;
const EXPANDED_HEIGHT = 225;
const COLLAPSED_WIDTH = 220;
const COLLAPSED_HEIGHT = 50;

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
    <div className="flex flex-col relative items-center h-full min-h-0 flex-1 pb-40 lg:pb-0">
      <motion.div
        animate={{
          height: mergeModifiedLines ? 0 : 100,
        }}
      />
      <DiffViewer
        patch={patch}
        options={{
          mergeModifiedLines,
          maxChangeRatio,
          maxDiffDistance,
          inlineMaxCharEdits,
        }}
      />

      <motion.div
        className="flex flex-col gap-2 p-4 max-w-md mx-auto absolute bottom-2 left-0 right-0 bg-card/40 backdrop-blur-sm rounded-xl border shadow-2xl z-100 overflow-hidden"
        initial={{
          width: COLLAPSED_WIDTH,
          height: COLLAPSED_HEIGHT,
        }}
        animate={{
          width: mergeModifiedLines ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          height: mergeModifiedLines ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
          borderRadius: mergeModifiedLines ? 14 : 20,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / 1,
          damping: 45,
          mass: 0.7,
          delay: mergeModifiedLines ? 0 : 0.08,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Checkbox
            id="mergeModifiedLines"
            checked={mergeModifiedLines}
            onCheckedChange={(state) => setMergeModifiedLines(state === true)}
          />
          <Label
            className="cursor-pointer w-full"
            onClick={() => setMergeModifiedLines(!mergeModifiedLines)}
          >
            Merge modified lines
          </Label>
        </div>

        <motion.div
          className="flex flex-col gap-2"
          animate={{
            opacity: mergeModifiedLines ? 1 : 0,
          }}
        >
          <Slider
            id="maxChangeRatio"
            min={0}
            max={1}
            step={0.01}
            value={[maxChangeRatio]}
            onValueChange={(value) => setMaxChangeRatio(value[0])}
            disabled={!mergeModifiedLines}
            label="Change ratio"
            className="min-w-[360px]"
          />

          <Slider
            id="maxDiffDistance"
            min={1}
            max={60}
            step={1}
            value={[maxDiffDistance]}
            onValueChange={(value) => setMaxDiffDistance(value[0])}
            disabled={!mergeModifiedLines}
            label="Diff distance"
            className="min-w-[360px]"
          />

          <Slider
            id="inlineMaxCharEdits"
            min={0}
            max={10}
            step={1}
            value={[inlineMaxCharEdits]}
            onValueChange={(value) => setInlineMaxCharEdits(value[0])}
            disabled={!mergeModifiedLines}
            label="Char edits"
            className="min-w-[360px]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
