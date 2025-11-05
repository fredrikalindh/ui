import type { File, Hunk, Line, LineSegment, SkipBlock } from "./parse";

interface ParseOptions {
  inlineMaxCharEdits: number;
  maxChangeRatio: number;
}

type LineKind = Line["type"];

const HUNK_HEADER_REGEX = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)/;

const TOKEN_REGEX = /\{\+([\s\S]*?)\+\}|\[-([\s\S]*?)-\]/g;

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
  const trimmed = line.trim();
  const isInsert = trimmed.startsWith("{+") && trimmed.endsWith("+}");
  if (isInsert) return "insert";
  const isDelete = trimmed.startsWith("[-") && trimmed.endsWith("-]");
  if (isDelete) return "delete";

  return "normal";
};

const mergeSegment = (segments: LineSegment[], segment: LineSegment): void => {
  const previous = segments[segments.length - 1];
  if (previous?.type === segment.type) {
    previous.value += segment.value;
  } else {
    segments.push(segment);
  }
};

const parsePathFromFirstLine = (
  line: string
): { oldPath: string; newPath: string } => {
  const filesStr = line.slice(11);
  let oldPath = "";
  let newPath = "";

  const quoteIndex = filesStr.indexOf('"');

  switch (quoteIndex) {
    case -1: {
      const segs = filesStr.split(" ");
      oldPath = segs[0]?.slice(2) ?? "";
      newPath = segs[1]?.slice(2) ?? "";
      break;
    }

    case 0: {
      const nextQuoteIndex = filesStr.indexOf('"', 2);
      oldPath = filesStr.slice(3, nextQuoteIndex);
      const newQuoteIndex = filesStr.indexOf('"', nextQuoteIndex + 1);
      if (newQuoteIndex < 0) {
        newPath = filesStr.slice(nextQuoteIndex + 4);
      } else {
        newPath = filesStr.slice(newQuoteIndex + 3, -1);
      }
      break;
    }

    default: {
      const segs = filesStr.split(" ");
      oldPath = segs[0]?.slice(2) ?? "";
      newPath = segs[1]?.slice(3, -1) ?? "";
      break;
    }
  }

  return { oldPath, newPath };
};

