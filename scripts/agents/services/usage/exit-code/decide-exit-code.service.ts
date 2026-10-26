import { USAGE_FAILURE_EXIT_CODE, USAGE_SUCCESS_EXIT_CODE } from "../../../constants/usage/usage-output.constant.ts";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";

export function decideExitCode(usages: readonly ProviderUsage[]): 0 | 1 {
  const hasUsableProvider = usages.some((usage) => usage.status === "ok");
  const everyProviderFailed = usages.length > 0 && !hasUsableProvider;
  return everyProviderFailed ? USAGE_FAILURE_EXIT_CODE : USAGE_SUCCESS_EXIT_CODE;
}
