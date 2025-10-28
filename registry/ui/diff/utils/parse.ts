import gitDiffParser, {
  Hunk as _Hunk,
  File as _File,
  Change as _Change,
  DeleteChange,
  InsertChange,
} from "gitdiff-parser";
import { diffChars, diffWords } from "diff";

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

const isSimilar = (
  a: string,
  b: string,
  similarityThreshold: number
): boolean => {
  if (similarityThreshold === 1) return true;

  if (a.trimEnd() === b.trimEnd()) return true;

  return changeRatio(a, b) < similarityThreshold;
};

const changeToLine = (change: _Change): Line => {
  return {
    ...change,
    content: [
      {
        value: change.content,
        type: "normal",
      },
    ],
  };
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

const mergeAdjacentLines = (
  changes: _Change[],
  options: ParseOptions
): Line[] => {
  const n = changes.length;
  const out: Line[] = [];
  for (let i = 0; i < n; i++) {
    const c = changes[i];
    if (!c) continue;
    if (
      c.type === "delete" &&
      changes[i + 1]?.type === "insert" &&
      isSimilar(c.content, changes[i + 1]!.content, options.similarityThreshold)
    ) {
      out.push({
        ...c,
        type: "normal",
        isNormal: true,
        oldLineNumber: (c as DeleteChange).lineNumber,
        newLineNumber: (changes[i + 1] as InsertChange).lineNumber,
        content: modifiedContent(c, changes[i + 1]!),
      });
      i++;
    } else {
      out.push(changeToLine(c));
    }
  }

  return out;
};

const mergeModifiedLines = (
  changes: _Change[],
  options: ParseOptions
): Line[] => {
  const n = changes.length;

  // Build index lists for valid inserts/deletes
  const addIdxs: number[] = [];
  const delIdxs: number[] = [];
  changes.forEach((c, i) => {
    if (!c) return;
    if (c.type === "insert") addIdxs.push(i);
    else if (c.type === "delete") delIdxs.push(i);
  });

  // Helper to calculate line distance between changes
  const getLineDistance = (del: DeleteChange, add: InsertChange): number => {
    const minLine = Math.min(del.lineNumber, add.lineNumber);
    const maxLine = Math.max(del.lineNumber, add.lineNumber);

    return Math.abs(maxLine - minLine);
  };

  // Track pairings: -1 means unpaired
  const pairOfDel = new Int32Array(n).fill(-1);
  const pairOfAdd = new Int32Array(n).fill(-1);
  const pairedAdd = new Set<number>();
  const pairedDelSnapshot = new Set<number>();

  // Find best matching insert for each delete
  delIdxs.forEach((di) => {
    const del = changes[di] as DeleteChange;

    const bestMatch: { idx: number; ratio: number } = addIdxs.reduce(
      (best, ai) => {
        const add = changes[ai] as InsertChange;

        if (getLineDistance(del, add) > options.maxDiffDistance) return best;

        if (!isSimilar(del.content, add.content, options.similarityThreshold))
          return best;

        const ratio = changeRatio(del.content, add.content);
        return ratio < best.ratio ? { idx: ai, ratio } : best;
      },
      { idx: -1, ratio: Infinity }
    );

    if (bestMatch.idx !== -1) {
      pairOfDel[di] = bestMatch.idx;
      pairOfAdd[bestMatch.idx] = di;
      pairedAdd.add(bestMatch.idx);
      pairedDelSnapshot.add(di);
    }
  });

  // Build prefix sum for unpaired delete detection
  const unpairedDelPrefix = new Int32Array(n + 1);
  changes.forEach((c, i) => {
    const isUnpairedDelete = c.type === "delete" && !pairedDelSnapshot.has(i);
    unpairedDelPrefix[i + 1] =
      unpairedDelPrefix[i] + (isUnpairedDelete ? 1 : 0);
  });

  const hasUnpairedDeleteBetween = (start: number, end: number) =>
    unpairedDelPrefix[end] - unpairedDelPrefix[Math.max(0, start)] > 0;

  // Process changes and build output
  const processed = new Set<number>();
  const out: Line[] = [];

  const emitNormal = (c: _Change) => {
    out.push(changeToLine(c));
  };

  const emitModified = (delIdx: number, addIdx: number) => {
    const del = changes[delIdx] as DeleteChange;
    const add = changes[addIdx] as InsertChange;
    out.push({
      oldLineNumber: del.lineNumber,
      newLineNumber: add.lineNumber,
      type: "normal",
      isNormal: true,
      content: modifiedContent(del, add),
    });
    processed.add(delIdx).add(addIdx);
  };

  // Main processing loop
  changes.forEach((c, i) => {
    if (!c || processed.has(i)) return;

    if (c.type === "normal") {
      processed.add(i);
      emitNormal(c);
      return;
    }

    if (c.type === "delete") {
      const pairedAddIdx = pairOfDel[i];

      if (pairedAddIdx === -1) {
        // No pair - emit as delete
        processed.add(i);
        emitNormal(c);
        return;
      }

      if (pairedAddIdx > i) {
        const shouldUnpair = hasUnpairedDeleteBetween(i + 1, pairedAddIdx);

        if (shouldUnpair) {
          // Unpair and emit as delete
          pairedAdd.delete(pairedAddIdx);
          pairOfAdd[pairedAddIdx] = -1;
          pairOfDel[i] = -1;
          processed.add(i);
          emitNormal(c);
        } else {
          // Defer - will be handled when we reach the insert
          processed.add(i);
        }
      } else {
        // Paired insert already seen - emit modified
        emitModified(i, pairedAddIdx);
      }
      return;
    }

    if (c.type === "insert") {
      if (!pairedAdd.has(i)) {
        // Unpaired insert
        processed.add(i);
        emitNormal(c);
      } else {
        // Paired - emit modified if not already done
        const pairedDelIdx = pairOfAdd[i];
        if (pairedDelIdx !== -1 && !processed.has(i)) {
          emitModified(pairedDelIdx, i);
        }
      }
    }
  });

  return out;
};

const parseHunk = (hunk: _Hunk, options: ParseOptions): Hunk => {
  if (options.mergeModifiedLines) {
    return {
      ...hunk,
      type: "hunk",
      lines:
        options.maxDiffDistance === 1
          ? mergeAdjacentLines(hunk.changes, options)
          : mergeModifiedLines(hunk.changes, options),
    };
  }

  return {
    ...hunk,
    type: "hunk",
    lines: hunk.changes.map(changeToLine),
  };
};

const insertSkipBlocks = (hunks: Hunk[]): (Hunk | SkipBlock)[] => {
  const result: (Hunk | SkipBlock)[] = [];
  let skipId = 0;
  let lastHunkLine = 1;

  for (const hunk of hunks) {
    const distanceToLastHunk = hunk.oldStart - lastHunkLine;

    if (distanceToLastHunk > 0) {
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
  maxDiffDistance: 30,
  similarityThreshold: 0.45,
  mergeModifiedLines: true,
};

export const parseDiff = (
  diff: string,
  options?: Partial<ParseOptions>
): File[] => {
  const opts = { ...defaultOptions, ...options };
  const files = gitDiffParser.parse(diff);

  return files.map((file) => ({
    ...file,
    hunks: insertSkipBlocks(file.hunks.map((hunk) => parseHunk(hunk, opts))),
  }));
};
