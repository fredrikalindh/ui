import React, { useLayoutEffect, useRef, useState } from "react";
import { Fade } from "./blur-fade/blur-fade";
import { cn } from "@workspace/ui/lib/utils";
import { Check, Copy, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import * as Collapsible from "@radix-ui/react-collapsible";

const Root = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <Collapsible.Root {...props}>
      <div
        className={cn(
          "relative text-[13px] rounded-xl overflow-hidden border bg-code min-h-16",
          className
        )}
      >
        {children}
      </div>
    </Collapsible.Root>
  );
};
