import { describe, expect, it } from "vitest";
import { mergeOverlappingEdits, parseWordDiff } from "../utils/parse-word-diff";
import { DIFF_WORD } from "../../../../diff-word";
import { DIFF_WORD_EXAMPLE } from "../../../../diff-word-example";
import type { Hunk, LineSegment } from "../utils/parse";

const collectLines = () =>
  parseWordDiff(DIFF_WORD).flatMap((file) =>
    file.hunks.flatMap((block) => (block.type === "hunk" ? block.lines : []))
  );
const collectExampleLines = () =>
  parseWordDiff(DIFF_WORD_EXAMPLE, { maxChangeRatio: 0.8 }).flatMap((file) =>
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
rename to src/beta.c`;
        const [file] = parseWordDiff(header);
        expect(file?.type).toBe("rename");
        expect(file?.oldPath).toBe("src/alpha.c");
        expect(file?.newPath).toBe("src/beta.c");
      });
      it("rename with content change", () => {
        const header = `diff --git a/src/old-name.txt b/src/new-name.txt
similarity index 87%
rename from src/old-name.txt
rename to   src/new-name.txt
index 1234567..abcdefg 100644
--- a/src/old-name.txt
+++ b/src/new-name.txt`;
        const [file] = parseWordDiff(header);
        expect(file?.type).toBe("rename");
        expect(file?.oldPath).toBe("src/old-name.txt");
        expect(file?.newPath).toBe("src/new-name.txt");
      });
      it("copy", () => {
        const header = `diff --git a/src/original.txt b/src/copy.txt
similarity index 95%
copy from src/original.txt
copy to copy.txt
index 1234567..abcdefg 100644
--- a/src/original.txt
+++ b/src/copy.txt`;
        const [file] = parseWordDiff(header);
        expect(file?.type).toBe("copy");
        expect(file?.oldPath).toBe("src/original.txt");
        expect(file?.newPath).toBe("src/copy.txt");
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

      const hunk = files[0]?.hunks.filter((block) => block.type === "hunk");
      expect(files[0]?.hunks).toHaveLength(2);
      expect(hunk[0]?.type).toBe("hunk");
      expect(hunk[0]?.newStart).toBe(1);
      expect(hunk[1]?.newStart).toBe(4);
    });
  });

  describe("parse lines", () => {
    const SIMPLE_WORD_DIFF = `diff --git a/file.txt b/file.txt
index 1111111..2222222 100644
--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
plain unchanged line
[-old value-]{+new value+}
{+brand new line+}
[-removed only line-]
`;

    const collectSimpleLines = () => {
      const [file] = parseWordDiff(SIMPLE_WORD_DIFF);
      const hunk = file?.hunks.find((block) => block.type === "hunk");
      return hunk?.lines ?? [];
    };

    it("parses insert line", () => {
      const lines = collectSimpleLines();

      const insertLine = lines.find((line) => line.type === "insert");
      expect(insertLine).toBeDefined();
      expect(insertLine).toMatchObject({
        type: "insert",
        isInsert: true,
        lineNumber: 3,
      });
      expect(insertLine?.content).toEqual([
        { type: "normal", value: "brand new line" },
      ]);
    });

    it("parses deleted line", () => {
      const lines = collectSimpleLines();

      const deleteLine = lines.find((line) => line.type === "delete");
      expect(deleteLine).toBeDefined();
      expect(deleteLine).toMatchObject({
        type: "delete",
        isDelete: true,
        lineNumber: 3,
      });
      expect(deleteLine?.content).toEqual([
        { type: "normal", value: "removed only line" },
      ]);
    });

    it("parses unchanged line", () => {
      const lines = collectSimpleLines();

      const unchangedLine = lines.find((line) =>
        line.content.some((segment) => segment.value === "plain unchanged line")
      );
      expect(unchangedLine).toBeDefined();
      expect(unchangedLine).toMatchObject({
        type: "normal",
        isNormal: true,
        oldLineNumber: 1,
        newLineNumber: 1,
      });
      expect(unchangedLine?.content).toEqual([
        { type: "normal", value: "plain unchanged line" },
      ]);
    });

    it("parses normal line", () => {
      const lines = collectSimpleLines();

      const normalLine = lines.find((line) =>
        line.content.some((segment) => segment.type === "insert")
      );
      expect(normalLine).toBeDefined();
      expect(normalLine).toMatchObject({
        type: "normal",
        oldLineNumber: 2,
        newLineNumber: 2,
      });
      // mergeOverlappingEdits extracts common suffix " value"
      expect(normalLine?.content).toEqual([
        { type: "delete", value: "old" },
        { type: "insert", value: "new" },
        { type: "normal", value: " value" },
      ]);
    });
    it("preserves empty lines", () => {
      const diff = `diff --git a/file.txt b/file.txt
index c0d0fb4..7e09cb7 100644
--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,3 @@

{+brand new line+}
`;
      const [file] = parseWordDiff(diff);
      const hunk = file?.hunks.find((block) => block.type === "hunk");
      const emptyLine = hunk?.lines.find(
        (line) =>
          line.type === "normal" &&
          line.content.every((segment) => segment.value === "")
      );
      expect(emptyLine).toBeDefined();
    });
  });

  describe("merge edited words", () => {
    it("merges overlapping delete/insert pairs into minimal edits", () => {
      const tokens: LineSegment[] = [
        { type: "normal", value: "prefix " },
        { type: "delete", value: "Copy" },
        { type: "insert", value: "Copy, ChevronDown" },
        { type: "normal", value: " suffix" },
      ];

      expect(mergeOverlappingEdits(tokens)).toEqual([
        { type: "normal", value: "prefix Copy" },
        { type: "insert", value: ", ChevronDown" },
        { type: "normal", value: " suffix" },
      ]);
    });

    it("doesn't merge non-overlapping delete/insert pairs", () => {
      const tokens: LineSegment[] = [
        { type: "normal", value: "prefix " },
        { type: "delete", value: "old" },
        { type: "insert", value: "new" },
        { type: "normal", value: " suffix" },
      ];

      expect(mergeOverlappingEdits(tokens)).toEqual([
        { type: "normal", value: "prefix " },
        { type: "delete", value: "old" },
        { type: "insert", value: "new" },
        { type: "normal", value: " suffix" },
      ]);
    });
  });

  describe("split weird merges into separate lines", () => {
    it("splits a merge of a delete and an insert into two lines", () => {
      const diff = `diff --git a/file.tsx b/file.tsx
index 1111111..2222222 100644
--- a/file.tsx
+++ b/file.tsx
@@ -1,1 +1,2 @@
import [-{ useTheme }-]{+* as Collapsible+} from [-"next-themes";-]{+"@radix-ui/react-collapsible";+}
`;

      const [file] = parseWordDiff(diff, { maxChangeRatio: 0.45 });
      const hunk = file?.hunks.find((block) => block.type === "hunk");
      const lines = hunk?.lines ?? [];

      const deletedImport = lines.find(
        (line) =>
          line.type === "delete" &&
          line.content.some((segment) =>
            segment.value.includes('import { useTheme } from "next-themes";')
          )
      );
      const insertedImport = lines.find(
        (line) =>
          line.type === "insert" &&
          line.content.some((segment) =>
            segment.value.includes(
              'import * as Collapsible from "@radix-ui/react-collapsible";'
            )
          )
      );

      expect(deletedImport).toBeDefined();
      expect(insertedImport).toBeDefined();

      expect(deletedImport?.content).toEqual([
        { type: "normal", value: 'import { useTheme } from "next-themes";' },
      ]);
      expect(insertedImport?.content).toEqual([
        {
          type: "normal",
          value: 'import * as Collapsible from "@radix-ui/react-collapsible";',
        },
      ]);
    });
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

  it("splits highly changed inline edits into separate lines", () => {
    const lines = collectExampleLines();

    const deletedImport = lines.find(
      (line) =>
        line.type === "delete" &&
        line.content.some((segment) =>
          segment.value.includes('import { useTheme } from "next-themes";')
        )
    );
    const insertedImport = lines.find(
      (line) =>
        line.type === "insert" &&
        line.content.some((segment) =>
          segment.value.includes(
            'import * as Collapsible from "@radix-ui/react-collapsible";'
          )
        )
    );

    expect(deletedImport).toBeDefined();
    expect(insertedImport).toBeDefined();

    expect(deletedImport?.content).toEqual([
      { type: "normal", value: 'import { useTheme } from "next-themes";' },
    ]);
    expect(insertedImport?.content).toEqual([
      {
        type: "normal",
        value: 'import * as Collapsible from "@radix-ui/react-collapsible";',
      },
    ]);
  });
});
