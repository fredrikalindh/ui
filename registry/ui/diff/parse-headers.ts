export function extractStatsFromPatch(patch: string): {
    additions: number;
    deletions: number;
  } {
    const lines = patch.split("\n");
    let additions = 0;
    let deletions = 0;
  
    for (const line of lines) {
      if (
        line.startsWith("+++") ||
        line.startsWith("---") ||
        line.startsWith("@@")
      ) {
        continue;
      }
      if (line.startsWith("+")) {
        additions++;
      } else if (line.startsWith("-")) {
        deletions++;
      }
    }
  
    return { additions, deletions };
  }