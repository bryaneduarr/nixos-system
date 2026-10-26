import { OPENCODE_USAGE_URL } from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import { opencodeUsageResponseSchema } from "../../../schemas/providers/opencode/opencode-usage-response.schema.ts";
import type { OpenCodeUsageRequest } from "../../../types/providers/opencode/opencode-usage-request.interface.ts";
import type {
  FetchProviderUrl,
  ProviderHttpResponse,
} from "../../../types/providers/provider-environment.interface.ts";
import { classifyHttpStatus } from "../http/classify-http-status.service.ts";

export async function requestOpenCodeUsage(fetchUrl: FetchProviderUrl, apiKey: string): Promise<OpenCodeUsageRequest> {
  const headers = { Authorization: `Bearer ${apiKey}` };
  try {
    return await readUsageResponse(await fetchUrl(OPENCODE_USAGE_URL, { headers }));
  } catch {
    return { state: "network-error" };
  }
}

async function readUsageResponse(response: ProviderHttpResponse): Promise<OpenCodeUsageRequest> {
  const statusClass = classifyHttpStatus(response.status);
  switch (statusClass.state) {
    case "rejected-token":
      return { state: "rejected-key" };
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

async function parseUsageBody(response: ProviderHttpResponse): Promise<OpenCodeUsageRequest> {
  try {
    const parsedResponse = opencodeUsageResponseSchema.safeParse(await response.json());
    return parsedResponse.success ? { state: "received", response: parsedResponse.data } : { state: "malformed-body" };
  } catch {
    return { state: "malformed-body" };
  }
}
