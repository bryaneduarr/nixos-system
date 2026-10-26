import { PROVIDER_ORDER } from "../../../constants/usage/provider-order.constant.ts";
import { PROVIDER_UNEXPECTED_FAILURE_MESSAGE } from "../../../constants/usage/usage-fetch.constant.ts";
import type { FetchAllUsagesInputs } from "../../../types/usage/fetch/fetch-all-usages-inputs.interface.ts";
import type { ProviderId, ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { fetchClaudeUsage } from "../../providers/claude/fetch-claude-usage.service.ts";
import { fetchOpenCodeUsage } from "../../providers/opencode/fetch-opencode-usage.service.ts";

export async function fetchAllUsages(inputs: FetchAllUsagesInputs): Promise<readonly ProviderUsage[]> {
  const requestedProviders = PROVIDER_ORDER.filter((provider) => inputs.providers.includes(provider));
  return Promise.all(requestedProviders.map((provider) => fetchProviderUsageSafely(provider, inputs)));
}

async function fetchProviderUsageSafely(provider: ProviderId, inputs: FetchAllUsagesInputs): Promise<ProviderUsage> {
  try {
    return await fetchProviderUsage(provider, inputs);
  } catch {
    return { status: "error", provider, message: PROVIDER_UNEXPECTED_FAILURE_MESSAGE };
  }
}

async function fetchProviderUsage(provider: ProviderId, inputs: FetchAllUsagesInputs): Promise<ProviderUsage> {
  switch (provider) {
    case "claude":
      return fetchClaudeUsage(inputs.environment);
    case "opencode":
      return fetchOpenCodeUsage(inputs.environment);
    default: {
      const unhandledProvider: never = provider;
      return unhandledProvider;
    }
  }
}
