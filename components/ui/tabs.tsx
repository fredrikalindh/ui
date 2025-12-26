"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [clip, setClip] = React.useState({
    left: 3,
    top: 3.5,
    width: 32.734375,
    height: 29,
  });

  React.useLayoutEffect(() => {
    const updateClip = () => {
      const container = containerRef.current;
      console.log({ container });

      if (!container) return;

      const activeTab = container.querySelector(
        '[data-state="active"]:not([aria-hidden="true"])'
      ) as HTMLElement;
      if (!activeTab) return;

      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      setClip({
        left: tabRect.left - containerRect.left,
        top: tabRect.top - containerRect.top,
        width: tabRect.width,
        height: tabRect.height,
      });
    };

    updateClip();

    const observer = new MutationObserver(updateClip);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        attributes: true,
        subtree: true,
        attributeFilter: ["data-state"],
      });
    }

    window.addEventListener("resize", updateClip);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateClip);
    };
  }, []);

  const hasClip = clip.width > 0;

  const baseLayoutClasses =
    "inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]";

  return (
    <TabsPrimitive.List
      ref={containerRef}
      data-slot="tabs-list"
      className={cn(
        "relative bg-muted text-muted-foreground",
        baseLayoutClasses,
        className
      )}
      {...props}
    >
      {/* Clipped overlay - active state styling */}
      <div
        className={cn(
          "absolute inset-0 bg-background text-foreground pointer-events-none",
          baseLayoutClasses,
          className,
          hasClip && "transition-[clip-path] duration-200 ease-out"
        )}
        style={
          hasClip
            ? {
                clipPath: `inset(${clip.top}px calc(100% - ${
                  clip.left + clip.width
                }px) calc(100% - ${clip.top + clip.height}px) ${
                  clip.left
                }px round 6px)`,
              }
            : { clipPath: "inset(0 100% 0 0)" }
        }
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(
              child as React.ReactElement<Record<string, unknown>>,
              {
                tabIndex: -1,
                "aria-hidden": true,
              }
            );
          }
          return child;
        })}
      </div>
      {/* Base triggers (interactive) */}
      {children}
    </TabsPrimitive.List>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
