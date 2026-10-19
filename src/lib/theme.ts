import { useSyncExternalStore } from "react"
import { useTheme } from "@figma/astraui"

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export function useHydratedTheme(): ReturnType<typeof useTheme> {
  const theme = useTheme()
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  )
  // Astra can read a saved dark preference before Next hydrates its light HTML.
  // Keep theme-dependent text and icons identical until hydration is complete.
  return { ...theme, theme: hydrated ? theme.theme : "light" }
}
