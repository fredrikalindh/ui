const TASK_ITEM_LINE_RE = /^(\s*[-*+]\s+)\[([ xX])\](.*)$/;

export type MarkdownTaskItem = {
  lineIndex: number;
  checked: boolean;
};

export function findMarkdownTaskItems(markdown: string): MarkdownTaskItem[] {
  const lines = markdown.split("\n");
  const items: MarkdownTaskItem[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const match = lines[lineIndex].match(TASK_ITEM_LINE_RE);
    if (!match) {
      continue;
    }
    items.push({
      lineIndex,
      checked: match[2].toLowerCase() === "x",
    });
  }

  return items;
}

export function setMarkdownTaskItemChecked(
  markdown: string,
  lineIndex: number,
  checked: boolean
): string {
  const lines = markdown.split("\n");
  const line = lines[lineIndex];
  if (line === undefined) {
    return markdown;
  }

  const marker = checked ? "x" : " ";
  const updated = line.replace(
    /^(\s*[-*+]\s+)\[([ xX])\]/,
    `$1[${marker}]`
  );

  if (updated === line) {
    return markdown;
  }

  lines[lineIndex] = updated;
  return lines.join("\n");
}

export function toggleMarkdownTaskItemAtLine(
  markdown: string,
  lineIndex: number
): string {
  const lines = markdown.split("\n");
  const line = lines[lineIndex];
  if (line === undefined) {
    return markdown;
  }

  const match = line.match(TASK_ITEM_LINE_RE);
  if (!match) {
    return markdown;
  }

  const checked = match[2].toLowerCase() === "x";
  return setMarkdownTaskItemChecked(markdown, lineIndex, !checked);
}
