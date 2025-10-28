import { Diff } from "@/registry/ui/diff";
import { EXAMPLE_DIFF } from "./data";

import {
  CollapsibleCard,
  CollapsibleCardHeader,
  CollapsibleCardTitle,
  CollapsibleCardContent,
} from "@/registry/ui/collapsible-card";
import { parseDiffHeader } from "@/registry/ui/diff/parse-headers";
import { Badge } from "@/components/ui/badge";

// TODO: scroll area?
export function DiffViewer({ patch = EXAMPLE_DIFF }: { patch?: string }) {
  const { additions, deletions, file, renamed } = parseDiffHeader(patch);
  return (
    <CollapsibleCard
      data-section-id="diff-viewer"
      id="diff-viewer"
      className="my-8 text-[0.8rem] w-full"
      title="File Changes"
      defaultOpen
    >
      <CollapsibleCardHeader>
        <CollapsibleCardTitle title={file}>{file}</CollapsibleCardTitle>

        <Badge variant="outline">{renamed ? "Renamed" : "Modified"}</Badge>
        <span className="text-xs tabular-nums whitespace-nowrap">
          <span className="text-green-600">+{additions}</span>{" "}
          <span className="text-orange-600">-{deletions}</span>
        </span>
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <Diff
          fileName="file-changes.tsx"
          patch={patch}
          status="modified"
          selectable={false}
        />
      </CollapsibleCardContent>
    </CollapsibleCard>
  );
}
