import type { BackendToolExecutor } from "../../../types/tools/backends/backend-tool-executor.interface.ts";

/** A backend tool call the fake executor received. */
export interface RecordedBackendCall {
  /** Name of the called tool. */
  readonly toolName: string;
  /** Arguments passed to the tool. */
  readonly toolArguments: unknown;
}

export function createBackendExecutor(
  answers: Readonly<Record<string, string>>,
  calls: RecordedBackendCall[] = [],
): BackendToolExecutor {
  return {
    async executeTool(toolName, toolArguments) {
      calls.push({ toolName, toolArguments });
      const answer = answers[toolName];
      return {
        toolCall: { type: "toolCall", id: "nested", name: toolName, arguments: {} },
        result: { content: [{ type: "text", text: answer ?? `Tool ${toolName} not found` }], details: {} },
        isError: answer === undefined,
      };
    },
  };
}
