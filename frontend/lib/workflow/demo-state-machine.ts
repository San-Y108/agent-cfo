import type { DemoStepId } from "./demo-steps";

export type DemoState =
  | "idle"
  | "inputting"
  | "parsing"
  | "planning"
  | "checking-risk"
  | "awaiting-approval"
  | "executing"
  | "completed"
  | "blocked"
  | "error";

export interface DemoStateMachine {
  state: DemoState;
  currentStep: DemoStepId | null;
  canProceed: boolean;
  canReset: boolean;
}

export const initialState: DemoStateMachine = {
  state: "idle",
  currentStep: null,
  canProceed: true,
  canReset: false,
};
