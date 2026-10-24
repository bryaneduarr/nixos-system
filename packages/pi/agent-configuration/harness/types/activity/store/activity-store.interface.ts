import type { ActivityBeginInput } from "./activity-begin-input.interface.ts";
import type { ActivityFinishPatch } from "./activity-finish-patch.interface.ts";
import type { ActivityListener } from "./activity-listener.interface.ts";
import type { ActivityUpdatePatch } from "./activity-update-patch.interface.ts";
import type { AgentActivity } from "./agent-activity.interface.ts";
import type { AgentActivityPhase } from "./agent-activity-phase.interface.ts";
import type { AssistantTextPatch } from "./assistant-text-patch.interface.ts";
import type { ToolActivity } from "./tool-activity.interface.ts";
import type { ToolActivityLookup } from "./tool-activity-lookup.interface.ts";

/** Records tool calls and the live state of the primary agent. */
export interface ActivityStore {
  /** Removes every recorded tool call and resets the primary agent. */
  clear(): void;
  /** Changes the phase of the primary agent. */
  setPhase(phase: AgentActivityPhase): void;
  /** Replaces the streamed thinking and response text of the primary agent. */
  setAssistantText(patch: AssistantTextPatch): void;
  /** Live state of the primary agent. */
  currentAgent(): AgentActivity;
  /** Records a tool call, or returns the existing record with the same identifier. */
  begin(input: ActivityBeginInput): ToolActivity;
  /** Applies a running update to a recorded tool call. */
  update(id: string, patch: ActivityUpdatePatch): void;
  /** Completes a recorded tool call. */
  finish(id: string, patch: ActivityFinishPatch): void;
  /** Looks up a recorded tool call by its identifier. */
  lookup(id: string): ToolActivityLookup;
  /** Every recorded tool call in the order it began. */
  all(): readonly ToolActivity[];
  /** Registers a listener notified after every change and returns a function that removes it. */
  subscribe(listener: ActivityListener): () => void;
}
