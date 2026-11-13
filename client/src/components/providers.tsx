"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "sonner";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <Tooltip.Provider delayDuration={150}>
        {children}
        <div id="datepicker-portal" />
        <ThemedToaster />
      </Tooltip.Provider>
    </NextThemesProvider>
  );
}
