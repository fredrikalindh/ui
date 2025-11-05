export const DIFF_WORD = `diff --git a/./before.tsx b/./after.tsx
index f73b4e9..66e0cfe 100644
--- a/./before.tsx
+++ b/./after.tsx
@@ -1,17 +1,25 @@
import React, { useLayoutEffect, useRef, useState } from "react";
import { Fade } from "./blur-fade/blur-fade";
import { cn } from "@workspace/ui/lib/utils";
import { Check, [-Copy-]{+Copy, ChevronDown+} } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
{+import * as Collapsible from "@radix-ui/react-collapsible";+}

const Root = ({
  className,
  {+children,+}
  ...props
}: React.ComponentProps<"div">) => {
  return (
    {+<Collapsible.Root {...props}>+}
      <div[-{...props}-]
        className={cn(
          "relative [-text-[13p]-]{+text-[13px]+} rounded-xl overflow-hidden border [-bg-code",-]{+bg-code min-h-16",+}
          className
        )}
      [-/>-]{+>+}
{+        {children}+}
{+      </div>+}
{+    </Collapsible.Root>+}
  );
};
`;
