// next-themes.d.ts
declare module "next-themes" {
  import * as React from "react";

  export interface ThemeProviderProps {
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    enableColorScheme?: boolean;
    forcedTheme?: string;
    disableTransitionOnChange?: boolean;
    storageKey?: string;
    themes?: string[];
    value?: Record<string, string>;
    children?: React.ReactNode;
  }

  export const ThemeProvider: React.FC<ThemeProviderProps>;

  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    forcedTheme?: string;
    resolvedTheme?: string;
    systemTheme?: "light" | "dark";
  };
}
