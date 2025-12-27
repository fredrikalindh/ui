import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { source } from "@/lib/source";
import { PageContent } from "./page-content";
import { TagFilter } from "@/components/tag-filter";
import mediaMetadata from "@/public/media-metadata.json";
import { MediaMeta } from "@/registry/ui/video";

const socialLinks = [
  { label: "X", href: "https://x.com/fredrikalindh" },
  { label: "GitHub", href: "https://github.com/fredrikalindh" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/fredrika-l-a17439102/",
  },
];

// Helper to get media metadata from the generated JSON
function getMediaMeta(src: string): MediaMeta | undefined {
  return (mediaMetadata as Record<string, MediaMeta>)[src];
}

const externalProjects = [
  {
    title: "ASI",
    description: "",
    url: "https://asi.review/",
    image: "/asi.png",
    date: "2025-11-01",
    tags: ["Engineering"],
    theme: "light" as const,
    buttonLabel: "View production",
    mediaMeta: getMediaMeta("/asi.png"),
  },
  {
    title: "Canvas",
    description: "",
    url: "https://canvas.fredrika.dev/",
    image: "/folder.mp4",
    date: "2025-08-27",
    tags: ["Engineering"],
    theme: "light" as const,
    buttonLabel: "View production",
    mediaMeta: getMediaMeta("/folder.mp4"),
  },
  {
    title: "Anywhere AI",
    description: "",
    url: "https://apps.apple.com/us/app/anywhere-ai/id6749791800",
    image: "/anywhere.mp4",
    date: "2025-08-11",
    tags: ["Engineering"],
    theme: "dark" as const,
    buttonLabel: undefined,
    mediaMeta: getMediaMeta("/anywhere.mp4"),
  },
  {
    title: "Agape",
    description: "",
    url: "https://apps.apple.com/us/app/agape-vipassana/id6748521302",
    image: "/agape.png",
    date: "2025-07-21",
    tags: ["Engineering"],
    theme: "light" as const,
    buttonLabel: undefined,
    mediaMeta: getMediaMeta("/agape.png"),
  },
];

export default function Home() {
  const allPages = source.getPages().filter((page) => {
    // Filter out unpublished pages
    return page.data.published !== false;
  });

  const mdxPages = allPages.map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    image: page.data.image,
    date: page.data.date,
    tags: page.data.tags,
    theme: page.data.theme,
    buttonLabel: page.data.buttonLabel,
    mediaMeta: page.data.image ? getMediaMeta(page.data.image) : undefined,
  }));

  // Combine MDX pages with external projects
  const pages = [...mdxPages, ...externalProjects];

  return (
    <div className="mx-auto max-w-7xl flex flex-col min-h-svh px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:gap-8 mb-8 sm:mb-16">
        <div className="flex flex-col gap-3">
          <h1 className="font-medium">Fredrika</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg">
            Multidisciplinary background across engineering, design, and
            product. Here are some recent projects and writings.
          </p>
        </div>
        <nav className="flex flex-row sm:flex-col gap-4 sm:gap-1 text-left sm:text-right text-sm sm:mt-10 items-end">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      <Suspense fallback={<div className="h-12 mb-10" />}>
        <TagFilter />
      </Suspense>
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <PageContent pages={pages} />
      </Suspense>
      <ThemeToggle />
    </div>
  );
}
