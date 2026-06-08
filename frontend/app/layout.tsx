import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/i18n/context";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
