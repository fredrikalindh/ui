"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dropdown({
  className,
  ...props
}: React.ComponentProps<"details">) {
  return (
    <details
      data-slot="dropdown"
      className={cn("group/dropdown relative inline-block", className)}
      {...props}
    />
  )
}

function DropdownTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"summary">) {
  return (
    <summary
      data-slot="dropdown-trigger"
      className={cn(
        "border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 cursor-pointer list-none items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] select-none [&::-webkit-details-marker]:hidden",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 shrink-0 opacity-50 transition-transform group-open/dropdown:rotate-180" />
    </summary>
  )
}

function DropdownContent({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end"
}) {
  return (
    <div
      data-slot="dropdown-content"
      className={cn(
        "bg-popover text-popover-foreground absolute z-50 mt-2 min-w-40 origin-top rounded-md border p-1 shadow-md",
        "group-open/dropdown:animate-in group-open/dropdown:fade-in-0 group-open/dropdown:zoom-in-95",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "end" && "right-0",
        className
      )}
      {...props}
    />
  )
}

function DropdownItem({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="dropdown-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem }
