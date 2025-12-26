import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/ui/card";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import { VideoWithPlaceholder, VideoMeta } from "@/registry/ui/video";

interface ExperimentCardProps {
  name: string;
  date: string;
  displayText?: string;
  textPosition?: "top" | "bottom";
  media?: {
    type: "image" | "video";
    src: string;
    alt?: string;
    videoMeta?: VideoMeta;
  };
  url?: string;
  buttonLabel?: string;
  className?: string;
  theme?: "dark" | "light";
}

function Media({ media }: { media: ExperimentCardProps["media"] }) {
  if (!media) return null;

  if (media.type === "video") {
    // Use VideoWithPlaceholder if we have metadata
    if (media.videoMeta) {
      return (
        <VideoWithPlaceholder
          src={media.src}
          meta={media.videoMeta}
          className="w-full rounded-md overflow-hidden"
        />
      );
    }
    // Fallback for videos without metadata
    return (
      <video
        src={media.src}
        className="w-full h-auto rounded-md object-cover overflow-hidden"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <img
      src={media.src}
      alt={media.alt ?? ""}
      className="w-full h-auto rounded-md overflow-hidden object-cover"
    />
  );
}

export function ExperimentCard({
  name,
  date,
  textPosition = "bottom",
  media,
  url,
  buttonLabel,
  className,
  theme = "light",
}: ExperimentCardProps) {
  const cardContent = (
    <>
      <CardContent
        className={cn(
          "p-0 relative flex flex-col box-border min-w-full",
          theme === "dark" ? "dark" : "light"
        )}
      >
        <CardHeader
          className={cn(
            "flex justify-between items-center absolute w-full h-8 px-4 z-10 gap-0 text-nowrap",
            textPosition === "top" ? "top-2" : "bottom-2"
          )}
        >
          <CardTitle className="text-[13px] text-foreground font-normal">
            {name}
          </CardTitle>
          <p className="text-[13px] text-muted-foreground font-normal">
            {date}
          </p>
        </CardHeader>
        {media && <Media media={media} />}
      </CardContent>

      {buttonLabel && url && (
        <CardFooter className="w-full p-0">
          <Button
            variant="secondary"
            size="lg"
            className="w-full group-hover/link:bg-secondary/80 transition-colors pointer-events-none"
          >
            {buttonLabel}
          </Button>
        </CardFooter>
      )}
    </>
  );

  if (url) {
    return (
      <a
        href={url}
        className={cn("block no-underline group/link w-full", className)}
      >
        <Card className="flex flex-col cursor-pointer p-1 w-full h-auto">
          {cardContent}
        </Card>
      </a>
    );
  }

  return (
    <Card className={cn("p-0 flex flex-col w-full h-auto", className)}>
      {cardContent}
    </Card>
  );
}
