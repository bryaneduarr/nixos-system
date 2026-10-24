import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import type { PromptTaskOutcome } from "../../../../types/subagents/tasks/run/prompt-task-outcome.interface.ts";
import type { PromptTaskSessionInput } from "../../../../types/subagents/tasks/run/prompt-task-session-input.interface.ts";

export async function promptTaskSession(input: PromptTaskSessionInput): Promise<PromptTaskOutcome> {
  const { session, signal } = input;
  let timedOut = false;
  let promptError: ValueState<string> = { state: "absent" };

  const abort = () => {
    void session.abort();
  };
  signal.addEventListener("abort", abort, { once: true });

  const timer =
    input.timeoutMs.state === "present" && input.timeoutMs.value
      ? setTimeout(() => {
          timedOut = true;
          abort();
        }, input.timeoutMs.value)
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
