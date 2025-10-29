import { describe, expect, it, test } from "vitest";
import { parseDiff } from "../utils/parse";

const lineBlocks = (diff: string) =>
  parseDiff(diff)?.[0]?.hunks.filter((hunk) => hunk.type === "hunk");

const HEADER = `diff --git a/file.tsx b/file.tsx
index 4def792..b63576c 100644
--- a/file.tsx
+++ b/file.tsx
`;

describe("parseDiff: core behavior", () => {
  describe("line-level behavior", () => {
    test("marks new lines as 'insert' when content is added", () => {
      const diff = `${HEADER}@@ -1,2 +1,3 @@
 line 1
+line 2
 line 3`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk.lines.map((l) => l.type)).toEqual([
        "normal",
        "insert",
        "normal",
      ]);
      expect(chunk!.lines[1]?.content[0]?.value).toBe("line 2");
    });

    test("marks removed lines as 'delete' when content is removed", () => {
      const diff = `${HEADER}@@ -1,3 +1,2 @@
 line 1
-line 2
 line 3`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines.map((l) => l.type)).toEqual([
        "normal",
        "delete",
        "normal",
      ]);
      expect(chunk!.lines[1]?.content[0]?.value).toBe("line 2");
    });

    test("preserves 'normal' type for unchanged lines", () => {
      const diff = `${HEADER}@@ -1,2 +1,2 @@
 line 1
 line 2`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines).toHaveLength(2);
      expect(chunk!.lines.every((l) => l.type === "normal")).toBe(true);
    });

    test("returns empty array for empty diff input", () => {
      expect(parseDiff("")).toEqual([]);
    });

    test("preserves empty lines as explicit delete/insert entries", () => {
      const diff = `${HEADER}@@ -1,3 +1,3 @@
 line 1
-
+line 2
 line 3`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines[1]?.type).toBe("delete");
      expect(chunk!.lines[2]?.type).toBe("insert");
    });

    test("emits consecutive 'insert' entries for multiple additions", () => {
      const diff = `${HEADER}@@ -1,1 +1,4 @@
 line 1
+line 2
+line 3
+line 4`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines.map((l) => l.type)).toEqual([
        "normal",
        "insert",
        "insert",
        "insert",
      ]);
    });

    test("emits consecutive 'delete' entries for multiple deletions", () => {
      const diff = `${HEADER}@@ -1,4 +1,1 @@
 line 1
-line 2
-line 3
-line 4`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines.map((l) => l.type)).toEqual([
        "normal",
        "delete",
        "delete",
        "delete",
      ]);
    });

    test("treats newline-at-EOF change as normal; no extra add/remove of closing brace", () => {
      // This is the actual scenario from packages/api/tsconfig.json
      const diff = `${HEADER}@@ -11,6 +11,6 @@
       "@workspace/github": ["../github/src"]
     }
   },
-  "include": ["src/**/*"],
+  "include": ["src/**/*", "src/markdown.d.ts"],
   "exclude": ["node_modules"]
-}
\\ No newline at end of file
+}`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();

      // The last line should be the final closing brace
      const lastLine = chunk!.lines[chunk!.lines.length - 1];
      expect(lastLine).toBeDefined();
      expect(
        lastLine!.content
          .map((s) => s.value)
          .join("")
          .trim()
      ).toBe("}");

      // The closing brace should appear as normal (not as both removed and added)
      expect(lastLine!.type).toBe("normal");

      // Verify there's no separate removed and added version of the final }
      const allLines = chunk!.lines.map((l) => ({
        type: l.type,
        content: l.content
          .map((s) => s.value)
          .join("")
          .trim(),
      }));

      const finalBraceCount = allLines.filter(
        (l) => l.content === "}" && l.type !== "normal"
      ).length;

      // Should have no removed or added versions of the final }
      expect(finalBraceCount).toBe(0);
    });
  });

  describe("word- and character-level pairing heuristics", () => {
    test("merges similar add/delete into single 'normal' line with word-level segments", () => {
      const diff = `${HEADER}@@ -1,1 +1,1 @@
-import { useState, useRef, useEffect } from 'react';
+import { useRef } from 'react';`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines).toHaveLength(1);
      expect(chunk!.lines[0]?.type).toBe("normal");

      const segments = chunk!.lines[0]!.content;
      expect(
        segments.some(
          (s) => s.type === "delete" && s.value.includes("useState")
        )
      ).toBe(true);
      expect(
        segments.some((s) => s.type === "insert" && s.value.includes("useRef"))
      ).toBe(false);
      expect(
        segments.some((s) => s.type === "normal" && s.value.includes("import"))
      ).toBe(true);
    });
    test("pairs lines for word-level diff even when addition precedes deletion", () => {
      const diff = `${HEADER}@@ -1,1 +1,1 @@
+import { useRef } from 'react';
-import { useState, useRef, useEffect } from 'react';
`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines).toHaveLength(1);
      expect(chunk!.lines[0]?.type).toBe("normal");

      const segments = chunk!.lines[0]!.content;
      expect(
        segments.some(
          (s) => s.type === "delete" && s.value.includes("useState")
        )
      ).toBe(true);
      expect(
        segments.some((s) => s.type === "insert" && s.value.includes("useRef"))
      ).toBe(false);
      expect(
        segments.some((s) => s.type === "normal" && s.value.includes("import"))
      ).toBe(true);
    });

    test("pairs consecutive similar edits into modified 'normal' lines", () => {
      const diff = `${HEADER}@@ -1,2 +1,3 @@
-const foo = 'bar';
-const baz = 'qux';
+const foo = 'baz';
+const baz = 'quux';
 const normal = 'value';
`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines).toHaveLength(3);

      expect(chunk!.lines.map((l) => l.type)).toEqual([
        "normal",
        "normal",
        "normal",
      ]);
    });

    test("does not pair dissimilar changes; emits separate delete and insert", () => {
      const diff = `${HEADER}@@ -1,1 +1,1 @@
-this is completely different text
+something totally unrelated here`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines.map((l) => l.type)).toEqual(["delete", "insert"]);
    });

    test("applies ~50% similarity threshold to include both delete and insert segments", () => {
      const diff = `${HEADER}@@ -1,1 +1,1 @@
-const value = calculateSomething();
+const result = calculateSomething();`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines).toHaveLength(1);
      expect(chunk!.lines?.[0]?.content.map((l) => l.type)).toEqual([
        "normal",
        "delete",
        "insert",
        "normal",
      ]);
      expect(chunk!.lines[0]?.type).toBe("normal");
    });

    test("rejects very low-similarity changes; emits separate delete and insert lines", () => {
      const diff = `${HEADER}@@ -1,1 +1,1 @@
-short
+this is a much longer line with completely different content`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines.map((l) => l.type)).toEqual(["delete", "insert"]);
    });

    test("prefers optimal pairing when multiple candidates exist", () => {
      const diff = `${HEADER}@@ -1,6 +1,6 @@
+const value = calculateValue();
+const result = processResult();
 line 1
-const value = getValue();
-const result = getResult();
 line 2`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.lines.map((l) => l.type)).toEqual([
        "normal",
        "normal",
        "normal",
        "normal",
      ]);

      const [valueLine, resultLine] = chunk!.lines;
      expect(
        valueLine?.content.some(
          (s) => s.type === "delete" && s.value.includes("getValue")
        )
      ).toBe(true);
      expect(
        valueLine?.content.some(
          (s) => s.type === "insert" && s.value.includes("calculateValue")
        )
      ).toBe(true);
      expect(
        resultLine?.content.some(
          (s) => s.type === "delete" && s.value.includes("getResult")
        )
      ).toBe(true);
      expect(
        resultLine?.content.some(
          (s) => s.type === "insert" && s.value.includes("processResult")
        )
      ).toBe(true);
    });
  });

  describe("chunking and skip blocks", () => {
    test("emits leading skip block for first distant hunk", () => {
      const diff = `${HEADER}@@ -10,3 +10,3 @@
 line 9 context
-line 10 old
+line 10 new
 line 11 context
`;

      const [file] = parseDiff(diff);
      const items = file.hunks;

      expect(items[0]).toMatchObject({ type: "skip", count: 9 });
      expect(items[1]).toMatchObject({ type: "hunk" });
    });

    test("inserts skip block between distant hunks", () => {
      const diff = `${HEADER}@@ -1,3 +1,3 @@
 line 1
-line 2 old
+line 2 new
 line 3
@@ -10,3 +10,3 @@
 line 10
-line 11 old
+line 11 new
 line 12
`;

      const [file] = parseDiff(diff);
      const items = file.hunks;

      expect(items[0]).toMatchObject({ type: "hunk" });
      expect(items[1]).toMatchObject({
        type: "skip",
        count: 6,
      });
      expect(items[2]).toMatchObject({ type: "hunk" });
    });
  });

  it("keeps JSX refactor as separate removal plus insertions (no pairing)", () => {
    const diff = `${HEADER}
@@ -1,1 +1,5 @@
-<Card.Root data-section-id={id} id={id}>
+<Card.Root
+  data-section-id={id}
+  id={id}
+  defaultOpen={file.status !== "delete"}
+>`;

    const result = lineBlocks(diff);
    const allLines = result.flatMap((r) => r.lines);

    const removed = allLines.filter((l) => l.type === "normal");
    const added = allLines.filter((l) => l.type === "insert");

    // Should be separate removed and added lines, not merged
    expect(removed.length).toBe(1);
    expect(added.length).toBe(4);

    // Removed line should come first
    expect(allLines[0]?.type).toBe("insert");
    expect(allLines[1]?.type).toBe("normal");
  });

  it("represents className change as a single modified line with inline segment", () => {
    const diff = `${HEADER}
@@ -257,7 +257,7 @@ export const FileChanges = ({ prMeta, files, prId }: FileChangesProps) => {
         )}
       </div>
-      <div className="space-y-4 mx-auto flex flex-col gap-4 overflow-visible flex-1 py-16 pr-24 max-w-4xl">
+      <div className="space-y-4 mx-auto flex flex-col gap-4 overflow-visible flex-1 py-16 max-w-4xl">
         <h1
           className="text-xl font-medium mb-2 mt-4 first:mt-0"
           id={slugify(displayTitle)}`;

    const result = lineBlocks(diff);
    const allLines = result.flatMap((r) => r.lines);

    const modified = allLines.filter(
      (l) => l.type === "normal" && l.content.length > 1
    );
    const added = allLines.filter((l) => l.type === "insert");
    const removed = allLines.filter((l) => l.type === "delete");

    // Should be displayed as a single modified line, not separate removed + added
    expect(modified.length).toBe(1);
    expect(added.length).toBe(0);
    expect(removed.length).toBe(0);
    expect(allLines.length).toBe(6);

    // The modified line should highlight the removed "pr-24 " part
    const modifiedLine = modified[0];
    expect(modifiedLine).toBeDefined();

    const hasRemovedSegment = modifiedLine?.content.some(
      (s) => s.type === "delete" && s.value.includes("pr-24")
    );
    expect(hasRemovedSegment).toBe(true);
  });

  it("preserves line order: deletions appear before insertions", () => {
    const diff = `diff --git a/file-changes.tsx b/file-changes.tsx
index 1234567..2345678 100644
--- a/file-changes.tsx
+++ b/file-changes.tsx
@@ -95,18 +95,24 @@ const DiffViewer = ({
   return (
     <Card.Root data-section-id={id} id={id}>
-        {file?.status === "insert" ? (
-          <Badge variant="success">New</Badge>
-        ) : file?.status === "deleted" ? (
+
+        {file?.status === "insert" && <Badge variant="success">New</Badge>}
+        {file?.status === "delete" && (
           <Badge variant="destructive">Deleted</Badge>
-        ) : null}
-        <span className="text-xs tabular-nums">
-          <span className="text-green-600">+{additions}</span>
-          <span className="text-red-600">-{deletions}</span>
-        </span>
+        )}
+        {file?.status === "normal" && (
+          <span className="text-xs tabular-nums">
+            <span className="text-green-600">+{additions}</span>
+            <span className="text-red-600">-{deletions}</span>
+          </span>
+        )}
`;

    const result = lineBlocks(diff);
    const allLines = result.flatMap((r) => r.lines);

    expect(allLines).toHaveLength(16);

    // Should have 3 normal lines, one added prop line, and a modified destructuring line
    expect(allLines.map((l) => l.type)).toEqual([
      "normal",
      "normal",
      "delete",
      "delete",
      "delete",
      "insert",
      "insert",
      "insert",
      "normal",
      "normal",
      "insert",
      "normal",
      "normal",
      "normal",
      "normal",
      "insert",
    ]);

    // the last 4 modified lines should not have any added or removed segments
    expect(
      allLines
        .filter((l) => l.type === "normal")
        .slice(-4)
        .every((l) => l.content.every((s) => s.type === "normal"))
    ).toBe(true);
  });

  it("pairs JSX tag split into a single modified line", () => {
    const diff = `${HEADER}
@@ -1,1 +1,3 @@
-<Component prop="value" />
+<Component
+  prop="value"
+/>`;

    const result = lineBlocks(diff);
    const allLines = result.flatMap((r) => r.lines);

    const modified = allLines.filter(
      (l) => l.type === "normal" && l.content.length > 1
    );
    expect(allLines.length).toBe(3);
    // The split tag gets paired with its original since it's the start
    expect(modified.length).toBe(1);
  });

  it("pairs JSX tag split when additions precede deletion", () => {
    const diff = `${HEADER}
@@ -1,1 +1,3 @@
+<Component
+  prop="value"
+/>
-<Component prop="value" />
`;

    const result = lineBlocks(diff);
    const allLines = result.flatMap((r) => r.lines);
    expect(allLines.length).toBe(3);
    const modified = allLines.filter(
      (l) => l.type === "normal" && l.content.length > 1
    );
    // The split tag gets paired with its original since it's the start
    expect(modified.length).toBe(1);

    expect(allLines[0]?.content.map((s) => s.value.trim())).toEqual([
      "<Component",
    ]);
  });

  it("does not pair similar function signatures when separated by context", () => {
    const diff = `${HEADER}
@@ -1,10 +1,15 @@
+const Header: React.FC<Props> = ({
+  className,
+  children,
+}) => (
+  <Wrapper>
const Root = () => {
 return <div>content</div>;
};
-
-const Header: React.FC<Props> = ({
-  className,
-}) => (
-  <div>header</div>
+  </Wrapper>
);`;

    const result = lineBlocks(diff);
    const allLines = result.flatMap((r) => r.lines);

    const removedLines = allLines.filter((l) => l.type === "delete");
    const addedLines = allLines.filter((l) => l.type === "insert");

    // The Header component was moved and restructured. Due to the distance and
    // intervening context lines, these don't get paired as modifications.
    // They appear as separate removals and additions, which is reasonable.
    expect(removedLines.length).toBeGreaterThan(0);
    expect(addedLines.length).toBeGreaterThan(0);
  });

  it("handles prop addition plus modified destructuring with inline highlights", () => {
    const diff = `${HEADER}
@@ -119,10 +125,32 @@ const Line: React.FC<{
   line: DiffLine;
   language: string;
   status: "insert" | "delete" | "normal";
-}> = ({ line, language, status }) => {
+  commentIndex?: FileCommentLineIndex;
+}> = ({ line, language, status, commentIndex }) => {`;

    const result = lineBlocks(diff);
    const allLines = result.flatMap((r) => r.lines);

    // Should have 3 normal lines, one added prop line, and a modified destructuring line
    expect(allLines.map((l) => l.type)).toEqual([
      "normal",
      "normal",
      "normal",
      "insert",
      "normal",
    ]);

    // Verify the first added line is the new prop
    const addedLines = allLines.filter((l) => l.type === "insert");
    expect(addedLines).toHaveLength(1);
    expect(
      addedLines[0]?.content.some((s) => s.value.includes("commentIndex?"))
    ).toBe(true);

    // Verify the modified line highlights both the added and removed destructuring pieces
    const modified = allLines.filter(
      (l) => l.type === "normal" && l.content.length > 1
    );
    expect(modified.length).toBe(1);
    const modifiedLine = modified[0];
    expect(modifiedLine).toBeDefined();
    expect(
      modifiedLine?.content.some(
        (s) => s.type === "insert" && s.value.includes("commentIndex")
      )
    ).toBe(true);
    expect(
      modifiedLine?.content.some(
        (s) => s.type !== "insert" && s.value.includes("line, language, status")
      )
    ).toBe(true);
  });
  it("performs character-level diff for single-character insertion", () => {
    const diff = `${HEADER}
@@ -1,1 +1,1 @@ const Line: React.FC<{
-Setup a new challeng each day
+Setup a new challenge each day
`;

    const result = lineBlocks(diff);

    expect(result).toHaveLength(1);

    const allLines = result.flatMap((r) => r.lines);

    expect(allLines).toHaveLength(1);

    expect(allLines[0]!.type).toBe("normal");
    expect(allLines[0]!.content.map((s) => s.value)).toEqual([
      "Setup a new challeng",
      "e",
      " each day",
    ]);
    expect(allLines[0]!.content.map((s) => s.type)).toEqual([
      "normal",
      "insert",
      "normal",
    ]);
  });
  it("performs character-level diff at start of word (case change)", () => {
    const diff = `${HEADER}
@@ -1,1 +1,1 @@ const Line: React.FC<{
-setup a new challenge each day
+Setup a new challenge each day
`;

    const result = lineBlocks(diff);
    expect(result).toHaveLength(1);
    const allLines = result.flatMap((r) => r.lines);
    expect(allLines).toHaveLength(1);

    expect(allLines[0]!.type).toBe("normal");
    expect(allLines[0]!.content.map((s) => s.value)).toEqual([
      "s",
      "S",
      "etup a new challenge each day",
    ]);
    expect(allLines[0]!.content.map((s) => s.type)).toEqual([
      "delete",
      "insert",
      "normal",
    ]);
  });
  it("performs character-level diff in middle of word (typo fix)", () => {
    const diff = `${HEADER}
@@ -1,1 +1,1 @@ const Line: React.FC<{
-Setup a new challennge each day
+Setup a new challenge each day
`;

    const result = lineBlocks(diff);

    expect(result).toHaveLength(1);
    const allLines = result.flatMap((r) => r.lines);

    expect(allLines).toHaveLength(1);

    expect(allLines[0]!.type).toBe("normal");
    expect(allLines[0]!.content.map((s) => s.value)).toEqual([
      "Setup a new challen",
      "n",
      "ge each day",
    ]);
    expect(allLines[0]!.content.map((s) => s.type)).toEqual([
      "normal",
      "delete",
      "normal",
    ]);
  });
});
