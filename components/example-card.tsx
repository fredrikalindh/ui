"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/registry/ui/copy-button";

export function ExampleCard({
  children,
  className,
  filename = "example.txt",
  copyValue,
}: {
  children: React.ReactNode;
  className?: string;
  filename?: string;
  copyValue: string;
}) {
  return (
    <div
      className={cn(
        "group relative p-8 rounded-2xl border my-8 bg-card",
        className
      )}
    >
      {children}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background p-1 rounded-lg">
        <CopyButton
          value={copyValue}
          className="size-8 opacity-70 hover:opacity-100"
        />
      </div>
    </div>
  );
}
