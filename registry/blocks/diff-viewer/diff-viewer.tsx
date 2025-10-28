import { Diff } from "@/registry/ui/diff";
import { EXAMPLE_DIFF } from "./data";

import {
  CollapsibleCard,
  CollapsibleCardHeader,
  CollapsibleCardTitle,
  CollapsibleCardContent,
} from "@/registry/ui/collapsible-card";

import { Badge } from "@/components/ui/badge";
import { parseDiff, ParseOptions } from "@/registry/ui/diff/utils/parse";

// TODO: scroll area?
export function DiffViewer({
  patch = EXAMPLE_DIFF,
  options = {},
}: {
  patch?: string;
  options?: Partial<ParseOptions>;
}) {
  const [file] = parseDiff(patch, options);

  return (
    <CollapsibleCard
      data-section-id="diff-viewer"
      id="diff-viewer"
      className="my-2 text-[0.8rem] w-full"
      title="File Changes"
      defaultOpen
    >
      <CollapsibleCardHeader>
        <CollapsibleCardTitle title={file.newPath}>
          {file.newPath}
        </CollapsibleCardTitle>

        <Badge variant="outline">
          {file.type === "rename" ? "Renamed" : "Modified"}
        </Badge>
        {/* <span className="text-xs tabular-nums whitespace-nowrap">
          <span className="text-green-600">+{additions}</span>{" "}
          <span className="text-orange-600">-{deletions}</span>
        </span> */}
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <Diff
          fileName="file-changes.tsx"
          hunks={file.hunks}
          type={file.type}
          // status="modified"
          // selectable={false}
        />
      </CollapsibleCardContent>
    </CollapsibleCard>
  );
}
