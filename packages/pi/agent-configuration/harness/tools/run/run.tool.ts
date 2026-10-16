import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { DEFAULT_RUN_TIMEOUT_MS } from "../../constants/tools/run-limits.constant.ts";
import { RUN_TOOL_DESCRIPTION } from "../../constants/tools/tool-descriptions.constant.ts";
import { RunParamsSchema } from "../../schemas/tools/run/run-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/create-harness-renderers.service.ts";
import { toToolCancellation } from "../../services/tools/process/tool-cancellation.service.ts";
import { runShell } from "../../services/tools/run/run-shell.service.ts";

export function registerRunTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "run",
    label: "Run",
    description: RUN_TOOL_DESCRIPTION,
    promptSnippet: "Run shell commands not covered by search, read, or edit",
    promptGuidelines: ["Use run only when search, read, or edit does not cover the operation."],
    parameters: RunParamsSchema,
    ...createHarnessRenderers("run"),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const text = await runShell({
        cwd: ctx.cwd,
        command: params.command,
        timeoutMs: params.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS,
        cancellation: toToolCancellation(signal),
      });
      return { content: [{ type: "text", text }], details: {} };
    },
  });
}
