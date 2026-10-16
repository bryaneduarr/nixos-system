import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { FALLBACK_FAST_MODELS } from "../../constants/codex/fallback-fast-models.constant.ts";
import { fastModelsFromCache } from "./fast-models-from-cache.service.ts";

export function loadFastModels(): Set<string> {
  const codexDirectory = process.env.CODEX_HOME || join(homedir(), ".codex");

  try {
    const cache: unknown = JSON.parse(readFileSync(join(codexDirectory, "models_cache.json"), "utf8"));
    return fastModelsFromCache(cache);
  } catch {
    return new Set(FALLBACK_FAST_MODELS);
  }
}
