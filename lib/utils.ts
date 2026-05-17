import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merges class names with Tailwind-aware deduplication. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
