import type { Api, Model } from "@earendil-works/pi-ai";
import { CODEX_PROVIDER, CODEX_RESPONSES_API } from "../../constants/codex/codex.constant.ts";

export function supportsFastMode(model: Model<Api> | undefined, fastModels: Set<string>): boolean {
  return model?.provider === CODEX_PROVIDER && model.api === CODEX_RESPONSES_API && fastModels.has(model.id);
}
