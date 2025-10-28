import { defineConfig } from "vitest/config";
import tsconfig from "./tsconfig.json";

const tsPaths = (tsconfig.compilerOptions?.paths ?? {}) as Record<string, string[]>;
const alias: Record<string, string> = Object.fromEntries(
  Object.entries(tsPaths).map(([key, [value]]) => [
    key.replace(/\*$/, ""),
    (value ?? "").replace(/\*$/, ""),
  ])
);

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["registry/**/*.test.ts", "registry/**/*.test.tsx", "registry/**/*.spec.ts", "registry/**/*.spec.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias,
  },
});


