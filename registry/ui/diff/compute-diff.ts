import { diffChars, diffWords } from "diff";
import parseDiff, { Chunk } from "parse-diff";

export interface DiffSegment {
  value: string;
  type: "added" | "removed" | "unchanged";
}

export interface DiffLine {
  lineNumberOld?: number;
  lineNumberNew?: number;
  segments: DiffSegment[];
  type: "added" | "removed" | "modified" | "unchanged";
}

interface SkipBlock {
  id: number;
  count: number;
  functionName?: string;
}

interface DisplayLine {
  kind: "line";
  line: DiffLine[];
}

interface DisplaySkip {
  kind: "skip";
  skip: SkipBlock;
}

export type DiffItem = DisplayLine | DisplaySkip;

// TODO: replace with https://www.npmjs.com/package/diff-match-patch
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
      diffs: DiffSegment[];
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
      type: d.added ? "added" : d.removed ? "removed" : "unchanged",
    })),
  };
}

/** Word-level diff for a single modified line */
const buildSegments = (a: string, b: string): DiffSegment[] => {
  const segments: DiffSegment[] = diffWords(a, b).map((token) => ({
    value: token.value,
    type: token.added ? "added" : token.removed ? "removed" : "unchanged",
  }));

  const result: DiffSegment[] = [];

  const mergeIntoResult = (segment: DiffSegment) => {
    const last = result[result.length - 1];
    if (last && last.type === segment.type) {
      last.value += segment.value;
    } else {
      result.push(segment);
    }
  };

  for (let i = 0; i < segments.length; i++) {
    if (segments[i]?.type === "removed" && segments[i + 1]?.type === "added") {
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

interface ChangeWithIndex {
  change: Chunk["changes"][number];
  index: number;
  content: string;
}

const stripDiffMarker = (change: Chunk["changes"][number]): string =>
  change.content.slice(1);

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

const MAX_PAIR_DISTANCE = 6;
const SIMILARITY_THRESHOLD = 0.45;

const collectIndexedChanges = (
  changes: Chunk["changes"]
): {
  additions: ChangeWithIndex[];
  deletions: ChangeWithIndex[];
} => {
  const additions: ChangeWithIndex[] = [];
  const deletions: ChangeWithIndex[] = [];

  changes.forEach((change, index) => {
    if (!change) return;
    // Skip Git metadata lines like "\ No newline at end of file"
    if (change.content.startsWith("\\")) return;

    const content = stripDiffMarker(change);

    if (change.type === "add") {
      additions.push({ change, index, content });
    } else if (change.type === "del") {
      deletions.push({ change, index, content });
    }
  });

  return { additions, deletions };
};

interface PairedChange {
  del: ChangeWithIndex;
  add: ChangeWithIndex;
}

/**
 * Pairs deletions with the most similar additions while tracking lookup maps
 * for fast access during the main diff traversal.
 */
const pairIndexedChanges = (
  deletions: ChangeWithIndex[],
  additions: ChangeWithIndex[]
) => {
  const pairedDeletions = new Set<number>();
  const pairedAdditions = new Set<number>();
  const byDeletion = new Map<number, PairedChange>();
  const byAddition = new Map<number, PairedChange>();

  for (const del of deletions) {
    let bestMatch: ChangeWithIndex | null = null;
    let bestSimilarity = -1;

    for (const add of additions) {
      if (pairedAdditions.has(add.index)) continue;
      if (!isSimilar(del.content, add.content)) continue;

      const similarity = changeRatio(del.content, add.content);
      if (bestMatch === null || similarity < bestSimilarity) {
        bestMatch = add;
        bestSimilarity = similarity;
      }
    }

    if (bestMatch) {
      const pair: PairedChange = { del, add: bestMatch };
      pairedDeletions.add(del.index);
      pairedAdditions.add(bestMatch.index);
      byDeletion.set(del.index, pair);
      byAddition.set(bestMatch.index, pair);
    }
  }

  return { byDeletion, byAddition, pairedAdditions, pairedDeletions };
};

const isWordCharacter = (char: string): boolean => /[A-Za-z0-9_]/.test(char);

const classifyLeadingCharacter = (value: string): "word" | "nonword" | null => {
  const trimmed = value.trimStart();
  if (!trimmed) return null;
  const firstChar = trimmed[0];
  if (!firstChar) return null;
  return isWordCharacter(firstChar) ? "word" : "nonword";
};

/**
 * Heuristic: determine whether two lines are similar enough to be considered a
 * modification rather than a deletion + insertion. We treat them as "similar"
 * when less than 50% of their characters change and their leading character
 * categories are compatible (to avoid pairing structurally dissimilar lines).
 * Lines that differ only by trailing whitespace are considered identical.
 */
const isSimilar = (a: string, b: string): boolean => {
  // Don't pair empty/whitespace-only lines
  if (a.trim().length === 0 || b.trim().length === 0) return false;

  // Treat lines that differ only by trailing whitespace as identical
  if (a.trimEnd() === b.trimEnd()) return true;

  const leadingA = classifyLeadingCharacter(a);
  const leadingB = classifyLeadingCharacter(b);

  if (leadingA && leadingB && leadingA !== leadingB) {
    return false;
  }

  return changeRatio(a, b) < SIMILARITY_THRESHOLD;
};

/**
 * Transforms a diff chunk into display-ready line metadata, pairing related
 * additions and deletions when they resemble modifications.
 */
const parseChunk = (chunk: Chunk): DiffLine[] => {
  const changes = chunk.changes;
  const { additions, deletions } = collectIndexedChanges(changes);
  const { byDeletion, byAddition, pairedAdditions, pairedDeletions } =
    pairIndexedChanges(deletions, additions);

  const diffLines: DiffLine[] = [];
  const processed = new Set<number>();

  const pushModifiedLine = (pair: PairedChange) => {
    // If lines differ only by trailing whitespace, treat as unchanged
    if (pair.del.content.trimEnd() === pair.add.content.trimEnd()) {
      diffLines.push({
        lineNumberOld: "ln" in pair.del.change ? pair.del.change.ln : undefined,
        lineNumberNew: "ln" in pair.add.change ? pair.add.change.ln : undefined,
        type: "unchanged",
        segments: [{ value: pair.add.content, type: "unchanged" }],
      });
    } else {
      diffLines.push({
        lineNumberOld: "ln" in pair.del.change ? pair.del.change.ln : undefined,
        lineNumberNew: "ln" in pair.add.change ? pair.add.change.ln : undefined,
        type: "modified",
        segments: buildSegments(pair.del.content, pair.add.content),
      });
    }
    processed.add(pair.del.index);
    processed.add(pair.add.index);
  };

  const pushUnchangedLine = (
    change: Extract<Chunk["changes"][number], { type: "normal" }>,
    value: string
  ) => {
    diffLines.push({
      lineNumberOld: "ln1" in change ? change.ln1 : undefined,
      lineNumberNew: "ln2" in change ? change.ln2 : undefined,
      type: "unchanged",
      segments: [{ value, type: "unchanged" }],
    });
  };

  const pushRemovedLine = (
    change: Extract<Chunk["changes"][number], { type: "del" }>,
    value: string
  ) => {
    diffLines.push({
      lineNumberOld: "ln" in change ? change.ln : undefined,
      lineNumberNew: undefined,
      type: "removed",
      segments: [{ value, type: "removed" }],
    });
  };

  const pushAddedLine = (
    change: Extract<Chunk["changes"][number], { type: "add" }>,
    value: string
  ) => {
    diffLines.push({
      lineNumberOld: undefined,
      lineNumberNew: "ln" in change ? change.ln : undefined,
      type: "added",
      segments: [{ value, type: "added" }],
    });
  };
  for (let index = 0; index < changes.length; index++) {
    const change = changes[index];
    if (!change || processed.has(index)) continue;

    // Skip Git metadata lines like "\ No newline at end of file"
    if (change.content.startsWith("\\")) {
      processed.add(index);
      continue;
    }

    const content = stripDiffMarker(change);

    switch (change.type) {
      case "normal": {
        pushUnchangedLine(change, content);
        processed.add(index);
        break;
      }
      case "del": {
        const pair = byDeletion.get(index);

        if (!pair) {
          pushRemovedLine(change, content);
          processed.add(index);
          break;
        }

        if (pair.add.index > index) {
          let hasInterveningChanges = false;
          for (let j = index + 1; j < pair.add.index; j++) {
            const interveningChange = changes[j];
            if (
              !interveningChange ||
              interveningChange.content.startsWith("\\") ||
              processed.has(j)
            ) {
              continue;
            }

            if (interveningChange.type === "del" && !pairedDeletions.has(j)) {
              hasInterveningChanges = true;
              break;
            }
          }

          if (hasInterveningChanges) {
            pushRemovedLine(change, content);
            processed.add(index);
            pairedAdditions.delete(pair.add.index);
            byAddition.delete(pair.add.index);
            byDeletion.delete(pair.del.index);
            break;
          }

          if (pair.add.index - index > MAX_PAIR_DISTANCE) {
            pushRemovedLine(change, content);
            processed.add(index);
            pairedAdditions.delete(pair.add.index);
            byAddition.delete(pair.add.index);
            byDeletion.delete(pair.del.index);
            break;
          }

          processed.add(index);
          break;
        }

        pushModifiedLine(pair);
        break;
      }
      case "add": {
        if (!pairedAdditions.has(index)) {
          pushAddedLine(change, content);
          processed.add(index);
          break;
        }

        const pair = byAddition.get(index);
        if (pair && !processed.has(index)) {
          pushModifiedLine(pair);
        }
        break;
      }
    }
  }

  return diffLines;
};

export const computeDiff = (diff: string): DiffItem[] => {
  const [file] = parseDiff(diff); // assume single-file patch
  if (!file) return [];

  const result: DiffItem[] = [];
  let skipId = 0;

  const parseFunctionName = (chunk: Chunk): string | undefined => {
    const headerMatch = chunk.content.match(/^@@.*@@\s*(.*)$/);
    if (!headerMatch) return undefined;

    const context = headerMatch[1]?.trim();

    return context || undefined;
  };

  file.chunks.forEach((chunk, index) => {
    const parsedLines = parseChunk(chunk);
    const functionName = parseFunctionName(chunk);

    // Insert skip block before first chunk if it doesn't start at line 1
    if (index === 0 && chunk.oldStart > 1) {
      result.push({
        kind: "skip",
        skip: { id: skipId++, count: chunk.oldStart - 1, functionName },
      });
    }

    // Insert skip block between chunks if there's a gap
    if (index > 0) {
      const prevChunk = file.chunks[index - 1];
      if (prevChunk) {
        const prevEnd = prevChunk.oldStart + prevChunk.oldLines;
        const currentStart = chunk.oldStart;
        const gap = currentStart - prevEnd;

        if (gap > 0) {
          result.push({
            kind: "skip",
            skip: { id: skipId++, count: gap, functionName },
          });
        }
      }
    }

    // Add the chunk's lines
    result.push({ kind: "line", line: parsedLines });
  });

  return result;
};
