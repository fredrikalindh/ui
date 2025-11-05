import type { File, Hunk, Line, LineSegment, SkipBlock } from "./parse";

interface ParseOptions {
  inlineMaxCharEdits: number;
  maxChangeRatio: number;
}

type LineKind = "normal" | "insert" | "delete";

const HUNK_HEADER_REGEX = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)/;

const TOKEN_REGEX = /\{\+([\s\S]*?)\+\}|\[-([\s\S]*?)-\]/g;

const DIFF_HEADER_REGEX = /^diff --git (.+?) (.+)$/;

const extractHunkContext = (header: string): string =>
  HUNK_HEADER_REGEX.exec(header)?.[5]?.trim() ?? "";

const insertSkipBlocks = (hunks: Hunk[]): (Hunk | SkipBlock)[] => {
  const result: (Hunk | SkipBlock)[] = [];
  let lastHunkLine = 1;

  for (const hunk of hunks) {
    const distanceToLastHunk = hunk.oldStart - lastHunkLine;
    const context = extractHunkContext(hunk.content);

    if (distanceToLastHunk > 0) {
      result.push({
        count: distanceToLastHunk,
        type: "skip",
        content: context ?? hunk.content,
      });
    }

    lastHunkLine = Math.max(hunk.oldStart + hunk.oldLines, lastHunkLine);
    result.push(hunk);
  }

  return result;
};

const classifyLine = (line: string): LineKind => {
  const hasInsert = line.includes("{+");
  const hasDelete = line.includes("[-");
  const hasTokens = hasInsert || hasDelete;

  if (!hasTokens) return "normal";
  if (hasInsert && hasDelete) return "normal";

  const plainText = line.replace(TOKEN_REGEX, "");
  if (plainText.trim().length > 0) return "normal";

  if (hasInsert) return "insert";
  if (hasDelete) return "delete";

  return "normal";
};

const mergeSegment = (segments: LineSegment[], segment: LineSegment): void => {
  if (!segment.value) return;

  const previous = segments[segments.length - 1];
  if (previous && previous.type === segment.type) {
    previous.value += segment.value;
    return;
  }

  segments.push(segment);
};

const mergeToken = (tokens: LineSegment[], token: LineSegment): void => {
  if (!token.value) return;
  const previous = tokens[tokens.length - 1];
  if (previous && previous.type === token.type) {
    previous.value += token.value;
    return;
  }
  tokens.push({ ...token });
};

const normalizePath = (path: string): string => {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/dev/null") return "";
  if (trimmed.startsWith("a/") || trimmed.startsWith("b/")) {
    return trimmed.slice(2);
  }
  return trimmed;
};

const parseDiffHeaderPaths = (
  line: string
): { oldPath: string; newPath: string } => {
  const match = DIFF_HEADER_REGEX.exec(line.trim());
  if (!match) {
    return { oldPath: "", newPath: "" };
  }

  return {
    oldPath: match[1],
    newPath: match[2],
  };
};

export function mergeOverlappingEdits(tokens: LineSegment[]): LineSegment[] {
  const out: LineSegment[] = [];
  let i = 0;

  while (i < tokens.length) {
    const cur = tokens[i];
    if (!cur) {
      i += 1;
      continue;
    }
    const nxt = tokens[i + 1];

    if (cur.type === "delete" && nxt?.type === "insert") {
      const oldTxt = cur.value;
      const newTxt = nxt.value;

      let p = 0;
      while (
        p < oldTxt.length &&
        p < newTxt.length &&
        oldTxt[p] === newTxt[p]
      ) {
        p++;
      }

      let s = 0;
      while (
        s < oldTxt.length - p &&
        s < newTxt.length - p &&
        oldTxt[oldTxt.length - 1 - s] === newTxt[newTxt.length - 1 - s]
      ) {
        s++;
      }

      if (p) {
        out.push({ type: "normal", value: oldTxt.slice(0, p) });
      }

      const oldMid = oldTxt.slice(p, oldTxt.length - s);
      const newMid = newTxt.slice(p, newTxt.length - s);

      if (oldMid) out.push({ type: "delete", value: oldMid });
      if (newMid) out.push({ type: "insert", value: newMid });

      if (s) {
        out.push({ type: "normal", value: oldTxt.slice(oldTxt.length - s) });
      }

      i += 2;
    } else {
      out.push(cur);
      i += 1;
    }
  }

  return out;
}

