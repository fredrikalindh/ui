"use client";

import React from "react";

import { refractor } from "refractor/all";

import "./theme.css";

import { parseDiff, DiffLine } from "./parse-diff";
import { guessLang } from "./guess-lang";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                — Helpers —                                 */
/* -------------------------------------------------------------------------- */

function hastToReact(
  node: ReturnType<typeof refractor.highlight>["children"][number],
  key: string
): React.ReactNode {
  if (node.type === "text") return node.value;
  if (node.type === "element") {
    const { tagName, properties, children } = node;
    return React.createElement(
      tagName,
      {
        key,
        className: (properties.className as string[] | undefined)?.join(" "),
      },
      children.map((c, i) => hastToReact(c, `${key}-${i}`))
    );
  }
  return null;
}

function highlight(code: string, lang: string): React.ReactNode[] {
  const id = `${lang}:${code}`;
  const tree = refractor.highlight(code, lang);
  const nodes = tree.children.map((c, i) => hastToReact(c, `${id}-${i}`));
  return nodes;
}

/* -------------------------------------------------------------------------- */
/*                               — Root —                                     */
/* -------------------------------------------------------------------------- */
export interface DiffSelectionRange {
  startLine: number;
  endLine: number;
}

export interface DiffProps extends React.TableHTMLAttributes<HTMLTableElement> {
  fileName?: string;
  language?: string;
  patch: string;
  status?: "added" | "removed" | "modified";
  selectable?: boolean;
  selectedRange?: DiffSelectionRange | null;
  onSelectionChange?: (range: DiffSelectionRange | null) => void;
  selectionIgnoreSelector?: string;
}

const defaultVars: React.CSSProperties = {
  "--code-added": "var(--color-green-500)",
  "--code-removed": "var(--color-orange-600)",
} as React.CSSProperties;

