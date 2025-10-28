import { describe, expect, test } from "vitest";
import { parseDiff } from "../utils/parse";

const header = `diff --git a/file.tsx b/file.tsx
index 4def792..b63576c 100644
--- a/file.tsx
+++ b/file.tsx
`;

describe("insert skip blocks", () => {
  test("inserts a skip block before the first distant chunk and preserves function name", () => {
    const diff = `${header}@@ -10,3 +10,3 @@ function foo
 line 9 context
-line 10 old
+line 10 new
 line 11 context\n`;

    const files = parseDiff(diff);

    expect(files.length).toBe(1);
    expect(files[0].hunks.length).toBe(2);
    expect(files[0].hunks?.[0].type).toBe("skip");
    expect(files[0].hunks?.[1].type).toBe("hunk");
  });

  test("inserts a skip block between separated chunks", () => {
    const diff = `${header}@@ -1,3 +1,3 @@
 line 1
-line 2 old
+line 2 new
 line 3
@@ -10,3 +10,3 @@ someFunction
 line 10
-line 11 old
+line 11 new
 line 12\n`;

    const files = parseDiff(diff);

    expect(files.length).toBe(1);
    const types = files[0].hunks.map((h) => h.type);
    expect(types).toEqual(["hunk", "skip", "hunk"]);
  });

  test("does not insert skip when the first chunk starts at line 1 and chunks are contiguous", () => {
    const diff = `${header}@@ -1,3 +1,3 @@ start
 line 1
-line 2
+line 2 changed
 line 3
@@ -4,3 +4,3 @@ cont
 line 4
-line 5
+line 5 changed
 line 6\n`;

    const files = parseDiff(diff);

    expect(files.length).toBe(1);
    const hasSkip = files[0].hunks.some((h) => h.type === "skip");
    expect(hasSkip).toBe(false);
  });
});


