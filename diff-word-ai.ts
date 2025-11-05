export const DIFF_WORD_AI = `diff --git a/apps/web/components/overflow-card.tsx b/apps/web/components/overflow-card.tsx
index fa4d9c4..8d980f1 100644
--- a/apps/web/components/overflow-card.tsx
+++ b/apps/web/components/overflow-card.tsx
@@ -1,36 +1,52 @@
 import React, { useLayoutEffect, useRef, useState } from "react";
 import { Fade } from "./blur-fade/blur-fade";
 import { cn } from "@workspace/ui/lib/utils";
 import { Check, [-Copy-]{+Copy, ChevronDown+} } from "lucide-react";
 import { Button } from "@workspace/ui/components/button";
[-import { useTheme } from "next-themes";-]
{+import * as Collapsible from "@radix-ui/react-collapsible";+}
 const Root = ({
   className,
   {+children,+}
{+  defaultOpen = true,+}
   ...props
 }: [-React.ComponentProps<"div">)-]{+React.ComponentProps<"div"> & {+}
{+  defaultOpen?: boolean;+}
{+})+} => {
   return (
     {+<Collapsible.Root defaultOpen={defaultOpen}>+}
       <div
         {...props}
         className={cn(
           "relative [-text-[13p]-]{+text-[13px]+} rounded-xl overflow-hidden border [-bg-code",-]{+bg-code min-h-16",+}
           className
         )}
       >
         {+{children}+}
       </div>
     {+</Collapsible.Root>+}
   );
 };
 const Header: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
   className,
   {+children,+}
   ...props
 }) => (
   {+<Collapsible.Trigger asChild>+}
     <div
       {...props}
       className={cn(
         "absolute top-3 inset-x-4 z-20",
         "flex items-center gap-2 justify-between",
         className
       )}
     {+>+}
{+      <Button variant="ghost" size="icon" className="h-8 w-8">+}
{+        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180"+} />
       {+</Button>+}
{+      {children}+}
{+    </div>+}
{+  </Collapsible.Trigger>+}
 );`;
