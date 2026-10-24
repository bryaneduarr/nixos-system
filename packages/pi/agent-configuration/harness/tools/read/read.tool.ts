import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { READ_TOOL_NAME } from "../../constants/tools/active-tools/harness-tools.constant.ts";
import {
  READ_TOOL_DESCRIPTION,
  READ_TOOL_GUIDELINES,
  READ_TOOL_LABEL,
  READ_TOOL_PROMPT_SNIPPET,
} from "../../constants/tools/read/read-tool.constant.ts";
import { ReadParamsSchema } from "../../schemas/tools/read/read-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/renderers/create-harness-renderers.service.ts";
import { readSource } from "../../services/tools/read/read-source.service.ts";
import { toReadSelection } from "../../services/tools/read/to-read-selection.service.ts";
import { toTextToolResult } from "../../services/tools/result/to-text-tool-result.service.ts";

export function registerReadTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: READ_TOOL_NAME,
    label: READ_TOOL_LABEL,
    description: READ_TOOL_DESCRIPTION,
    promptSnippet: READ_TOOL_PROMPT_SNIPPET,
    promptGuidelines: [...READ_TOOL_GUIDELINES],
    parameters: ReadParamsSchema,
    ...createHarnessRenderers(READ_TOOL_NAME),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const text = await readSource({
        cwd: ctx.cwd,
        path: params.path,
        selection: toReadSelection(params),
      });
      return toTextToolResult(text);
    },
  });
}
