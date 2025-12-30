"use client";

import { useRef, useMemo, useState, useLayoutEffect } from "react";
import {
  AnchorProvider,
  ScrollProvider,
  TOCItem,
  useActiveAnchor,
  type TOCItemType,
} from "fumadocs-core/toc";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface TocProps {
  toc: TOCItemType[];
}

function TocItems({ toc }: TocProps) {
  const activeAnchor = useActiveAnchor();
  const containerRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [pathData, setPathData] = useState<{ full: string; active: string }>({
    full: "",
    active: "",
  });

  const activeIndex = useMemo(() => {
    const id = activeAnchor;
    if (!id) return 0;
    const idx = toc.findIndex((item) => item.url === `#${id}`);
    return idx >= 0 ? idx : 0;
  }, [activeAnchor, toc]);

  useLayoutEffect(() => {
    if (!containerRef.current || itemRefs.current.length === 0) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const points: { x: number; y: number; depth: number }[] = [];

    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const rect = item.getBoundingClientRect();
      const depth = toc[index].depth - 2;
      // Center of the dot
      const x = depth * 12 + 7;
      const y = rect.top - containerRect.top + rect.height / 2;
      points.push({ x, y, depth });
    });

    if (points.length === 0) return;

    const generatePath = (pts: { x: number; y: number; depth: number }[]) => {
      if (pts.length === 0) return "";
      if (pts.length === 1) return "";

      let d = `M ${pts[0].x} ${pts[0].y}`;

      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];

        if (curr.x !== prev.x) {
          // Depth change - draw curved connector
          const midY = (prev.y + curr.y) / 2;
          const radius = Math.min(8, Math.abs(curr.y - prev.y) / 4);

          if (curr.x > prev.x) {
            // Going deeper (indent right)
            d += ` L ${prev.x} ${midY - radius}`;
            d += ` Q ${prev.x} ${midY} ${prev.x + radius} ${midY}`;
            d += ` L ${curr.x - radius} ${midY}`;
            d += ` Q ${curr.x} ${midY} ${curr.x} ${midY + radius}`;
            d += ` L ${curr.x} ${curr.y}`;
          } else {
            // Coming back (indent left)
            d += ` L ${prev.x} ${midY - radius}`;
            d += ` Q ${prev.x} ${midY} ${prev.x - radius} ${midY}`;
            d += ` L ${curr.x + radius} ${midY}`;
            d += ` Q ${curr.x} ${midY} ${curr.x} ${midY + radius}`;
            d += ` L ${curr.x} ${curr.y}`;
          }
        } else {
          // Same depth - straight line
          d += ` L ${curr.x} ${curr.y}`;
        }
      }

      return d;
    };

    const fullPath = generatePath(points);
    const activePath = generatePath(points.slice(0, activeIndex + 1));

    setPathData({ full: fullPath, active: activePath });
  }, [toc, activeIndex]);

  return (
    <div className="relative">
      {/* TOC items */}
      <ul ref={containerRef} className="relative flex flex-col text-sm">
        <motion.span
          className="absolute size-3 rounded-full bg-blue"
          animate={{
            left: 2 + (toc[activeIndex]?.depth - 2) * 12,
            top: itemRefs.current[activeIndex]
              ? itemRefs.current[activeIndex]!.offsetTop +
                itemRefs.current[activeIndex]!.offsetHeight / 2
              : 0,
            y: "-50%",
          }}
        />

        {toc.map((item, index) => {
          const isActive = index === activeIndex;
          const isPassed = index < activeIndex;
          const depth = item.depth - 2;
          const isFirst = index === 0;
          const isLast = index === toc.length - 1;
          const showDot = isFirst || isLast;

          return (
            <li
              key={item.url}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="relative"
              style={{
                paddingLeft: `${depth * 12 + 24}px`,
              }}
            >
              <TOCItem
                href={item.url}
                className={cn(
                  "block py-1.5 transition-colors duration-200",
                  isActive
                    ? "text-blue font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.title}
              </TOCItem>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Toc({ toc }: TocProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (toc.length === 0) return null;

  return (
    <AnchorProvider toc={toc}>
      <ScrollProvider containerRef={containerRef}>
        <nav
          ref={containerRef}
          className="sticky top-32 hidden xl:block max-h-[calc(100vh-10rem)] overflow-auto"
        >
          <TocItems toc={toc} />
        </nav>
      </ScrollProvider>
    </AnchorProvider>
  );
}
