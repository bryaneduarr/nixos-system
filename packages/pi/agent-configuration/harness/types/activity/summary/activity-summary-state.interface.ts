import type { ValueState } from "../value/value-state.interface.ts";

/** Live state shared by the activity summary widget. */
export interface ActivitySummaryState {
  /** Records whether the agent is working and the current spinner frame. */
  setProgress(working: boolean, frame: number): void;
  /** Whether the agent is working. */
  isWorking(): boolean;
  /** Spinner frame index shown while working. */
  currentFrame(): number;
  /** Completion time of a user message, once its turn has settled. */
  completion(messageNumber: number): ValueState<number>;
  /** Records when the turn of a user message settled. */
  setCompletion(messageNumber: number, completedAt: number): void;
  /** Forgets every recorded completion. */
  clearCompletions(): void;
}
