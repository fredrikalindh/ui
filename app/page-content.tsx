"use client";

import { ExperimentCard } from "@/components/experiment-card";
import { MasonryGrid } from "@/components/masonry-grid";
import { parseAsString, useQueryState } from "nuqs";

interface Page {
  title: string;
  description?: string;
  url: string;
  image?: string;
  date?: string;
  tags: string[];
  theme?: "light" | "dark";
  buttonLabel?: string;
}

export function PageContent({ pages }: { pages: Page[] }) {
  const [activeTag, setActiveTag] = useQueryState(
    "tag",
    parseAsString.withDefault("")
  );

  const filteredPages = pages.filter(
    (page) => activeTag === "All" || !activeTag || page.tags.includes(activeTag)
  );

  return (
    <main className="w-full">
      <MasonryGrid gap={8} columnBreakpoints={{ default: 3, 1024: 2, 640: 1 }}>
        {filteredPages.map((page) => (
          <ExperimentCard
            key={page.url}
            name={page.title}
            date={page.date ?? ""}
            media={
              page.image
                ? {
                    type: page.image.match(/\.(mp4|webm|ogg|mov)$/i)
                      ? "video"
                      : "image",
                    src: page.image,
                    alt: page.title,
                  }
                : undefined
            }
            url={page.url}
            theme={page.theme ?? "dark"}
            textPosition="top"
            buttonLabel={page.buttonLabel ?? undefined}
          />
        ))}
      </MasonryGrid>
    </main>
  );
}
