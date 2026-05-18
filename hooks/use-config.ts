import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

type Config = {
  packageManager: "npm" | "yarn" | "pnpm" | "bun"
  installationType: "cli" | "manual"
}

// Persisted in localStorage so package-manager preference survives reloads.
const configAtom = atomWithStorage<Config>("config", {
  packageManager: "pnpm",
  installationType: "cli",
})

export function useConfig() {
  return useAtom(configAtom)
}
