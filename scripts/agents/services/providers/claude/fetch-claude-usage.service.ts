import {
  CLAUDE_CREDENTIALS_UNREADABLE_MESSAGE,
  CLAUDE_LOGIN_EXPIRED_MESSAGE,
  CLAUDE_PROVIDER_ID,
  CLAUDE_SIGN_IN_MESSAGE,
  CLAUDE_USAGE_MALFORMED_MESSAGE,
  CLAUDE_USAGE_NETWORK_ERROR_MESSAGE,
} from "../../../constants/providers/claude/claude-provider.constant.ts";
import type { ClaudeOAuthCredentials } from "../../../types/providers/claude/claude-credentials.interface.ts";
import type { ClaudeUsageRequest } from "../../../types/providers/claude/claude-usage-request.interface.ts";
import type { ProviderEnvironment } from "../../../types/providers/provider-environment.interface.ts";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { describePlanName } from "../plan/describe-plan-name.service.ts";
import { buildClaudeUsageWindows } from "./build-claude-usage-windows.service.ts";
import { readClaudeCredentials } from "./read-claude-credentials.service.ts";
import { requestClaudeUsage } from "./request-claude-usage.service.ts";

export async function fetchClaudeUsage(environment: ProviderEnvironment): Promise<ProviderUsage> {
  const credentialRead = await readClaudeCredentials(environment);
  switch (credentialRead.state) {
    case "not-signed-in":
      return { status: "not-signed-in", provider: CLAUDE_PROVIDER_ID, message: CLAUDE_SIGN_IN_MESSAGE };
    case "unreadable":
      return { status: "error", provider: CLAUDE_PROVIDER_ID, message: CLAUDE_CREDENTIALS_UNREADABLE_MESSAGE };
    case "signed-in":
      return fetchUsageForCredentials(environment, credentialRead.credentials);
    default: {
      const unhandledRead: never = credentialRead;
      return unhandledRead;
    }
  }
}

async function fetchUsageForCredentials(
  environment: ProviderEnvironment,
  credentials: ClaudeOAuthCredentials,
): Promise<ProviderUsage> {
  if (hasTokenExpired(credentials.expiresAt, environment.now)) {
    return { status: "login-expired", provider: CLAUDE_PROVIDER_ID, message: CLAUDE_LOGIN_EXPIRED_MESSAGE };
  }
  const usageRequest = await requestClaudeUsage(environment.fetchUrl, credentials.accessToken);
  return toClaudeProviderUsage(usageRequest, credentials.subscriptionType);
}

function toClaudeProviderUsage(usageRequest: ClaudeUsageRequest, subscriptionType: string): ProviderUsage {
  switch (usageRequest.state) {
    case "received":
      return {
        status: "ok",
        provider: CLAUDE_PROVIDER_ID,
        plan: describePlanName(subscriptionType),
        windows: buildClaudeUsageWindows(usageRequest.response.limits),
      };
    case "rejected-token":
      return { status: "login-expired", provider: CLAUDE_PROVIDER_ID, message: CLAUDE_LOGIN_EXPIRED_MESSAGE };
    case "http-error":
      return {
        status: "error",
        provider: CLAUDE_PROVIDER_ID,
        message: `Claude usage request failed with HTTP ${usageRequest.status}.`,
      };
    case "network-error":
      return { status: "error", provider: CLAUDE_PROVIDER_ID, message: CLAUDE_USAGE_NETWORK_ERROR_MESSAGE };
    case "malformed-body":
      return { status: "error", provider: CLAUDE_PROVIDER_ID, message: CLAUDE_USAGE_MALFORMED_MESSAGE };
    default: {
      const unhandledRequest: never = usageRequest;
      return unhandledRequest;
    }
  }
}

function hasTokenExpired(expiresAt: number, now: Date): boolean {
  return expiresAt <= now.getTime();
}
