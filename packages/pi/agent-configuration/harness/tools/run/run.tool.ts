import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { RUN_TOOL_NAME } from "../../constants/tools/active-tools/harness-tools.constant.ts";
import {
  RUN_TOOL_DESCRIPTION,
  RUN_TOOL_GUIDELINES,
  RUN_TOOL_LABEL,
  RUN_TOOL_PROMPT_SNIPPET,
} from "../../constants/tools/run/run-tool.constant.ts";
import { RunParamsSchema } from "../../schemas/tools/run/run-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/renderers/create-harness-renderers.service.ts";
import { toToolCancellation } from "../../services/tools/process/tool-cancellation.service.ts";
import { executeRun } from "../../services/tools/run/execute-run.service.ts";
import { prepareRunArguments } from "../../services/tools/run/prepare-run-arguments.service.ts";

export function registerRunTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: RUN_TOOL_NAME,
    label: RUN_TOOL_LABEL,
    description: RUN_TOOL_DESCRIPTION,
    promptSnippet: RUN_TOOL_PROMPT_SNIPPET,
    promptGuidelines: [...RUN_TOOL_GUIDELINES],
    parameters: RunParamsSchema,
    prepareArguments: prepareRunArguments,
    ...createHarnessRenderers(RUN_TOOL_NAME),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      return executeRun({ cwd: ctx.cwd, parameters: params, cancellation: toToolCancellation(signal) });
    },
  });
}
