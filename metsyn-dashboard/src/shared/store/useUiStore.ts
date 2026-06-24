import { create } from "zustand"

type Theme = "light" | "dark"

interface UiState {
  theme: Theme
  voiceOpen: boolean
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  setVoiceOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: "light",
  voiceOpen: false,
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  setTheme: (theme) => set({ theme }),
  setVoiceOpen: (voiceOpen) => set({ voiceOpen }),
}))
