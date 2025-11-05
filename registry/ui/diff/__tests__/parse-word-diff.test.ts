import { describe, expect, it } from "vitest";
import { mergeOverlappingEdits, parseWordDiff } from "../utils/parse-word";
import { DIFF_WORD } from "../../../../diff-word-diff";
import type { LineSegment } from "../utils/parse";

const collectLines = () =>
  parseWordDiff(DIFF_WORD).flatMap((file) =>
    file.hunks.flatMap((block) => (block.type === "hunk" ? block.lines : []))
  );

describe("parseWordDiff", () => {
  const header = `diff --git a/file.tsx b/file.tsx
index 4def792..b63576c 100644
--- a/file.tsx
+++ b/file.tsx`;
  describe("parse headers", () => {
    it("extracts old file path", () => {
      const [file] = parseWordDiff(header);
      expect(file?.oldPath).toBe("file.tsx");
    });
    it("extracts new file path", () => {
      const [file] = parseWordDiff(header);
      expect(file?.newPath).toBe("file.tsx");
    });

    describe("extracts type correctly", () => {
      it("modify", () => {
        const [file] = parseWordDiff(header);
        expect(file?.type).toBe("modify");
      });
      it("add", () => {
        const header = `diff --git a/src/bar.c b/src/bar.c
new file mode 100644
index 0000000..3b18e7a
--- /dev/null
+++ b/src/bar.c`;
        const [file] = parseWordDiff(header);
        expect(file?.type).toBe("add");
      });
      it("delete", () => {
        const header = `diff --git a/src/old.c b/src/old.c
deleted file mode 100644
index 3b18e7a..0000000
--- a/src/old.c
+++ /dev/null`;
        const [file] = parseWordDiff(header);
        expect(file?.type).toBe("delete");
      });
      it("rename", () => {
        const header = `diff --git a/src/alpha.c b/src/beta.c
similarity index 100%
rename from src/alpha.c
rename to   src/beta.c`;
        const [file] = parseWordDiff(header);
        expect(file?.type).toBe("rename");
      });
      it("copy", () => {
        const header = `diff --git a/src/alpha.c b/src/alpha_copy.c
similarity index 100%
copy from src/alpha.c
copy to   src/alpha_copy.c`;
        const [file] = parseWordDiff(header);
        expect(file?.type).toBe("copy");
      });
    });
  });

  describe("parse multiple files", () => {
    it("parses one file", () => {
      const files = parseWordDiff(DIFF_WORD);
      expect(files).toHaveLength(1);
    });
    it("parses multiple files", () => {
      const files = parseWordDiff(`${DIFF_WORD}\n${DIFF_WORD}`);
      expect(files).toHaveLength(2);
    });
  });

  describe("parse hunks", () => {
    it("parses one hunk", () => {
      const files = parseWordDiff(DIFF_WORD);
      expect(files[0]?.hunks).toHaveLength(1);
    });
    it("parses multiple hunks", () => {
      const files = parseWordDiff(`${header}
@@ -1,3 +1,3 @@
import { [-useState, -]useRef, {+useEffect+} } from 'react';
 
const [-Inpt-]{+Input+} = () => {
@@ -4,4 +4,4 @@
{+  +}return <div>Input</div>;
};
`);
      expect(files[0]?.hunks).toHaveLength(2);
    });
  });

  describe("parse lines", () => {
    it("parses insert line");
    it("parses deleted line");
    it("parses unchanged line");
    it("parses normal line");
  });

  describe("merge edited words", () => {});

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
    expect(segments.find((segment) => segment.type === "insert")?.value).toBe(
      ", ChevronDown"
    );
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
      collapsibleImport!.content.every((segment) => segment.type === "normal")
    ).toBe(true);
  });
});
