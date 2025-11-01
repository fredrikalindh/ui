import React, {
  ComponentProps,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

/**
 * Shoutout to https://designengineer.lorenzodossi.com/slider for inspo
 */
export const Slider = ({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step,
  showSteps = true,
  label,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root> & {
  showSteps?: boolean;
  label: string;
}) => {
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [labelBounds, setLabelBounds] = useState({ left: 0, right: 0 });

  useLayoutEffect(() => {
    if (!labelRef.current || !valueRef.current || !containerRef.current) return;

    const updateBounds = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const labelWidth = labelRef.current?.offsetWidth || 0;
      const valueWidth = valueRef.current?.offsetWidth || 0;

      const paddingLeft = 24;

      const leftExclusionPercent =
        ((labelWidth + paddingLeft) / containerWidth) * 100;
      const rightExclusionPercent = (valueWidth / containerWidth) * 100;

      setLabelBounds({
        left: leftExclusionPercent,
        right: 100 - rightExclusionPercent,
      });
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [label, value]);

  let stepMarks: number[] = [];

  if (showSteps && step) {
    const marks: number[] = [];
    const range = max - min;
    const stepCount = Math.floor(range / step);

    if (stepCount <= 10) {
      for (let i = 1; i <= stepCount; i++) {
        const position = (i * step) / range;
        const positionPercent = position * 100;

        // Only add mark if it's not behind the label or value
        if (
          positionPercent > labelBounds.left &&
          positionPercent < labelBounds.right
        ) {
          marks.push(positionPercent);
        }
      }
    }
    stepMarks = marks;
  }

  const val = typeof value === "number" ? value : value?.[0] ?? 0;
  const percentage = max - min === 0 ? 0 : ((val - min) / (max - min)) * 100;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      ref={containerRef}
      className={cn(
        "relative flex h-12 w-full touch-none select-none items-center rounded-lg bg-card border transition-colors hover:bg-muted cursor-grab data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "group/slider active:cursor-grabbing overflow-hidden shrink-0",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-4 select-none">
        <span
          ref={labelRef}
          className="text-sm font-normal tracking-tight text-foreground/30 group-hover/slider:text-foreground group-data-disabled/slider:!text-foreground/30 transition-colors duration-150"
        >
          {label}
        </span>
        <span
          ref={valueRef}
          className="min-w-8 text-right text-sm font-medium tracking-tight text-foreground group-data-disabled/slider:opacity-50"
        >
          {typeof value === "number" ? value : value?.map((v) => v).join(", ")}
        </span>
      </div>

      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-muted h-full relative grow overflow-hidden rounded-lg data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        {stepMarks.map((position) => (
          <div
            key={position}
            className="absolute top-1/2 -translate-y-1/2 size-0.75 rounded-full bg-black/20 pointer-events-none transition-opacity duration-150 animate-in fade-in"
            style={{
              left: `calc(${position}% - 11px)`,
            }}
          />
        ))}
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-card absolute data-[orientation=horizontal]:h-full rounded-lg data-[orientation=vertical]:w-full transition-all duration-150 ease-out",
            "after:content-[''] after:absolute after:right-2 after:top-1/2 after:-translate-y-1/2 after:h-7 after:w-0.5 after:rounded-xl after:bg-muted-foreground/20",
            "after:transition-all after:duration-300 after:ease-out",
            "group-hover/slider:after:bg-muted-foreground/50 group-data-disabled/slider:after:bg-muted-foreground/50",
            {
              "after:opacity-10 after:h-6":
                percentage > labelBounds.right || percentage < labelBounds.left,
            }
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="opacity-0 w-4 h-8" aria-label={label} />
    </SliderPrimitive.Root>
  );
};
