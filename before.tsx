import React, { useLayoutEffect, useRef, useState } from "react";
import { Fade } from "./blur-fade/blur-fade";
import { cn } from "@workspace/ui/lib/utils";
import { Check, Copy } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

const Root = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      {...props}
      className={cn(
        "relative text-[13p] rounded-xl overflow-hidden border bg-code",
        className
      )}
    />
  );
};
