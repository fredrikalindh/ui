"use client";

import { ExperimentCard } from "@/components/experiment-card";
import { MasonryGrid } from "@/components/masonry-grid";
import { parseAsString, useQueryState } from "nuqs";
import { MediaMeta } from "@/registry/ui/video";

interface Page {
  title: string;
  description?: string;
  url: string;
  image?: string;
  date?: string;
  tags: string[];
  theme?: "light" | "dark";
  buttonLabel?: string;
  mediaMeta?: MediaMeta;
}

export function PageContent({ pages }: { pages: Page[] }) {
  const [activeTag, setActiveTag] = useQueryState(
    "tag",
    parseAsString.withDefault("")
  );

  const isVisible = (page: Page) =>
    activeTag === "All" || !activeTag || page.tags.includes(activeTag);

  return (
    <main className="w-full">
      <MasonryGrid>
        {pages.map((page, index) => (
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
                    meta: page.mediaMeta,
                  }
                : undefined
            }
            url={page.url}
            theme={page.theme ?? "dark"}
            textPosition="top"
            buttonLabel={page.buttonLabel ?? undefined}
            className={isVisible(page) ? "" : "hidden"}
            priority={index < 6}
          />
        ))}
      </MasonryGrid>
    </main>
  );
}
