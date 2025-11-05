import { describe, expect, it } from "vitest";

import { DIFF_MYERS } from "../../../../diff.ts";
import { DIFF_WORD } from "../../../../diff-word.ts";
import { toWordDiff } from "../utils/to-word-diff";

describe("toWordDiff", () => {
  it("converts Myers algorithm diff output to word diff format", () => {
    const result = toWordDiff(DIFF_MYERS);
    expect(result.trim()).toEqual(DIFF_WORD.trim());
  });
});
