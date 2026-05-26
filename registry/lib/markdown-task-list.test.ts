import { describe, expect, it } from "vitest";

import {
  findTaskLineIndexByOccurrence,
  splitMarkdownFrontmatter,
  toggleMarkdownTaskAtLine,
} from "../../lib/markdown-task-list";

describe("toggleMarkdownTaskAtLine", () => {
  it("checks an unchecked task", () => {
    const source = "- [ ] Buy milk\n- [ ] Walk dog\n";
    expect(toggleMarkdownTaskAtLine(source, 0, true)).toBe(
      "- [x] Buy milk\n- [ ] Walk dog\n"
    );
  });

  it("unchecks a checked task", () => {
    const source = "- [x] Done item\n";
    expect(toggleMarkdownTaskAtLine(source, 0, false)).toBe("- [ ] Done item\n");
  });

  it("preserves leading whitespace and bullet style", () => {
    const source = "  * [X] Nested\n";
    expect(toggleMarkdownTaskAtLine(source, 0, false)).toBe("  * [ ] Nested\n");
  });

  it("leaves non-task lines unchanged", () => {
    const source = "- regular bullet\n";
    expect(toggleMarkdownTaskAtLine(source, 0, true)).toBe(source);
  });
});

describe("splitMarkdownFrontmatter", () => {
  it("splits yaml frontmatter from body", () => {
    const source = "---\ntitle: Todo\n---\n\n- [ ] item\n";
    const { frontmatter, body } = splitMarkdownFrontmatter(source);
    expect(frontmatter).toBe("---\ntitle: Todo\n---");
    expect(body).toBe("\n- [ ] item\n");
  });
});

describe("findTaskLineIndexByOccurrence", () => {
  it("maps occurrence index to line index", () => {
    const source = "intro\n- [ ] first\n- [ ] second\n";
    expect(findTaskLineIndexByOccurrence(source, 0)).toBe(1);
    expect(findTaskLineIndexByOccurrence(source, 1)).toBe(2);
    expect(findTaskLineIndexByOccurrence(source, 2)).toBe(-1);
  });
});
