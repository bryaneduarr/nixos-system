import { BACKEND_NO_ANSWER_PATTERNS } from "../../../constants/tools/backends/backend-no-answer.constant.ts";
import { BACKEND_TIMEOUT_MS } from "../../../constants/tools/backends/backend-tools.constant.ts";
import type { BackendToolExecutor } from "../../../types/tools/backends/backend-tool-executor.interface.ts";
import type { BackendToolResult } from "../../../types/tools/backends/backend-tool-result.interface.ts";
import { extractText } from "../result/extract-text.service.ts";

export async function callBackendTool(
  executor: BackendToolExecutor,
  toolName: string,
  toolArguments: Record<string, unknown>,
): Promise<BackendToolResult> {
  const timeout = AbortSignal.timeout(BACKEND_TIMEOUT_MS);
  try {
    const outcome = await executor.executeTool(toolName, toolArguments, { signal: timeout });
    if (outcome.isError || timeout.aborted) return { found: false };
    const text = extractText(outcome.result.content).trim();
    const isNoAnswer = BACKEND_NO_ANSWER_PATTERNS.some((pattern) => pattern.test(text));
    return text && !isNoAnswer ? { found: true, text } : { found: false };
  } catch {
    return { found: false };
  }
}
