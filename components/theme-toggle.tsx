"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/registry/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = React.useCallback(() => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        disabled
        aria-label="Toggle theme"
      >
        <Sun className="size-4" aria-hidden="true" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full fixed right-2 bottom-2 z-50"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      <Sun
        className={`absolute size-4 transition-all ${
          theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute size-4 transition-all ${
          theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
        aria-hidden="true"
      />
      <Monitor
        className={`absolute size-4 transition-all ${
          theme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
        aria-hidden="true"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
