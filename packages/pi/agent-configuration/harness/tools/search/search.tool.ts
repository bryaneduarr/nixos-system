import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { DEFAULT_SEARCH_LIMIT } from "../../constants/tools/search-limits.constant.ts";
import { SEARCH_TOOL_DESCRIPTION } from "../../constants/tools/tool-descriptions.constant.ts";
import { SearchParamsSchema } from "../../schemas/tools/search/search-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/create-harness-renderers.service.ts";
import { toToolCancellation } from "../../services/tools/process/tool-cancellation.service.ts";
import { searchRepo } from "../../services/tools/search/search-repo.service.ts";

export function registerSearchTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "search",
    label: "Search",
    description: SEARCH_TOOL_DESCRIPTION,
    promptSnippet: "Locate files, symbols, references, and tests with bounded output",
    promptGuidelines: [
      "Use search to locate relevant files, symbols, references, and tests before reading or editing.",
    ],
    parameters: SearchParamsSchema,
    ...createHarnessRenderers("search"),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const text = await searchRepo({
        cwd: ctx.cwd,
        query: params.query,
        kind: params.kind ?? "auto",
        scope: params.path ? { kind: "path", path: params.path } : { kind: "workspace" },
        limit: params.limit ?? DEFAULT_SEARCH_LIMIT,
        cancellation: toToolCancellation(signal),
      });
      return { content: [{ type: "text", text }], details: {} };
    },
  });
}
