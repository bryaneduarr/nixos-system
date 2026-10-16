import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Api, Model } from "@earendil-works/pi-ai";

const fallbackModels = ["gpt-5.4", "gpt-5.5"];

export function fastModelsFromCache(value: unknown): Set<string> {
  const models = new Set<string>();

  if (!value || typeof value !== "object" || !("models" in value)) return models;
  if (!Array.isArray(value.models)) return models;

  for (const model of value.models) {
    if (!model || typeof model.slug !== "string" || !Array.isArray(model.service_tiers)) continue;
    const supportsPriority = model.service_tiers.some(
      (tier: unknown) => tier !== null && typeof tier === "object" && "id" in tier && tier.id === "priority",
    );
    if (supportsPriority) models.add(model.slug);
  }

  return models;
}

export function loadFastModels(): Set<string> {
  const codexDirectory = process.env.CODEX_HOME || join(homedir(), ".codex");

  try {
    const cache = JSON.parse(readFileSync(join(codexDirectory, "models_cache.json"), "utf8"));
    return fastModelsFromCache(cache);
  } catch {
    return new Set(fallbackModels);
  }
}

export function supportsFastMode(model: Model<Api> | undefined, models: Set<string>): boolean {
  return model?.provider === "openai-codex" && model.api === "openai-codex-responses" && models.has(model.id);
}