const buildSegments = (line: string): LineSegment[] => {
  const fallbackType = "normal";
  const tokens: LineSegment[] = [];

  let lastIndex = 0;
  TOKEN_REGEX.lastIndex = 0;

  for (const match of line.matchAll(TOKEN_REGEX)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      mergeToken(tokens, {
        type: fallbackType,
        value: line.slice(lastIndex, index),
      });
    }

    const [fullMatch, insertValue, deleteValue] = match;

    if (insertValue !== undefined) {
      mergeToken(tokens, { type: "insert", value: insertValue });
    } else if (deleteValue !== undefined) {
      mergeToken(tokens, { type: "delete", value: deleteValue });
    }

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < line.length) {
    mergeToken(tokens, {
      type: fallbackType,
      value: line.slice(lastIndex),
    });
  }

  if (tokens.length === 0) {
    tokens.push({ type: fallbackType, value: "" });
  }

  const mergedTokens = mergeOverlappingEdits(tokens);

  const segments: LineSegment[] = [];
  for (const token of mergedTokens) {
    mergeSegment(segments, {
      type: token.type,
      value: token.value,
    });
  }

  if (segments.length === 0) {
    segments.push({
      type: fallbackType,
      value: "",
    });
  }

  return segments;
};

const calculateChangeRatio = (
  segments: LineSegment[]
): {
  ratio: number;
  changed: number;
  hasInsert: boolean;
  hasDelete: boolean;
  insertValue: string;
  deleteValue: string;
} => {
  let totalLength = 0;
  let changedLength = 0;
  let hasInsert = false;
  let hasDelete = false;
  let insertValue = "";
  let deleteValue = "";

  for (const segment of segments) {
    const length = segment.value.length;
    totalLength += length;

    if (segment.type === "insert") {
      changedLength += length;
      hasInsert = true;
      insertValue += segment.value;
    } else if (segment.type === "delete") {
      changedLength += length;
      hasDelete = true;
      deleteValue += segment.value;
    } else {
      insertValue += segment.value;
      deleteValue += segment.value;
    }
  }

  const ratio = totalLength === 0 ? 0 : changedLength / totalLength;

  return {
    ratio,
    changed: changedLength,
    hasInsert,
    hasDelete,
    insertValue,
    deleteValue,
  };
};

const buildLineVersion = (
  segments: LineSegment[],
  variant: "old" | "new"
): string =>
  segments
    .filter((segment) =>
      variant === "old" ? segment.type !== "insert" : segment.type !== "delete"
    )
    .map((segment) => segment.value)
    .join("");

const stripWordDiffMarkers = (line: string): string =>
  line
    .replace(/\{\+/g, "")
    .replace(/\+\}/g, "")
    .replace(/\[-/g, "")
    .replace(/-\]/g, "");

interface FileBuilder extends Omit<File, "hunks"> {
  hunks: Hunk[];
}

const createFile = (oldPath = "", newPath = ""): FileBuilder => ({
  oldPath: normalizePath(oldPath),
  newPath: normalizePath(newPath),
  type: "modify",
  oldRevision: "",
  newRevision: "",
  oldMode: "",
  newMode: "",
  oldEndingNewLine: true,
  newEndingNewLine: true,
  hunks: [],
});

const parseHunkHeader = (
  header: string
): Pick<
  Hunk,
  "content" | "oldStart" | "oldLines" | "newStart" | "newLines" | "type"
> => {
  const match = HUNK_HEADER_REGEX.exec(header);

  if (!match) {
    throw new Error(`Invalid hunk header: ${header}`);
  }

  const [, oldStart, oldLines, newStart, newLines] = match;

  return {
    type: "hunk",
    content: header,
    oldStart: Number(oldStart),
    oldLines: oldLines ? Number(oldLines) : 1,
    newStart: Number(newStart),
    newLines: newLines ? Number(newLines) : 1,
  };
};

/**
 * Parses diffs output from `git diff --word-diff` into a list of files and hunks.
 */
