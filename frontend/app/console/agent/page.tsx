import { AgentHub } from "@/components/console/agent-hub";

/**
 * `/console/agent` now delegates to the same Agent CFO hub used on `/console`.
 *
 * This keeps the conversational command center in one component and ensures
 * quick actions always read from the shared ConsoleState.
 */
export default function AgentPage() {
  return <AgentHub />;
}