export function mergeOverlappingEdits(tokens: LineSegment[]): LineSegment[] {
  const out: LineSegment[] = [];
  let i = 0;

  while (i < tokens.length) {
    const cur = tokens[i];
    const nxt = tokens[i + 1];

    if (cur.type === "delete" && nxt?.type === "insert") {
      const oldTxt = cur.value;
      const newTxt = nxt.value;

      let prefixLength = 0;
      while (
        prefixLength < oldTxt.length &&
        prefixLength < newTxt.length &&
        oldTxt[prefixLength] === newTxt[prefixLength]
      ) {
        prefixLength++;
      }

      let suffixLength = 0;
      while (
        suffixLength < oldTxt.length - prefixLength &&
        suffixLength < newTxt.length - prefixLength &&
        oldTxt[oldTxt.length - 1 - suffixLength] ===
          newTxt[newTxt.length - 1 - suffixLength]
      ) {
        suffixLength++;
      }

      if (prefixLength) {
        mergeSegment(out, {
          type: "normal",
          value: oldTxt.slice(0, prefixLength),
        });
      }

      const oldMid = oldTxt.slice(prefixLength, oldTxt.length - suffixLength);
      const newMid = newTxt.slice(prefixLength, newTxt.length - suffixLength);

      if (oldMid) mergeSegment(out, { type: "delete", value: oldMid });
      if (newMid) mergeSegment(out, { type: "insert", value: newMid });

      if (suffixLength) {
        mergeSegment(out, {
          type: "normal",
          value: oldTxt.slice(oldTxt.length - suffixLength),
        });
      }

      i += 2;
    } else {
      mergeSegment(out, cur);
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
      mergeSegment(tokens, {
        type: fallbackType,
        value: line.slice(lastIndex, index),
      });
    }

    const [fullMatch, insertValue, deleteValue] = match;

    if (insertValue !== undefined) {
      mergeSegment(tokens, { type: "insert", value: insertValue });
    } else if (deleteValue !== undefined) {
      mergeSegment(tokens, { type: "delete", value: deleteValue });
    }

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < line.length) {
    mergeSegment(tokens, {
      type: fallbackType,
      value: line.slice(lastIndex),
    });
  }

  if (tokens.length === 0) {
    return [{ type: fallbackType, value: "" }];
  }

  return mergeOverlappingEdits(tokens);
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
  oldPath: oldPath,
  newPath: newPath,
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
  const maxChangeRatio = options?.maxChangeRatio;

  const normalized = diff.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const linesLen = lines.length;

  const STAT_START = 2;
  const STAT_HUNK = 5;

  let stat = STAT_START;

  let currentFile: FileBuilder | null = null;
  let currentFileType: FileBuilder["type"] | null = null;
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

    currentFile.type = currentFileType ?? currentFile.type ?? "modify";
    currentFile.oldPath = currentFile.oldPath;
    currentFile.newPath = currentFile.newPath;

    const hunksWithSkips = insertSkipBlocks(currentFile.hunks);
    files.push({
      ...currentFile,
      hunks: hunksWithSkips,
    });

    currentFile = null;
    currentFileType = null;
    stat = STAT_START;
  };

  let i = 0;
  // Basically same as gitdiff-parser (https://www.npmjs.com/package/gitdiff-parser) except for how we're parsing lines
  // TODO: improve readability
  while (i < linesLen) {
    const line = lines[i];

    if (line.indexOf("diff --git") === 0) {
      flushFile();

      const paths = parsePathFromFirstLine(line);
      currentFile = createFile(paths.oldPath, paths.newPath);
      currentFileType = null;
      stat = STAT_START;

      let simiLine: string | undefined;
      let infoType: string | undefined;

      simiLoop: while ((simiLine = lines[++i])) {
        const spaceIndex = simiLine.indexOf(" ");
        infoType = spaceIndex > -1 ? simiLine.slice(0, spaceIndex) : infoType;

        switch (infoType) {
          case "diff":
            i--;
            break simiLoop;

          case "deleted":
          case "new": {
            const leftStr = simiLine.slice(spaceIndex + 1);
            if (leftStr.indexOf("file mode") === 0 && currentFile) {
              if (infoType === "new") {
                currentFile.newMode = leftStr.slice(10);
              } else {
                currentFile.oldMode = leftStr.slice(10);
              }
            }
            break;
          }

          case "similarity":
            if (currentFile) {
              const parts = simiLine.split(" ");
              const percent = parseInt(parts[2], 10);
              if (!Number.isNaN(percent)) {
                currentFile.similarity = percent;
              }
            }
            break;

          case "index":
            if (currentFile) {
              const segs = simiLine.slice(spaceIndex + 1).split(" ");
              const revs = segs[0].split("..");
              currentFile.oldRevision = revs[0] ?? "";
              currentFile.newRevision = revs[1] ?? "";

              if (segs[1]) {
                currentFile.oldMode = segs[1];
                currentFile.newMode = segs[1];
              }
            }
            break;

          case "copy":
          case "rename":
            if (currentFile) {
              const infoStr = simiLine.slice(spaceIndex + 1);
              if (infoStr.indexOf("from") === 0) {
                currentFile.oldPath = infoStr.slice(5);
              } else {
                currentFile.newPath = infoStr.slice(3);
              }
              currentFileType = infoType as FileBuilder["type"];
            }
            break;

          case "---":
            if (currentFile) {
              let oldPath = simiLine.slice(spaceIndex + 1);
              const nextLine = lines[++i] ?? "";
              let newPath = nextLine.slice(4);

              if (oldPath === "/dev/null") {
                newPath = newPath.slice(2);
                currentFileType = "add";
              } else if (newPath === "/dev/null") {
                oldPath = oldPath.slice(2);
                currentFileType = "delete";
              } else {
                // Only set to "modify" if type hasn't been set already (e.g., by rename/copy)
                if (currentFileType === null) {
                  currentFileType = "modify";
                }
                oldPath = oldPath.slice(2);
                newPath = newPath.slice(2);
              }

              if (oldPath) {
                currentFile.oldPath = oldPath;
              }
              if (newPath) {
                currentFile.newPath = newPath;
              }

              stat = STAT_HUNK;
              break simiLoop;
            }
            break;

          default:
            break;
        }
      }

      if (currentFile) {
        currentFile.type = currentFileType ?? currentFile.type ?? "modify";
      }
    } else if (line.indexOf("Binary") === 0) {
      if (currentFile) {
        currentFile.isBinary = true;
        currentFile.type =
          line.indexOf("/dev/null and") >= 0
            ? "add"
            : line.indexOf("and /dev/null") >= 0
            ? "delete"
            : "modify";
      }
      stat = STAT_START;
      currentFileType = null;
      flushFile();
    } else if (stat === STAT_HUNK && currentFile) {
      if (line.indexOf("@@") === 0) {
        flushHunk();
        const hunkMeta = parseHunkHeader(line);

        currentHunk = {
          ...hunkMeta,
          lines: [],
        };

        currentHunkLines = [];
        oldCursor = hunkMeta.oldStart;
        newCursor = hunkMeta.newStart;
        oldLineCount = 0;
        newLineCount = 0;
      } else if (currentHunk) {
        if (line.indexOf("\\ No newline at end of file") === 0) {
          currentFile.oldEndingNewLine = false;
          currentFile.newEndingNewLine = false;
        } else {
          const kind = classifyLine(line);

          if (kind === "insert") {
            const value = stripWordDiffMarkers(line);

            const insertLine: Line = {
              type: "insert",
              lineNumber: newCursor,
              isInsert: true,
              content: [{ type: "normal", value }],
            };
            currentHunkLines.push(insertLine);
            newCursor += 1;
            newLineCount += 1;
          } else if (kind === "delete") {
            const value = stripWordDiffMarkers(line);
            const deleteLine: Line = {
              type: "delete",
              lineNumber: oldCursor,
              isDelete: true,
              content: [{ type: "normal", value }],
            };
            currentHunkLines.push(deleteLine);
            oldCursor += 1;
            oldLineCount += 1;
          } else {
            const segments = buildSegments(line);
            const changeStats = calculateChangeRatio(segments);

            if (
              changeStats.hasInsert &&
              changeStats.hasDelete &&
              maxChangeRatio !== undefined &&
              changeStats.ratio > maxChangeRatio
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
            } else {
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
            }
          }
        }
      }
    }

    i += 1;
  }

  flushFile();

  return files;
};