export const parseWordDiff = (
  diff: string,
  options?: Partial<ParseOptions>
): File[] => {
  const files: File[] = [];

  const normalized = diff.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const linesLen = lines.length;

  const STAT_START = "start" as const;
  const STAT_HEADER = "header" as const;
  const STAT_HUNK = "hunk" as const;
  type ParseState = typeof STAT_START | typeof STAT_HEADER | typeof STAT_HUNK;
  let state: ParseState = STAT_START;

  let currentFile: FileBuilder | null = null;
  let pendingFileType: FileBuilder["type"] | null = null;
  let currentHunk: Hunk | null = null;
  let currentHunkLines: Line[] = [];
  let oldCursor = 0;
  let newCursor = 0;
  let oldLineCount = 0;
  let newLineCount = 0;

  const flushHunk = () => {
    if (!currentHunk) return;

    currentHunk.lines = currentHunkLines;
    currentHunk.oldLines = oldLineCount;
    currentHunk.newLines = newLineCount;
    currentFile?.hunks.push(currentHunk);

    currentHunk = null;
    currentHunkLines = [];
    oldCursor = 0;
    newCursor = 0;
    oldLineCount = 0;
    newLineCount = 0;
  };

  const flushFile = () => {
    if (!currentFile) return;
    flushHunk();

    currentFile.type = pendingFileType ?? currentFile.type ?? "modify";

    const hunksWithSkips = insertSkipBlocks(currentFile.hunks);
    files.push({
      ...currentFile,
      hunks: hunksWithSkips,
    });

    currentFile = null;
    pendingFileType = null;
    state = STAT_START;
  };

  let i = 0;
  while (i < linesLen) {
    const line = lines[i];

    if (line.startsWith("diff --git ")) {
      flushFile();

      const paths = parseDiffHeaderPaths(line);
      currentFile = createFile(paths.oldPath, paths.newPath);
      pendingFileType = null;
      state = STAT_HEADER;
      i += 1;
      continue;
    }

    if (!currentFile) {
      i += 1;
      continue;
    }

    if (line.startsWith("Binary ")) {
      currentFile.isBinary = true;
      if (line.includes("/dev/null and")) {
        pendingFileType = "add";
      } else if (line.includes("and /dev/null")) {
        pendingFileType = "delete";
      }
      currentFile.type = pendingFileType ?? currentFile.type ?? "modify";
      flushFile();
      i += 1;
      continue;
    }

    if (state === STAT_HEADER) {
      if (!line.trim()) {
        i += 1;
        continue;
      }

      if (line.startsWith("diff --git ")) {
        flushFile();
        continue;
      }

      if (line.startsWith("index ")) {
        const match = /^index ([0-9a-f]+)\.\.([0-9a-f]+)(?: (\d+))?/.exec(line);
        if (match) {
          currentFile.oldRevision = match[1];
          currentFile.newRevision = match[2];
          if (match[3]) {
            currentFile.oldMode = match[3];
            currentFile.newMode = match[3];
          }
        }
        i += 1;
        continue;
      }

      if (line.startsWith("similarity index ")) {
        const match = /^similarity index (\d+)%/.exec(line);
        if (match) {
          currentFile.similarity = Number(match[1]);
        }
        i += 1;
        continue;
      }

      if (line.startsWith("new file mode ")) {
        pendingFileType = "add";
        currentFile.newMode = line.slice("new file mode ".length);
        i += 1;
        continue;
      }

      if (line.startsWith("deleted file mode ")) {
        pendingFileType = "delete";
        currentFile.oldMode = line.slice("deleted file mode ".length);
        i += 1;
        continue;
      }

      if (line.startsWith("old mode ")) {
        currentFile.oldMode = line.slice("old mode ".length);
        i += 1;
        continue;
      }

      if (line.startsWith("new mode ")) {
        currentFile.newMode = line.slice("new mode ".length);
        i += 1;
        continue;
      }

      if (line.startsWith("rename from ")) {
        pendingFileType = "rename";
        currentFile.oldPath = normalizePath(line.slice("rename from ".length));
        i += 1;
        continue;
      }

      if (line.startsWith("rename to ")) {
        pendingFileType = "rename";
        currentFile.newPath = normalizePath(line.slice("rename to ".length));
        i += 1;
        continue;
      }

      if (line.startsWith("copy from ")) {
        pendingFileType = "copy";
        currentFile.oldPath = normalizePath(line.slice("copy from ".length));
        i += 1;
        continue;
      }

      if (line.startsWith("copy to ")) {
        pendingFileType = "copy";
        currentFile.newPath = normalizePath(line.slice("copy to ".length));
        i += 1;
        continue;
      }

      if (line.startsWith("--- ")) {
        const oldPathRaw = line.slice(4);
        const nextLine = lines[i + 1];
        let newPathRaw = "";
        if (nextLine?.startsWith("+++ ")) {
          newPathRaw = nextLine.slice(4);
          i += 1;
        }

        const normalizedOldPath = normalizePath(oldPathRaw);
        const normalizedNewPath = normalizePath(newPathRaw);

        const oldIsDevNull = oldPathRaw === "/dev/null";
        const newIsDevNull = newPathRaw === "/dev/null";

        if (oldIsDevNull && !newIsDevNull) {
          pendingFileType = pendingFileType ?? "add";
        } else if (!oldIsDevNull && newIsDevNull) {
          pendingFileType = pendingFileType ?? "delete";
        } else if (!pendingFileType) {
          pendingFileType = currentFile.type ?? "modify";
        }

        if (oldIsDevNull) {
          currentFile.oldPath = "";
        } else if (normalizedOldPath) {
          currentFile.oldPath = normalizedOldPath;
        }

        if (newIsDevNull) {
          currentFile.newPath = "";
        } else if (normalizedNewPath) {
          currentFile.newPath = normalizedNewPath;
        }

        currentFile.type = pendingFileType ?? "modify";
        state = STAT_HUNK;
        i += 1;
        continue;
      }

      if (line.startsWith("@@ ")) {
        currentFile.type = pendingFileType ?? currentFile.type ?? "modify";
        state = STAT_HUNK;
        continue;
      }

      i += 1;
      continue;
    }

    if (state === STAT_HUNK) {
      if (line.startsWith("diff --git ")) {
        flushFile();
        continue;
      }

      if (line.startsWith("@@ ")) {
        flushHunk();
        const header = line;
        const hunkMeta = parseHunkHeader(header);

        currentHunk = {
          ...hunkMeta,
          lines: [],
        };

        currentHunkLines = [];
        oldCursor = hunkMeta.oldStart;
        newCursor = hunkMeta.newStart;
        oldLineCount = 0;
        newLineCount = 0;
        i += 1;
        continue;
      }

      if (!currentHunk) {
        i += 1;
        continue;
      }

      if (line.startsWith("\\ No newline at end of file")) {
        currentFile.oldEndingNewLine = false;
        currentFile.newEndingNewLine = false;
        i += 1;
        continue;
      }

      const kind = classifyLine(line);

      if (kind === "insert") {
        const value = stripWordDiffMarkers(line);
        const segments: LineSegment[] = [{ type: "normal", value }];
        const insertLine: Line = {
          type: "insert",
          lineNumber: newCursor,
          isInsert: true,
          content: segments,
        };
        currentHunkLines.push(insertLine);
        newCursor += 1;
        newLineCount += 1;
        i += 1;
        continue;
      }

      if (kind === "delete") {
        const value = stripWordDiffMarkers(line);
        const segments: LineSegment[] = [{ type: "normal", value }];
        const deleteLine: Line = {
          type: "delete",
          lineNumber: oldCursor,
          isDelete: true,
          content: segments,
        };
        currentHunkLines.push(deleteLine);
        oldCursor += 1;
        oldLineCount += 1;
        i += 1;
        continue;
      }

      const segments = buildSegments(line);
      const changeStats = calculateChangeRatio(segments);

      if (
        changeStats.hasInsert &&
        changeStats.hasDelete &&
        options?.maxChangeRatio &&
        changeStats.ratio > options?.maxChangeRatio
      ) {
        if (changeStats.deleteValue) {
          const deleteLine: Line = {
            type: "delete",
            lineNumber: oldCursor,
            isDelete: true,
            content: [{ type: "normal", value: changeStats.deleteValue }],
          };
          currentHunkLines.push(deleteLine);
          oldCursor += 1;
          oldLineCount += 1;
        }

        if (changeStats.insertValue) {
          const insertLine: Line = {
            type: "insert",
            lineNumber: newCursor,
            isInsert: true,
            content: [{ type: "normal", value: changeStats.insertValue }],
          };
          currentHunkLines.push(insertLine);
          newCursor += 1;
          newLineCount += 1;
        }

        i += 1;
        continue;
      }

      const normalLine: Line = {
        type: "normal",
        isNormal: true,
        oldLineNumber: oldCursor,
        newLineNumber: newCursor,
        content: segments,
      };
      currentHunkLines.push(normalLine);
      oldCursor += 1;
      newCursor += 1;
      oldLineCount += 1;
      newLineCount += 1;
      i += 1;
      continue;
    }

    i += 1;
  }

  flushFile();

  return files;
};
