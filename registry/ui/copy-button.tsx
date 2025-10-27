"use client";

import React, { useState } from "react";

import { Check, Copy } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export const CopyButton = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!text) return;
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      data-state={copied ? "copied" : "not-copied"}
      className={cn("transition-opacity relative flex-shrink-0", className)}
      onClick={handleCopy}
    >
      <Check
        className={cn(
          "w-4 h-4 absolute inset-0 m-auto transition-all duration-200",
          copied ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-75"
        )}
        aria-label="Copied"
      />
      <Copy
        className={cn(
          "w-4 h-4 absolute inset-0 m-auto transition-all duration-200",
          !copied
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-sm scale-75"
        )}
        aria-label="Copy"
      />
    </Button>
  );
};
