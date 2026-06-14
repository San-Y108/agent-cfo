import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { AppProvider } from "@/lib/i18n/context";

const geist = localFont({
  src: "../public/fonts/Geist-VariableFont_wght.ttf",
  variable: "--font-geist",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMono-VariableFont_wght.ttf",
  variable: "--font-mono",
  weight: "100 700",
});

export const metadata: Metadata = {
  title: "AgentCFO — AI Treasury Command Center",
  description: "AI CFO for DAO treasury payouts. Risk-checked payment plans, human approval, simulated wallet execution, and auditable settlement reports.",
};

// Anti-FOUC: defaults are applied via the hardcoded .dark class on <html>.
// Stored prefs are applied client-side by AppProvider after hydration.
const htmlClass = `dark ${geist.variable} ${geistMono.variable}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-bg text-fg antialiased font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
