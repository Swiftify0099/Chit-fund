import React, { createContext, useContext, useState, useEffect } from "react";
import { themeApi } from "@/services/api";

interface Theme {
  id: number;
  name: string;
  bg_color: string;
  bg_image?: string;
  text_color: string;
  highlight_color: string;
  font_bold: boolean;
  title?: string;
  subtitle?: string;
  shadow_color?: string;
  is_active: boolean;
}

const DEFAULT_THEME: Theme = {
  id: 0,
  name: "Midnight Blue",
  bg_color: "#0F1629",
  text_color: "#FFFFFF",
  highlight_color: "#6C63FF",
  font_bold: false,
  is_active: true,
};

interface ThemeContextType {
  theme: Theme;
  themes: Theme[];
  loadTheme: () => Promise<void>;
  loadAllThemes: () => Promise<void>;
  activateTheme: (id: number) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [themes, setThemes] = useState<Theme[]>([]);

  const loadTheme = async () => {
    try {
      const { data } = await themeApi.activeTheme();
      setTheme(data);
    } catch {
      setTheme(DEFAULT_THEME);
    }
  };

  const loadAllThemes = async () => {
    try {
      const { data } = await themeApi.listThemes();
      setThemes(data);
    } catch {}
  };

  const activateTheme = async (id: number) => {
    await themeApi.activateTheme(id);
    await loadTheme();
    await loadAllThemes();
  };

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themes, loadTheme, loadAllThemes, activateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
