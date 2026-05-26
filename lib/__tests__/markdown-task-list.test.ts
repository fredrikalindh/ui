import { describe, expect, it } from "vitest";

import {
  findMarkdownTaskItems,
  setMarkdownTaskItemChecked,
  toggleMarkdownTaskItemAtLine,
} from "../markdown-task-list";

describe("markdown-task-list", () => {
  it("finds task items with line indices", () => {
    const markdown = [
      "# Title",
      "",
      "- [ ] First",
      "- [x] Second",
      "  - [X] Nested",
    ].join("\n");

    expect(findMarkdownTaskItems(markdown)).toEqual([
      { lineIndex: 2, checked: false },
      { lineIndex: 3, checked: true },
      { lineIndex: 4, checked: true },
    ]);
  });

  it("toggles unchecked to checked", () => {
    const markdown = "- [ ] Do the thing";
    expect(toggleMarkdownTaskItemAtLine(markdown, 0)).toBe("- [x] Do the thing");
  });

  it("toggles checked to unchecked", () => {
    const markdown = "- [x] Done";
    expect(toggleMarkdownTaskItemAtLine(markdown, 0)).toBe("- [ ] Done");
  });

  it("sets checked state explicitly", () => {
    const markdown = "- [ ] Item";
    expect(setMarkdownTaskItemChecked(markdown, 0, true)).toBe("- [x] Item");
    expect(setMarkdownTaskItemChecked("- [x] Item", 0, false)).toBe(
      "- [ ] Item"
    );
  });

  it("leaves non-task lines unchanged", () => {
    const markdown = "- regular bullet";
    expect(toggleMarkdownTaskItemAtLine(markdown, 0)).toBe(markdown);
  });
});
