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
  // TODO: fix so length match in hunk headers
  it("converts Myers algorithm diff output to word diff format", () => {
    const result = toWordDiff(EXAMPLE_DIFF);
    expect(result.trim()).toEqual(DIFF_WORD_EXAMPLE.trim());
  });
});
