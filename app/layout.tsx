import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";

import SessionProvider from "@/components/providers/SessionProvider";
import { DisplayCurrencyProvider } from "@/components/providers/DisplayCurrencyProvider";
import { PreferencesProvider } from "@/components/providers/PreferencesProvider";
import { PublicLocaleProvider } from "@/lib/i18n/public/context";
import { ConditionalShell } from "@/components/layout/ConditionalShell";

// ✅ Manrope
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// mono stays
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "We Mongolia",
  description: "Explore Mongolia with We Mongolia",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <SessionProvider>
          {/* Phase 6 — PreferencesProvider is the single source of truth for
              currency + language, with geo defaults + user-pref resolution.
              DisplayCurrencyProvider stays mounted for back-compat with
              components that already call useDisplayCurrency(). */}
          <PreferencesProvider>
            <DisplayCurrencyProvider>
              <PublicLocaleProvider>
                <ConditionalShell>{children}</ConditionalShell>
              </PublicLocaleProvider>
            </DisplayCurrencyProvider>
          </PreferencesProvider>
        </SessionProvider>
      </body>
    </html>
  );
}