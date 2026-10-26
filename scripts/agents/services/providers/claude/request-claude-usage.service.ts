import {
  CLAUDE_BETA_HEADER_NAME,
  CLAUDE_BETA_HEADER_VALUE,
  CLAUDE_USAGE_URL,
} from "../../../constants/providers/claude/claude-provider.constant.ts";
import { claudeUsageResponseSchema } from "../../../schemas/providers/claude/claude-usage-response.schema.ts";
import type { ClaudeUsageRequest } from "../../../types/providers/claude/claude-usage-request.interface.ts";
import type {
  FetchProviderUrl,
  ProviderHttpResponse,
} from "../../../types/providers/provider-environment.interface.ts";
import { classifyHttpStatus } from "../http/classify-http-status.service.ts";

export async function requestClaudeUsage(fetchUrl: FetchProviderUrl, accessToken: string): Promise<ClaudeUsageRequest> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    [CLAUDE_BETA_HEADER_NAME]: CLAUDE_BETA_HEADER_VALUE,
  };
  try {
    return await readUsageResponse(await fetchUrl(CLAUDE_USAGE_URL, { headers }));
  } catch {
    return { state: "network-error" };
  }
}

async function readUsageResponse(response: ProviderHttpResponse): Promise<ClaudeUsageRequest> {
  const statusClass = classifyHttpStatus(response.status);
  switch (statusClass.state) {
    case "rejected-token":
      return { state: "rejected-token" };
    case "http-error":
      return { state: "http-error", status: statusClass.status };
    case "success":
      return parseUsageBody(response);
    default: {
      const unhandledStatus: never = statusClass;
      return unhandledStatus;
    }
  }
}

async function parseUsageBody(response: ProviderHttpResponse): Promise<ClaudeUsageRequest> {
  try {
    const parsedResponse = claudeUsageResponseSchema.safeParse(await response.json());
    return parsedResponse.success ? { state: "received", response: parsedResponse.data } : { state: "malformed-body" };
  } catch {
    return { state: "malformed-body" };
  }
}
