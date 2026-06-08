import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentCFO — AI Treasury Command Center",
  description: "AI CFO for DAO treasury payouts. Risk-checked payment plans, human approval, simulated wallet execution, and auditable settlement reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#030712] text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
