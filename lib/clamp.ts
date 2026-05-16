// Keep values within the provided inclusive range.
export function clamp(val: number, [min, max]: [number, number]): number {
    return Math.min(Math.max(val, min), max);
  }
  