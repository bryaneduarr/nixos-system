import type { UsageSnapshot } from "../../types/runtime/usage-snapshot.interface.ts";
import type { ProviderId } from "../../types/usage/provider-usage.interface.ts";
import { fetchAllUsages } from "../usage/fetch/fetch-all-usages.service.ts";
import { createProviderEnvironment } from "./create-provider-environment.service.ts";

export async function readUsageSnapshot(
  providers: readonly ProviderId[],
  readNow: () => Date = () => new Date(),
): Promise<UsageSnapshot> {
  const environment = createProviderEnvironment(readNow());
  const usages = await fetchAllUsages({ providers, environment });
  return { usages, now: environment.now };
}
