"use client";

import React from "react";

import { refractor } from "refractor/all";

import "./theme.css";

import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  guessLang,
  Hunk as HunkType,
  SkipBlock,
  File,
  Line as LineType,
} from "./utils";

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

export interface DiffProps
  extends React.TableHTMLAttributes<HTMLTableElement>,
    Pick<File, "hunks" | "type"> {
  fileName?: string;
  language?: string;
}

const defaultVars: React.CSSProperties = {
  "--code-added": "var(--color-green-500)",
  "--code-removed": "var(--color-orange-600)",
} as React.CSSProperties;

const Hunk = ({ hunk }: { hunk: HunkType | SkipBlock }) => {
  return hunk.type === "hunk" ? (
    <>
      {hunk.lines.map((line, index) => (
        <Line key={index} line={line} language="tsx" />
      ))}
    </>
  ) : (
    <CollapsedIndicator lines={hunk.count} functionName={hunk.context} />
  );
};

const Diff: React.FC<DiffProps> = ({
  fileName,
  language: langProp,
  style,
  hunks,
  className,
  children,
  ...props
}) => {
  // TODO: -> context
  const language = langProp ?? guessLang(fileName);

  return (
    <table
      {...props}
      style={{ ...defaultVars, ...style }}
      className={cn(
        "font-mono text-[0.8rem] w-full m-0 border-separate border-0 outline-none overflow-x-auto border-spacing-0",
        className
      )}
    >
      <tbody className="w-full box-border">
        {children ??
          hunks.map((hunk, index) => <Hunk key={index} hunk={hunk} />)}
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
  line: LineType;
  language: string;
}> = ({ line, language }) => {
  const Tag =
    line.type === "insert" ? "ins" : line.type === "delete" ? "del" : "span";

  const lineNumberNew =
    line.type === "normal" ? line.newLineNumber : line.lineNumber;
  const lineNumberOld = line.type === "normal" ? line.oldLineNumber : undefined;

  return (
    <tr
      data-line-new={lineNumberNew ?? undefined}
      data-line-old={lineNumberOld ?? undefined}
      data-line-kind={line.type}
      className={cn("whitespace-pre-wrap box-border border-none", {
        "bg-[var(--code-added)]/10 border-l-3 box-border":
          line.type === "insert",
        "bg-[var(--code-removed)]/10 border-l-3 box-border":
          line.type === "delete",
      })}
    >
      <td
        className={cn("border-l-3 border-transparent w-1", {
          "border-l-3 box-border border-[color:var(--code-added)]/60":
            line.type === "insert",
          "border-l-3 box-border border-[color:var(--code-removed)]/80":
            line.type === "delete",
        })}
      />
      <td className="tabular-nums text-center opacity-50 px-2 text-xs select-none">
        {line.type === "delete" ? "–" : lineNumberNew}
      </td>
      <td className="text-nowrap pr-6">
        <Tag>
          {line.content.map((seg, i) => (
            <span
              key={i}
              className={cn({
                "bg-[color:var(--code-added)]/20":
                  seg.type === "insert" && line.type === "normal",
                "bg-[color:var(--code-removed)]/20":
                  seg.type === "delete" && line.type === "normal",
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

export { Diff, Hunk };
