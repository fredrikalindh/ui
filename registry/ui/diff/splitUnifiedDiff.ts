import parseDiff from "parse-diff";

export interface Versions {
  oldString: string;
  newString: string;
}

// TODO: compare to https://www.npmjs.com/package/gitdiff-parser
/**
 * Convert a unified diff string into the full
 * "before" and "after" file contents.
 */
export function splitUnifiedDiff(patch: string): Versions {
  const [file] = parseDiff(patch); // assume single-file patch
  const oldLines: string[] = [];
  const newLines: string[] = [];

  file?.chunks.forEach((hunk) => {
    hunk.changes.forEach((l) => {
      switch (l.type) {
        case "normal": // context
          oldLines.push(l.content); // Remove leading space from unified diff
          newLines.push(l.content);
          break;
        case "del":
          oldLines.push(l.content.slice(1));
          break;
        case "add":
          newLines.push(l.content.slice(1));
          break;
      }
    });
  });

  return { oldString: oldLines.join("\n"), newString: newLines.join("\n") };
}
