import { describe, expect, it } from "vitest";

import { DIFF_MYERS } from "./diff";
import { DIFF_WORD } from "./diff-word";
import { toWordDiff } from "../utils/to-word-diff";
import { EXAMPLE_DIFF } from "../../../../registry/blocks/diff-viewer/data";
import { DIFF_WORD_EXAMPLE } from "./diff-word-example";

describe("toWordDiff", () => {
  it("converts Myers algorithm diff output to word diff format", () => {
    const result = toWordDiff(DIFF_MYERS);
    expect(result.trim()).toEqual(DIFF_WORD.trim());
  });
  it("converts Myers algorithm diff output to word diff format", () => {
    const result = toWordDiff(EXAMPLE_DIFF);
    expect(result.trim()).toEqual(DIFF_WORD_EXAMPLE.trim());
  });

  it("marks empty added lines as inserted lines 1", () => {
    const diffWithEmptyInsert = `diff --git a/file.txt b/file.txt
index 1111111..2222222 100644
--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,3 @@
 line before
+
 line after
`;

    const result = toWordDiff(diffWithEmptyInsert);

    const expected = `diff --git a/file.txt b/file.txt
index 1111111..2222222 100644
--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,3 @@
line before
{++}
line after
`;

    expect(result).toEqual(expected);
  });

  it("marks empty added lines as inserted lines", () => {
    const diffWithEmptyInsert = `diff --git a/file.txt b/file.txt
index 1111111..2222222 100644
--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,3 @@
+<Preview>
+
+So we can use the same change ratio to split merged lines into separate insertions and deletions.
`;

    const result = toWordDiff(diffWithEmptyInsert);

    const expected = `diff --git a/file.txt b/file.txt
index 1111111..2222222 100644
--- a/file.txt
+++ b/file.txt
@@ -1,0 +1,3 @@
{+<Preview>+}
{++}
{+So we can use the same change ratio to split merged lines into separate insertions and deletions.+}
`;

    expect(result).toEqual(expected);
  });
});
