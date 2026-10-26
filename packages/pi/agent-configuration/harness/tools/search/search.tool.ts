import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { SEARCH_TOOL_NAME } from "../../constants/tools/active-tools/harness-tools.constant.ts";
import {
  SEARCH_TOOL_DESCRIPTION,
  SEARCH_TOOL_GUIDELINES,
  SEARCH_TOOL_LABEL,
  SEARCH_TOOL_PROMPT_SNIPPET,
} from "../../constants/tools/search/search-tool.constant.ts";
import { SearchParamsSchema } from "../../schemas/tools/search/search-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/renderers/create-harness-renderers.service.ts";
import { hideBackendDeclarations } from "../../services/tools/backends/hide-backend-declarations.service.ts";
import { toToolCancellation } from "../../services/tools/process/tool-cancellation.service.ts";
import { toTextToolResult } from "../../services/tools/result/to-text-tool-result.service.ts";
import { searchRepo } from "../../services/tools/search/search-repo.service.ts";
import { toSearchRequest } from "../../services/tools/search/to-search-request.service.ts";

export function registerSearchTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: SEARCH_TOOL_NAME,
    label: SEARCH_TOOL_LABEL,
    description: SEARCH_TOOL_DESCRIPTION,
    promptSnippet: SEARCH_TOOL_PROMPT_SNIPPET,
    promptGuidelines: [...SEARCH_TOOL_GUIDELINES],
    parameters: SearchParamsSchema,
    prepareLoadout: hideBackendDeclarations,
    ...createHarnessRenderers(SEARCH_TOOL_NAME),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const request = toSearchRequest(params, {
        cwd: ctx.cwd,
        backend: ctx,
        cancellation: toToolCancellation(signal),
      });
      return toTextToolResult(await searchRepo(request));
    },
  });
}
