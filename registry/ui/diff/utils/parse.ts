import gitDiffParser, {
  Hunk as _Hunk,
  File as _File,
  Change as _Change,
} from "gitdiff-parser";
import DiffMatchPatch from "diff-match-patch";
import { diffChars, diffWords } from "diff";

const dmp = new DiffMatchPatch();

export interface LineSegment {
  value: string;
  type: "insert" | "delete" | "normal";
}

type ReplaceKey<T, K extends PropertyKey, V> = T extends unknown
  ? Omit<T, K> & Record<K, V>
  : never;

export type Line = ReplaceKey<_Change, "content", LineSegment[]>;

export interface Hunk extends Omit<_Hunk, "changes"> {
  type: "hunk";
  lines: Line[];
}

export interface SkipBlock {
  id: number;
  count: number;
  type: "skip";
  context?: string;
}

export interface File extends Omit<_File, "hunks"> {
  hunks: (Hunk | SkipBlock)[];
}

export interface ParseOptions {
  maxDiffDistance: number;
  similarityThreshold: number;
  zipChanges?: boolean;
  mergeModifiedLines: boolean;
}

/**
 * Computes how much of the combined content changed between two strings.
 * A lower ratio indicates a closer match.
 */
const changeRatio = (a: string, b: string): number => {
  const tokens = diffWords(a, b);
  const changedChars = tokens
    .filter((token) => token.added || token.removed)
    .reduce((sum, token) => sum + token.value.length, 0);
  const totalChars = a.length + b.length;
  return totalChars === 0 ? 1 : changedChars / totalChars;
};

/**
 * Heuristic: determine whether two lines are similar enough to be considered a
 * modification rather than a deletion + insertion.
 */
const isSimilar = (
  a: string,
  b: string,
  similarityThreshold: number
): boolean => {
  if (similarityThreshold === 0) return true;
  // Don't pair empty/whitespace-only lines
  // if (a.trim().length === 0 || b.trim().length === 0) return false;

  // Treat lines that differ only by trailing whitespace as identical
  if (a.trimEnd() === b.trimEnd()) return true;

  return changeRatio(a, b) < similarityThreshold;
};

// TODO: segments for modified lines with https://www.npmjs.com/package/diff-match-patch
const parseLine = (line: _Change): LineSegment[] => {
  return [
    {
      value: line.content,
      type: "normal",
    },
  ];
};

export function zipChanges(changes: _Change[]) {
  const [result] = changes.reduce<[_Change[], _Change | null, number]>(
    ([result, last, lastDeletionIndex], current, i) => {
      if (!last) {
        result.push(current);
        return [result, current, current.type === "delete" ? i : -1];
      }

      if (current.type === "insert" && lastDeletionIndex >= 0) {
        result.splice(lastDeletionIndex + 1, 0, current);
        // The new `lastDeletionIndex` may be out of range, but `splice` will fix it
        return [result, current, lastDeletionIndex + 2];
      }

      result.push(current);

      // Keep the `lastDeletionIndex` if there are lines of deletions,
      // otherwise update it to the new deletion line
      const newLastDeletionIndex =
        current.type === "delete"
          ? last?.type === "delete"
            ? lastDeletionIndex
            : i
          : i;

      return [result, current, newLastDeletionIndex];
    },
    [[], null, -1]
  );
  return result;
}

enum ParsedType {
  Delete = -1,
  Normal = 0,
  Insert = 1,
}

// TODO: replace with https://www.npmjs.com/package/diff-match-patch - not better
const lineMergeWithGitDiffParser = (
  current: _Change,
  next: _Change
): Line["content"] => {
  const diff = dmp.diff_main(current.content, next.content);
  dmp.diff_cleanupSemantic(diff);
  return diff.map(([type, value]: [type: ParsedType, value: string]) => ({
    type:
      type === ParsedType.Normal
        ? "normal"
        : type === ParsedType.Insert
        ? "insert"
        : "delete",
    value: value,
  }));
};

