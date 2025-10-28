import { Diff } from "@/registry/ui/diff";
import { EXAMPLE_DIFF } from "./data";

import {
  CollapsibleCard,
  CollapsibleCardHeader,
  CollapsibleCardTitle,
  CollapsibleCardContent,
} from "@/registry/ui/collapsible-card";

import { Badge } from "@/components/ui/badge";
import { parseDiff, zipChanges } from "@/registry/ui/diff/utils/parse";
import gitdiffParser from "gitdiff-parser";

// TODO: scroll area?
export function DiffViewer({ patch = EXAMPLE_DIFF }: { patch?: string }) {
  const [file] = parseDiff(patch);
  // const [file] = gitdiffParser.parse(patch);

  // const hunk = file.hunks[0];

  // if (!hunk) return null;

  // console.log({changes: hunk.changes, zip: zipChanges(hunk.changes)});

  // return (
  //   <div className="my-4">
  //     <pre className="text-xs border rounded-xl overflow-y-auto">
  //       {JSON.stringify(hunk.changes, null, 2)}
  //     </pre>
  //     <pre className="text-xs border rounded-xl overflow-y-auto">
  //       {JSON.stringify(zipChanges(hunk.changes), null, 2)}
  //     </pre>
  //   </div>
  // );

  return (
    <CollapsibleCard
      data-section-id="diff-viewer"
      id="diff-viewer"
      className="my-8 text-[0.8rem] w-full"
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
