"use client";

/**
 * Preview/Markdown editor with interactive GFM task lists.
 *
 * Glass (everysphere): wire the same toggle into TipTap preview via
 * `@tiptap/extension-task-list` + `@tiptap/extension-task-item` in
 * `packages/ui/src/primitives/RichTextEditor/useRichTextEditor.ts`, then
 * persist serialized markdown from `glass-markdown-wysiwyg-surface.ts`.
 * See Linear GLINT-271.
 */

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  findTaskLineIndexByOccurrence,
  splitMarkdownFrontmatter,
  toggleMarkdownTaskAtLine,
} from "@/lib/markdown-task-list";

export type MarkdownDocView = "preview" | "markdown";

export type MarkdownDocEditorProps = {
  value: string;
  onChange: (value: string) => void;
  view?: MarkdownDocView;
  onViewChange?: (view: MarkdownDocView) => void;
  className?: string;
};

function createTaskListInput({
  source,
  onToggle,
}: {
  source: string;
  onToggle: (lineIndex: number, checked: boolean) => void;
}) {
  let occurrence = 0;

  return function TaskListInput({
    type,
    checked,
    disabled,
    ...props
  }: React.ComponentProps<"input">) {
    if (type !== "checkbox") {
      return <input type={type} checked={checked} disabled={disabled} {...props} />;
    }

    const taskOccurrence = occurrence++;
    const lineIndex = findTaskLineIndexByOccurrence(source, taskOccurrence);

    return (
      <Checkbox
        checked={Boolean(checked)}
        disabled={lineIndex < 0}
        className="mr-2 translate-y-[1px]"
        onCheckedChange={(next) => {
          if (lineIndex < 0) {
            return;
          }
          onToggle(lineIndex, next === true);
        }}
        onClick={(event) => event.stopPropagation()}
      />
    );
  };
}

export function MarkdownDocEditor({
  value,
  onChange,
  view: controlledView,
  onViewChange,
  className,
}: MarkdownDocEditorProps) {
  const [uncontrolledView, setUncontrolledView] =
    React.useState<MarkdownDocView>("preview");
  const view = controlledView ?? uncontrolledView;

  const setView = React.useCallback(
    (next: MarkdownDocView) => {
      onViewChange?.(next);
      if (controlledView === undefined) {
        setUncontrolledView(next);
      }
    },
    [controlledView, onViewChange]
  );

  const handleToggle = React.useCallback(
    (lineIndex: number, checked: boolean) => {
      onChange(toggleMarkdownTaskAtLine(value, lineIndex, checked));
    },
    [onChange, value]
  );

  const { frontmatter, body } = React.useMemo(
    () => splitMarkdownFrontmatter(value),
    [value]
  );

  const markdownComponents = React.useMemo(
    () => ({
      input: createTaskListInput({ source: value, onToggle: handleToggle }),
      ul: ({ className: ulClassName, ...props }: React.ComponentProps<"ul">) => (
        <ul
          className={cn(
            "my-2 ml-6 list-disc [&>li.task-list-item]:list-none [&:has(>li.task-list-item)]:ml-0",
            ulClassName
          )}
          {...props}
        />
      ),
      li: ({ className: liClassName, ...props }: React.ComponentProps<"li">) => (
        <li
          className={cn("pl-2 [&.task-list-item]:list-none [&.task-list-item]:pl-0", liClassName)}
          {...props}
        />
      ),
    }),
    [handleToggle, value]
  );

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex items-center justify-end gap-1 border-b px-3 py-2">
        <ViewToggle active={view === "preview"} onClick={() => setView("preview")}>
          Preview
        </ViewToggle>
        <ViewToggle active={view === "markdown"} onClick={() => setView("markdown")}>
          Markdown
        </ViewToggle>
      </div>

      {view === "preview" ? (
        <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
          {frontmatter ? (
            <FrontmatterPreview raw={frontmatter} />
          ) : null}
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {body}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="min-h-[240px] flex-1 resize-none bg-transparent px-6 py-4 font-mono text-sm leading-relaxed outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
        />
      )}
    </div>
  );
}

function FrontmatterPreview({ raw }: { raw: string }) {
  const lines = raw
    .split("\n")
    .slice(1, -1)
    .filter((line) => line.trim().length > 0);

  return (
    <section className="mb-6">
      <h2 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
        Properties
      </h2>
      <dl className="space-y-1 text-sm">
        {lines.map((line) => {
          const colon = line.indexOf(":");
          if (colon === -1) {
            return null;
          }
          const key = line.slice(0, colon).trim();
          const val = line.slice(colon + 1).trim();
          return (
            <div key={line} className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-2">
              <dt className="text-muted-foreground">{key}</dt>
              <dd className="font-mono text-xs">{val}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function ViewToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1 text-sm transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
