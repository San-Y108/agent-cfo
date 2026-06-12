import { AgentHub } from "@/components/console/agent-hub";

/**
 * Console home — Agent-first Command Center.
 *
 * The default Console view is the Agent CFO hub. Functional modules
 * (Treasury / Wallets / Analytics / Policy) are accessed via edge capsules
 * and open as persistent side panels.
 */
export default function ConsoleHomePage() {
  return <AgentHub />;
}
