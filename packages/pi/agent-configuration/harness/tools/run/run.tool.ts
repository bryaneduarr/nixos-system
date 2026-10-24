import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { DEFAULT_RUN_TIMEOUT_MS } from "../../constants/tools/run-limits.constant.ts";
import { RUN_TOOL_DESCRIPTION, RUN_TOOL_GUIDELINES } from "../../constants/tools/tool-descriptions.constant.ts";
import { RunParamsSchema } from "../../schemas/tools/run/run-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/renderers/create-harness-renderers.service.ts";
import { toToolCancellation } from "../../services/tools/process/tool-cancellation.service.ts";
import { prepareRunArguments } from "../../services/tools/run/prepare-run-arguments.service.ts";
import { prepareRunDirectory } from "../../services/tools/run/prepare-run-directory.service.ts";
import { runShell } from "../../services/tools/run/run-shell.service.ts";
import type { RunDirectory } from "../../types/tools/run/run-directory.interface.ts";

function blockedMessage(runDirectory: Extract<RunDirectory, { state: "blocked" }>): string {
  if (runDirectory.reason === "not-a-directory") {
    return `${runDirectory.directory} is not a directory.\nCreate the directory first, then run again.`;
  }
  return `Could not create ${runDirectory.directory}.\nCheck the path and its permissions, then run again.`;
}

export function registerRunTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "run",
    label: "Run",
    description: RUN_TOOL_DESCRIPTION,
    promptSnippet: "Run shell commands not covered by search, read, or edit",
    promptGuidelines: [...RUN_TOOL_GUIDELINES],
    parameters: RunParamsSchema,
    prepareArguments: prepareRunArguments,
    ...createHarnessRenderers("run"),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const runDirectory = await prepareRunDirectory(ctx.cwd, params.cwd ?? ".");
      if (runDirectory.state === "blocked") {
        return {
          isError: true,
          content: [{ type: "text", text: blockedMessage(runDirectory) }],
          details: {},
        };
      }
      const text = await runShell({
        cwd: ctx.cwd,
        directory: runDirectory.directory,
        command: params.command,
        timeoutMs: params.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS,
        cancellation: toToolCancellation(signal),
      });
      return { content: [{ type: "text", text }], details: {} };
    },
  });
}
