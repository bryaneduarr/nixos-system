import {
  OPENCODE_AUTH_UNREADABLE_MESSAGE,
  OPENCODE_LOGIN_EXPIRED_MESSAGE,
  OPENCODE_PROVIDER_ID,
  OPENCODE_SIGN_IN_MESSAGE,
  OPENCODE_USAGE_MALFORMED_MESSAGE,
  OPENCODE_USAGE_NETWORK_ERROR_MESSAGE,
} from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import type { OpenCodeUsageRequest } from "../../../types/providers/opencode/opencode-usage-request.interface.ts";
import type { ProviderEnvironment } from "../../../types/providers/provider-environment.interface.ts";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { buildOpenCodeUsageWindows } from "./build-opencode-usage-windows.service.ts";
import { readOpenCodeApiKey } from "./read-opencode-api-key.service.ts";
import { requestOpenCodeUsage } from "./request-opencode-usage.service.ts";

export async function fetchOpenCodeUsage(environment: ProviderEnvironment): Promise<ProviderUsage> {
  const keyRead = await readOpenCodeApiKey(environment);
  switch (keyRead.state) {
    case "not-signed-in":
      return { status: "not-signed-in", provider: OPENCODE_PROVIDER_ID, message: OPENCODE_SIGN_IN_MESSAGE };
    case "unreadable":
      return { status: "error", provider: OPENCODE_PROVIDER_ID, message: OPENCODE_AUTH_UNREADABLE_MESSAGE };
    case "signed-in":
      return toOpenCodeProviderUsage(await requestOpenCodeUsage(environment.fetchUrl, keyRead.apiKey));
    default: {
      const unhandledKeyRead: never = keyRead;
      return unhandledKeyRead;
    }
  }
}

function toOpenCodeProviderUsage(usageRequest: OpenCodeUsageRequest): ProviderUsage {
  switch (usageRequest.state) {
    case "received":
      return {
        status: "ok",
        provider: OPENCODE_PROVIDER_ID,
        plan: { state: "unreported" },
        windows: buildOpenCodeUsageWindows(usageRequest.response.usage),
      };
    case "rejected-key":
      return { status: "login-expired", provider: OPENCODE_PROVIDER_ID, message: OPENCODE_LOGIN_EXPIRED_MESSAGE };
    case "http-error":
      return {
        status: "error",
        provider: OPENCODE_PROVIDER_ID,
        message: `OpenCode Go usage request failed with HTTP ${usageRequest.status}.`,
      };
    case "network-error":
      return { status: "error", provider: OPENCODE_PROVIDER_ID, message: OPENCODE_USAGE_NETWORK_ERROR_MESSAGE };
    case "malformed-body":
      return { status: "error", provider: OPENCODE_PROVIDER_ID, message: OPENCODE_USAGE_MALFORMED_MESSAGE };
    default: {
      const unhandledRequest: never = usageRequest;
      return unhandledRequest;
    }
  }
}
