import type { Metadata } from "next";
import Script from "next/script";
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

// Anti-FOUC: set .dark class + lang before hydration based on stored prefs.
// Defaults: dark theme, english.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('agentcfo-theme') || 'dark';
    var l = localStorage.getItem('agentcfo-lang') || 'en';
    var root = document.documentElement;
    if (t === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    root.lang = l === 'zh' ? 'zh-CN' : 'en';
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-bg text-fg antialiased font-sans">
        {/* Anti-FOUC theme script — beforeInteractive so it runs synchronously before paint. */}
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
