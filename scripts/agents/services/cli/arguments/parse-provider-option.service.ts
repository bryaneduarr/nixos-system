import { PROVIDER_LIST_SEPARATOR } from "../../../constants/cli/command-flags.constant.ts";
import { PROVIDER_NAMES_TEXT, PROVIDER_VALUE_EMPTY_MESSAGE } from "../../../constants/cli/command-text.constant.ts";
import { PROVIDER_ORDER } from "../../../constants/usage/provider-order.constant.ts";
import { providerNameSchema } from "../../../schemas/cli/arguments/provider-name.schema.ts";
import type { ProviderOptionParse } from "../../../types/cli/arguments/provider-option.interface.ts";
import type { ProviderId } from "../../../types/usage/provider-usage.interface.ts";

function unknownProviderMessage(name: string): string {
  return `Unknown provider "${name}". Valid providers: ${PROVIDER_NAMES_TEXT}.`;
}

export function parseProviderOption(rawList: string): ProviderOptionParse {
  if (rawList === "") return { state: "invalid", message: PROVIDER_VALUE_EMPTY_MESSAGE };
  const requestedProviders = new Set<ProviderId>();
  for (const name of rawList.split(PROVIDER_LIST_SEPARATOR)) {
    const parsedName = providerNameSchema.safeParse(name);
    if (!parsedName.success) return { state: "invalid", message: unknownProviderMessage(name) };
    requestedProviders.add(parsedName.data);
  }
  return { state: "valid", providers: PROVIDER_ORDER.filter((provider) => requestedProviders.has(provider)) };
}
