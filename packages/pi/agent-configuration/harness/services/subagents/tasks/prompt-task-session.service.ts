import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import type { PromptTaskOutcome } from "../../../types/subagents/tasks/prompt-task-outcome.interface.ts";
import type { PromptTaskSessionInput } from "../../../types/subagents/tasks/prompt-task-session-input.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export async function promptTaskSession(input: PromptTaskSessionInput): Promise<PromptTaskOutcome> {
  const { session, signal } = input;
  let timedOut = false;
  let promptError: ValueState<string> = { state: "absent" };

  const abort = () => {
    void session.abort();
  };
  signal.addEventListener("abort", abort, { once: true });

  const timeoutMs = presentValue(input.timeoutMs);
  const timer = timeoutMs
    ? setTimeout(() => {
        timedOut = true;
        abort();
      }, timeoutMs)
    : undefined;

  try {
    if (signal.aborted) {
      abort();
    } else {
      try {
        await session.prompt(input.prompt);
      } catch (error) {
        promptError = { state: "present", value: error instanceof Error ? error.message : String(error) };
      }
    }

    return { timedOut, promptError };
  } finally {
    if (timer) clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}
