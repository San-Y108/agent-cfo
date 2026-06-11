import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/lib/i18n/context";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
        {/* Anti-FOUC theme script — placed at body top so React doesn't warn
            about scripts inside <head>. Runs synchronously before paint. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
