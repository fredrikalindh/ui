"use client";

import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { Checkbox } from "@/components/ui/checkbox";
import {
  findMarkdownTaskItems,
  setMarkdownTaskItemChecked,
} from "@/lib/markdown-task-list";
import { cn } from "@/lib/utils";

import { Button } from "./button";

export type MarkdownDocViewMode = "preview" | "markdown";

export type MarkdownDocEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  defaultView?: MarkdownDocViewMode;
  className?: string;
  readOnly?: boolean;
};

export function MarkdownDocEditor({
  value,
  onChange,
  defaultView = "preview",
  className,
  readOnly = false,
}: MarkdownDocEditorProps) {
  const [view, setView] = React.useState<MarkdownDocViewMode>(defaultView);
  const taskItems = React.useMemo(() => findMarkdownTaskItems(value), [value]);
  let taskRenderIndex = 0;

  const handleTaskToggle = React.useCallback(
    (lineIndex: number, checked: boolean) => {
      if (readOnly || !onChange) {
        return;
      }
      onChange(setMarkdownTaskItemChecked(value, lineIndex, checked));
    },
    [onChange, readOnly, value]
  );

  const markdownComponents: Components = {
    ul: ({ className, ...props }) => (
      <ul
        className={cn(
          "mb-2 mt-0 ml-6 list-disc [&>li.task-list-item]:list-none [&:has(>li.task-list-item)]:ml-0",
          className
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li
        className={cn("mt-2 pl-2 text-lg [&.task-list-item]:pl-0", className)}
        {...props}
      />
    ),
    input: ({ checked, className, disabled }) => {
      const item = taskItems[taskRenderIndex++];
      const isChecked = checked === true;

      return (
        <Checkbox
          className={cn("mr-2 align-middle", className)}
          checked={isChecked}
          disabled={disabled || readOnly || !onChange || !item}
          onCheckedChange={(next) => {
            if (!item) {
              return;
            }
            handleTaskToggle(item.lineIndex, next === true);
          }}
          aria-label={
            isChecked ? "Mark todo incomplete" : "Mark todo complete"
          }
        />
      );
    },
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="mb-3 flex justify-end gap-1">
        <Button
          type="button"
          size="sm"
          variant={view === "preview" ? "secondary" : "ghost"}
          onClick={() => setView("preview")}
        >
          Preview
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "markdown" ? "secondary" : "ghost"}
          onClick={() => setView("markdown")}
        >
          Markdown
        </Button>
      </div>

      {view === "markdown" ? (
        <textarea
          className="min-h-[240px] w-full resize-y rounded-md border border-border bg-transparent p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
          spellCheck={false}
        />
      ) : (
        <div className="markdown-doc-preview max-w-none leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {value}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
