"use client";

import { ExperimentCard } from "@/components/experiment-card";
import { MasonryGrid } from "@/components/masonry-grid";
import { parseAsString, useQueryState } from "nuqs";
import { VideoMeta } from "@/registry/ui/video";
import { LayoutGroup } from "motion/react";

interface Page {
  title: string;
  description?: string;
  url: string;
  image?: string;
  date?: string;
  tags: string[];
  theme?: "light" | "dark";
  buttonLabel?: string;
  videoMeta?: VideoMeta;
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
      <LayoutGroup>
        <MasonryGrid>
          {pages.map((page) => (
            <ExperimentCard
              key={page.url}
              layoutId={page.url}
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
                      videoMeta: page.videoMeta,
                    }
                  : undefined
              }
              url={page.url}
              theme={page.theme ?? "dark"}
              textPosition="top"
              buttonLabel={page.buttonLabel ?? undefined}
              className={isVisible(page) ? "" : "hidden"}
            />
          ))}
        </MasonryGrid>
      </LayoutGroup>
    </main>
  );
}
