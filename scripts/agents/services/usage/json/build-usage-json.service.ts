import { USAGE_JSON_INDENT_SPACES } from "../../../constants/usage/usage-output.constant.ts";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";

export function buildUsageJson(usages: readonly ProviderUsage[]): string {
  return JSON.stringify(usages.map(toUsageJsonItem), null, USAGE_JSON_INDENT_SPACES);
}

function toUsageJsonItem(usage: ProviderUsage) {
  switch (usage.status) {
    case "ok":
      return {
        provider: usage.provider,
        status: usage.status,
        plan: usage.plan.state === "reported" ? usage.plan.name : null,
        windows: usage.windows.map(({ label, percentRemaining, resetsAt }) => ({ label, percentRemaining, resetsAt })),
        message: null,
      };
    case "not-signed-in":
    case "login-expired":
    case "error":
      return { provider: usage.provider, status: usage.status, plan: null, windows: [], message: usage.message };
    default: {
      const unhandledUsage: never = usage;
      return unhandledUsage;
    }
  }
}
