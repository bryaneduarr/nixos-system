import type { AssistantActivityLookup } from "./assistant-activity-lookup.interface.ts";

/* Records the thinking and streamed response of assistant messages as they arrive. */
export interface AssistantMessageRecorder {
  /* Forgets the message in progress, such as when a session starts. */
  reset(): void;
  /* Starts recording an assistant message; other messages are ignored. */
  start(message: unknown): void;
  /* Records the streamed text of the message in progress and returns its parsed text. */
  update(message: unknown, cwd: string): AssistantActivityLookup;
  /* Completes the message in progress and returns its parsed text. */
  end(message: unknown, cwd: string): AssistantActivityLookup;
}
