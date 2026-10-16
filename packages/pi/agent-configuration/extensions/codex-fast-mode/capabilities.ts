import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Api, Model } from "@earendil-works/pi-ai";
import { Value } from "typebox/value";
import { CODEX_PROVIDER, CODEX_RESPONSES_API } from "./constants/codex/codex.constant.ts";
import {
  CachedModelSchema,
  ModelsCacheSchema,
  PriorityServiceTierSchema,
} from "./schemas/codex-models/models-cache.schema.ts";

const fallbackModels = ["gpt-5.4", "gpt-5.5"];

export function fastModelsFromCache(value: unknown): Set<string> {
  const models = new Set<string>();
  if (!Value.Check(ModelsCacheSchema, value)) return models;

  for (const model of value.models) {
    if (!Value.Check(CachedModelSchema, model)) continue;
    const supportsPriority = model.service_tiers.some((tier) => Value.Check(PriorityServiceTierSchema, tier));
    if (supportsPriority) models.add(model.slug);
  }

  return models;
}

export function loadFastModels(): Set<string> {
  const codexDirectory = process.env.CODEX_HOME || join(homedir(), ".codex");

  try {
    const cache: unknown = JSON.parse(readFileSync(join(codexDirectory, "models_cache.json"), "utf8"));
    return fastModelsFromCache(cache);
  } catch {
    return new Set(fallbackModels);
  }
}

export function supportsFastMode(model: Model<Api> | undefined, models: Set<string>): boolean {
  return model?.provider === CODEX_PROVIDER && model.api === CODEX_RESPONSES_API && models.has(model.id);
}
