import type { BackendToolExecutor } from "../../../types/tools/backends/backend-tool-executor.interface.ts";
import { toTextToolResult } from "../result/to-text-tool-result.service.ts";

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
        result: toTextToolResult(answer ?? `Tool ${toolName} not found`),
        isError: answer === undefined,
      };
    },
  };
}
