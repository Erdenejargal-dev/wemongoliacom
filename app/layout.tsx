import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";

import SessionProvider from "@/components/providers/SessionProvider";
import { DisplayCurrencyProvider } from "@/components/providers/DisplayCurrencyProvider";
import { PreferencesProvider } from "@/components/providers/PreferencesProvider";
import { PublicLocaleProvider } from "@/lib/i18n/public/context";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { getResolvedLocaleCurrencyForRequest } from "@/lib/locale-currency-resolver.server";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialResolved = await getResolvedLocaleCurrencyForRequest();

  return (
    <html lang={initialResolved.language} className={`${manrope.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <SessionProvider>
          {/* Phase 6.4 — Resolver + middleware agree on CF-IPCountry defaults. */}
          <PreferencesProvider initialResolved={initialResolved}>
            <DisplayCurrencyProvider initialCurrency={initialResolved.currency}>
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