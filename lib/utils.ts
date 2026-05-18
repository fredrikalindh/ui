import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge class names and resolve conflicting Tailwind utilities.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
