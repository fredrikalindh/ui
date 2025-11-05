import { Diff, Hunk } from "@/registry/ui/diff";

import {
  CollapsibleCard,
  CollapsibleCardHeader,
  CollapsibleCardTitle,
  CollapsibleCardContent,
} from "@/registry/ui/collapsible-card";

import { parseDiff, ParseOptions } from "@/registry/ui/diff/utils/parse";
import { parseWordDiff } from "@/registry/ui/diff/utils/parse-word";
import { DIFF_WORD } from "@/diff-word-diff";

export function DiffViewer({
  patch,
  options = {},
}: {
  patch: string;
  options?: Partial<ParseOptions>;
}) {
  // const [file] = parseDiff(DIFF_WORD, options);
  const [file] = parseWordDiff(DIFF_WORD, options);

  return (
    <CollapsibleCard
      data-section-id="diff-viewer"
      id="diff-viewer"
      className="my-4 text-[0.8rem] w-full"
      defaultOpen
    >
      <CollapsibleCardHeader>
        <CollapsibleCardTitle title={file.newPath}>
          {file.newPath}
        </CollapsibleCardTitle>
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <Diff fileName="file-changes.tsx" hunks={file.hunks} type={file.type}>
          {file.hunks.map((hunk) => (
            <Hunk key={hunk.content} hunk={hunk} />
          ))}
        </Diff>
      </CollapsibleCardContent>
    </CollapsibleCard>
  );
}
