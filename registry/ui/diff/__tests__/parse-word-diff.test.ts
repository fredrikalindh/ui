import { describe, expect, it } from "vitest";
import { mergeOverlappingEdits, parseWordDiff } from "../utils/parse-word";
import { DIFF_WORD } from "../../../../diff-word-diff";
import type { LineSegment } from "../utils/parse";

const collectLines = () =>
  parseWordDiff(DIFF_WORD).flatMap((file) =>
    file.hunks.flatMap((block) => (block.type === "hunk" ? block.lines : []))
  );

describe("parseWordDiff", () => {
  it("merges overlapping delete/insert pairs into minimal edits", () => {
    const tokens: LineSegment[] = [
      { type: "normal", value: "prefix " },
      { type: "delete", value: "Copy" },
      { type: "insert", value: "Copy, ChevronDown" },
      { type: "normal", value: " suffix" },
    ];

    expect(mergeOverlappingEdits(tokens)).toEqual([
      { type: "normal", value: "prefix " },
      { type: "normal", value: "Copy" },
      { type: "insert", value: ", ChevronDown" },
      { type: "normal", value: " suffix" },
    ]);
  });

  it("parses diff metadata into file entries", () => {
    const files = parseWordDiff(DIFF_WORD);

    expect(files).toHaveLength(1);

    const [file] = files;
    expect(file?.oldPath).toMatch(/before\.tsx$/);
    expect(file?.newPath).toMatch(/after\.tsx$/);
    expect(file?.hunks.some((block) => block.type === "hunk")).toBe(true);
  });

  it("extracts inline segments for replacements within a line", () => {
    const lines = collectLines();

    const lucideImport = lines.find((line) =>
      line.content.some((segment) => segment.value.includes('"lucide-react"'))
    );

    expect(lucideImport).toBeDefined();

    const segments = lucideImport!.content;
    expect(segments.map((segment) => segment.type)).toEqual([
      "normal",
      "insert",
      "normal",
    ]);
    expect(segments[0]?.value.includes("Copy")).toBe(true);
    expect(
      segments.find((segment) => segment.type === "insert")?.value
    ).toBe(", ChevronDown");
    expect(segments.some((segment) => segment.type === "delete")).toBe(false);
  });

  it("marks stand-alone additions as inserted lines", () => {
    const lines = collectLines();

    const collapsibleImport = lines.find((line) =>
      line.content.some((segment) =>
        segment.value.includes("@radix-ui/react-collapsible")
      )
    );

    expect(collapsibleImport).toBeDefined();
    expect(collapsibleImport!.type).toBe("insert");
    expect(
      collapsibleImport!.content.every((segment) => segment.type === "insert")
    ).toBe(true);
  });
});
