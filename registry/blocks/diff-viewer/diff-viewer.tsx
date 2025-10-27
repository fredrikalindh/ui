import { Diff } from "@/registry/ui/diff";
import { EXAMPLE_DIFF } from "./data";

import {
  CollapsibleCard,
  CollapsibleCardHeader,
  CollapsibleCardTitle,
  CollapsibleCardContent,
} from "@/registry/ui/collapsible-card";
import { extractStatsFromPatch } from "@/registry/ui/diff/parse-headers";
import { Badge } from "@/components/ui/badge";

// TODO: scroll area?
export function DiffViewer() {
  const { additions, deletions } = extractStatsFromPatch(EXAMPLE_DIFF);
  return (
    <CollapsibleCard
      data-section-id="diff-viewer"
      id="diff-viewer"
      className="my-8 text-[13px] w-full"
      title="File Changes"
      defaultOpen
    >
      <CollapsibleCardHeader>
        <CollapsibleCardTitle title="file-changes.tsx">
          apps/web/components/markdown-renderer.tsx
        </CollapsibleCardTitle>

        <Badge variant="outline">Modified</Badge>
        <span className="text-xs tabular-nums whitespace-nowrap">
          <span className="text-green-600">+{additions}</span>{" "}
          <span className="text-orange-600">-{deletions}</span>
        </span>
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <Diff
          fileName="file-changes.tsx"
          patch={EXAMPLE_DIFF}
          status="modified"
          selectable={false}
        />
      </CollapsibleCardContent>
    </CollapsibleCard>
  );
}
