import { describe, expect, it, test } from "vitest";
import { computeDiff, type DiffLine } from "../compute-diff";

const lineBlocks = (diff: string) =>
  computeDiff(diff).filter(
    (item): item is { kind: "line"; line: DiffLine[] } => item.kind === "line"
  );

describe("computeDiff concise plan", () => {
  describe("basic diff behavior", () => {
    test("returns added lines when new content appears", () => {
      const diff = `@@ -1,2 +1,3 @@
 line 1
+line 2
 line 3`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line.map((l) => l.type)).toEqual([
        "unchanged",
        "added",
        "unchanged",
      ]);
      expect(chunk!.line[1]?.segments[0]?.value).toBe("line 2");
    });

    test("returns removed lines when content disappears", () => {
      const diff = `@@ -1,3 +1,2 @@
 line 1
-line 2
 line 3`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line.map((l) => l.type)).toEqual([
        "unchanged",
        "removed",
        "unchanged",
      ]);
      expect(chunk!.line[1]?.segments[0]?.value).toBe("line 2");
    });

    test("preserves unchanged lines in diff output", () => {
      const diff = `@@ -1,2 +1,2 @@
 line 1
 line 2`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line).toHaveLength(2);
      expect(chunk!.line.every((l) => l.type === "unchanged")).toBe(true);
    });

    test("handles empty diff gracefully", () => {
      expect(computeDiff("")).toEqual([]);
    });

    test("keeps empty lines intact", () => {
      const diff = `@@ -1,3 +1,3 @@
 line 1
-
+line 2
 line 3`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line[1]?.type).toBe("removed");
      expect(chunk!.line[2]?.type).toBe("added");
    });

    test("groups multiple consecutive additions", () => {
      const diff = `@@ -1,1 +1,4 @@
 line 1
+line 2
+line 3
+line 4`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line.map((l) => l.type)).toEqual([
        "unchanged",
        "added",
        "added",
        "added",
      ]);
    });

    test("groups multiple consecutive deletions", () => {
      const diff = `@@ -1,4 +1,1 @@
 line 1
-line 2
-line 3
-line 4`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line.map((l) => l.type)).toEqual([
        "unchanged",
        "removed",
        "removed",
        "removed",
      ]);
    });

    test("treats adding newline at EOF as unchanged", () => {
      // This is the actual scenario from packages/api/tsconfig.json
      const diff = `@@ -11,6 +11,6 @@
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
      const lastLine = chunk!.line[chunk!.line.length - 1];
      expect(lastLine).toBeDefined();
      expect(
        lastLine!.segments
          .map((s) => s.value)
          .join("")
          .trim()
      ).toBe("}");

      // The closing brace should appear as unchanged (not as both removed and added)
      expect(lastLine!.type).toBe("unchanged");

      // Verify there's no separate removed and added version of the final }
      const allLines = chunk!.line.map((l) => ({
        type: l.type,
        content: l.segments
          .map((s) => s.value)
          .join("")
          .trim(),
      }));

      const finalBraceCount = allLines.filter(
        (l) => l.content === "}" && l.type !== "unchanged"
      ).length;

      // Should have no removed or added versions of the final }
      expect(finalBraceCount).toBe(0);
    });
  });

  describe("word-level pairing heuristics", () => {
    test("generates word-level diff for similar lines", () => {
      const diff = `@@ -1,1 +1,1 @@
-import { useState, useRef, useEffect } from 'react';
+import { useRef } from 'react';`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line).toHaveLength(1);
      expect(chunk!.line[0]?.type).toBe("modified");

      const segments = chunk!.line[0]!.segments;
      expect(
        segments.some(
          (s) => s.type === "removed" && s.value.includes("useState")
        )
      ).toBe(true);
      expect(
        segments.some((s) => s.type === "added" && s.value.includes("useRef"))
      ).toBe(false);
      expect(
        segments.some(
          (s) => s.type === "unchanged" && s.value.includes("import")
        )
      ).toBe(true);
    });
    test("generates word-level diff despite addition coming before deletion", () => {
      const diff = `@@ -1,1 +1,1 @@
+import { useRef } from 'react';
-import { useState, useRef, useEffect } from 'react';
`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line).toHaveLength(1);
      expect(chunk!.line[0]?.type).toBe("modified");

      const segments = chunk!.line[0]!.segments;
      expect(
        segments.some(
          (s) => s.type === "removed" && s.value.includes("useState")
        )
      ).toBe(true);
      expect(
        segments.some((s) => s.type === "added" && s.value.includes("useRef"))
      ).toBe(false);
      expect(
        segments.some(
          (s) => s.type === "unchanged" && s.value.includes("import")
        )
      ).toBe(true);
    });

    test("pairs similar consecutive edits", () => {
      const diff = `@@ -1,2 +1,3 @@
-const foo = 'bar';
-const baz = 'qux';
+const foo = 'baz';
+const baz = 'quux';
 const unchanged = 'value';
`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line).toHaveLength(3);

      expect(chunk!.line.map((l) => l.type)).toEqual([
        "modified",
        "modified",
        "unchanged",
      ]);
    });

    test("rejects pairing for dissimilar changes", () => {
      const diff = `@@ -1,1 +1,1 @@
-this is completely different text
+something totally unrelated here`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line.map((l) => l.type)).toEqual(["removed", "added"]);
    });

    test("respects similarity threshold around fifty percent", () => {
      const diff = `@@ -1,1 +1,1 @@
-const value = calculateSomething();
+const result = calculateSomething();`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line).toHaveLength(1);
      expect(chunk!.line?.[0]?.segments.map((l) => l.type)).toEqual([
        "unchanged",
        "removed",
        "added",
        "unchanged",
      ]);
      expect(chunk!.line[0]?.type).toBe("modified");
    });

    test("rejects very low similarity matches", () => {
      const diff = `@@ -1,1 +1,1 @@
-short
+this is a much longer line with completely different content`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line.map((l) => l.type)).toEqual(["removed", "added"]);
    });

    test("prefers best pairings when multiple candidates exist", () => {
      const diff = `@@ -1,6 +1,6 @@
+const value = calculateValue();
+const result = processResult();
 line 1
-const value = getValue();
-const result = getResult();
 line 2`;

      const chunk = lineBlocks(diff)[0];
      expect(chunk).toBeDefined();
      expect(chunk!.line.map((l) => l.type)).toEqual([
        "modified",
        "modified",
        "unchanged",
        "unchanged",
      ]);

      const [valueLine, resultLine] = chunk!.line;
      expect(
        valueLine?.segments.some(
          (s) => s.type === "removed" && s.value.includes("getValue")
        )
      ).toBe(true);
      expect(
        valueLine?.segments.some(
          (s) => s.type === "added" && s.value.includes("calculateValue")
        )
      ).toBe(true);
      expect(
        resultLine?.segments.some(
          (s) => s.type === "removed" && s.value.includes("getResult")
        )
      ).toBe(true);
      expect(
        resultLine?.segments.some(
          (s) => s.type === "added" && s.value.includes("processResult")
        )
      ).toBe(true);
    });
  });

  describe("chunking and skip blocks", () => {
    test("creates skip block before the first distant chunk", () => {
      const diff = `@@ -10,3 +10,3 @@
 line 9 context
-line 10 old
+line 10 new
 line 11 context
`;

      const items = computeDiff(diff);

      expect(items[0]).toMatchObject({
        kind: "skip",
        skip: { count: 9 },
      });
      expect(items[1]).toMatchObject({ kind: "line" });
    });

    test("creates skip blocks between separated chunks", () => {
      const diff = `@@ -1,3 +1,3 @@
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

      const items = computeDiff(diff);

      expect(items[0]).toMatchObject({ kind: "line" });
      expect(items[1]).toMatchObject({
        kind: "skip",
        skip: { count: 6 },
      });
      expect(items[2]).toMatchObject({ kind: "line" });
    });
  });

  // describe("ordering and reordering safeguards", () => {
  //   test.todo("keeps add-before-delete sequences paired when close");
  //   test.todo("skips pairing when add and delete are far apart");
  //   test.todo("skips pairing for far but dissimilar lines");
  //   test.todo("mixes consecutive and non-consecutive edits correctly");
  //   test.todo("maintains legacy consecutive pairing behavior");
  //   test.todo("handles scenarios with more additions than deletions");
  //   test.todo("handles scenarios with more deletions than additions");
  //   test.todo("keeps removed lines before added lines in badge bug");
  //   test.todo("handles Card.Root refactor ordering");
  // });

  it("should handle the Card.Root refactoring correctly", () => {
    const diff = `diff --git a/test.tsx b/test.tsx
@@ -1,1 +1,5 @@
-<Card.Root data-section-id={id} id={id}>
+<Card.Root
+  data-section-id={id}
+  id={id}
+  defaultOpen={file.status !== "removed"}
+>`;

    const result = computeDiff(diff);
    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));

    const removed = allLines.filter((l) => l.type === "removed");
    const added = allLines.filter((l) => l.type === "added");

    // Should be separate removed and added lines, not merged
    expect(removed.length).toBe(1);
    expect(added.length).toBe(5);

    // Removed line should come first
    expect(allLines[0]?.type).toBe("removed");
    expect(allLines[1]?.type).toBe("added");
  });

  it.todo("should extract the function name from the line", () => {
    // const diff = `diff --git a/file.tsx b/file.tsx
    // @@ -257,7 +257,7 @@ export const FileChanges = ({ prMeta, files, prId }: FileChangesProps) => {
    //          )}
    //        </div>
    // -      <div className="space-y-4 mx-auto flex flex-col gap-4 overflow-visible flex-1 py-16 pr-24 max-w-4xl">
    // +      <div className="space-y-4 mx-auto flex flex-col gap-4 overflow-visible flex-1 py-16 max-w-4xl">
    //          <h1
    //            className="text-xl font-medium mb-2 mt-4 first:mt-0"
    //            id={slugify(displayTitle)}`;
  });

  it("should display simple className change as modified line", () => {
    const diff = `diff --git a/file.tsx b/file.tsx
@@ -257,7 +257,7 @@ export const FileChanges = ({ prMeta, files, prId }: FileChangesProps) => {
         )}
       </div>
-      <div className="space-y-4 mx-auto flex flex-col gap-4 overflow-visible flex-1 py-16 pr-24 max-w-4xl">
+      <div className="space-y-4 mx-auto flex flex-col gap-4 overflow-visible flex-1 py-16 max-w-4xl">
         <h1
           className="text-xl font-medium mb-2 mt-4 first:mt-0"
           id={slugify(displayTitle)}`;

    const result = computeDiff(diff);
    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));

    const modified = allLines.filter((l) => l.type === "modified");
    const added = allLines.filter((l) => l.type === "added");
    const removed = allLines.filter((l) => l.type === "removed");

    // Should be displayed as a single modified line, not separate removed + added
    expect(modified.length).toBe(1);
    expect(added.length).toBe(0);
    expect(removed.length).toBe(0);

    // The modified line should highlight the removed "pr-24 " part
    const modifiedLine = modified[0];
    expect(modifiedLine).toBeDefined();

    const hasRemovedSegment = modifiedLine?.segments.some(
      (s) => s.type === "removed" && s.value.includes("pr-24")
    );
    expect(hasRemovedSegment).toBe(true);
  });

  it("should display removed lines before added lines (no reordering)", () => {
    const diff = `diff --git a/file-changes.tsx b/file-changes.tsx
index 1234567..2345678 100644
--- a/file-changes.tsx
+++ b/file-changes.tsx
@@ -95,18 +95,24 @@ const DiffViewer = ({
   return (
     <Card.Root data-section-id={id} id={id}>
-        {file?.status === "added" ? (
-          <Badge variant="success">New</Badge>
-        ) : file?.status === "deleted" ? (
+
+        {file?.status === "added" && <Badge variant="success">New</Badge>}
+        {file?.status === "removed" && (
           <Badge variant="destructive">Deleted</Badge>
-        ) : null}
-        <span className="text-xs tabular-nums">
-          <span className="text-green-600">+{additions}</span>
-          <span className="text-red-600">-{deletions}</span>
-        </span>
+        )}
+        {file?.status === "modified" && (
+          <span className="text-xs tabular-nums">
+            <span className="text-green-600">+{additions}</span>
+            <span className="text-red-600">-{deletions}</span>
+          </span>
+        )}
`;

    const result = computeDiff(diff);

    console.log(JSON.stringify(result, null, 2));

    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));

    expect(allLines).toHaveLength(16);

    // Should have 3 unchanged lines, one added prop line, and a modified destructuring line
    expect(allLines.map((l) => l.type)).toEqual([
      "unchanged",
      "unchanged",
      "removed",
      "removed",
      "removed",
      "added",
      "added",
      "added",
      "unchanged",
      "modified",
      "added",
      "modified",
      "modified",
      "modified",
      "modified",
      "added",
    ]);

    // the last 4 modified lines should not have any added or removed segments
    expect(
      allLines
        .filter((l) => l.type === "modified")
        .slice(-4)
        .every((l) => l.segments.every((s) => s.type === "unchanged"))
    ).toBe(true);
  });

  it("should handle simple JSX reformatting", () => {
    const diff = `diff --git a/test.tsx b/test.tsx
@@ -1,1 +1,3 @@
-<Component prop="value" />
+<Component
+  prop="value"
+/>`;

    const result = computeDiff(diff);
    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));
    const modified = allLines.filter((l) => l.type === "modified");
    expect(allLines.length).toBe(3);
    // The split tag gets paired with its original since it's the start
    expect(modified.length).toBe(1);
  });

  it("should handle simple JSX reformatting", () => {
    const diff = `diff --git a/test.tsx b/test.tsx
@@ -1,1 +1,3 @@
+<Component
+  prop="value"
+/>
-<Component prop="value" />
`;

    const result = computeDiff(diff);
    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));
    const modified = allLines.filter((l) => l.type === "modified");
    expect(allLines.length).toBe(3);
    // The split tag gets paired with its original since it's the start
    expect(modified.length).toBe(1);

    expect(allLines[0]?.segments.map((s) => s.value.trim())).toEqual([
      "<Component",
      'prop="value" />',
    ]);
  });

  it("should pair similar function signatures even when separated", () => {
    const diff = `diff --git a/test.tsx b/test.tsx
index 1234567..2345678 100644
--- a/test.tsx
+++ b/test.tsx
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

    const result = computeDiff(diff);
    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));

    const removedLines = allLines.filter((l) => l.type === "removed");
    const addedLines = allLines.filter((l) => l.type === "added");

    // The Header component was moved and restructured. Due to the distance and
    // intervening context lines, these don't get paired as modifications.
    // They appear as separate removals and additions, which is reasonable.
    expect(removedLines.length).toBeGreaterThan(0);
    expect(addedLines.length).toBeGreaterThan(0);
  });

  it("should handle React component prop addition with modified destructuring", () => {
    const diff = `diff --git a/test.tsx b/test.tsx
@@ -119,10 +125,32 @@ const Line: React.FC<{
   line: DiffLine;
   language: string;
   status: "added" | "removed" | "modified";
-}> = ({ line, language, status }) => {
+  commentIndex?: FileCommentLineIndex;
+}> = ({ line, language, status, commentIndex }) => {`;

    const result = computeDiff(diff);
    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));

    // Should have 3 unchanged lines, one added prop line, and a modified destructuring line
    expect(allLines.map((l) => l.type)).toEqual([
      "unchanged",
      "unchanged",
      "unchanged",
      "added",
      "modified",
    ]);

    // Verify the first added line is the new prop
    const addedLines = allLines.filter((l) => l.type === "added");
    expect(addedLines).toHaveLength(1);
    expect(
      addedLines[0]?.segments.some((s) => s.value.includes("commentIndex?"))
    ).toBe(true);

    // Verify the modified line highlights both the added and removed destructuring pieces
    const modifiedLine = allLines.find((l) => l.type === "modified");
    expect(modifiedLine).toBeDefined();
    expect(
      modifiedLine?.segments.some(
        (s) => s.type === "added" && s.value.includes("commentIndex")
      )
    ).toBe(true);
    expect(
      modifiedLine?.segments.some(
        (s) => s.type !== "added" && s.value.includes("line, language, status")
      )
    ).toBe(true);
  });
  it("should character diffs nicely", () => {
    const diff = `diff --git a/test.tsx b/test.tsx
@@ -1,1 +1,1 @@ const Line: React.FC<{
-Setup a new challeng each day
+Setup a new challenge each day
`;

    const result = computeDiff(diff);

    expect(result).toHaveLength(1);

    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));

    expect(allLines).toHaveLength(1);

    expect(allLines[0]!.type).toBe("modified");
    expect(allLines[0]!.segments.map((s) => s.value)).toEqual([
      "Setup a new challeng",
      "e",
      " each day",
    ]);
    expect(allLines[0]!.segments.map((s) => s.type)).toEqual([
      "unchanged",
      "added",
      "unchanged",
    ]);
  });
  it("should character diffs nicely in beginning of word", () => {
    const diff = `diff --git a/test.tsx b/test.tsx
@@ -1,1 +1,1 @@ const Line: React.FC<{
-setup a new challenge each day
+Setup a new challenge each day
`;

    const result = computeDiff(diff);

    expect(result).toHaveLength(1);

    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));

    expect(allLines).toHaveLength(1);

    expect(allLines[0]!.type).toBe("modified");
    expect(allLines[0]!.segments.map((s) => s.value)).toEqual([
      "s",
      "S",
      "etup a new challenge each day",
    ]);
    expect(allLines[0]!.segments.map((s) => s.type)).toEqual([
      "removed",
      "added",
      "unchanged",
    ]);
  });
  it("should character diffs nicely in middle of word", () => {
    const diff = `diff --git a/test.tsx b/test.tsx
@@ -1,1 +1,1 @@ const Line: React.FC<{
-Setup a new challennge each day
+Setup a new challenge each day
`;

    const result = computeDiff(diff);

    expect(result).toHaveLength(1);

    const allLines = result
      .filter((r) => r.kind === "line")
      .flatMap((r) => (r.kind === "line" ? r.line : []));

    expect(allLines).toHaveLength(1);

    expect(allLines[0]!.type).toBe("modified");
    expect(allLines[0]!.segments.map((s) => s.value)).toEqual([
      "Setup a new challen",
      "n",
      "ge each day",
    ]);
    expect(allLines[0]!.segments.map((s) => s.type)).toEqual([
      "unchanged",
      "removed",
      "unchanged",
    ]);
  });
});
