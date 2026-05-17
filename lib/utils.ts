import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge class names and resolve Tailwind conflicts.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
