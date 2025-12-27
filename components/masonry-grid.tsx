"use client";

import {
  ReactNode,
  Children,
  isValidElement,
  cloneElement,
  ReactElement,
} from "react";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface MasonryGridProps {
  children: ReactNode;
  gap?: number;
  className?: string;
}

// Reorder children so CSS columns (top-to-bottom) displays them in left-to-right order
function reorderForColumns<T>(items: T[], columnCount: number): T[] {
  if (columnCount <= 1) return items;

  const itemsPerColumn = Math.ceil(items.length / columnCount);
  const reordered: T[] = new Array(items.length);

  items.forEach((item, originalIndex) => {
    const targetColumn = originalIndex % columnCount;
    const targetRow = Math.floor(originalIndex / columnCount);
    const newIndex = targetColumn * itemsPerColumn + targetRow;
    reordered[newIndex] = item;
  });

  return reordered.filter((item) => item !== undefined);
}

export function MasonryGrid({
  children,
  gap = 8,
  className,
}: MasonryGridProps) {
  const breakpoint = useBreakpoint();

  // Map breakpoints to column counts (matches Tailwind classes below)
  const columnCount = breakpoint === "sm" ? 1 : breakpoint === "md" ? 2 : 3;

  const childArray = Children.toArray(children);
  const reorderedChildren = reorderForColumns(childArray, columnCount);

  return (
    <div
      className={`columns-1 sm:columns-2 lg:columns-3 ${className ?? ""}`}
      style={{ gap: `${gap}px` }}
    >
      {reorderedChildren.map((child) => {
        if (isValidElement(child)) {
          const props = child.props as Record<string, unknown>;
          return cloneElement(child as ReactElement<Record<string, unknown>>, {
            className: `${props.className ?? ""} break-inside-avoid`,
            style: {
              ...(props.style as React.CSSProperties),
              marginBottom: `${gap}px`,
            },
          });
        }
        return child;
      })}
    </div>
  );
}
