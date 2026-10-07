import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/components/auth-provider";

import { SettingsProvider } from "@/components/settings-provider";
import { BRAND_CONFIG } from "@/lib/brandConfig";

export const metadata: Metadata = {
  title: {
    default: BRAND_CONFIG.cheapRouterTitle,
    template: `%s | ${BRAND_CONFIG.cheapRouterName}`,
  },
  description: "Access premium AI models like GPT-4, Gemini, and Claude with a single API key at unbeatable prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <SettingsProvider>
              <AuthProvider>{children}</AuthProvider>
            </SettingsProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
