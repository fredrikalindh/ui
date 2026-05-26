/** Matches GFM task list items: `- [ ]`, `- [x]`, `* [X]`, etc. */
const TASK_LIST_ITEM_RE = /^(\s*[-+*]\s+)\[([ xX])\](.*)$/;

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/** Split optional YAML frontmatter from markdown body (e.g. agentdoc files). */
export function splitMarkdownFrontmatter(source: string): {
  frontmatter: string | null;
  body: string;
} {
  if (!source.startsWith("---")) {
    return { frontmatter: null, body: source };
  }

  const match = source.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: null, body: source };
  }

  return {
    frontmatter: match[0].trimEnd(),
    body: source.slice(match[0].length),
  };
}

export function isMarkdownTaskListLine(line: string): boolean {
  return TASK_LIST_ITEM_RE.test(line);
}

/**
 * Toggle `- [ ]` / `- [x]` on a specific line (0-based). Returns the original
 * string when the line is not a task list item.
 */
export function toggleMarkdownTaskAtLine(
  source: string,
  lineIndex: number,
  checked: boolean
): string {
  const lines = source.split("\n");
  if (lineIndex < 0 || lineIndex >= lines.length) {
    return source;
  }

  const line = lines[lineIndex];
  const match = line.match(TASK_LIST_ITEM_RE);
  if (!match) {
    return source;
  }

  const marker = checked ? "x" : " ";
  lines[lineIndex] = `${match[1]}[${marker}]${match[3]}`;
  return lines.join("\n");
}

/** Line index of the Nth task list item in `source` (0-based occurrence). */
export function findTaskLineIndexByOccurrence(
  source: string,
  occurrenceIndex: number
): number {
  const lines = source.split("\n");
  let seen = 0;

  for (let i = 0; i < lines.length; i++) {
    if (!isMarkdownTaskListLine(lines[i])) {
      continue;
    }
    if (seen === occurrenceIndex) {
      return i;
    }
    seen++;
  }

  return -1;
}
