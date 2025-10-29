"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type PreviewItem = {
  id: string;
  src?: string;
  label?: string;
  description?: string;
};

type DocsPreviewContextValue = {
  setActivePreviewId: React.Dispatch<React.SetStateAction<string | null>>;
  activePreviewId: string | null;
  activePreview: PreviewItem | null;
  renderPreview: (preview: PreviewItem) => React.ReactNode;
};

const DocsPreviewContext = React.createContext<DocsPreviewContextValue | null>(
  null
);

function getPreviewFromElement(element: Element): PreviewItem {
  return {
    id: element.id,
    src: element.getAttribute("data-preview-src") ?? undefined,
    label: element.getAttribute("data-preview-label") ?? undefined,
    description: element.getAttribute("data-preview-description") ?? undefined,
  };
}

export function DocsPreviewProvider({
  children,
  renderPreview,
}: {
  children: React.ReactNode;
  renderPreview: (preview: PreviewItem) => React.ReactNode;
}) {
  const [activePreviewId, setActivePreviewId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries.filter(
          (entry) => entry.isIntersecting
        );

        if (intersectingEntries.length === 0) return;

        intersectingEntries.sort((a, b) => {
          return (
            a.target.getBoundingClientRect().top -
            b.target.getBoundingClientRect().top
          );
        });

        const activeEntry =
          intersectingEntries.find((entry) => {
            const rect = entry.target.getBoundingClientRect();
            return rect.top <= window.innerHeight * 0.4;
          }) || intersectingEntries[0];

        setActivePreviewId(activeEntry.target.id);
      },
      { rootMargin: "-30% 0% -50% 0%", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    const elements = document.querySelectorAll("[data-docs-preview-section]");
    elements.forEach((element) => observer.observe(element));

    setActivePreviewId(elements[0]?.id ?? null);

    return () => {
      observer.disconnect();
    };
  }, []);

  const activePreview = React.useMemo(() => {
    if (!activePreviewId) return null;

    const element = document.getElementById(activePreviewId);
    return element ? getPreviewFromElement(element) : null;
  }, [activePreviewId]);

  const value = React.useMemo<DocsPreviewContextValue>(
    () => ({
      setActivePreviewId,
      activePreviewId,
      activePreview,
      renderPreview,
    }),
    [activePreviewId, activePreview, renderPreview]
  );

  return (
    <DocsPreviewContext.Provider value={value}>
      {children}
    </DocsPreviewContext.Provider>
  );
}

export function useDocsPreview() {
  const context = React.useContext(DocsPreviewContext);
  if (!context) {
    throw new Error(
      "useDocsPreview must be used within a DocsPreviewProvider component."
    );
  }
  return context;
}

type PreviewSectionProps = {
  id: string;
  src?: string;
  label?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export function PreviewSection({
  id,
  src,
  label,
  description,
  className,
  children,
}: PreviewSectionProps) {
  const { setActivePreviewId, activePreviewId, renderPreview } =
    useDocsPreview();
  const ref = React.useRef<HTMLDivElement | null>(null);

  const isActive = activePreviewId === id;
  const handleClick = React.useCallback(() => {
    setActivePreviewId(id);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [id, setActivePreviewId]);

  return (
    <section
      ref={ref}
      id={id}
      data-docs-preview-section={id}
      data-preview-src={src}
      data-preview-label={label}
      data-preview-description={description}
      data-active={isActive ? "true" : undefined}
      className={cn(
        "relative flex flex-col gap-4 rounded-xl transition-colors bd-muted [&_p]:opacity-50 data-[active=true]:[&_p]:opacity-100 mb-[6rem] [&_p]:transition-opacity [&_p]:duration-200 cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {children}
      <div className="mt-4 overflow-hidden rounded-2xl lg:hidden">
        {renderPreview({
          id,
          src,
          label,
          description,
        })}
      </div>
    </section>
  );
}

export function DocsPreviewPane({
  className,
  fallback,
}: {
  className?: string;
  fallback?: React.ReactNode;
}) {
  const { activePreview, renderPreview } = useDocsPreview();

  if (!activePreview) {
    return fallback ? (
      <aside className={cn("hidden lg:block", className)}>{fallback}</aside>
    ) : null;
  }

  return (
    <aside
      className={cn(
        "hidden sticky top-0 lg:h-svh py-4 pr-4 flex-1 w-full rounded-2xl h-full max-h-svh overflow-hidden lg:flex flex-col z-20",
        className
      )}
    >
      <div className="relative h-full w-full bg-muted overflow-hidden rounded-2xl flex-1 min-h-0">
        <div className="absolute inset-0">{renderPreview(activePreview)}</div>
      </div>
    </aside>
  );
}
