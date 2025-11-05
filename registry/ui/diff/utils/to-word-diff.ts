import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DIFF_HEADER_PREFIX = "diff --git ";
const NO_NEWLINE_MARKER = "\\ No newline at end of file";
const WORKING_DIR_PATH = process.cwd();
interface FileDiff {
  headers: string[];
  hunks: string[];
}

const joinLines = (segments: string[]): string =>
  segments.length > 0 ? `${segments.join("\n")}\n` : "";

const parseFileDiffs = (patch: string): FileDiff[] => {
  const lines = patch.split("\n");
  const files: FileDiff[] = [];

  let current: FileDiff | null = null;
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

const buildSnapshots = (
  hunkLines: string[]
): { before: string; after: string } => {
  const before: string[] = [];
  const after: string[] = [];

  for (const line of hunkLines) {
    if (!line || line.startsWith("@@") || line === NO_NEWLINE_MARKER) continue;

    const prefix = line[0];
    const content = line.slice(1);

    if (prefix === " ") {
      before.push(content);
      after.push(content);
    } else if (prefix === "-") {
      before.push(content);
    } else if (prefix === "+") {
      after.push(content);
    }
  }

  return {
    before: joinLines(before),
    after: joinLines(after),
  };
};

const computeWordDiff = (before: string, after: string): string[] => {
  const tempDir = mkdtempSync(join(tmpdir(), "to-word-diff-"));
  const beforePath = join(tempDir, "before.patch");
  const afterPath = join(tempDir, "after.patch");

  try {
    writeFileSync(beforePath, before, "utf8");
    writeFileSync(afterPath, after, "utf8");

    const result = spawnSync(
      "git",
      ["diff", "--word-diff", "--no-index", beforePath, afterPath],
      {
        encoding: "utf8",
      }
    );

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0 && result.status !== 1) {
      const message = result.stderr || result.stdout || "git diff failed";
      throw new Error(message);
    }

    const lines = result.stdout.trimEnd().split("\n");
    const start = lines.findIndex((line) => line.startsWith("@@"));
    return start === -1 ? [] : lines.slice(start);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

export const toWordDiff = (patch: string): string => {
  const files = parseFileDiffs(patch);
  if (files.length === 0) return patch;

  const converted = files.map((file) => {
    const { before, after } = buildSnapshots(file.hunks);

    // writeFileSync(join(WORKING_DIR_PATH, "a.tsx"), before, "utf8");
    // writeFileSync(join(WORKING_DIR_PATH, "b.tsx"), after, "utf8");

    const hunkLines = computeWordDiff(before, after);
    return [...file.headers, ...hunkLines].join("\n");
  });

  return converted.join("\n");
};
