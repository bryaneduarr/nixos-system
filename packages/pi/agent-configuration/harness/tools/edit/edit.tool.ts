import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { EDIT_TOOL_DESCRIPTION } from "../../constants/tools/tool-descriptions.constant.ts";
import { EditParamsSchema } from "../../schemas/tools/edit/edit-parameters.schema.ts";
import { editFile } from "../../services/tools/edit/edit-file.service.ts";
import { toEditRequest } from "../../services/tools/edit/to-edit-request.service.ts";
import { createHarnessRenderers } from "../../ui/tool-renderer.ts";

export function registerEditTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "edit",
    label: "Edit",
    description: EDIT_TOOL_DESCRIPTION,
    promptSnippet: "Apply precise file edits and report a compact diff",
    promptGuidelines: ["Use edit for code changes; prefer exact-text replacements over rewriting whole files."],
    parameters: EditParamsSchema,
    ...createHarnessRenderers("edit"),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const validation = toEditRequest(ctx.cwd, params);
      if (!validation.valid) {
        return { content: [{ type: "text", text: validation.summary }], details: {} };
      }
      const result = await editFile(validation.request);
      return { content: [{ type: "text", text: result.summary }], details: {} };
    },
  });
}
