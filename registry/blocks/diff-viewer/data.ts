export const EXAMPLE_DIFF = `diff --git a/apps/web/components/overflow-card.tsx b/apps/web/components/overflow-card.tsx
index fa4d9c4..8d980f1 100644
--- a/apps/web/components/overflow-card.tsx
+++ b/apps/web/components/overflow-card.tsx
@@ -1,40 +1,55 @@
 import React, { useLayoutEffect, useRef, useState } from "react";
 import { Fade } from "./blur-fade/blur-fade";
-import { useTheme } from "next-themes";
 import { cn } from "@workspace/ui/lib/utils";
 import { Button } from "@workspace/ui/components/button";
-import { Check, Copy } from "lucide-react";
+import { Check, Copy, ChevronDown } from "lucide-react";
+import * as Collapsible from "@radix-ui/react-collapsible";
 
 const Root = ({
   className,
   children,
+  defaultOpen = true,
   ...props
-}: React.ComponentProps<"div">) => {
+}: React.ComponentProps<"div"> & {
+  defaultOpen?: boolean;
+}) => {
+  const [open, setOpen] = useState(defaultOpen);
+
   return (
+    <Collapsible.Root open={open} onOpenChange={setOpen}>
+      <div
+        {...props}
+        className={cn(
+          "relative text-[13px] rounded-xl overflow-hidden border bg-code flex flex-col min-h-16",
+          className
+        )}
+      >
+        {children}
+      </div>
+    </Collapsible.Root>
+  );
+};
+
+const Header: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
+  className,
+  children,
+  ...props
+}) => (
+  <Collapsible.Trigger asChild>
     <div
       {...props}
       className={cn(
-        "relative text-[13px] rounded-xl overflow-hidden border bg-code flex flex-col",
+        "absolute top-3 inset-x-4 z-20",
+        "flex items-center gap-2 justify-between",
         className
       )}
     >
+      <Button variant="ghost" size="icon" className="h-8 w-8">
+        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
+      </Button>
       {children}
     </div>
-  );
-};
-
-const Header: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
-  className,
-  ...props
-}) => (
-  <div
-    {...props}
-    className={cn(
-      "absolute top-3 inset-x-4 z-20",
-      "flex items-center gap-2 justify-between",
-      className
-    )}
-  />
+  </Collapsible.Trigger>
 );
 `;

export const SIMPLE_DIFF = `diff --git a/components/input.tsx b/components/input.tsx
index 3facda6..82485f0 100644
--- a/components/input.tsx
+++ b/components/input.tsx
@@ -1,3 +1,3 @@
-import { useState, useRef } from 'react';
+import { useRef, useEffect } from 'react';
 
-const Inpt = () => {
+const Input = () => {
`;

export const DISSIMILAR_DIFF = `diff --git a/components/input.tsx b/components/input.tsx
index 3facda6..82485f0 100644
--- a/components/input.tsx
+++ b/components/input.tsx
@@ -1,3 +1,3 @@
-import { useState, useRef } from 'react';
+const Input = () => {
`;

export const MIXED_DIFF = `diff --git a/file-changes.tsx b/file-changes.tsx
index 1234567..2345678 100644
--- a/file-changes.tsx
+++ b/file-changes.tsx
@@ -95,18 +95,24 @@ const DiffViewer = ({
   return (
     <Card.Root data-section-id={id} id={id}>
-        {file?.status === "insert" ? (
-          <Badge variant="success">New</Badge>
-        ) : file?.status === "deleted" ? (
+
+        {file?.status === "insert" && <Badge variant="success">New</Badge>}
+        {file?.status === "delete" && (
           <Badge variant="destructive">Deleted</Badge>
-        ) : null}
-        <span className="text-xs tabular-nums">
-          <span className="text-green-600">+{additions}</span>
-          <span className="text-red-600">-{deletions}</span>
-        </span>
+        )}
+        {file?.status === "modified" && (
+          <span className="text-xs tabular-nums">
+            <span className="text-green-600">+{additions}</span>
+            <span className="text-red-600">-{deletions}</span>
+          </span>
+        )}
`;
// export const MIXED_DIFF2 = `diff --git a/file-changes.tsx b/file-changes.tsx
// index 1234567..2345678 100644
// --- a/file-changes.tsx
// +++ b/file-changes.tsx
// @@ -1,1 +1,5 @@
// -<Card.Root data-section-id={id} id={id}>
// +<Card.Root
// +  data-section-id={id}
// +  id={id}
// +  defaultOpen={file.status !== "delete"}
// +>
// `;
export const MIXED_DIFF2 = `diff --git a/file-changes.tsx b/file-changes.tsx
index 1234567..2345678 100644
--- a/file-changes.tsx
+++ b/file-changes.tsx
@@ -257,7 +257,7 @@ export const FileChanges = ({ prMeta, files, prId }: FileChangesProps) => {
         )}
       </div>
-      <div className="space-y-4 mx-auto flex flex-col gap-4 overflow-visible flex-1 py-16 pr-24 max-w-4xl">
+      <div className="space-y-4 mx-auto flex flex-col gap-4 overflow-visible flex-1 py-16 max-w-4xl">
         <h1
           className="text-xl font-medium mb-2 mt-4 first:mt-0"
           id={slugify(displayTitle)}`;
// export const MIXED_DIFF2 = `diff --git a/file-changes.tsx b/file-changes.tsx
// index 1234567..2345678 100644
// --- a/file-changes.tsx
// +++ b/file-changes.tsx
// @@ -1,1 +1,3 @@
// +<Component
// +  prop="value"
// +/>
// -<Component prop="value" />`;
