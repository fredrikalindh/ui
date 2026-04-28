/** Display date like "Jan 24, 2024" for ISO calendar dates (YYYY-MM-DD) without UTC shift. */
export function formatCardDate(value: string): string {
  const trimmed = value.trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const date = ymd
    ? new Date(
        Number(ymd[1]),
        Number(ymd[2]) - 1,
        Number(ymd[3])
      )
    : new Date(trimmed);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
