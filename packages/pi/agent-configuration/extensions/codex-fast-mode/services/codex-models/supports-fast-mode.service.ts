import { CODEX_PROVIDER, CODEX_RESPONSES_API } from "../../constants/codex/codex.constant.ts";
import type { ModelIdentity } from "../../types/codex-models/model-identity.interface.ts";

export function supportsFastMode(model: ModelIdentity, fastModels: Set<string>): boolean {
  return model.provider === CODEX_PROVIDER && model.api === CODEX_RESPONSES_API && fastModels.has(model.id);
}
