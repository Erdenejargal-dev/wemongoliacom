import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { ConditionalShell } from "@/components/layout/ConditionalShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "We Mongolia",
  description: "Explore Mongolia with We Mongolia",
  // Adding the favicon here
  icons: {
    icon: "/favicon.ico",
    // Optional: If you have a shortcut icon or apple-touch-icon
    // shortcut: "/assets/favicon.ico",
    // apple: "/assets/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ConditionalShell>
            {children}
          </ConditionalShell>
        </SessionProvider>
      </body>
    </html>
  );
}