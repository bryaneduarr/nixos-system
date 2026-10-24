import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { EDIT_TOOL_NAME } from "../../constants/tools/active-tools/harness-tools.constant.ts";
import {
  EDIT_TOOL_DESCRIPTION,
  EDIT_TOOL_GUIDELINES,
  EDIT_TOOL_LABEL,
  EDIT_TOOL_PROMPT_SNIPPET,
} from "../../constants/tools/edit/edit-tool.constant.ts";
import { EditParamsSchema } from "../../schemas/tools/edit/edit-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/renderers/create-harness-renderers.service.ts";
import { executeEdit } from "../../services/tools/edit/execute-edit.service.ts";
import { prepareEditArguments } from "../../services/tools/edit/request/prepare-edit-arguments.service.ts";
import { toTextToolResult } from "../../services/tools/result/to-text-tool-result.service.ts";

export function registerEditTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: EDIT_TOOL_NAME,
    label: EDIT_TOOL_LABEL,
    description: EDIT_TOOL_DESCRIPTION,
    promptSnippet: EDIT_TOOL_PROMPT_SNIPPET,
    promptGuidelines: [...EDIT_TOOL_GUIDELINES],
    parameters: EditParamsSchema,
    prepareArguments: prepareEditArguments,
    ...createHarnessRenderers(EDIT_TOOL_NAME),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      return toTextToolResult(await executeEdit(ctx, ctx.cwd, params));
    },
  });
}
