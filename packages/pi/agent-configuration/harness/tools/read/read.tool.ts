import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { READ_TOOL_DESCRIPTION } from "../../constants/tools/tool-descriptions.constant.ts";
import { ReadParamsSchema } from "../../schemas/tools/read/read-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/renderers/create-harness-renderers.service.ts";
import { readSource } from "../../services/tools/read/read-source.service.ts";
import { toReadSelection } from "../../services/tools/read/to-read-selection.service.ts";

export function registerReadTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "read",
    label: "Read",
    description: READ_TOOL_DESCRIPTION,
    promptSnippet: "Read only the source needed for the current problem",
    promptGuidelines: [
      "Use read for the source required to understand the problem; it bounds large files automatically.",
    ],
    parameters: ReadParamsSchema,
    ...createHarnessRenderers("read"),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const text = await readSource({
        cwd: ctx.cwd,
        path: params.path,
        selection: toReadSelection(params),
      });
      return { content: [{ type: "text", text }], details: {} };
    },
  });
}
