"use client";

import { ReactNode, useMemo } from "react";

import { cn } from "@/lib/utils";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface ResponsiveGridProps {
  children: ReactNode[] | ReactNode;
  className?: string;
  columns?: number; // optional override for number of columns
}

export function ResponsiveGrid({
  children,
  className,
  columns: overrideColumns,
}: ResponsiveGridProps) {
  const breakpoint = useBreakpoint();

  const columns = useMemo(() => {
    const childrenArray = Array.isArray(children) ? children : [children];

    const getColumnCount = () => {
      if (typeof overrideColumns === "number" && overrideColumns > 0) {
        return overrideColumns;
      }
      switch (breakpoint) {
        case "mobile":
          return 1;
        case "tablet":
          return 2;
        case "desktop":
          return 3;
        default:
          return 0;
      }
    };

    const numColumns = getColumnCount();

    if (numColumns === 0) {
      return [];
    }

    const cols: ReactNode[][] = Array.from({ length: numColumns }, () => []);

    // Distribute children across columns for masonry effect
    childrenArray.forEach((child, index) => {
      const columnIndex = index % numColumns;
      cols[columnIndex].push(child);
    });

    return cols;
  }, [children, breakpoint, overrideColumns]);

  if (
    !breakpoint &&
    !(typeof overrideColumns === "number" && overrideColumns > 0)
  ) {
    return <></>;
  }

  return (
    <div className={cn("w-full flex -ml-2 pl-1 pr-2", className)}>
      {columns.map((columnChildren, columnIndex) => (
        <div
          key={columnIndex}
          className="pl-2 bg-clip-padding space-y-2 w-full"
        >
          {columnChildren.map((child, childIndex) => (
            <div
              key={`${
                breakpoint ?? overrideColumns ?? "grid"
              }-${columnIndex}-${childIndex}`}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {child}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
