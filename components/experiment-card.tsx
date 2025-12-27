import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/ui/card";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import { VideoWithPlaceholder, MediaMeta } from "@/registry/ui/video";
import { motion } from "motion/react";

interface ExperimentCardProps {
  name: string;
  date: string;
  displayText?: string;
  textPosition?: "top" | "bottom";
  media?: {
    type: "image" | "video";
    src: string;
    alt?: string;
    meta?: MediaMeta;
  };
  url?: string;
  buttonLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  theme?: "dark" | "light";
  layoutId?: string;
  /** Mark as priority/LCP image - disables lazy loading and sets fetchpriority="high" */
  priority?: boolean;
}

function Media({
  media,
  priority,
}: {
  media: ExperimentCardProps["media"];
  priority?: boolean;
}) {
  if (!media) return null;

  if (media.type === "video") {
    // Use VideoWithPlaceholder if we have metadata
    if (media.meta) {
      return (
        <VideoWithPlaceholder
          src={media.src}
          meta={media.meta}
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

  // Image with metadata - use aspect ratio to prevent layout shift
  if (media.meta) {
    return (
      <div
        className="w-full rounded-md overflow-hidden relative"
        style={{ aspectRatio: media.meta.aspectRatio }}
      >
        {/* Blurred placeholder */}
        {media.meta.placeholder && (
          <img
            aria-hidden
            src={media.meta.placeholder}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "blur(24px)",
              transform: "scale(1.15)",
            }}
          />
        )}
        <img
          src={media.src}
          alt={media.alt ?? ""}
          width={media.meta.width}
          height={media.meta.height}
          className="absolute inset-0 w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
        />
      </div>
    );
  }

  // Fallback for images without metadata
  return (
    <img
      src={media.src}
      alt={media.alt ?? ""}
      className="w-full h-auto rounded-md overflow-hidden object-cover"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}

const MotionCard = motion.create(Card);

export function ExperimentCard({
  name,
  date,
  textPosition = "bottom",
  media,
  url,
  buttonLabel,
  className,
  style,
  theme = "light",
  layoutId,
  priority,
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
        {media && <Media media={media} priority={priority} />}
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
      <motion.a
        href={url}
        className={cn(
          "block no-underline group/link w-full break-inside-avoid",
          className
        )}
        style={style}
        layoutId={layoutId}
      >
        <Card
          className={cn(
            "flex flex-col cursor-pointer w-full h-auto",
            buttonLabel ? "p-1" : "p-0"
          )}
        >
          {cardContent}
        </Card>
      </motion.a>
    );
  }

  return (
    <MotionCard
      className={cn(
        "p-0 flex flex-col w-full h-auto break-inside-avoid",
        className
      )}
      style={style}
      layoutId={layoutId}
    >
      {cardContent}
    </MotionCard>
  );
}
