import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/ui/card";

import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";

interface ExperimentCardProps {
  name: string;
  date: string;
  displayText?: string;
  textPosition?: "top" | "bottom";
  media?: {
    type: "image" | "video";
    src: string;
    alt?: string;
    aspectRatio?: string;
  };
  url?: string;
  buttonLabel?: string;
  className?: string;
  theme?: "dark" | "light";
}

const Media = ({ media }: { media: ExperimentCardProps["media"] }) => {
  if (!media) return null;

  const mediaStyle = media.aspectRatio
    ? { aspectRatio: media.aspectRatio }
    : { aspectRatio: "16/9" };

  if (media.type === "video") {
    return (
      <video
        src={media.src}
        className="w-full rounded-md object-cover overflow-hidden"
        style={mediaStyle}
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
      className="object-cover w-full rounded-md overflow-hidden"
      style={mediaStyle}
    />
  );
};

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  name,
  date,
  textPosition = "bottom",
  media,
  url,
  buttonLabel,
  className,
  theme = "light",
}) => {
  const cardContent = (
    <>
      <CardContent
        className={cn(
          "p-0 relative flex flex-1 box-border",
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
        className={cn(`block no-underline group/link w-full`, className)}
      >
        <Card className="flex flex-col cursor-pointer h-fit p-1 w-full">
          {cardContent}
        </Card>
      </a>
    );
  }

  return (
    <Card className={cn("min-h-fit p-0 flex flex-col w-full", className)}>
      {cardContent}
    </Card>
  );
};