const Diff: React.FC<DiffProps> = ({
  fileName,
  language: langProp,
  style,
  patch,
  status = "modified",
  selectable = false,
  selectedRange = null,
  onSelectionChange,
  selectionIgnoreSelector,
  ...divProps
}) => {
  const language = langProp ?? guessLang(fileName);
  const chunks = React.useMemo(() => parseDiff(patch), [patch]);
  const {
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onPointerUp: onPointerUpProp,
    onPointerCancel: onPointerCancelProp,
    className,
    ...restDivProps
  } = divProps;
  const tableRef = React.useRef<HTMLTableElement | null>(null);
  const selectionStateRef = React.useRef<{
    startLine: number;
    pointerId: number;
  } | null>(null);
  const currentRangeRef = React.useRef<DiffSelectionRange | null>(null);
  const isDraggingRef = React.useRef(false);
  const ignoreSelector =
    selectionIgnoreSelector ??
    "button, a, textarea, input, [data-comment-draft-ignore='true']";

  const getLineFromTarget = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return null;
    const row = target.closest<HTMLTableRowElement>("tr[data-line-new]");
    if (!row) return null;
    const attr = row.getAttribute("data-line-new");
    if (!attr) return null;
    const line = Number.parseInt(attr, 10);
    return Number.isFinite(line) ? line : null;
  }, []);

  const resolveLineAtPoint = React.useCallback(
    (clientX: number, clientY: number) => {
      if (typeof document === "undefined") return null;
      const element = document.elementFromPoint(clientX, clientY);
      return getLineFromTarget(element);
    },
    [getLineFromTarget]
  );

  const getLineFromPointerEvent = React.useCallback(
    (event: React.PointerEvent<HTMLTableElement>) => {
      const direct = getLineFromTarget(event.target);
      if (direct !== null) return direct;
      return resolveLineAtPoint(event.clientX, event.clientY);
    },
    [getLineFromTarget, resolveLineAtPoint]
  );

  const clearHighlight = React.useCallback(() => {
    const tableEl = tableRef.current;
    if (!tableEl) return;
    tableEl
      .querySelectorAll<HTMLTableRowElement>("tr[data-comment-draft='true']")
      .forEach((row) => {
        row.removeAttribute("data-comment-draft");
      });
  }, []);

  const applyHighlight = React.useCallback(
    (range: DiffSelectionRange | null) => {
      const tableEl = tableRef.current;
      if (!tableEl) return;
      clearHighlight();
      if (!range) return;
      const min = Math.min(range.startLine, range.endLine);
      const max = Math.max(range.startLine, range.endLine);
      for (let line = min; line <= max; line++) {
        const row = tableEl.querySelector<HTMLTableRowElement>(
          `tr[data-line-new='${line}']`
        );
        if (row) {
          row.setAttribute("data-comment-draft", "true");
        }
      }
    },
    [clearHighlight]
  );

  const stopSelection = React.useCallback(
    (
      event: React.PointerEvent<HTMLTableElement>,
      finalize: boolean
    ): DiffSelectionRange | null => {
      const state = selectionStateRef.current;
      const range = currentRangeRef.current;
      selectionStateRef.current = null;
      currentRangeRef.current = null;
      isDraggingRef.current = false;
      if (state && event.currentTarget.hasPointerCapture(state.pointerId)) {
        event.currentTarget.releasePointerCapture(state.pointerId);
      }
      if (!finalize) {
        applyHighlight(selectedRange ?? null);
        return null;
      }
      if (range) {
        return range;
      }
      if (!state) return null;
      const fallback = { startLine: state.startLine, endLine: state.startLine };
      applyHighlight(fallback);
      return fallback;
    },
    [applyHighlight, selectedRange]
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLTableElement>) => {
      onPointerDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!selectable) return;
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (ignoreSelector && target.closest(ignoreSelector)) return;
      const line = getLineFromTarget(target);
      if (line === null) return;
      event.preventDefault();
      selectionStateRef.current = {
        startLine: line,
        pointerId: event.pointerId,
      };
      currentRangeRef.current = { startLine: line, endLine: line };
      isDraggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      applyHighlight({ startLine: line, endLine: line });
    },
    [
      applyHighlight,
      getLineFromTarget,
      ignoreSelector,
      onPointerDownProp,
      selectable,
    ]
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLTableElement>) => {
      onPointerMoveProp?.(event);
      if (event.defaultPrevented) return;
      if (!selectable) return;
      if (!selectionStateRef.current) return;
      if (event.buttons !== 1) return;
      const line = getLineFromPointerEvent(event);
      if (line === null) return;
      const startLine = selectionStateRef.current.startLine;
      const range = { startLine, endLine: line };
      currentRangeRef.current = range;
      applyHighlight(range);
    },
    [applyHighlight, getLineFromPointerEvent, onPointerMoveProp, selectable]
  );

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLTableElement>) => {
      onPointerUpProp?.(event);
      if (event.defaultPrevented) return;
      if (!selectable) return;
      if (!selectionStateRef.current) return;
      const line = getLineFromPointerEvent(event);
      if (line !== null) {
        const startLine = selectionStateRef.current.startLine;
        const range = { startLine, endLine: line };
        currentRangeRef.current = range;
        applyHighlight(range);
      }
      const finalRange = stopSelection(event, true);
      if (finalRange) {
        applyHighlight(finalRange);
        onSelectionChange?.(finalRange);
      } else {
        applyHighlight(selectedRange ?? null);
        onSelectionChange?.(null);
      }
    },
    [
      applyHighlight,
      getLineFromPointerEvent,
      onPointerUpProp,
      onSelectionChange,
      selectable,
      selectedRange,
      stopSelection,
    ]
  );

  const handlePointerCancel = React.useCallback(
    (event: React.PointerEvent<HTMLTableElement>) => {
      onPointerCancelProp?.(event);
      if (!selectable) return;
      if (!selectionStateRef.current) {
        applyHighlight(selectedRange ?? null);
        onSelectionChange?.(null);
        return;
      }
      stopSelection(event, false);
      onSelectionChange?.(null);
    },
    [
      applyHighlight,
      onPointerCancelProp,
      onSelectionChange,
      selectable,
      selectedRange,
      stopSelection,
    ]
  );

  React.useEffect(() => {
    if (isDraggingRef.current) return;
    applyHighlight(selectedRange ?? null);
  }, [applyHighlight, selectedRange]);

  return (
    <table
      {...restDivProps}
      style={{ ...defaultVars, ...style }}
      className={cn(
        "font-mono text-[0.8rem] w-full m-0 border-separate border-0 outline-none overflow-x-auto border-spacing-0",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      ref={tableRef}
    >
      <tbody className="w-full box-border">
        {chunks.map((chunk, index) => (
          <React.Fragment key={index}>
            {chunk.kind === "line" &&
              chunk.line.map((line, index) => (
                <Line
                  key={index}
                  line={line}
                  language={language}
                  status={status}
                />
              ))}
            {chunk.kind === "skip" && (
              <CollapsedIndicator
                key={`skip-${chunk.skip.id}`}
                lines={chunk.skip.count}
                functionName={chunk.skip.functionName}
              />
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

const CollapsedIndicator: React.FC<{
  lines: number;
  functionName?: string;
}> = ({ lines, functionName }) => (
  <>
    <tr className="h-4">
      <td colSpan={100}></td>
    </tr>
    <tr
      className={cn(
        "h-10 items-center font-mono",
        "select-none bg-muted text-muted-foreground"
      )}
    >
      <td></td>
      <td className="tabular-nums opacity-50 px-2 select-none">
        <ChevronsUpDown className="size-4 mx-auto" />
      </td>
      <td>
        <span className="px-0 sticky left-2 italic opacity-50">
          {functionName ? `${functionName}` : `${lines} lines hidden`}
        </span>
      </td>
    </tr>
    <tr className="h-4">
      <td colSpan={100}></td>
    </tr>
  </>
);

const Line: React.FC<{
  line: DiffLine;
  language: string;
  status: "added" | "removed" | "modified";
}> = ({ line, language, status }) => {
  const Tag =
    status === "added" ? "ins" : status === "removed" ? "del" : "span";
  const lineNumberNew =
    typeof line.lineNumberNew === "number" ? line.lineNumberNew : null;

  return (
    <tr
      data-line-new={lineNumberNew ?? undefined}
      data-line-old={
        typeof line.lineNumberOld === "number" ? line.lineNumberOld : undefined
      }
      data-line-kind={line.type}
      className={cn("whitespace-pre-wrap box-border border-none", {
        "bg-[var(--code-added)]/10 border-l-3 box-border":
          line.type === "added" && status === "modified",
        "bg-[var(--code-removed)]/10 border-l-3 box-border":
          line.type === "removed" && status === "modified",
      })}
    >
      <td
        className={cn("border-l-3 border-transparent w-1", {
          "border-l-3 box-border border-[color:var(--code-added)]/60":
            line.type === "added",
          "border-l-3 box-border border-[color:var(--code-removed)]/80":
            line.type === "removed",
        })}
      />
      <td className="tabular-nums text-center opacity-50 px-2 text-xs select-none">
        {line.lineNumberNew ?? "–"}
      </td>
      <td className="text-nowrap pr-6">
        <Tag>
          {line.segments.map((seg, i) => (
            <span
              key={i}
              className={cn({
                "bg-[color:var(--code-added)]/20":
                  seg.type === "added" && line.type === "modified",
                "bg-[color:var(--code-removed)]/20":
                  seg.type === "removed" && line.type === "modified",
              })}
            >
              {highlight(seg.value, language).map((n, idx) => (
                <React.Fragment key={idx}>{n}</React.Fragment>
              ))}
            </span>
          ))}
        </Tag>
      </td>
    </tr>
  );
};

export { Diff };
