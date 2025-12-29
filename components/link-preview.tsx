"use client";

import * as React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { OGMetadata } from "@/lib/og-metadata";

type LinkPreviewProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  metadata?: OGMetadata | null;
};

export function LinkPreview({
  href,
  children,
  className,
  metadata,
}: LinkPreviewProps) {
  const [imageError, setImageError] = React.useState(false);
  const [faviconError, setFaviconError] = React.useState(false);

  // If no metadata, just render a regular link
  if (!metadata) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={cn("font-medium underline underline-offset-4", className)}
      >
        {children}
      </a>
    );
  }

  const domain = (() => {
    try {
      return new URL(href).hostname.replace("www.", "");
    } catch {
      return href;
    }
  })();

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("font-medium underline underline-offset-4", className)}
        >
          {children}
        </a>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-[320px] p-0 overflow-hidden"
        side="top"
        sideOffset={8}
      >
        {/* OG Image */}
        {metadata.image && !imageError && (
          <div className="relative w-full h-40 bg-muted overflow-hidden">
            <Image
              src={metadata.image}
              alt={metadata.title || "Link preview"}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        )}

        {/* Content */}
        <div className="p-3 space-y-1.5">
          {/* Site info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {metadata.favicon && !faviconError && (
              <Image
                src={metadata.favicon}
                alt=""
                width={14}
                height={14}
                className="rounded-sm"
                onError={() => setFaviconError(true)}
                unoptimized
              />
            )}
            <span className="truncate">{metadata.siteName || domain}</span>
            <ExternalLink className="size-3 ml-auto shrink-0 opacity-50" />
          </div>

          {/* Title */}
          {metadata.title && (
            <h4 className="font-medium text-sm leading-snug line-clamp-2">
              {metadata.title}
            </h4>
          )}

          {/* Description */}
          {metadata.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {metadata.description}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
