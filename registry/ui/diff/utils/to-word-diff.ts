import parseDiff from "parse-diff";
import { diffArrays } from "diff";

const DIFF_HEADER_PREFIX = "diff --git ";
const NO_NEWLINE_MARKER = "\\ No newline at end of file";

interface RawFileDiff {
  headers: string[];
  hunks: string[];
}

interface Token {
  value: string;
  trailing: string;
}

const joinLines = (segments: string[]): string =>
  segments.length > 0 ? `${segments.join("\n")}\n` : "";

const collectRawDiffs = (patch: string): RawFileDiff[] => {
  const lines = patch.split("\n");
  const files: RawFileDiff[] = [];

  let current: RawFileDiff | null = null;
  let collectingHunks = false;

  for (const line of lines) {
    if (line.startsWith(DIFF_HEADER_PREFIX)) {
      if (current) files.push(current);
      current = { headers: [line], hunks: [] };
      collectingHunks = false;
      continue;
    }

    if (!current) {
      current = { headers: [], hunks: [] };
      collectingHunks = false;
      if (!line) continue;
    }

    if (!collectingHunks) {
      if (line.startsWith("@@")) {
        collectingHunks = true;
        current.hunks.push(line);
      } else {
        current.headers.push(line);
      }
    } else {
      current.hunks.push(line);
    }
  }

  if (current) files.push(current);

  return files.filter((file) => file.hunks.length > 0);
};

const buildChunkSnapshot = (chunk: parseDiff.Chunk): { before: string; after: string } => {
  const before: string[] = [];
  const after: string[] = [];

  chunk.changes.forEach((change) => {
    if (change.content === NO_NEWLINE_MARKER) return;

    const line = change.content.slice(1);
    if (change.type === "del") {
      before.push(line);
    } else if (change.type === "add") {
      after.push(line);
    } else {
      before.push(line);
      after.push(line);
    }
  });

  return {
    before: joinLines(before),
    after: joinLines(after),
  };
};

const splitWords = (text: string): Token[] => {
  const tokens: Token[] = [];
  const regex = /([^\s]+)(\s*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    tokens.push({ value: match[1], trailing: match[2] });
  }

  return tokens;
};

const wrapValue = (value: string, start: string, end: string): string =>
  value
    .split("\n")
    .map((line) => {
      if (!line) return line;
      const match = line.match(/(\s*)$/);
      const trailing = match ? match[1] : "";
      const content = line.slice(0, line.length - trailing.length);
      if (content) {
        return `${start}${content}${end}${trailing}`;
      }
      return `${start}${line}${end}`;
    })
    .join("\n");

const computeWordDiff = (before: string, after: string): string => {
  const beforeTokens = splitWords(before);
  const afterTokens = splitWords(after);
  const parts = diffArrays(
    beforeTokens.map((token) => token.value),
    afterTokens.map((token) => token.value)
  );

  let beforeIdx = 0;
  let afterIdx = 0;
  let pendingTrailing = "";
  let result = "";

  const extract = (tokens: Token[], index: number, count: number) => {
    let content = "";
    for (let i = 0; i < count; i += 1) {
      const token = tokens[index + i];
      const isLast = i === count - 1;
      content += token.value;
      if (!isLast) content += token.trailing;
    }
    const trailing = count > 0 ? tokens[index + count - 1].trailing : "";
    return { content, trailing };
  };

  const flushPending = () => {
    if (pendingTrailing) {
      result += pendingTrailing;
      pendingTrailing = "";
    }
  };

  for (let partIdx = 0; partIdx < parts.length; partIdx += 1) {
    const part = parts[partIdx];
    const nextPart = parts[partIdx + 1];
    const count = part.value.length;

    if (part.added) {
      flushPending();
      const { content, trailing } = extract(afterTokens, afterIdx, count);
      if (content.trim() === "" && trailing.trim() === "") {
        result += content + trailing;
      } else {
        result += wrapValue(content, "{+", "+}");
        result += trailing;
      }
      afterIdx += count;
      continue;
    }

    if (part.removed) {
      const { content } = extract(beforeTokens, beforeIdx, count);
      if (nextPart && nextPart.added) {
        flushPending();
      }
      if (content.trim() !== "") {
        result += wrapValue(content, "[-", "-]");
      }
      beforeIdx += count;
      if (!(nextPart && nextPart.added)) {
        flushPending();
      }
      continue;
    }

    for (let i = 0; i < count; i += 1) {
      flushPending();
      const token = afterTokens[afterIdx + i];
      result += token.value;
      if (token.trailing) {
        if (nextPart && nextPart.removed && token.trailing.includes("\n")) {
          pendingTrailing = token.trailing;
        } else {
          result += token.trailing;
        }
      }
    }

    beforeIdx += count;
    afterIdx += count;
  }

  flushPending();
  return result;
};

export const toWordDiff = (patch: string): string => {
  const parsedFiles = parseDiff(patch).filter((file) => file.chunks.length > 0);
  const rawFiles = collectRawDiffs(patch);

  if (!parsedFiles.length || parsedFiles.length !== rawFiles.length) {
    return patch;
  }

  const converted = parsedFiles.map((file, index) => {
    const headers = rawFiles[index]?.headers ?? [];
    const hunks = file.chunks.map((chunk) => {
      const { before, after } = buildChunkSnapshot(chunk);
      const body = computeWordDiff(before, after);
      return body ? `${chunk.content}\n${body}` : chunk.content;
    });
    const headerText = headers.join("\n");
    const bodyText = hunks.join("\n");
    return bodyText ? `${headerText}\n${bodyText}` : headerText;
  });

  return converted.join("\n");
};
