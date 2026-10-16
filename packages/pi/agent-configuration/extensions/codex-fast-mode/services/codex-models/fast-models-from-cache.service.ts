import { Value } from "typebox/value";
import {
  CachedModelSchema,
  ModelsCacheSchema,
  PriorityServiceTierSchema,
} from "../../schemas/codex-models/models-cache.schema.ts";

export function fastModelsFromCache(value: unknown): Set<string> {
  const models = new Set<string>();
  if (!Value.Check(ModelsCacheSchema, value)) return models;

  for (const model of value.models) {
    if (!Value.Check(CachedModelSchema, model)) continue;
    const hasPriorityTier = model.service_tiers.some((tier) => Value.Check(PriorityServiceTierSchema, tier));
    if (hasPriorityTier) models.add(model.slug);
  }

  return models;
}