function roughlyEqual(
  a: string,
  b: string,
  maxEdits = 4
):
  | {
      equal: false;
    }
  | {
      equal: true;
      diffs: LineSegment[];
    } {
  const diffs = diffChars(a, b);

  let edits = 0;
  for (const part of diffs) {
    if (part.added || part.removed) {
      edits += part.value.length;
      if (edits > maxEdits) return { equal: false };
    }
  }

  if (edits > maxEdits) return { equal: false };

  return {
    equal: true,
    diffs: diffs.map((d) => ({
      value: d.value,
      type: d.added ? "insert" : d.removed ? "delete" : "normal",
    })),
  };
}

const modifiedContent = (current: _Change, next: _Change): Line["content"] => {
  const segments: LineSegment[] = diffWords(current.content, next.content).map(
    (token) => ({
      value: token.value,
      type: token.added ? "insert" : token.removed ? "delete" : "normal",
    })
  );

  const result: LineSegment[] = [];

  const mergeIntoResult = (segment: LineSegment) => {
    const last = result[result.length - 1];
    if (last && last.type === segment.type) {
      last.value += segment.value;
    } else {
      result.push(segment);
    }
  };

  for (let i = 0; i < segments.length; i++) {
    if (segments[i]?.type === "delete" && segments[i + 1]?.type === "insert") {
      const eq = roughlyEqual(segments[i]!.value, segments[i + 1]!.value);

      if (eq.equal) {
        eq.diffs.forEach(mergeIntoResult);

        i++;
      } else {
        result.push(segments[i]!);
      }
    } else {
      mergeIntoResult(segments[i]!);
    }
  }

  return result;
};

const mergeModifiedLines = (
  changes: _Change[],
  options: ParseOptions
): Line[] => {
  const result: Line[] = [];
  // - [x] stupid version of this deletion followed by an addition is a modified line
  // - [ ] match line numbers
  // - [ ] handle multiple consecutive deletions and insertions
  for (let i = 0; i < changes.length; i++) {
    const current = changes[i];
    const next = changes[i + 1];

    if (
      current.type === "delete" &&
      next?.type === "insert" &&
      isSimilar(current.content, next.content, options.similarityThreshold)
    ) {
      const content = modifiedContent(current, next);
      result.push({
        type: "normal",
        isNormal: true,
        oldLineNumber: current.lineNumber,
        newLineNumber: next.lineNumber,
        content: content,
      });
      i++;
    } else {
      result.push({
        ...changes[i],
        content: parseLine(changes[i]),
      });
    }
  }

  return result;
};

// TODO: merge modified lines
const parseHunk = (hunk: _Hunk, options: ParseOptions): Hunk => {
  if (options.mergeModifiedLines) {
    return {
      ...hunk,
      type: "hunk",
      lines: mergeModifiedLines(hunk.changes, options),
    };
  }

  const changes = options.zipChanges ? zipChanges(hunk.changes) : hunk.changes;

  return {
    ...hunk,
    type: "hunk",
    lines: changes.map(
      (change): Line => ({
        ...change,
        content: parseLine(change),
      })
    ),
  };
};

const insertSkipBlocks = (hunks: Hunk[]): (Hunk | SkipBlock)[] => {
  const result: (Hunk | SkipBlock)[] = [];
  let skipId = 0;
  let lastHunkLine = 0;

  for (const hunk of hunks) {
    const distanceToLastHunk = hunk.oldStart - lastHunkLine - 1;

    if (distanceToLastHunk > 1) {
      result.push({
        id: skipId++,
        count: distanceToLastHunk,
        type: "skip",
      });
    }
    lastHunkLine = Math.max(hunk.oldStart + hunk.oldLines, lastHunkLine);
    result.push(hunk);
  }

  return result;
};

const defaultOptions: ParseOptions = {
  maxDiffDistance: 6,
  similarityThreshold: 0.45,
  zipChanges: false,
  mergeModifiedLines: true,
};

export const parseDiff = (
  diff: string,
  options: Partial<ParseOptions>
): File[] => {
  const opts = { ...defaultOptions, ...options };
  const files = gitDiffParser.parse(diff);

  return files.map((file) => ({
    ...file,
    hunks: insertSkipBlocks(file.hunks.map((hunk) => parseHunk(hunk, opts))),
  }));
};
