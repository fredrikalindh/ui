"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface MasonryGridProps {
  children: ReactNode[];
  gap?: number;
  columnBreakpoints?: {
    default: number;
    [breakpoint: number]: number;
  };
}

export function MasonryGrid({
  children,
  gap = 8,
  columnBreakpoints = { default: 3, 1024: 2, 640: 1 },
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(columnBreakpoints.default);

  // Determine column count based on container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateColumns = () => {
      const width = container.offsetWidth;
      const breakpoints = Object.keys(columnBreakpoints)
        .filter((key) => key !== "default")
        .map(Number)
        .sort((a, b) => b - a);

      for (const bp of breakpoints) {
        if (width < bp) {
          setColumnCount(columnBreakpoints[bp]);
          return;
        }
      }
      setColumnCount(columnBreakpoints.default);
    };

    updateColumns();
    const resizeObserver = new ResizeObserver(updateColumns);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [columnBreakpoints]);

  // Distribute children across columns in order (round-robin for equal distribution)
  const columns: ReactNode[][] = Array.from({ length: columnCount }, () => []);
  children.forEach((child, index) => {
    columns[index % columnCount].push(child);
  });

  return (
    <div ref={containerRef} className="flex w-full" style={{ gap: `${gap}px` }}>
      {columns.map((columnItems, colIndex) => (
        <div
          key={colIndex}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {columnItems}
        </div>
      ))}
    </div>
  );
}
