import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageBacking } from "./async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-store",
      storage: createJSONStorage(() => asyncStorageBacking),
    }
  )
);
