import React, { useLayoutEffect, useRef, useState } from "react";
import { Fade } from "./blur-fade/blur-fade";
import { cn } from "@workspace/ui/lib/utils";
import { Check, Copy } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useTheme } from "next-themes";
const Root = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      {...props}
      className={cn(
        "relative text-[13p] rounded-xl overflow-hidden border bg-code",
        className
      )}
    >
    </div>
  );
};

const Header: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    {...props}
    className={cn(
      "absolute top-3 inset-x-4 z-20",
      "flex items-center gap-2 justify-between",
      className
    )}
  />
);

