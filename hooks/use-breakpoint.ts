"use client";

import { useEffect, useState } from "react";

type BreakpointSize = "mobile" | "tablet" | "desktop" | null;

const getBreakpoint = (width: number): BreakpointSize => {
  if (width < 480) return "mobile"; // sm breakpoint
  if (width <= 960) return "tablet"; // lg breakpoint
  return "desktop";
};

export function useBreakpoint(): BreakpointSize {
  const [screenSize, setScreenSize] = useState<BreakpointSize>(null);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getBreakpoint(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return screenSize;
}
