const diffHeaderRegex = /diff --git a\/(.*) b\/(.*)/;

export function parseDiffHeader(patch: string): {
    additions: number;
    deletions: number;
    file: string;
    renamed: boolean;
  } {
    const lines = patch.split("\n");

    const diffHeaderMatch = patch.match(diffHeaderRegex);
    if (!diffHeaderMatch) {
        throw new Error("Invalid diff header");
    }
    const [, oldFile, newFile] = diffHeaderMatch;

    const renamed = oldFile !== newFile;

    let additions = 0;
    let deletions = 0;
    for (const line of lines) {
      if (line.startsWith("+++ ") || line.startsWith("--- ")) continue;
      if (line.startsWith("+")) {
        additions++;
      } else if (line.startsWith("-")) {
        deletions++;
      }
    }

    return { additions, deletions, file: newFile, renamed };
  }